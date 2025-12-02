
'use server';

import { Lipana } from '@lipana/sdk';
import { doc, updateDoc } from 'firebase/firestore';
import { db as adminDb } from '@/firebase/config-server'; 
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
  environment: 'production'
});

interface InitiateStkPushInput {
    amount: number;
    phoneNumber: string;
    invoiceId: string;
}

interface InitiateStkPushOutput {
    success: boolean;
    message: string;
    transactionId?: string;
    checkoutRequestID?: string;
}

/**
 * Initiates an STK push payment to the user's phone.
 * @param input - The details for initiating the STK push.
 * @returns An object containing the success status and transaction details or an error message.
 */
export async function initiateStkPush(input: InitiateStkPushInput): Promise<InitiateStkPushOutput> {
  const { amount, phoneNumber, invoiceId } = input;

  if (!phoneNumber) {
    return { success: false, message: 'Phone number is required for STK Push.' };
  }
  
  try {
    const stkResponse = await lipana.transactions.initiateStkPush({
      phone: phoneNumber,
      amount: amount,
    });

    // Mark the invoice as pending in Firestore using the admin instance
    const invoiceRef = doc(adminDb, 'billings', invoiceId);
    await updateDoc(invoiceRef, { paymentStatus: 'pending' });

    // Revalidate the path to show the updated status on the billing page
    revalidatePath('/dashboard/billing');
    
    console.log('STK push initiated:', stkResponse);
    return { 
        success: true, 
        message: 'STK Push initiated successfully. Please check your phone.',
        transactionId: stkResponse.transactionId,
        checkoutRequestID: stkResponse.checkoutRequestID,
    };

  } catch (error: any) {
    console.error('Error initiating STK push:', error.message);
    return { success: false, message: error.message || "An unknown error occurred." };
  }
}
