'use server';

import { Lipana } from '@lipana/sdk';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config-client';
import { revalidatePath } from 'next/cache';

// This is a server-side only file.
// Do not expose this to the client.

// Ensure that the environment variable is being read correctly.
if (!process.env.LIPANA_SECRET_KEY) {
    throw new Error('LIPANA_SECRET_KEY is not set in the environment variables.');
}

// Initialize the SDK
const lipana = new Lipana({
  apiKey: process.env.LIPANA_SECRET_KEY,
  environment: 'production' // Set to 'production' as per the key prefix
});

interface CreatePaymentLinkInput {
    amount: number;
    title: string;
    description: string;
    invoiceId: string;
}

interface CreatePaymentLinkOutput {
    success: boolean;
    paymentLinkUrl?: string;
    error?: string;
}

/**
 * Creates a Lipa Na M-Pesa payment link for a given invoice.
 * @param input - The details for creating the payment link.
 * @returns An object containing the success status and the payment link URL or an error message.
 */
export async function createPaymentLink(input: CreatePaymentLinkInput): Promise<CreatePaymentLinkOutput> {
  const { amount, title, description, invoiceId } = input;
  
  // Use a relative URL for success, which will redirect to your own app.
  // We'll need to build out this success page later.
  const successRedirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/dashboard/billing?payment_success=true&invoice_id=${invoiceId}`;
  
  try {
    const paymentLink = await lipana.paymentLinks.create({
      title,
      description,
      amount,
      currency: 'KES',
      allowCustomAmount: false,
      successRedirectUrl: successRedirectUrl
    });

    // Mark the invoice as pending in Firestore
    const invoiceRef = doc(db, 'billings', invoiceId);
    await updateDoc(invoiceRef, { paymentStatus: 'pending' });

    // Revalidate the path to show the updated status on the billing page
    revalidatePath('/dashboard/billing');
    
    console.log('Payment link created:', paymentLink.url);
    return { success: true, paymentLinkUrl: paymentLink.url };

  } catch (error: any) {
    console.error('Error creating payment link:', error.message);
    return { success: false, error: error.message || "An unknown error occurred." };
  }
}
