import { afterEach, describe, it, expect, vi } from 'vitest';
import { sameOrigin } from '../src/lib/http';
afterEach(() => vi.unstubAllEnvs());
function request(
  origin?: string,
  host = '127.0.0.1:3000',
  url = 'http://localhost:3000/api/checkout',
) {
  return new Request(url, { headers: { host, ...(origin ? { origin } : {}) } });
}
describe('same-origin protection', () => {
  it('allows the exact application origin', () => {
    expect(() => sameOrigin(request('http://localhost:3000'))).not.toThrow();
  });
  it('allows Next’s loopback normalization only in development with matching Host', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(() => sameOrigin(request('http://127.0.0.1:3000'))).not.toThrow();
  });
  it('does not allow loopback aliases in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(() => sameOrigin(request('http://127.0.0.1:3000'))).toThrow();
  });
  it.each([
    undefined,
    'null',
    'https://evil.example',
    'http://localhost:3001',
    'https://127.0.0.1:3000',
    'http://127.0.0.1:3000.evil.example',
  ])('rejects invalid or cross-site origin %s', (origin) => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(() => sameOrigin(request(origin))).toThrow();
  });
  it('requires the browser origin to match the actual Host', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(() => sameOrigin(request('http://127.0.0.1:3000', 'localhost:3000'))).toThrow();
  });
});
