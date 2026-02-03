import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 */
export async function POST(req: NextRequest) {
  // Lazy imports to avoid build-time initialization
  const { verifyWebhookSignature } = await import('@/lib/stripe-client');
  const { init } = await import('@instantdb/admin');

  // Initialize InstantDB admin client (done at runtime, not module load)
  const db = init({
    appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!,
    adminToken: process.env.INSTANTDB_ADMIN_TOKEN || '',
  });

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  try {
    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const event = verifyWebhookSignature(body, signature, webhookSecret);

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Extract registration data from metadata
      const { eventId, name, email, phone, address } = session.metadata || {};

      if (!eventId || !name || !email || !phone || !address) {
        console.error('Missing metadata in checkout session:', session.id);
        return NextResponse.json(
          { error: 'Missing registration data in session metadata' },
          { status: 400 }
        );
      }

      // Save registration to InstantDB
      const registrationId = crypto.randomUUID();

      await (db as any).transact([
        (db as any).tx.registrations[registrationId].update({
          id: registrationId,
          eventId,
          name,
          email,
          phone,
          address,
          registeredAt: new Date().toISOString(),
          paid: true,
          stripeSessionId: session.id,
        }),
      ]);

      console.log('Registration saved:', registrationId);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
