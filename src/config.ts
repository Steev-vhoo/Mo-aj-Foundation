/**
 * Site-wide settings. Most of what the foundation will need to change lives here.
 * Anything marked TODO is a placeholder waiting on information from the foundation.
 */
export const site = {
  name: 'The MO-AJ Foundation',
  fullName: 'The Mark Ofosu-Ampadu Jnr Foundation',
  tagline: 'Putting a human face to road carnage in Ghana',
  description:
    'The Mark Ofosu-Ampadu Jnr (MO-AJ) Foundation tells the stories of road accident victims and their families, and rallies support for safer roads and better road safety policy in Ghana.',
  email: 'themoajfoundation@gmail.com',
  phone: '', // TODO: public phone / WhatsApp number
  location: 'Accra, Ghana', // TODO: confirm
  social: {
    facebook: '', // TODO: e.g. https://www.facebook.com/moajfoundation
    instagram: '', // TODO
    x: '', // TODO
    linkedin: '', // TODO
    youtube: '', // TODO
    tiktok: '', // TODO
  },
};

/** Donations. Paystack payment pages accept MoMo and cards and need no server code. */
export const donate = {
  paystackUrl: '', // TODO: Paystack payment page link, e.g. https://paystack.com/pay/moaj-foundation
  momo: {
    network: '', // TODO: e.g. MTN MoMo
    number: '', // TODO
    accountName: '', // TODO
  },
  bank: {
    bankName: '', // TODO
    accountName: '', // TODO
    accountNumber: '', // TODO
    branch: '', // TODO
  },
  suggestedAmounts: [50, 100, 250, 500],
  currency: 'GH₵',
};

/**
 * Form endpoints: the site's own API routes, which save to Supabase (see src/pages/api/).
 * Until Supabase is configured, visitors are offered a pre-filled email instead.
 */
export const forms = {
  contact: '/api/message',
  volunteer: '/api/volunteer',
};

export const nav = [
  { href: '/about', label: 'About' },
  { href: '/stories', label: 'Stories' },
  { href: '/road-safety', label: 'Road Safety' },
  { href: '/news', label: 'News' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/get-involved', label: 'Get Involved' },
  { href: '/contact', label: 'Contact' },
];
