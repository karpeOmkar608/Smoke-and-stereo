import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin, serviceClient } from '@/lib/supabase/server';
import { sameOrigin, apiError } from '@/lib/http';
import { storiesSchema } from '@/lib/editorial';
const safeUrl = z.union([
  z.literal(''),
  z.url().refine((s) => s.startsWith('https://'), 'Use an HTTPS URL'),
]);
const contentSchema = z.object({
  announcement: z.string().max(180),
  heroTitle: z.string().max(100),
  heroCopy: z.string().max(250),
  heroImage: safeUrl,
  campaignImage: safeUrl,
  about: z.string().max(5000),
  contactEmail: z.union([z.literal(''), z.email()]),
  instagram: safeUrl,
  youtube: safeUrl,
  shippingPolicy: z.string().max(20000),
  returnsPolicy: z.string().max(20000),
  privacyPolicy: z.string().max(20000),
  termsPolicy: z.string().max(20000),
  editorialStories: z
    .string()
    .max(100000)
    .refine((value) => {
      try {
        return storiesSchema.safeParse(JSON.parse(value)).success;
      } catch {
        return false;
      }
    }, 'Invalid editorial stories')
    .optional()
    .default('[]'),
  upcomingDropTitle: z.string().max(180).optional().default(''),
  upcomingDropDate: z
    .string()
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), 'Invalid release date')
    .optional()
    .default(''),
  upcomingDropImage: safeUrl.optional().default(''),
  upcomingDropCopy: z.string().max(2000).optional().default(''),
});
const actionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('content'), value: contentSchema }),
  z.object({
    action: z.literal('merchandise'),
    value: z.object({
      external_sku: z.string().min(1).max(200),
      featured: z.boolean(),
      hidden: z.boolean(),
      collections: z.array(z.string().max(100)).max(20),
      editorial_description: z.string().max(10000),
      size_guide: z.string().max(10000),
    }),
  }),
  z.object({ action: z.literal('refresh') }),
  z.object({
    action: z.literal('reconcile'),
    id: z.uuid(),
    resolution: z.enum(['accepted', 'not_accepted']),
    evidence: z.string().min(20).max(5000),
  }),
  z.object({
    action: z.literal('status'),
    id: z.uuid(),
    status: z.enum(['confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
    evidence: z.string().min(20).max(5000),
  }),
]);
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    let user;
    try {
      user = await requireAdmin();
    } catch {
      return apiError(new Error('Administrator access required'), 403);
    }
    const input = actionSchema.parse(await request.json());
    const db = serviceClient();
    const audit = await db.from('admin_audit').insert({
      actor_id: user.id,
      action: input.action,
      target: 'id' in input ? input.id : input.action,
      details: input,
    });
    if (audit.error) throw new Error('Could not record audit event');
    if (input.action === 'content') {
      const { error } = await db
        .from('site_settings')
        .upsert(
          { setting_key: 'content', setting_value: input.value },
          { onConflict: 'setting_key' },
        );
      if (error) throw error;
      revalidatePath('/', 'layout');
    } else if (input.action === 'merchandise') {
      const { error } = await db.from('product_merchandising').upsert(input.value);
      if (error) throw error;
      revalidateTag('catalog', 'max');
    } else if (input.action === 'refresh') {
      revalidateTag('catalog', { expire: 0 });
    } else if (input.action === 'reconcile') {
      const { error } = await db
        .from('orders')
        .update({
          integration_status: input.resolution === 'accepted' ? 'submitted' : 'failed',
          integration_error: `Manually reconciled: ${input.evidence}`,
        })
        .eq('id', input.id)
        .in('integration_status', ['reconciliation_required', 'processing']);
      if (error) throw error;
    } else if (input.action === 'status') {
      const { error } = await db
        .from('orders')
        .update({ order_status: input.status })
        .eq('id', input.id);
      if (error) throw error;
    }
    return NextResponse.json({ ok: true });
  } catch {
    return apiError(
      new Error('Action could not be completed. Check inputs and database connection.'),
    );
  }
}
