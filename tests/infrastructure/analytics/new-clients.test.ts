/** @jest-environment jsdom */

import { createAdmitadClient } from '@/infrastructure/analytics/clients/admitad.client';
import { createGoogleAdsClient } from '@/infrastructure/analytics/clients/google-ads.client';
import { createPinterestClient } from '@/infrastructure/analytics/clients/pinterest.client';
import { createSpotifyClient } from '@/infrastructure/analytics/clients/spotify.client';

describe('createGoogleAdsClient', () => {
  it('fires page_view as the Google Ads Page View conversion (5h6u…)', async () => {
    const gtag = jest.fn();
    window.gtag = gtag;

    const client = createGoogleAdsClient({
      conversionId: 'AW-10856259903',
    });

    expect(await client.init()).toBe(true);
    expect(gtag).toHaveBeenCalledWith('config', 'AW-10856259903', { send_page_view: false });

    await client.track('page_view', { path: '/', value: 1, currency: 'INR' });

    expect(gtag).toHaveBeenCalledWith('event', 'conversion', {
      send_to: 'AW-10856259903/5h6uCN3igaMDEL_C1bgo',
      value: 1,
      currency: 'INR',
      page_path: '/',
    });
  });

  it('fires purchase conversion with transaction_id', async () => {
    const gtag = jest.fn();
    window.gtag = gtag;

    const client = createGoogleAdsClient({
      conversionId: 'AW-10856259903',
      purchaseSendTo: 'AW-10856259903/HCLTCODigaMDEL_C1bgo',
    });

    expect(await client.init()).toBe(true);

    await client.track('purchase', {
      value: 1999,
      currency: 'INR',
      transaction_id: 'ord-1',
    });

    expect(gtag).toHaveBeenCalledWith('event', 'conversion', {
      send_to: 'AW-10856259903/HCLTCODigaMDEL_C1bgo',
      value: 1999,
      currency: 'INR',
      transaction_id: 'ord-1',
    });
  });

  it('skips non-conversion events', async () => {
    const gtag = jest.fn();
    window.gtag = gtag;

    const client = createGoogleAdsClient({
      conversionId: 'AW-10856259903',
    });

    expect(await client.init()).toBe(true);
    await client.track('click', { label: 'nav' });

    expect(gtag).toHaveBeenCalledTimes(1);
  });
});

describe('createPinterestClient', () => {
  it('tracks Pinterest events when pintrk is available', async () => {
    const pintrk = jest.fn();
    window.pintrk = pintrk;

    const client = createPinterestClient('2612345678901');
    expect(await client.init()).toBe(true);

    await client.track('addtocart', { value: 500, currency: 'INR' });
    expect(pintrk).toHaveBeenCalledWith('track', 'addtocart', {
      value: 500,
      currency: 'INR',
    });
  });
});

describe('createSpotifyClient', () => {
  it('tracks Spotify pixel events when spotify is available', async () => {
    const spotify = jest.fn();
    window.spotify = spotify;

    const client = createSpotifyClient('pixel-abc');
    expect(await client.init()).toBe(true);

    await client.track('Purchase', { value: 1200, currency: 'INR', order_id: 'ord-2' });
    expect(spotify).toHaveBeenCalledWith('track', 'Purchase', {
      value: 1200,
      currency: 'INR',
      order_id: 'ord-2',
    });
  });
});

describe('createAdmitadClient', () => {
  it('reports purchase conversions via TagTag', async () => {
    const processPositions = jest.fn();
    const buildReferencesOrder = jest.fn().mockReturnValue([{ price: '0', currency: 'INR' }]);

    window.ADMITAD = {
      Tracking: {
        buildReferencesOrder,
        processPositions,
      },
    };

    const client = createAdmitadClient('campaign-1');
    expect(await client.init()).toBe(true);

    await client.track('purchase', {
      transaction_id: 'ord-99',
      value: 2999,
      currency: 'INR',
    });

    expect(buildReferencesOrder).toHaveBeenCalledWith({
      orderNumber: 'ord-99',
      orderedItem: [],
    });
    expect(processPositions).toHaveBeenCalledTimes(1);
  });

  it('skips purchase when order id is missing', async () => {
    const processPositions = jest.fn();
    window.ADMITAD = {
      Tracking: {
        buildReferencesOrder: jest.fn().mockReturnValue([{}]),
        processPositions,
      },
    };

    const client = createAdmitadClient('campaign-1');
    expect(await client.init()).toBe(true);

    await client.track('purchase', { value: 100 });
    expect(processPositions).not.toHaveBeenCalled();
  });
});
