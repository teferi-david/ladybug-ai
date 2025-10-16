const Stripe = require('stripe');

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function getOrCreatePrices() {
  try {
    console.log('Setting up Stripe prices for Ladybug AI...\n');

    // Define the plans we need
    const plans = [
      {
        name: 'Trial',
        productName: 'Ladybug AI - 3 Day Trial',
        productDescription: '3-day trial access to all Ladybug AI tools',
        priceAmount: 149, // $1.49
        currency: 'usd',
        recurring: null, // One-time payment
        envVar: 'STRIPE_TRIAL_PRICE_ID'
      },
      {
        name: 'Monthly',
        productName: 'Ladybug AI - Monthly Plan',
        productDescription: 'Monthly subscription to all Ladybug AI tools',
        priceAmount: 1549, // $15.49
        currency: 'usd',
        recurring: { interval: 'month' },
        envVar: 'STRIPE_MONTHLY_PRICE_ID'
      },
      {
        name: 'Annual',
        productName: 'Ladybug AI - Annual Plan',
        productDescription: 'Annual subscription to all Ladybug AI tools',
        priceAmount: 14949, // $149.49
        currency: 'usd',
        recurring: { interval: 'year' },
        envVar: 'STRIPE_ANNUAL_PRICE_ID'
      },
      {
        name: 'Single Use',
        productName: 'Ladybug AI - Single Use',
        productDescription: 'One-time 24-hour access with 2000 token limit',
        priceAmount: 399, // $3.99
        currency: 'usd',
        recurring: null, // One-time payment
        envVar: 'STRIPE_SINGLE_USE_PRICE_ID'
      }
    ];

    const results = {};

    for (const plan of plans) {
      console.log(`Creating ${plan.name} product and price...`);
      
      // Create product
      const product = await stripe.products.create({
        name: plan.productName,
        description: plan.productDescription,
        metadata: {
          plan_type: plan.name.toLowerCase()
        }
      });

      // Create price
      const priceData = {
        product: product.id,
        unit_amount: plan.priceAmount,
        currency: plan.currency,
        metadata: {
          plan_type: plan.name.toLowerCase()
        }
      };

      if (plan.recurring) {
        priceData.recurring = plan.recurring;
      }

      const price = await stripe.prices.create(priceData);

      results[plan.name] = {
        productId: product.id,
        priceId: price.id,
        amount: plan.priceAmount,
        currency: plan.currency,
        recurring: plan.recurring ? plan.recurring.interval : 'one-time'
      };

      console.log(`✅ ${plan.name}: ${price.id} ($${(plan.priceAmount / 100).toFixed(2)} ${plan.recurring ? `per ${plan.recurring.interval}` : 'one-time'})`);
    }

    console.log('\n=== ENVIRONMENT VARIABLES ===');
    console.log('Copy these to your .env.local file and Vercel environment variables:\n');
    
    for (const plan of plans) {
      console.log(`${plan.envVar}=${results[plan.name].priceId}`);
    }

    console.log('\n=== VERIFICATION ===');
    console.log('Test your configuration by visiting:');
    console.log('https://ladybugai.us/api/stripe/test-config\n');

    return results;

  } catch (error) {
    console.error('Error setting up Stripe prices:', error);
    throw error;
  }
}

// Run the script
getOrCreatePrices()
  .then(() => {
    console.log('🎉 Stripe prices created successfully!');
    console.log('📝 Remember to update your environment variables');
    console.log('🚀 Redeploy your application after updating env vars');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
