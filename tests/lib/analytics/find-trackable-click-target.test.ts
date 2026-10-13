/** @jest-environment jsdom */

import {
  findTrackableClickTarget,
  getClickElementType,
  shouldSkipClickTracking,
} from '@/lib/analytics/find-trackable-click-target';

describe('findTrackableClickTarget', () => {
  it('resolves nested clicks to the nearest interactive ancestor', () => {
    document.body.innerHTML =
      '<button type="button"><span class="icon">Home</span></button>';

    const icon = document.querySelector('.icon');

    expect(findTrackableClickTarget(icon)?.tagName).toBe('BUTTON');
  });

  it('returns null for plain text nodes', () => {
    document.body.innerHTML = '<p>Hello</p>';
    expect(findTrackableClickTarget(document.querySelector('p'))).toBeNull();
  });
});

describe('shouldSkipClickTracking', () => {
  it('skips elements inside data-analytics-ignore containers', () => {
    document.body.innerHTML =
      '<div data-analytics-ignore><button type="button">Hidden</button></div>';
    const button = document.querySelector('button');

    expect(button).not.toBeNull();
    expect(shouldSkipClickTracking(button as HTMLButtonElement)).toBe(true);
  });
});

describe('getClickElementType', () => {
  it('prefers explicit roles over tag names', () => {
    document.body.innerHTML = '<div role="tab">Gold</div>';
    const tab = document.querySelector('[role="tab"]');

    expect(getClickElementType(tab as HTMLElement)).toBe('tab');
  });
});
