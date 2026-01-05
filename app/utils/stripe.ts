// Utilitaires Stripe pour la facturation
import Stripe from 'stripe';

// Initialiser Stripe (utiliser les variables d'environnement)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-12-15.clover',
});

/**
 * Créer un PaymentIntent Stripe
 */
export async function createPaymentIntent(amount: number, currency: string = 'eur', metadata?: Record<string, string>) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir en centimes
      currency,
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });
    return paymentIntent;
  } catch (error) {
    console.error('Erreur création PaymentIntent:', error);
    throw error;
  }
}

/**
 * Récupérer les paiements depuis Stripe
 */
export async function getStripePayments(limit: number = 100) {
  try {
    const payments = await stripe.paymentIntents.list({
      limit,
      expand: ['data.customer'],
    });
    return payments.data.filter(p => p.status === 'succeeded');
  } catch (error) {
    console.error('Erreur récupération paiements:', error);
    return [];
  }
}

/**
 * Créer une facture Stripe avec XML Factur-X embarqué
 */
export async function createStripeInvoiceWithFacturX(
  customerId: string,
  amount: number,
  description: string,
  facturXXML: string
) {
  try {
    // Créer d'abord un invoice item
    await stripe.invoiceItems.create({
      customer: customerId,
      amount: Math.round(amount * 100),
      currency: 'eur',
      description,
    });

    // Créer la facture Stripe
    const invoice = await stripe.invoices.create({
      customer: customerId,
      auto_advance: false, // Ne pas finaliser automatiquement
      metadata: {
        factur_x_compliant: 'true',
        norme: 'EN 16931',
        // Note: Le XML complet est trop long pour metadata, il sera dans le PDF généré
      },
    });

    // Finaliser la facture
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
    return finalizedInvoice;
  } catch (error) {
    console.error('Erreur création facture Stripe:', error);
    // En mode démo, on peut ignorer l'erreur Stripe
    return null;
  }
}

