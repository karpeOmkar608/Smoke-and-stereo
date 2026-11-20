import 'server-only';
import { configured, serviceClient } from './supabase/server';
export type SiteContent = {
  announcement: string;
  heroTitle: string;
  heroCopy: string;
  heroImage: string;
  campaignImage: string;
  about: string;
  contactEmail: string;
  instagram: string;
  youtube: string;
  shippingPolicy: string;
  returnsPolicy: string;
  privacyPolicy: string;
  termsPolicy: string;
};
export const defaults: SiteContent = {
  announcement: 'INDEPENDENT CULTURE. UNCOMPROMISED EXPRESSION.',
  heroTitle: 'BUILT FROM CULTURE.',
  heroCopy: 'Desi Hip-Hop. Street culture. A different frequency.',
  heroImage: '',
  campaignImage: '',
  about:
    'An expression of the streets, the sound, and the culture that raised us. Smoke & Stereo brings Desi Hip-Hop beyond the speakers and into everyday expression.',
  contactEmail: '',
  instagram: '',
  youtube: '',
  shippingPolicy:
    'Shipping details will be published before the first drop. Checkout remains closed until delivery rates are configured.',
  returnsPolicy:
    'Our returns and refunds policy will be published before orders open. Contact details will be available at launch.',
  privacyPolicy:
    'Our privacy policy will be published before customer registrations and orders open.',
  termsPolicy: 'Our terms of sale will be published before orders open.',
};
export async function getContent(): Promise<SiteContent> {
  if (!configured()) return defaults;
  try {
    const { data, error } = await serviceClient()
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'content')
      .maybeSingle();
    if (error) return defaults;
    return { ...defaults, ...data?.setting_value };
  } catch {
    return defaults;
  }
}
