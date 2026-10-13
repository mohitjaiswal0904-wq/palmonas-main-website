import { popTokens } from '@/config/theme/pop.tokens';

describe('popTokens', () => {
  it('exposes Figma timeline pipeline colors', () => {
    expect(popTokens.timeline).toBe('#d1d5dc');
    expect(popTokens.timelinePipelineGradient).toContain('linear-gradient');
    expect(popTokens.timelinePipelineGradient).toContain(popTokens.timeline);
  });

  it('exposes How It Works joint dimensions from Figma', () => {
    expect(popTokens.howItWorksBadgePx).toBe(38);
    expect(popTokens.howItWorksPipelineHeightPx).toBe(85);
    expect(popTokens.howItWorksCardMinHeightPx).toBe(98);
  });
});
