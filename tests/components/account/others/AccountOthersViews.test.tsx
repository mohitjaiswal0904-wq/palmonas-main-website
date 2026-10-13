import { render, screen } from '@testing-library/react';

import { FaqsView } from '@/components/account/others/FaqsView';
import { HowToEarnView } from '@/components/account/others/HowToEarnView';
import { HowToRedeemView } from '@/components/account/others/HowToRedeemView';
import { PrivacyPolicyView } from '@/components/account/others/PrivacyPolicyView';
import { SupportCenterView } from '@/components/account/others/SupportCenterView';
import {
  accountFaqsContent,
  accountPrivacyContent,
  accountRewardsPolicyContent,
  accountSupportContent,
} from '@/config/account/account.config';

const firstSupportFaq = accountSupportContent.items[0]!;
const firstRewardsFaq = accountRewardsPolicyContent.faqItems[0]!;
const firstSiteFaq = accountFaqsContent.items[0]!;
const firstPrivacySection = accountPrivacyContent.sections[0]!;
const privacyIntro = accountPrivacyContent.intro[0]!;

describe('SupportCenterView', () => {
  it('renders live hero and contact actions', () => {
    render(<SupportCenterView />);

    expect(
      screen.getByRole('heading', { name: accountSupportContent.pageTitle }),
    ).toBeInTheDocument();
    expect(screen.getByText(accountSupportContent.heroTitle)).toBeInTheDocument();
    expect(screen.getByText(accountSupportContent.hoursTime)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Call Palmonas support/i })).toBeInTheDocument();
  });

  it('lists first support FAQ question verbatim', () => {
    render(<SupportCenterView />);

    expect(screen.getByText(firstSupportFaq.question)).toBeInTheDocument();
  });
});

describe('HowToEarnView', () => {
  it('renders rewards policy title and first FAQ', () => {
    render(<HowToEarnView />);

    expect(screen.getByText(accountRewardsPolicyContent.pageTitle)).toBeInTheDocument();
    expect(screen.getByText(firstRewardsFaq.question)).toBeInTheDocument();
  });

  it('includes eligibility heading from live dump', () => {
    render(<HowToEarnView />);

    expect(screen.getByText('ELIGIBILITY:')).toBeInTheDocument();
  });
});

describe('HowToRedeemView', () => {
  it('renders how-to-redeem title', () => {
    render(<HowToRedeemView />);

    expect(screen.getByRole('heading', { name: 'How To Redeem' })).toBeInTheDocument();
  });

  it('includes redeem FAQ from support dump', () => {
    render(<HowToRedeemView />);

    expect(screen.getByText('How do I redeem reward points?')).toBeInTheDocument();
  });
});

describe('FaqsView', () => {
  it('renders jewellery FAQs verbatim', () => {
    render(<FaqsView />);

    expect(
      screen.getByRole('heading', { name: accountFaqsContent.pageTitle }),
    ).toBeInTheDocument();
    expect(screen.getByText(firstSiteFaq.question)).toBeInTheDocument();
    expect(screen.getByText(firstSiteFaq.paragraphs[0]!)).toBeInTheDocument();
  });

  it('keeps multi-paragraph demi-fine answer', () => {
    render(<FaqsView />);

    expect(screen.getByText(firstSiteFaq.paragraphs[3]!)).toBeInTheDocument();
  });
});

describe('PrivacyPolicyView', () => {
  it('renders privacy intro and first section heading', () => {
    render(<PrivacyPolicyView />);

    expect(
      screen.getByRole('heading', { name: accountPrivacyContent.pageTitle }),
    ).toBeInTheDocument();
    expect(screen.getByText(privacyIntro)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: firstPrivacySection.heading }),
    ).toBeInTheDocument();
  });

  it('includes first body paragraph of personal information section', () => {
    render(<PrivacyPolicyView />);

    expect(screen.getByText(firstPrivacySection.paragraphs[0]!)).toBeInTheDocument();
  });
});
