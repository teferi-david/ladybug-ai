# 🔧 Troubleshooting Guide

## Common Issues & Solutions

---

## ❌ "An error occurred, please try again" - Free Tier Not Working

### Problem:
When testing the free AI Humanizer on the landing page (without logging in), you get an error message.

### Root Cause:
The API routes need environment variables (Supabase, OpenAI) to function. If these aren't set in Vercel, the API calls fail.

### Solution:

**You MUST complete the service setup before the site will work!**

Follow these steps in order:

#### Step 1: Setup Supabase (15 min)
1. Go to https://supabase.com
2. Create new project: `ladybug-ai`
3. Wait for setup (2-3 min)
4. Go to **SQL Editor** → Paste entire `supabase/schema.sql`
5. Click **Run**
6. Go to **Settings** → **API** → Copy these:
   - Project URL
   - anon public key
   - service_role key

#### Step 2: Setup OpenAI (5 min)
1. Go to https://platform.openai.com
2. Add payment method
3. Add $10-20 credit
4. Go to https://platform.openai.com/api-keys
5. Create new key
6. **Copy it immediately**

#### Step 3: Add to Vercel (5 min)
1. Go to Vercel Dashboard
2. Your Project → **Settings** → **Environment Variables**
3. Add these:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   OPENAI_API_KEY=sk-...
   ```
4. Click **Save**

#### Step 4: Redeploy (2 min)
1. Go to **Deployments** tab
2. Click **...** on latest deployment
3. Click **Redeploy**
4. Wait 1-2 minutes

#### Step 5: Test Again
1. Visit your site
2. Scroll to "Try Our Free AI Humanizer"
3. Paste text
4. Click "Humanize Text"
5. Should work! ✅

---

## ❌ "Service not configured yet" Error

### Problem:
Error message says "Service not configured yet"

### Solution:
This means environment variables are missing. Follow Step 1-4 above.

### Quick Check:
In Vercel Dashboard → Settings → Environment Variables

**Required Variables:**
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ OPENAI_API_KEY

**All must be present!**

---

## ❌ "Database not configured" Error

### Problem:
Error mentions database or Supabase

### Solution:
1. Check Supabase credentials are in Vercel env vars
2. Verify Supabase URL is correct (starts with `https://`)
3. Make sure you ran the SQL schema
4. Redeploy after adding env vars

### Verify Supabase:
1. Go to Supabase Dashboard
2. Click on your project
3. Go to **Table Editor**
4. You should see tables: `users`, `daily_usage`, `subscriptions`, `usage_logs`

If tables are missing → Run `supabase/schema.sql` again

---

## ❌ "OpenAI API not configured" Error

### Problem:
Error mentions OpenAI

### Solution:
1. Verify `OPENAI_API_KEY` is in Vercel env vars
2. Check key starts with `sk-`
3. Verify OpenAI account has credits
4. Make sure billing is set up in OpenAI

### Check OpenAI Credits:
1. Go to https://platform.openai.com/usage
2. Should show available credits
3. If zero, add more credit

---

## ❌ Authentication Not Working

### Problem:
Can't sign up or login

### Solutions:

**1. Check Supabase Auth is Enabled**
- Supabase Dashboard → Authentication → Providers
- Email provider should be enabled ✅

**2. Check Redirect URLs**
- Supabase → Authentication → URL Configuration
- Add your Vercel URL:
  ```
  https://your-site.vercel.app
  https://your-site.vercel.app/dashboard
  https://your-site.vercel.app/auth/callback
  ```

**3. Check Email Confirmations**
- Check your email (including spam)
- Or disable email confirmation in Supabase

---

## ❌ Stripe Checkout Not Working

### Problem:
Can't complete payment or checkout fails

### Solutions:

**1. Using Test Mode?**
- Stripe Dashboard → Toggle should say "TEST MODE"
- Use test card: `4242 4242 4242 4242`

**2. Check Environment Variables**
Verify these are in Vercel:
- `STRIPE_SECRET_KEY` (starts with `sk_test_`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (starts with `pk_test_`)
- All 4 price IDs (start with `price_`)

**3. Products Created?**
- Stripe Dashboard → Products
- Should have 4 products (Trial, Monthly, Annual, Single Use)

**4. Webhook Configured?**
- Will set up later, checkout works without it initially

---

## ❌ Plan Not Activating After Payment

### Problem:
Paid but plan shows as inactive in dashboard

### Solution:

**This means webhook isn't working:**

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click **Add endpoint**
3. URL: `https://your-vercel-url.vercel.app/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy webhook secret (starts with `whsec_`)
6. Add to Vercel as `STRIPE_WEBHOOK_SECRET`
7. Redeploy

**Test webhook:**
- Make a test purchase
- Check Stripe Dashboard → Webhooks → Recent deliveries
- Should show successful events ✅

---

## ❌ Environment Variables Not Working

### Problem:
Added env vars but still getting errors

### Solution:

**YOU MUST REDEPLOY after adding environment variables!**

1. Add/update env vars in Vercel
2. Go to **Deployments** tab
3. Click **...** → **Redeploy**
4. Wait for build to complete
5. Test again

**Common Mistake:**
- ❌ Adding env vars but not redeploying
- ✅ Add env vars → Redeploy → Test

---

## ❌ Build Failing on Vercel

### Problem:
Deployment shows "Build Failed"

### Solutions:

**1. Check Build Logs**
- Click on failed deployment
- Read error message
- Usually TypeScript or missing dependency

**2. Common Build Errors:**

**Missing dependencies:**
```bash
# In your local terminal
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

**TypeScript errors:**
- Already handled with `ignoreBuildErrors: true` in `next.config.js`

**3. Test Build Locally:**
```bash
npm run build
```
If it fails locally, fix errors before pushing

---

## ❌ Daily Usage Not Resetting

### Problem:
Free tier limits don't reset daily

### Solution:

**Vercel Cron (Paid Plan Only):**
The `vercel.json` cron job only works on Vercel Pro plan.

**Workaround for Free Tier:**

**Option 1: Manual Reset**
Call the reset endpoint manually:
```bash
curl -X GET https://your-site.vercel.app/api/resetDailyUsage \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Option 2: External Cron Service (Free)**
1. Go to https://cron-job.org
2. Sign up (free)
3. Create new cron job:
   - URL: `https://your-site.vercel.app/api/resetDailyUsage`
   - Schedule: Daily at midnight UTC
   - Add header: `Authorization: Bearer YOUR_CRON_SECRET`

**Option 3: Increase Free Tier**
- Change daily limit from 2 to 5 uses
- Users won't hit limit as often

---

## ❌ "Invalid Token" or "Unauthorized" Errors

### Problem:
Getting authentication errors even when logged in

### Solutions:

**1. Clear Browser Cache**
- Hard reload: Cmd/Ctrl + Shift + R
- Or clear all cookies for your site

**2. Check Session**
- Open DevTools → Application → Cookies
- Should see Supabase auth cookie
- If missing, log out and back in

**3. Token Expired**
- Sessions expire after time
- Log out and log back in
- Should create new token

---

## ❌ Vercel URL Changed After Redeploy

### Problem:
Your Vercel URL changed and now things break

### Solution:

**Update URLs Everywhere:**

1. **Vercel Environment Variables**
   - Update `NEXT_PUBLIC_APP_URL`

2. **Supabase**
   - Update Site URL
   - Update Redirect URLs

3. **Stripe Webhook**
   - Update webhook endpoint URL

4. **Redeploy Again**

---

## 🔍 How to Debug Issues

### Step 1: Check Browser Console
1. Right-click → Inspect → Console tab
2. Look for red errors
3. Note the error message

### Step 2: Check Vercel Logs
1. Vercel Dashboard → Your Project
2. Click on latest deployment
3. Click **Functions** tab
4. Look for errors in logs

### Step 3: Check Supabase Logs
1. Supabase Dashboard → Logs
2. Filter by errors
3. Look for failed queries

### Step 4: Check Stripe Logs
1. Stripe Dashboard → Developers → Logs
2. Look for failed webhooks or API calls

---

## 📋 Pre-Launch Checklist

Before you can use the site, complete ALL of these:

### Required (Must Do):
- [ ] Supabase project created
- [ ] SQL schema run in Supabase
- [ ] OpenAI API key obtained
- [ ] OpenAI billing set up
- [ ] Stripe account created (test mode)
- [ ] 4 Stripe products created
- [ ] All environment variables in Vercel
- [ ] Site redeployed after adding env vars
- [ ] Free tier tested and working
- [ ] User registration tested
- [ ] Login tested

### Recommended (Should Do):
- [ ] Stripe webhook configured
- [ ] Test payment completed
- [ ] Plan activation verified
- [ ] All 3 AI tools tested
- [ ] Mobile responsive checked

### Optional (Can Do Later):
- [ ] Custom domain added
- [ ] Analytics set up
- [ ] Email service configured
- [ ] Switch to Stripe live mode

---

## 💡 Quick Fixes

### Site Not Loading?
1. Check Vercel deployment status
2. Check for build errors
3. Try hard reload (Cmd/Ctrl + Shift + R)

### Features Not Working?
1. Check environment variables
2. Check Vercel logs
3. Redeploy

### Database Errors?
1. Verify Supabase credentials
2. Check SQL schema was run
3. Check RLS policies enabled

### Payment Errors?
1. Use Stripe test mode
2. Use test card: 4242 4242 4242 4242
3. Check price IDs are correct

---

## 🆘 Still Having Issues?

### Resources:
1. **DEPLOYMENT_CHECKLIST.md** - Step-by-step setup
2. **DEPLOY_NOW.md** - Detailed deployment guide
3. **NEXT_STEPS.md** - Full roadmap
4. **README.md** - Technical documentation

### Check:
- Vercel logs (for server errors)
- Browser console (for client errors)
- Supabase logs (for database errors)
- Stripe logs (for payment errors)

### Common Solution:
**90% of issues are fixed by:**
1. Adding all environment variables
2. Redeploying
3. Hard refreshing the browser

---

## ✅ Verification Steps

To verify everything is working:

### 1. Free Tier Test
- [ ] Visit homepage (not logged in)
- [ ] Scroll to free trial section
- [ ] Paste text
- [ ] Click "Humanize Text"
- [ ] Should get result back ✅

### 2. Auth Test
- [ ] Click "Register"
- [ ] Create account
- [ ] Should redirect to dashboard ✅

### 3. Checkout Test
- [ ] Go to Pricing
- [ ] Select plan
- [ ] Use card: 4242 4242 4242 4242
- [ ] Complete checkout
- [ ] Should show plan as active ✅

### 4. Tools Test (Logged In)
- [ ] Try AI Humanizer
- [ ] Try Paraphraser
- [ ] Try Citation Generator
- [ ] All should work ✅

---

**If ALL tests pass ✅ → Your site is fully functional!**

**If any test fails ❌ → Follow the relevant section above**

---

## 🎯 Summary

**The #1 reason the free tier doesn't work:**
- Missing environment variables in Vercel

**The solution:**
1. Add Supabase credentials
2. Add OpenAI API key
3. Redeploy
4. Test again

**Follow DEPLOYMENT_CHECKLIST.md for the complete setup process!**

