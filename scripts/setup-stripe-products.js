const Stripe = require('stripe');

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createStripeProductsAndPrices() {
  try {
    console.log('Creating Stripe products and prices...\n');

    // 1. Create Trial Product and Price
    console.log('Creating Trial product...');
    const trialProduct = await stripe.products.create({
      name: 'Ladybug AI - 3 Day Trial',
      description: '3-day trial access to all Ladybug AI tools',
      metadata: {
        plan_type: 'trial'
      }
    });
    console.log('Trial Product ID:', trialProduct.id);

    const trialPrice = await stripe.prices.create({
      product: trialProduct.id,
      unit_amount: 149, // $1.49 in cents
      currency: 'usd',
      metadata: {
        plan_type: 'trial'
      }
    });
    console.log('Trial Price ID:', trialPrice.id);
    console.log('Trial Price Amount: $1.49\n');

    // 2. Create Monthly Product and Price
    console.log('Creating Monthly product...');
    const monthlyProduct = await stripe.products.create({
      name: 'Ladybug AI - Monthly Plan',
      description: 'Monthly subscription to all Ladybug AI tools',
      metadata: {
        plan_type: 'monthly'
      }
    });
    console.log('Monthly Product ID:', monthlyProduct.id);

    const monthlyPrice = await stripe.prices.create({
      product: monthlyProduct.id,
      unit_amount: 1549, // $15.49 in cents
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan_type: 'monthly'
      }
    });
    console.log('Monthly Price ID:', monthlyPrice.id);
    console.log('Monthly Price Amount: $15.49/month\n');

    // 3. Create Annual Product and Price
    console.log('Creating Annual product...');
    const annualProduct = await stripe.products.create({
      name: 'Ladybug AI - Annual Plan',
      description: 'Annual subscription to all Ladybug AI tools',
      metadata: {
        plan_type: 'annual'
      }
    });
    console.log('Annual Product ID:', annualProduct.id);

    const annualPrice = await stripe.prices.create({
      product: annualProduct.id,
      unit_amount: 14949, // $149.49 in cents
      currency: 'usd',
      recurring: {
        interval: 'year'
      },
      metadata: {
        plan_type: 'annual'
      }
    });
    console.log('Annual Price ID:', annualPrice.id);
    console.log('Annual Price Amount: $149.49/year\n');

    // 4. Create Single Use Product and Price
    console.log('Creating Single Use product...');
    const singleUseProduct = await stripe.products.create({
      name: 'Ladybug AI - Single Use',
      description: 'One-time 24-hour access with 2000 token limit',
      metadata: {
        plan_type: 'singleUse'
      }
    });
    console.log('Single Use Product ID:', singleUseProduct.id);

    const singleUsePrice = await stripe.prices.create({
      product: singleUseProduct.id,
      unit_amount: 399, // $3.99 in cents
      currency: 'usd',
      metadata: {
        plan_type: 'singleUse'
      }
    });
    console.log('Single Use Price ID:', singleUsePrice.id);
    console.log('Single Use Price Amount: $3.99\n');

    // Output environment variables
    console.log('=== ENVIRONMENT VARIABLES TO SET ===');
    console.log('Add these to your .env.local file and Vercel environment variables:\n');
    console.log(`STRIPE_TRIAL_PRICE_ID=${trialPrice.id}`);
    console.log(`STRIPE_MONTHLY_PRICE_ID=${monthlyPrice.id}`);
    console.log(`STRIPE_ANNUAL_PRICE_ID=${annualPrice.id}`);
    console.log(`STRIPE_SINGLE_USE_PRICE_ID=${singleUsePrice.id}\n`);

    console.log('=== SUMMARY ===');
    console.log('✅ All products and prices created successfully!');
    console.log('✅ Copy the environment variables above');
    console.log('✅ Add them to your .env.local file');
    console.log('✅ Add them to your Vercel environment variables');
    console.log('✅ Redeploy your application');

  } catch (error) {
    console.error('Error creating Stripe products and prices:', error);
    throw error;
  }
}

// Run the script
createStripeProductsAndPrices()
  .then(() => {
    console.log('\n🎉 Stripe setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Stripe setup failed:', error.message);
    process.exit(1);
  });
