export const CONTACT_SUPPORT_PHONE = '9175008322';
export const CONTACT_SUPPORT_PHONE_HREF = 'tel:+919175008322';
export const CONTACT_SUPPORT_PHONE_DISPLAY = '+91 91750 08322';
export const CONTACT_SUPPORT_URL = 'https://support.palmonas.com/support';
export const CONTACT_HOURS_SHORT = '10 AM – 7 PM, all week';

export const CONTACT_COMPANY_NAME = 'Demifine® Fashion Pvt Ltd';

export const CONTACT_CORPORATE_OFFICE =
  'Office No 501/502/503/504/505(A), 5th Floor, Verdant 84, Plot 1, Lane Z, Koregaon Park Annexe, Mundhwa, Pune, Maharashtra 411036.';

export type ContactTeamIcon =
  | 'user-plus'
  | 'handshake'
  | 'gift'
  | 'shield'
  | 'megaphone'
  | 'message-square';

export interface ContactTeamSection {
  title: string;
  description: string;
  email: string;
  icon: ContactTeamIcon;
}

export const contactTeamSections: ContactTeamSection[] = [
  {
    title: 'Join Our Team',
    description:
      "We'd love to have you on board. Reach out for any hiring-related queries and current openings.",
    email: 'hr@palmonas.com',
    icon: 'user-plus',
  },
  {
    title: 'Partner With Us',
    description:
      'Become part of the PALMONAS family. Get in touch to start a franchise or business partnership.',
    email: 'franchise@palmonas.com',
    icon: 'handshake',
  },
  {
    title: 'Gift with Elegance',
    description:
      'Elevate your corporate gifting experience with PALMONAS and make every gesture memorable.',
    email: 'corporate@palmonas.com',
    icon: 'gift',
  },
  {
    title: 'Legal Concerns',
    description:
      'For any legal concerns or compliance matters, please reach out to our legal team directly.',
    email: 'legalteam@palmonas.com',
    icon: 'shield',
  },
  {
    title: 'Press & Media',
    description:
      'For all press and media-related inquiries, our communications team is here to collaborate.',
    email: 'pr@palmonas.com',
    icon: 'megaphone',
  },
  {
    title: 'General Support',
    description:
      "Got a question about an order, returns, or your jewellery? Submit a ticket and we'll get back fast.",
    email: 'support@palmonas.com',
    icon: 'message-square',
  },
];
