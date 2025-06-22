// backend/services/paymentService.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createConnectedAccount = async (landlordData) => {
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'US',
    email: landlordData.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true }
    }
  });

  return account;
};

export const calculateCommission = async (bookingAmount, commissionRate) => {
  const commission = Math.round(bookingAmount * commissionRate);
  return {
    totalAmount: bookingAmount,
    commission: commission,
    landlordPayout: bookingAmount - commission
  };
};