import { describe, it, expect } from 'vitest';
import { getNewDrops } from '../src/lib/new-drops';
import { demoProducts } from '../src/lib/demo/catalog';

describe('New Drops release selection', () => {
  it('includes only assigned releases rather than the entire catalogue', () => {
    const drops = getNewDrops(demoProducts);
    expect(drops.map((product) => product.sku)).toEqual([
      'DEMO-FREQUENCY',
      'DEMO-STATIC',
      'DEMO-AFTERHOURS',
      'DEMO-SILENCE',
    ]);
    expect(demoProducts).toHaveLength(8);
  });
  it('handles no assigned releases without inventing a drop', () => {
    expect(getNewDrops(demoProducts.map((product) => ({ ...product, collections: [] })))).toEqual(
      [],
    );
  });
  it('sorts dated releases first and leaves the source catalogue unchanged', () => {
    const dated = { ...demoProducts[0], createdAt: '2026-01-01T00:00:00Z' };
    const undated = { ...demoProducts[2], createdAt: undefined };
    const invalid = { ...demoProducts[3], createdAt: 'unknown' };
    const source = [undated, invalid, dated];
    expect(getNewDrops(source).map((product) => product.sku)).toEqual([
      dated.sku,
      undated.sku,
      invalid.sku,
    ]);
    expect(source[0]).toBe(undated);
  });
});
