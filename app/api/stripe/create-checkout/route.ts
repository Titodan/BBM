import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/stripe/create-checkout
 * Create a Stripe Checkout session for paid event registrations
 */
export async function POST(req: NextRequest) {
  // Lazy import to avoid build-time initialization
  const { createCheckoutSession } = await import('@/lib/stripe-client');
  try {
    const body = await req.json();
    const { eventId, eventTitle, price, name, email, phone, address } = body;

    // Validate required fields
    if (!eventId || !eventTitle || !price || !name || !email || !phone || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate price
    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { error: 'Invalid price' },
        { status: 400 }
      );
    }

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    // Create Stripe Checkout session
    const session = await createCheckoutSession({
      eventId,
      eventTitle,
      priceInCents: price,
      registrationData: {
        name,
        email,
        phone,
        address,
      },
      successUrl: `${baseUrl}/events/${eventId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/events/${eventId}`,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
