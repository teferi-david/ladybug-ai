# Ladybug AI - Quick Setup Guide

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait for your database to be ready
3. Go to **SQL Editor** and run the entire `supabase/schema.sql` file
4. Go to **Authentication** → **Settings** and ensure email auth is enabled
5. Go to **Project Settings** → **API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Setup OpenAI

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy it → `OPENAI_API_KEY`

### 4. Setup Stripe

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Get your API keys from **Developers** → **API keys**:
   - Secret key → `STRIPE_SECRET_KEY`
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

3. Create products and prices:
   - Go to **Products** → **Add Product**
   - Create 4 products:
     
     **Product 1: 3-Day Trial**
     - Name: "3-Day Trial"
     - Price: $1.49
     - Billing: One-time
     - Copy price ID → `STRIPE_TRIAL_PRICE_ID`
     
     **Product 2: Monthly Plan**
     - Name: "Monthly Plan"
     - Price: $15.49
     - Billing: Recurring monthly
     - Copy price ID → `STRIPE_MONTHLY_PRICE_ID`
     
     **Product 3: Annual Plan**
     - Name: "Annual Plan"
     - Price: $149.49
     - Billing: Recurring yearly
     - Copy price ID → `STRIPE_ANNUAL_PRICE_ID`
     
     **Product 4: Single Use**
     - Name: "Single Use"
     - Price: $3.99
     - Billing: One-time
     - Copy price ID → `STRIPE_SINGLE_USE_PRICE_ID`

4. Setup Webhook:
   - Go to **Developers** → **Webhooks**
   - Click **Add endpoint**
   - Endpoint URL: `https://your-domain.vercel.app/api/stripe/webhook` (use ngrok for local testing)
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy webhook signing secret → `STRIPE_WEBHOOK_SECRET`

### 5. Create .env.local

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_TRIAL_PRICE_ID=price_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_ANNUAL_PRICE_ID=price_...
STRIPE_SINGLE_USE_PRICE_ID=price_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron Secret (generate random string)
CRON_SECRET=your_random_secret_here_12345
```

### 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 7. Test Stripe Webhooks Locally (Optional)

Install Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
```

Login and forward webhooks:
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Use the webhook secret provided by the CLI in your `.env.local`

### 8. Deploy to Vercel

1. Push your code to GitHub
2. Go to [https://vercel.com](https://vercel.com)
3. Click **Import Project**
4. Select your GitHub repository
5. Add all environment variables from `.env.local`
6. Deploy!
7. Update Stripe webhook URL to your Vercel domain
8. Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables

## Testing

### Test Free Tier
1. Visit homepage without logging in
2. Try the AI Humanizer demo (2 uses per day, 500 tokens max)

### Test Authentication
1. Click "Get Started" → Register
2. Create an account with email/password
3. Check Supabase Auth dashboard to see new user

### Test Subscription
1. Login to your account
2. Go to Pricing page
3. Use Stripe test card: `4242 4242 4242 4242`
4. Expiry: Any future date
5. CVC: Any 3 digits
6. Complete checkout
7. Check Dashboard to see active plan

### Test AI Tools
1. Login with active subscription
2. Visit Humanizer, Paraphraser, or Citation Generator
3. Process text and verify output

## Troubleshooting

**Issue: Supabase RLS errors**
- Make sure you ran the entire `schema.sql` file
- Check that RLS policies are enabled

**Issue: Stripe webhook not working**
- Verify webhook secret matches between Stripe and `.env.local`
- Check Stripe Dashboard → Webhooks for failed events
- Use Stripe CLI for local testing

**Issue: OpenAI errors**
- Verify API key is correct
- Check you have credits in your OpenAI account
- Ensure billing is set up in OpenAI

**Issue: Daily usage not resetting**
- Vercel cron jobs only work on paid plans
- Manually call `/api/resetDailyUsage` with correct auth header
- Or implement a different reset mechanism

## Need Help?

Check the main README.md for more detailed information about the project structure and features.

