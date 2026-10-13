import {
  getSearchDraftQuery,
  setSearchDraftQuery,
  subscribeSearchDraftQuery,
} from '@/lib/search/search-draft-query';

describe('search-draft-query', () => {
  beforeEach(() => {
    setSearchDraftQuery('');
  });

  it('publishes the latest draft query', () => {
    setSearchDraftQuery('gold');

    expect(getSearchDraftQuery()).toBe('gold');
  });

  it('notifies subscribers when the draft changes', () => {
    const listener = jest.fn();
    const unsubscribe = subscribeSearchDraftQuery(listener);

    setSearchDraftQuery('ring');

    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('does not notify after unsubscribe', () => {
    const listener = jest.fn();
    const unsubscribe = subscribeSearchDraftQuery(listener);
    unsubscribe();

    setSearchDraftQuery('anklet');

    expect(listener).not.toHaveBeenCalled();
  });

  it('skips notify when the draft is unchanged', () => {
    const listener = jest.fn();
    setSearchDraftQuery('gold');
    const unsubscribe = subscribeSearchDraftQuery(listener);

    setSearchDraftQuery('gold');

    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });
});
