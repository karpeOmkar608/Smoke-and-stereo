import { beforeEach, describe, it, expect, vi } from 'vitest';
vi.mock('../src/lib/supabase/server', () => ({ serviceClient: vi.fn() }));
import { provider, mapProviderCatalog } from '../src/lib/catalog';
beforeEach(() => {
  vi.unstubAllGlobals();
  vi.stubEnv('INDIAN_DROPSHIPPERS_API_KEY', 'test-only-key');
  vi.stubEnv('INDIAN_DROPSHIPPERS_BASE_URL', 'https://provider.invalid');
});
describe('supplier client', () => {
  it('sends credentials server-side with a timeout', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('{"test":true}', { status: 200 }));
    vi.stubGlobal('fetch', fetcher);
    await expect(provider('/catalog')).resolves.toEqual({ test: true });
    expect(fetcher.mock.calls[0][1].headers['x-api-key']).toBe('test-only-key');
    expect(fetcher.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  });
  it('rejects missing credentials without making a request', async () => {
    vi.stubEnv('INDIAN_DROPSHIPPERS_API_KEY', '');
    const fn = vi.fn();
    vi.stubGlobal('fetch', fn);
    await expect(provider('/catalog')).rejects.toThrow();
    expect(fn).not.toHaveBeenCalled();
  });
  it.each([401, 404, 422, 500])('rejects HTTP %i', async (status) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status })));
    await expect(provider('/catalog')).rejects.toThrow(`HTTP ${status}`);
  });
  it('propagates an ambiguous network failure for reconciliation', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new DOMException('Timed out', 'TimeoutError')),
    );
    await expect(provider('/orders', { method: 'POST', body: '{}' })).rejects.toThrow();
  });
  it('fails closed for every unverified schema', () => {
    for (const raw of [null, {}, [], { products: [] }])
      expect(() => mapProviderCatalog(raw)).toThrow('not been verified');
  });
});
