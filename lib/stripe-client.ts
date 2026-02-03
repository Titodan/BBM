import Stripe from 'stripe';

// Get Stripe instance (lazy initialization)
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      // For build time, return a mock - actual calls will only happen at runtime
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2026-01-28.clover',
    });
  }
  return stripeInstance;
}

/**
 * Create a Stripe Checkout session for an event
 */
export async function createCheckoutSession({
  eventId,
  eventTitle,
  priceInCents,
  registrationData,
  successUrl,
  cancelUrl,
}: {
  eventId: string;
  eventTitle: string;
  priceInCents: number;
  registrationData: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  successUrl: string;
  cancelUrl: string;
}) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: eventTitle,
            description: 'Event Registration',
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: registrationData.email,
    metadata: {
      eventId,
      ...registrationData,
    },
  });

  return session;
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
