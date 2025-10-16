# 🚨 URGENT FIX: "Unable to Connect to API" Error

## The Problem:
Your site shows: **"Unable to connect to API"**

## The Cause:
Vercel doesn't have your environment variables (API keys) yet.

## The Solution:
Add your environment variables to Vercel (5 minutes)

---

## 🎯 STEP-BY-STEP FIX

### Step 1: Open Vercel Dashboard
Go to: **https://vercel.com/dashboard**

### Step 2: Find Your Project
Look for your project (probably named `ladybug-ai` or similar)
Click on it.

### Step 3: Go to Settings
Click the **"Settings"** tab at the top

### Step 4: Open Environment Variables
Click **"Environment Variables"** in the left sidebar

### Step 5: Add Each Variable

You need to add **9 environment variables**. Here's the list:

#### Variable 1: NEXT_PUBLIC_SUPABASE_URL
- Click **"Add New"**
- Name: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://sjdvdsneczqiwdnjjnss.supabase.co`
- Environments: ✅ Production ✅ Preview ✅ Development
- Click **"Save"**

#### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
- Click **"Add New"**
- Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: Copy from your `.env.local` file (line 4)
- Environments: ✅ Production ✅ Preview ✅ Development
- Click **"Save"**

#### Variable 3: SUPABASE_SERVICE_ROLE_KEY
- Click **"Add New"**
- Name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: Copy from your `.env.local` file (line 5)
- Environments: ✅ Production ✅ Preview ✅ Development
- Click **"Save"**

#### Variable 4: OPENAI_API_KEY ⚠️ MOST IMPORTANT
- Click **"Add New"**
- Name: `OPENAI_API_KEY`
- Value: Copy from your `.env.local` file (line 8)
- Environments: ✅ Production ✅ Preview ✅ Development
- Click **"Save"**

#### Variable 5: STRIPE_SECRET_KEY
- Click **"Add New"**
- Name: `STRIPE_SECRET_KEY`
- Value: Copy from your `.env.local` file (line 11)
- Environments: ✅ Production ✅ Preview ✅ Development
- Click **"Save"**

#### Variable 6: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- Click **"Add New"**
- Name: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Value: Copy from your `.env.local` file (line 12)
- Environments: ✅ Production ✅ Preview ✅ Development
- Click **"Save"**

#### Variable 7: STRIPE_WEBHOOK_SECRET
- Click **"Add New"**
- Name: `STRIPE_WEBHOOK_SECRET`
- Value: `whsec_S3MPxkzakmpeyNWC2nFmQskx4DPFZSrZ`
- Environments: ✅ Production ✅ Preview ✅ Development
- Click **"Save"**

#### Variable 8: NEXT_PUBLIC_APP_URL
- Click **"Add New"**
- Name: `NEXT_PUBLIC_APP_URL`
- Value: `https://ladybugai.us`
- Environments: ✅ Production ✅ Preview ✅ Development
- Click **"Save"**

#### Variable 9: CRON_SECRET
- Click **"Add New"**
- Name: `CRON_SECRET`
- Value: `ladybug_secret_2024` (or any random string)
- Environments: ✅ Production ✅ Preview ✅ Development
- Click **"Save"**

---

### Step 6: Redeploy (CRITICAL!)

**Variables only work after redeployment!**

1. Click **"Deployments"** tab (at the top)
2. Find the latest deployment (first item in the list)
3. Click the **"..."** button (three dots)
4. Click **"Redeploy"**
5. Confirm "Redeploy"
6. ⏳ Wait 2 minutes for the build

---

### Step 7: Test Your Site

After deployment completes (green checkmark):

1. Go to **https://ladybugai.us**
2. Hard refresh: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows)
3. Scroll to "Try It Free"
4. Enter text: "This is AI text that needs humanization"
5. Click **"Humanize Text"**
6. ✅ Should work in 2-3 seconds!

---

## 📋 Verification Checklist

Before testing, make sure:

- [ ] Added all 9 environment variables
- [ ] Selected all 3 environments for each variable
- [ ] Clicked "Save" for each variable
- [ ] Redeployed the site
- [ ] Waited for build to complete (green ✅)
- [ ] Hard refreshed browser (Cmd+Shift+R)

---

## 🎯 Why This Fixes It

**Currently:**
```
Browser → Vercel (no API keys) → ❌ Can't connect to OpenAI/Supabase
```

**After adding env vars:**
```
Browser → Vercel (has API keys) → ✅ Connects to OpenAI/Supabase → Works!
```

---

## ⏱️ Time Estimate

- Add 9 variables: **5 minutes**
- Redeploy: **2 minutes**
- Test: **1 minute**
- **Total: 8 minutes until working!**

---

## 🆘 If Still Not Working After This

1. Check browser console (F12) for new error message
2. Verify all 9 variables are in Vercel
3. Verify you redeployed AFTER adding variables
4. Check deployment logs in Vercel for errors

But 99% of the time, adding the environment variables and redeploying fixes it!

---

## 💡 Quick Copy Commands

To make it easier, you can copy values from your `.env.local`:

```bash
# On Mac/Linux, these commands will show you each value:
grep NEXT_PUBLIC_SUPABASE_URL .env.local
grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local
grep SUPABASE_SERVICE_ROLE_KEY .env.local
grep OPENAI_API_KEY .env.local
grep STRIPE_SECRET_KEY .env.local
grep NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY .env.local
grep STRIPE_WEBHOOK_SECRET .env.local | head -1
grep NEXT_PUBLIC_APP_URL .env.local
```

Then copy each value to Vercel!

---

## ✅ Expected Result

After completing these steps, your site will:
- ✅ Connect to OpenAI successfully
- ✅ Humanize text in 2-3 seconds
- ✅ Show "1 use remaining" after first use
- ✅ Track daily usage properly
- ✅ Work for all 3 tools (Humanizer, Paraphraser, Citation Generator)

**Your code is perfect - it just needs the API keys on Vercel!** 🚀

