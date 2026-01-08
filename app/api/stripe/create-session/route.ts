import { NextResponse } from 'next/server';
import { stripe } from '../../../../app/utils/stripe';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, clientName, factureId } = body;
    const amountCents = Math.round((+amount || 0) * 100);

    // If stripe key is placeholder or 0 amount, return mock receipt
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder') || amountCents <= 0) {
      return NextResponse.json({
        mockReceipt: true,
        receipt: {
          id: `rcpt_demo_${Date.now()}`,
          clientName,
          amount: `${(amountCents / 100).toFixed(2)}€`,
          description: `Facture #${factureId}`,
          date: new Date().toLocaleString('fr-FR'),
        },
      });
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Facture ${factureId} - ${clientName}`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/facturation?paid=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/facturation?cancelled=1`,
      metadata: {
        facture_id: factureId?.toString() || '',
        client_name: clientName || '',
      },
    });

    return NextResponse.json({ sessionUrl: session.url });
  } catch (error) {
    console.error('Stripe route error:', error);
    return NextResponse.json({ mockReceipt: true, receipt: { id: `rcpt_err_${Date.now()}`, clientName: 'Client', amount: '0.00€', description: 'Erreur Stripe', date: new Date().toLocaleString('fr-FR') } });
  }
}
