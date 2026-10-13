import { readFileSync } from 'node:fs';

import { CmsSlotApiEnvelopeSchema } from '@/types/cms-slot';

describe('header slot API parse', () => {
  it('parses the live header slot envelope', () => {
    const raw = readFileSync('/tmp/header-slot.json', 'utf8');
    const json = JSON.parse(raw) as unknown;

    expect(() => CmsSlotApiEnvelopeSchema.parse(json)).not.toThrow();
  });
});
