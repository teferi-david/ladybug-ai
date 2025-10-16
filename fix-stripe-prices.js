// Quick fix for Stripe price IDs
// Run this with: node fix-stripe-prices.js

const Stripe = require('stripe');

// You need to set your Stripe secret key here
const stripe = new Stripe('sk_test_...'); // Replace with your actual secret key

async function createPrices() {
  try {
    console.log('🔧 Creating Stripe prices for Ladybug AI...\n');

    // Trial Price (One-time payment)
    const trialProduct = await stripe.products.create({
      name: 'Ladybug AI - 3 Day Trial',
      description: '3-day trial access to all Ladybug AI tools'
    });

    const trialPrice = await stripe.prices.create({
      product: trialProduct.id,
      unit_amount: 149, // $1.49
      currency: 'usd'
    });

    // Monthly Price (Recurring)
    const monthlyProduct = await stripe.products.create({
      name: 'Ladybug AI - Monthly Plan',
      description: 'Monthly subscription to all Ladybug AI tools'
    });

    const monthlyPrice = await stripe.prices.create({
      product: monthlyProduct.id,
      unit_amount: 1549, // $15.49
      currency: 'usd',
      recurring: { interval: 'month' }
    });

    // Annual Price (Recurring)
    const annualProduct = await stripe.products.create({
      name: 'Ladybug AI - Annual Plan',
      description: 'Annual subscription to all Ladybug AI tools'
    });

    const annualPrice = await stripe.prices.create({
      product: annualProduct.id,
      unit_amount: 14949, // $149.49
      currency: 'usd',
      recurring: { interval: 'year' }
    });

    // Single Use Price (One-time payment)
    const singleUseProduct = await stripe.products.create({
      name: 'Ladybug AI - Single Use',
      description: 'One-time 24-hour access with 2000 token limit'
    });

    const singleUsePrice = await stripe.prices.create({
      product: singleUseProduct.id,
      unit_amount: 399, // $3.99
      currency: 'usd'
    });

    console.log('✅ All prices created successfully!\n');
    console.log('📋 COPY THESE ENVIRONMENT VARIABLES:\n');
    console.log(`STRIPE_TRIAL_PRICE_ID=${trialPrice.id}`);
    console.log(`STRIPE_MONTHLY_PRICE_ID=${monthlyPrice.id}`);
    console.log(`STRIPE_ANNUAL_PRICE_ID=${annualPrice.id}`);
    console.log(`STRIPE_SINGLE_USE_PRICE_ID=${singleUsePrice.id}\n`);
    
    console.log('🔧 NEXT STEPS:');
    console.log('1. Copy the environment variables above');
    console.log('2. Add them to your Vercel environment variables');
    console.log('3. Redeploy your application');
    console.log('4. Test at: https://ladybugai.us/api/stripe/test-config');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure to:');
    console.log('1. Replace "sk_test_..." with your actual Stripe secret key');
    console.log('2. Run: npm install stripe');
    console.log('3. Try again');
  }
}

createPrices();
