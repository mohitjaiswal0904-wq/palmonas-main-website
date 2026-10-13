import { parseSearchIntent, mergeIntentSuggestions } from '@/lib/search/search-intent';

describe('parseSearchIntent', () => {
  it('rewrites a lone man search so it does not match mangalsutra', () => {
    expect(parseSearchIntent('man')).toMatchObject({
      apiQuery: 'men',
      gender: 'men',
      suggestions: ['men'],
    });
  });

  it('rewrites 9k and 9 carat onto the 9kt spelling already used in the catalog', () => {
    expect(parseSearchIntent('9k gold').apiQuery).toBe('9kt gold');
    expect(parseSearchIntent('9 carat')).toMatchObject({ apiQuery: '9kt', metal: '9kt' });
    expect(parseSearchIntent('9 kt gold').apiQuery).toBe('9kt gold');
  });

  it('turns silver ring for men into the men-first query', () => {
    expect(parseSearchIntent('silver ring for men')).toMatchObject({
      apiQuery: 'men silver ring',
      type: 'ring',
      metal: 'silver',
      gender: 'men',
      productType: "men's rings",
    });
  });

  it('maps chain to necklaces and keeps a necklace fallback', () => {
    expect(parseSearchIntent('chain')).toMatchObject({
      type: 'chain',
      productType: 'necklaces',
      fallbackQuery: 'chain necklace',
    });
    expect(parseSearchIntent('silver chain').fallbackQuery).toBe('silver chain necklace');
  });

  it('does not guess a type from an ambiguous fragment', () => {
    expect(parseSearchIntent('silver b').type).toBeUndefined();
    expect(parseSearchIntent('gold c').type).toBeUndefined();
  });

  it('finishes a unique prefix', () => {
    expect(parseSearchIntent('sil')).toMatchObject({
      apiQuery: 'silver',
      metal: 'silver',
      suggestions: ['silver'],
    });
    expect(parseSearchIntent('gol').apiQuery).toBe('gold');
    expect(parseSearchIntent('bra').apiQuery).toBe('bracelet');
    expect(parseSearchIntent('rin').apiQuery).toBe('ring');
    expect(parseSearchIntent('ear').apiQuery).toBe('earrings');
    expect(parseSearchIntent('mangal').apiQuery).toBe('mangalsutra');
    expect(parseSearchIntent('silver rin').suggestions).toEqual(['silver ring']);
  });

  it('treats diamond as lab-grown and offers a fallback query', () => {
    expect(parseSearchIntent('diamond')).toMatchObject({
      stone: 'lab-grown',
      fallbackQuery: 'lab grown diamond',
    });
    expect(parseSearchIntent('diamond ring').fallbackQuery).toBe('lab grown diamond ring');
  });

  it('keeps rose gold and gold plated distinct from solid gold', () => {
    expect(parseSearchIntent('rose gold').metal).toBe('rose-gold');
    expect(parseSearchIntent('gold plated').metal).toBe('gold-plated');
    expect(parseSearchIntent('gold').metal).toBe('gold');
    expect(parseSearchIntent('platinum ring')).toMatchObject({
      metal: 'platinum',
      type: 'ring',
      productType: 'rings',
    });
  });
});

describe('mergeIntentSuggestions', () => {
  it('puts the finished word ahead of other terms', () => {
    expect(mergeIntentSuggestions('sil', ['Silver Rings', 'Bracelets'], 6)).toEqual([
      'silver',
      'Silver Rings',
      'Bracelets',
    ]);
  });
});
