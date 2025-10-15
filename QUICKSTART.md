# Quick Start Guide - Ladybug AI

Get Ladybug AI running in 10 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- A code editor (VS Code recommended)

## Setup Steps

### 1. Install Dependencies (2 min)

```bash
npm install
```

### 2. Get Your API Keys (5 min)

**Supabase:**
1. Go to [supabase.com](https://supabase.com) → New Project
2. Wait for database setup
3. Go to Settings → API → Copy project URL and anon key
4. Go to SQL Editor → Paste entire `supabase/schema.sql` file → Run

**OpenAI:**
1. Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create new key → Copy it

**Stripe:**
1. Visit [dashboard.stripe.com](https://dashboard.stripe.com)
2. Get test API keys from Developers → API keys
3. Create 4 products (Trial $1.49, Monthly $15.49, Annual $149.49, Single $3.99)
4. Copy each price ID

### 3. Create .env.local (1 min)

Copy this template and fill in your keys:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

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

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=random_secret_123
```

### 4. Run Development Server (1 min)

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## Test the App

### Test Free Features
1. Open homepage (don't login)
2. Scroll to "Try It Free" section
3. Paste text → Click "Humanize Text"
4. Should work 2 times (500 tokens each)

### Test Authentication
1. Click "Get Started"
2. Create account with email/password
3. Should redirect to dashboard

### Test Subscription (Test Mode)
1. Go to Pricing
2. Select any plan
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout
5. Dashboard should show active plan

### Test AI Tools
1. Login with active subscription
2. Visit Humanizer/Paraphraser/Citation
3. Process text → Should work unlimited times

## Stripe Webhook Setup (For Local Testing)

### Option 1: Stripe CLI (Recommended)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook secret to .env.local
```

### Option 2: Use Test Mode Without Webhooks
- Payments will work
- Webhook events won't update database
- Manually update user plan in Supabase for testing

## Common Issues

**❌ "Supabase URL is not defined"**
- Check `.env.local` exists
- Verify `NEXT_PUBLIC_SUPABASE_URL` is set
- Restart dev server

**❌ "OpenAI API key invalid"**
- Verify key starts with `sk-`
- Check OpenAI account has credits
- Ensure no extra spaces in `.env.local`

**❌ "Stripe webhook failed"**
- Use Stripe CLI for local testing
- Or skip webhook testing (manually update DB)

**❌ Tools return "Unauthorized"**
- Make sure you're logged in
- Check Supabase session is valid
- Verify token in browser DevTools → Application → Cookies

**❌ Database errors**
- Ensure entire `schema.sql` was run
- Check Supabase logs
- Verify RLS policies are enabled

## Project Structure

```
app/
  ├── page.tsx              # Landing page with free trial
  ├── humanizer/           # AI Humanizer tool
  ├── paraphraser/         # Paraphraser tool
  ├── citation/            # Citation generator
  ├── pricing/             # Pricing page
  ├── dashboard/           # User dashboard
  ├── login/              # Login page
  ├── register/           # Sign up page
  └── api/                # Backend API routes
      ├── humanize/
      ├── paraphrase/
      ├── citation/
      └── stripe/

components/              # Reusable UI components
lib/                    # Utilities and helpers
supabase/              # Database schema
types/                 # TypeScript types
```

## Next Steps

1. ✅ App running locally
2. 📚 Read full [README.md](README.md) for details
3. 🚀 Check [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
4. 📖 Review [SETUP.md](SETUP.md) for advanced configuration

## Features Included

✅ Three AI tools (Humanizer, Paraphraser, Citation)  
✅ User authentication (Supabase)  
✅ Subscription payments (Stripe)  
✅ Free tier (2 uses/day per tool)  
✅ Multiple pricing plans  
✅ User dashboard  
✅ Subscription management  
✅ Responsive design  
✅ Production-ready TypeScript  

## Need Help?

1. Check the error message carefully
2. Review `.env.local` for typos
3. Restart the dev server
4. Check browser console for errors
5. Review Supabase/Stripe/OpenAI dashboards

## You're Ready! 🎉

Your Ladybug AI app is now running locally. Start building or customize as needed!

**Test Card for Stripe:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

