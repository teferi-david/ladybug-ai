# 🚀 Deployment Checklist - Quick Reference

Follow this checklist to deploy your Ladybug AI to production!

---

## ✅ Step-by-Step Deployment

### 🔲 Step 1: Push to GitHub (2 minutes)

1. Go to https://github.com/new
2. Create a new repository named `ladybug-ai` (or any name you prefer)
3. Keep it **Private** (recommended)
4. **Don't** initialize with README
5. Click **Create repository**
6. Run these commands in your terminal:

```bash
cd "/Users/teferi/Documents/Projects/Ladybug AI"
git remote add origin https://github.com/YOUR_USERNAME/ladybug-ai.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your GitHub username!**

✅ Code is now on GitHub!

---

### 🔲 Step 2: Setup Supabase Database (8 minutes)

1. ✅ Go to https://supabase.com → Sign in with GitHub
2. ✅ Click **New Project**
3. ✅ Fill in:
   - Name: `ladybug-ai`
   - Database Password: (create strong password, save it!)
   - Region: (choose closest)
4. ✅ Click **Create new project** (wait 2-3 min)
5. ✅ Go to **SQL Editor** → **New Query**
6. ✅ Copy entire `supabase/schema.sql` file contents
7. ✅ Paste and click **Run**
8. ✅ Go to **Authentication** → **Providers** → Enable **Email**
9. ✅ Go to **Settings** → **API** → Copy:
   - Project URL
   - anon public key
   - service_role key (click "Reveal")

**Save these 3 keys somewhere safe!**

---

### 🔲 Step 3: Setup OpenAI (3 minutes)

1. ✅ Go to https://platform.openai.com
2. ✅ Sign in/Sign up
3. ✅ Add payment method (**Settings** → **Billing**)
4. ✅ Add $10-20 credit
5. ✅ Go to https://platform.openai.com/api-keys
6. ✅ Click **Create new secret key**
7. ✅ Name: `Ladybug AI Production`
8. ✅ **COPY THE KEY** (can't see it again!)

**Save this key!**

---

### 🔲 Step 4: Setup Stripe Products (10 minutes)

1. ✅ Go to https://dashboard.stripe.com → Sign up
2. ✅ **Stay in TEST MODE** (toggle top right)
3. ✅ Go to **Developers** → **API keys** → Copy:
   - Publishable key (pk_test_...)
   - Secret key (sk_test_...)

**Save these keys!**

4. ✅ Go to **Products** → **Add Product** (create 4 products):

**Product 1:**
- Name: `3-Day Trial`
- Price: `1.49` USD, One-time
- **Copy Price ID** → save as `STRIPE_TRIAL_PRICE_ID`

**Product 2:**
- Name: `Monthly Plan`
- Price: `15.49` USD, Recurring Monthly
- **Copy Price ID** → save as `STRIPE_MONTHLY_PRICE_ID`

**Product 3:**
- Name: `Annual Plan`
- Price: `149.49` USD, Recurring Yearly
- **Copy Price ID** → save as `STRIPE_ANNUAL_PRICE_ID`

**Product 4:**
- Name: `Single Use Access`
- Price: `3.99` USD, One-time
- **Copy Price ID** → save as `STRIPE_SINGLE_USE_PRICE_ID`

**Save all 4 price IDs!**

5. ✅ Go to **Settings** → **Billing** → **Customer portal**
6. ✅ Click **Activate test mode** → **Save changes**

---

### 🔲 Step 5: Deploy to Vercel (5 minutes)

1. ✅ Go to https://vercel.com/signup
2. ✅ Click **Continue with GitHub**
3. ✅ Click **Add New...** → **Project**
4. ✅ Import your `ladybug-ai` repository
5. ✅ Click **Environment Variables**
6. ✅ Add these variables:

```env
NEXT_PUBLIC_SUPABASE_URL=<from Supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase>

OPENAI_API_KEY=<from OpenAI>

STRIPE_SECRET_KEY=<from Stripe>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<from Stripe>
STRIPE_TRIAL_PRICE_ID=<from Stripe>
STRIPE_MONTHLY_PRICE_ID=<from Stripe>
STRIPE_ANNUAL_PRICE_ID=<from Stripe>
STRIPE_SINGLE_USE_PRICE_ID=<from Stripe>

NEXT_PUBLIC_APP_URL=https://temp.vercel.app
CRON_SECRET=make_a_random_long_string_here_12345
STRIPE_WEBHOOK_SECRET=
```

7. ✅ Click **Deploy**
8. ✅ Wait 2-3 minutes
9. ✅ **Copy your Vercel URL** (e.g., `https://ladybug-ai-xxxxx.vercel.app`)

---

### 🔲 Step 6: Update Vercel URL (2 minutes)

1. ✅ In Vercel → **Settings** → **Environment Variables**
2. ✅ Edit `NEXT_PUBLIC_APP_URL`
3. ✅ Replace with your actual Vercel URL
4. ✅ Click **Save**
5. ✅ Go to **Deployments** → **...** → **Redeploy**

---

### 🔲 Step 7: Setup Stripe Webhook (3 minutes)

1. ✅ In Stripe → **Developers** → **Webhooks**
2. ✅ Click **Add endpoint**
3. ✅ Endpoint URL: `https://YOUR-VERCEL-URL.vercel.app/api/stripe/webhook`
4. ✅ Click **Select events** → Choose:
   - checkout.session.completed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
5. ✅ Click **Add endpoint**
6. ✅ Click endpoint → **Reveal** signing secret
7. ✅ Copy the secret (whsec_...)
8. ✅ In Vercel → **Settings** → **Environment Variables**
9. ✅ Edit `STRIPE_WEBHOOK_SECRET` → Paste secret → Save
10. ✅ **Redeploy** again

---

### 🔲 Step 8: Configure Supabase URLs (2 minutes)

1. ✅ In Supabase → **Authentication** → **URL Configuration**
2. ✅ Site URL: `https://YOUR-VERCEL-URL.vercel.app`
3. ✅ Add Redirect URLs:
   ```
   https://YOUR-VERCEL-URL.vercel.app/dashboard
   https://YOUR-VERCEL-URL.vercel.app/auth/callback
   https://YOUR-VERCEL-URL.vercel.app
   ```
4. ✅ Click **Save**

---

### 🔲 Step 9: Test Your Live Site! (5 minutes)

1. ✅ Visit your Vercel URL
2. ✅ Try free tier (no login) - should work!
3. ✅ Create account - check email
4. ✅ Go to Pricing → Choose plan
5. ✅ Use test card: `4242 4242 4242 4242`
6. ✅ Complete checkout
7. ✅ Check dashboard - plan should be active!
8. ✅ Try AI tools - should work!

---

## 🎊 YOU'RE LIVE!

Your Ladybug AI is now:
- ✅ Live on the internet
- ✅ Taking payments
- ✅ Ready for users!

**Your live URL**: https://YOUR-VERCEL-URL.vercel.app

---

## 📝 Important Info to Save

Create a secure note with:

```
=== LADYBUG AI CREDENTIALS ===

VERCEL URL: https://your-url.vercel.app

SUPABASE:
- Project URL: https://xxxxx.supabase.co
- Database Password: [your password]
- Anon Key: eyJhbGc...
- Service Role Key: eyJhbGc...

OPENAI:
- API Key: sk-...

STRIPE (TEST MODE):
- Publishable Key: pk_test_...
- Secret Key: sk_test_...
- Webhook Secret: whsec_...
- Trial Price ID: price_...
- Monthly Price ID: price_...
- Annual Price ID: price_...
- Single Use Price ID: price_...

CRON SECRET: [your random string]
```

---

## 🔄 Making Updates

After code changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

Vercel auto-deploys in 1-2 minutes!

---

## 🚨 Quick Troubleshooting

**Build failed?**
- Check Vercel logs
- Verify all env vars are set

**Checkout not working?**
- Check Stripe webhook is configured
- Verify price IDs are correct

**Auth not working?**
- Check Supabase redirect URLs
- Verify Supabase keys

**AI tools failing?**
- Check OpenAI has credits
- Verify API key is correct

---

## 📞 Need Help?

Read **DEPLOY_NOW.md** for detailed instructions!

---

## 🎯 Next Steps

1. ✅ Test everything thoroughly
2. ✅ Invite friends to test
3. ✅ Monitor Vercel/Stripe/OpenAI dashboards
4. ✅ When ready: Switch Stripe to Live Mode
5. ✅ Add custom domain (optional)
6. ✅ Launch! 🚀

---

**Current Status**: Ready to deploy! Start with Step 1 above.

