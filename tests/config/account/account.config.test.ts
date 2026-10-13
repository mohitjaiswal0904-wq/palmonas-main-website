import { ACCOUNT_OTHERS_MENU_ITEMS } from '@/components/account/common/account-menu.config';
import {
  ACCOUNT_SUPPORT_HOME_URL,
  ACCOUNT_SUPPORT_TICKET_URL,
  accountFaqsContent,
  accountMessages,
  accountPrivacyContent,
  accountRewardsPolicyContent,
  accountSupportContent,
  isAccountFeatureEnabled,
  isAccountPanelFeatureEnabled,
} from '@/config/account/account.config';

describe('account.config features', () => {
  it('disables refer-and-earn when live program copy is missing', () => {
    expect(isAccountFeatureEnabled('referAndEarn')).toBe(false);
  });

  it('keeps live-sourced info panels enabled', () => {
    expect(isAccountFeatureEnabled('support')).toBe(true);
    expect(isAccountFeatureEnabled('howToEarn')).toBe(true);
    expect(isAccountFeatureEnabled('howToRedeem')).toBe(true);
    expect(isAccountFeatureEnabled('faqs')).toBe(true);
    expect(isAccountFeatureEnabled('privacyPolicy')).toBe(true);
  });

  it('exports support URLs from live Palmonas support', () => {
    expect(ACCOUNT_SUPPORT_TICKET_URL).toContain('support.palmonas.com');
    expect(ACCOUNT_SUPPORT_HOME_URL).toContain('support.palmonas.com');
  });

  it('loads verbatim FAQ dump from live pages/faqs', () => {
    expect(accountFaqsContent.items[0]?.question).toBe('What is Demifine® collection?');
    expect(accountFaqsContent.items[0]?.paragraphs[0]).toContain(
      'in between fine (pure gold and diamonds)',
    );
  });

  it('loads verbatim privacy intro from live privacy-policy', () => {
    expect(accountPrivacyContent.intro[0]).toContain(
      'personal information is collected, used, and shared',
    );
    expect(accountPrivacyContent.sections[0]?.heading).toBe('PERSONAL INFORMATION WE COLLECT');
  });

  it('loads rewards policy FAQ dump for How To Earn', () => {
    expect(accountRewardsPolicyContent.faqItems[0]?.question).toBe('What are PALMONAS REWARDS?');
    expect(accountRewardsPolicyContent.bodyLines).toContain('ELIGIBILITY:');
  });

  it('loads support center FAQ dump', () => {
    expect(accountSupportContent.heroTitle).toBe('Need Assistance? Raise a Support Ticket');
    expect(accountSupportContent.items.length).toBeGreaterThan(10);
  });
});

describe('account order-history copy', () => {
  it('exposes product card view label', () => {
    expect(accountMessages.orderHistory.a11y.viewProduct).toBe('View {name}');
  });
});

describe('ACCOUNT_OTHERS_MENU_ITEMS flags', () => {
  it('hides disabled Others items from the menu', () => {
    const ids = ACCOUNT_OTHERS_MENU_ITEMS.map((item) => item.id);
    expect(ids).not.toContain('refer-and-earn');
    expect(ids).toContain('support');
    expect(ids).toContain('logout');
  });

  it('matches panel flag helper for menu visibility', () => {
    expect(isAccountPanelFeatureEnabled('refer-and-earn')).toBe(false);
    expect(isAccountPanelFeatureEnabled('support')).toBe(true);
    expect(isAccountPanelFeatureEnabled('profile')).toBe(true);
  });
});
