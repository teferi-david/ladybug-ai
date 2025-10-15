# 🚀 Deploy Ladybug AI to Vercel - Complete Guide

Follow these steps to get your Ladybug AI live on the internet!

---

## Part 1: Push to GitHub (5 minutes)

### Step 1: Initialize Git Repository

```bash
cd "/Users/teferi/Documents/Projects/Ladybug AI"
git init
git add .
git commit -m "Initial commit: Complete Ladybug AI SaaS application"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `ladybug-ai` (or your preferred name)
3. Keep it **Private** (recommended for now)
4. **Don't** initialize with README (we already have one)
5. Click **Create repository**

### Step 3: Push to GitHub

Copy the commands from GitHub (they'll look like this):

```bash
git remote add origin https://github.com/YOUR_USERNAME/ladybug-ai.git
git branch -M main
git push -u origin main
```

✅ **Code is now on GitHub!**

---

## Part 2: Setup Supabase (10 minutes)

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click **Start your project**
3. Sign in with GitHub
4. Click **New Project**
5. Fill in:
   - **Name**: `ladybug-ai`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free
6. Click **Create new project**
7. Wait 2-3 minutes for database setup

### Step 2: Run Database Schema

1. In Supabase Dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open your local file: `supabase/schema.sql`
4. Copy the **entire contents**
5. Paste into SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned"

### Step 3: Configure Email Authentication

1. Go to **Authentication** → **Providers** (left sidebar)
2. Click **Email**
3. Enable **Email provider**
4. Enable **Confirm email** (recommended)
5. Click **Save**

### Step 4: Get Your API Keys

1. Go to **Project Settings** → **API** (gear icon, bottom left)
2. Copy these values (you'll need them soon):
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (click "Reveal" first)

✅ **Supabase is configured!**

---

## Part 3: Setup OpenAI (5 minutes)

### Step 1: Create OpenAI Account

1. Go to https://platform.openai.com
2. Sign up or sign in
3. Add payment method (required for API access)
   - Go to **Settings** → **Billing**
   - Add payment method
   - Add at least $5 credit (recommended $10-20 to start)

### Step 2: Create API Key

1. Go to https://platform.openai.com/api-keys
2. Click **Create new secret key**
3. Name: `Ladybug AI Production`
4. Click **Create secret key**
5. **COPY THE KEY NOW** (you can't see it again!)
   - Save as: `OPENAI_API_KEY`

### Step 3: Set Usage Limits (Recommended)

1. Go to **Settings** → **Limits**
2. Set **Monthly budget**: $20 (or your preference)
3. Set **Email notification threshold**: $15
4. Click **Save**

✅ **OpenAI is ready!**

---

## Part 4: Setup Stripe (15 minutes)

### Step 1: Create Stripe Account

1. Go to https://dashboard.stripe.com/register
2. Sign up with your email
3. Complete account setup
4. **Stay in TEST MODE** (toggle in top right)

### Step 2: Get API Keys

1. Go to **Developers** → **API keys**
2. Copy these (TEST MODE):
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY` (click "Reveal")

### Step 3: Create Products & Prices

#### Product 1: 3-Day Trial

1. Go to **Products** → Click **Add Product**
2. Fill in:
   - **Name**: `3-Day Trial`
   - **Description**: `Full access to all AI tools for 3 days`
   - **Pricing**: One-time
   - **Price**: `1.49` USD
   - **Payment type**: One-time
3. Click **Add product**
4. **Copy the Price ID** (starts with `price_...`)
   - Save as: `STRIPE_TRIAL_PRICE_ID`

#### Product 2: Monthly Plan

1. Click **Add Product**
2. Fill in:
   - **Name**: `Monthly Plan`
   - **Description**: `Unlimited access to all AI tools, billed monthly`
   - **Pricing**: Recurring
   - **Price**: `15.49` USD
   - **Billing period**: Monthly
3. Click **Add product**
4. **Copy the Price ID**
   - Save as: `STRIPE_MONTHLY_PRICE_ID`

#### Product 3: Annual Plan

1. Click **Add Product**
2. Fill in:
   - **Name**: `Annual Plan`
   - **Description**: `Unlimited access, best value - save $36/year`
   - **Pricing**: Recurring
   - **Price**: `149.49` USD
   - **Billing period**: Yearly
3. Click **Add product**
4. **Copy the Price ID**
   - Save as: `STRIPE_ANNUAL_PRICE_ID`

#### Product 4: Single Use

1. Click **Add Product**
2. Fill in:
   - **Name**: `Single Use Access`
   - **Description**: `2,000 tokens, 24-hour access`
   - **Pricing**: One-time
   - **Price**: `3.99` USD
   - **Payment type**: One-time
3. Click **Add product**
4. **Copy the Price ID**
   - Save as: `STRIPE_SINGLE_USE_PRICE_ID`

### Step 4: Enable Customer Portal

1. Go to **Settings** → **Billing** → **Customer portal**
2. Click **Activate test mode**
3. Configure settings:
   - ✅ Allow customers to update payment methods
   - ✅ Allow customers to cancel subscriptions
   - ✅ Show subscription history
4. Click **Save changes**

✅ **Stripe products created!** (We'll setup webhooks after Vercel deployment)

---

## Part 5: Deploy to Vercel (10 minutes)

### Step 1: Create Vercel Account

1. Go to https://vercel.com/signup
2. Click **Continue with GitHub**
3. Authorize Vercel

### Step 2: Import Your Repository

1. Click **Add New...** → **Project**
2. Find your `ladybug-ai` repository
3. Click **Import**

### Step 3: Configure Project

1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `./` (leave as is)
3. **Build Command**: `npm run build` (auto-filled)
4. **Output Directory**: `.next` (auto-filled)

### Step 4: Add Environment Variables

Click **Environment Variables** and add these **one by one**:

```env
# Supabase (from Part 2, Step 4)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# OpenAI (from Part 3, Step 2)
OPENAI_API_KEY=sk-...

# Stripe (from Part 4, Step 2)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Price IDs (from Part 4, Step 3)
STRIPE_TRIAL_PRICE_ID=price_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_ANNUAL_PRICE_ID=price_...
STRIPE_SINGLE_USE_PRICE_ID=price_...

# App URL (we'll update this after deployment)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Cron Secret (create a random string)
CRON_SECRET=your_random_secret_12345_make_it_long

# Webhook Secret (leave blank for now, we'll add after Stripe webhook setup)
STRIPE_WEBHOOK_SECRET=
```

**Important**: For `NEXT_PUBLIC_APP_URL`, put a placeholder for now. We'll update it in a moment.

### Step 5: Deploy!

1. Click **Deploy**
2. Wait 2-3 minutes for build to complete
3. You'll see "🎉 Congratulations!" when done
4. Click **Continue to Dashboard**

### Step 6: Get Your Live URL

1. You'll see your deployment URL (e.g., `https://ladybug-ai-xxxxx.vercel.app`)
2. Click on the URL to visit your live site!
3. **Copy this URL** - you'll need it next

### Step 7: Update App URL

1. In Vercel Dashboard, go to **Settings** → **Environment Variables**
2. Find `NEXT_PUBLIC_APP_URL`
3. Click **Edit**
4. Replace with your actual Vercel URL: `https://your-actual-url.vercel.app`
5. Click **Save**
6. Go to **Deployments** tab
7. Click **...** on latest deployment → **Redeploy** → **Redeploy**

✅ **Your site is LIVE!**

---

## Part 6: Configure Stripe Webhooks (5 minutes)

### Step 1: Create Webhook Endpoint

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL**: `https://your-vercel-url.vercel.app/api/stripe/webhook`
   (Replace with your actual Vercel URL)
4. Click **Select events**
5. Choose these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
6. Click **Add events**
7. Click **Add endpoint**

### Step 2: Get Webhook Secret

1. Click on your new webhook endpoint
2. Under **Signing secret**, click **Reveal**
3. Copy the secret (starts with `whsec_...`)

### Step 3: Add to Vercel

1. Go back to Vercel Dashboard
2. **Settings** → **Environment Variables**
3. Find `STRIPE_WEBHOOK_SECRET`
4. Click **Edit**
5. Paste your webhook secret
6. Click **Save**
7. **Redeploy** again (Deployments → ... → Redeploy)

✅ **Stripe webhooks configured!**

---

## Part 7: Configure Supabase Auth (3 minutes)

### Step 1: Update Site URL

1. Go to Supabase Dashboard
2. **Authentication** → **URL Configuration**
3. **Site URL**: `https://your-vercel-url.vercel.app`
4. Click **Save**

### Step 2: Add Redirect URLs

1. In **Redirect URLs** section, click **Add URL**
2. Add these URLs (replace with your actual URL):
   ```
   https://your-vercel-url.vercel.app/dashboard
   https://your-vercel-url.vercel.app/auth/callback
   https://your-vercel-url.vercel.app
   ```
3. Click **Save**

✅ **Supabase auth configured!**

---

## Part 8: Test Your Live Site! (10 minutes)

### Test 1: Free Tier (No Login)

1. Visit your Vercel URL
2. Scroll to "Try It Free" section
3. Enter some text
4. Click "Humanize Text"
5. Should work! ✅

### Test 2: User Registration

1. Click "Get Started" or "Register"
2. Create account with your email
3. Check your email for confirmation (if enabled)
4. You should be redirected to dashboard ✅

### Test 3: Stripe Checkout (Test Mode)

1. Go to **Pricing** page
2. Click on any plan
3. Use test card: `4242 4242 4242 4242`
4. Expiry: Any future date (e.g., `12/34`)
5. CVC: Any 3 digits (e.g., `123`)
6. ZIP: Any 5 digits (e.g., `12345`)
7. Complete checkout
8. You should be redirected to dashboard
9. Plan should show as active ✅

### Test 4: AI Tools

1. Go to **Humanizer**, **Paraphraser**, or **Citation**
2. Enter some text
3. Click generate
4. Should work with your active subscription! ✅

### Test 5: Stripe Webhook

1. After checkout, go to Stripe Dashboard
2. **Developers** → **Webhooks**
3. Click on your webhook
4. Check **Recent deliveries**
5. Should see successful events ✅

---

## 🎉 You're Live!

Your Ladybug AI SaaS is now:
- ✅ Live on the internet
- ✅ Connected to Supabase database
- ✅ Authentication working
- ✅ Stripe payments working
- ✅ AI tools functional
- ✅ Ready for real users!

---

## 📝 Quick Reference

### Your URLs
- **Live Site**: https://your-vercel-url.vercel.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **Stripe Dashboard**: https://dashboard.stripe.com
- **OpenAI Dashboard**: https://platform.openai.com

### Test Card (Stripe)
- **Card**: 4242 4242 4242 4242
- **Expiry**: Any future date
- **CVC**: Any 3 digits
- **ZIP**: Any 5 digits

---

## 🔄 Making Updates

After making code changes:

```bash
git add .
git commit -m "Your change description"
git push
```

Vercel will **automatically redeploy**! (takes 1-2 minutes)

---

## 🚨 Troubleshooting

### Site not loading?
- Check Vercel build logs (Deployments tab)
- Verify all environment variables are set

### Stripe checkout failing?
- Verify webhook secret is correct
- Check webhook events are selected
- Test in Stripe test mode first

### Authentication not working?
- Check Supabase URL configuration
- Verify redirect URLs include your Vercel domain
- Check Supabase Auth is enabled

### AI tools not working?
- Verify OpenAI API key is correct
- Check you have credits in OpenAI account
- Look at Vercel logs (Functions tab) for errors

---

## 🎯 Going to Production

When ready for real users:

1. **Stripe**: Switch to Live Mode
   - Create products again in live mode
   - Update price IDs in Vercel env vars
   - Create new webhook for live mode

2. **OpenAI**: Already in production mode

3. **Supabase**: Already in production mode

4. **Custom Domain** (optional):
   - Go to Vercel → Settings → Domains
   - Add your custom domain
   - Update all URLs (Stripe webhook, Supabase, env vars)

---

## 💰 Costs

- **Vercel**: Free (up to 100GB bandwidth)
- **Supabase**: Free (up to 500MB database)
- **OpenAI**: ~$0.002 per request (very cheap!)
- **Stripe**: 2.9% + $0.30 per transaction

**Total to start**: $0/month (plus OpenAI usage)

---

## 🎊 Congratulations!

Your SaaS is live and ready to make money! 🚀

Share your live URL and start getting users!

**Need help?** Check the other documentation files or review error logs in Vercel/Supabase/Stripe dashboards.

