import {
  popBenefits,
  popHowItWorksSteps,
  popPlanPerks,
} from '@/config/pop.config';

describe('pop.config', () => {
  it('exposes the 9KT-focused redeem step copy', () => {
    const redeemStep = popHowItWorksSteps.find((step) => step.title === 'Shop Your Choice');

    expect(redeemStep).toMatchObject({
      mobileTitle: 'Redeem on Any 9KT Jewellery',
      description: 'Redeem your plan value on 9KT jewellery from our collection',
    });
  });

  it('exposes updated plan perks including early withdrawal', () => {
    expect(popPlanPerks).toEqual([
      'Pay for only 5 months',
      '6th month contribution is FREE',
      'No hidden charges',
      'Early withdrawal option',
      'Buy any jewellery from 9KT collection',
    ]);
  });

  it('exposes premium collection benefit copy with Gold & Diamond wording', () => {
    expect(popBenefits[0]).toMatchObject({
      title: 'Premium Collection',
      description: 'Access to our entire range of Gold & Diamond jewellery',
    });
  });

  it('keeps four how-it-works steps with redeem mobile title only on the last step', () => {
    expect(popHowItWorksSteps).toHaveLength(4);
    expect(popHowItWorksSteps.filter((step) => step.mobileTitle)).toEqual([
      popHowItWorksSteps[3],
    ]);
  });
});
