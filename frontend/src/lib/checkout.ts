/**
 * Lemon Squeezy direct checkout URLs.
 *
 * We redirect the user straight to LemonSqueezy instead of going through
 * our backend /billing/checkout/{tier} endpoint.  This avoids any issues
 * with the backend Docker image being out-of-date on the server.
 *
 * The backend webhook (/billing/webhook) still handles crediting the user
 * after payment is completed.
 */

const CHECKOUT_URLS: Record<string, string> = {
  basic:    'https://vitelo.lemonsqueezy.com/checkout/buy/f70d5ec6-2c23-4789-b634-4891e55594c3',
  pro:      'https://vitelo.lemonsqueezy.com/checkout/buy/d6140b0a-eb81-45c6-aa37-40f3c4419aaa',
  ultimate: 'https://vitelo.lemonsqueezy.com/checkout/buy/78a4fe7d-8347-4af7-b2cd-bc5bc2a47391',
};

/**
 * Redirect the browser to the Lemon Squeezy checkout page.
 * Optionally pre-fills the buyer's email address.
 */
export function redirectToCheckout(tier: string, email?: string) {
  const base = CHECKOUT_URLS[tier];
  if (!base) {
    alert('Invalid plan selected.');
    return;
  }
  const url = email ? `${base}?checkout[email]=${encodeURIComponent(email)}` : base;
  window.location.href = url;
}
