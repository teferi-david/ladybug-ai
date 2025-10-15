# 🚀 Vercel Environment Variables Setup - Do This NOW

## ⚠️ Your Site Won't Work Until You Complete This

Your code is perfect! The API calls are correctly routed through Next.js backend. But Vercel needs your API keys.

---

## 📋 Step-by-Step Instructions

### 1️⃣ Copy Your Environment Variables

Open your `.env.local` file and copy these values:

```bash
# Copy these from your .env.local file:

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-proj-...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://ladybugai.us
CRON_SECRET=your-secret-here

# ⚠️ IMPORTANT: Copy the ACTUAL values from your .env.local file!
# The values above are just placeholders.
```

---

### 2️⃣ Go to Vercel Dashboard

**Direct Link:** https://vercel.com/dashboard

1. Find your project (probably named `ladybug-ai`)
2. Click on it

---

### 3️⃣ Add Environment Variables

1. Click **"Settings"** tab (top navigation)
2. Click **"Environment Variables"** in the left sidebar
3. For EACH variable above:

   **Add This Variable:**
   - **Key:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Value:** (copy from your .env.local file)
   - **Environments:** ✅ Production ✅ Preview ✅ Development
   - Click **"Save"**

   **Repeat for ALL 8 variables:**
   - ✅ `NEXT_PUBLIC_SUPABASE_URL`
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`
   - ✅ `OPENAI_API_KEY` ⬅️ **MOST IMPORTANT**
   - ✅ `STRIPE_SECRET_KEY`
   - ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - ✅ `STRIPE_WEBHOOK_SECRET`
   - ✅ `NEXT_PUBLIC_APP_URL`
   - ✅ `CRON_SECRET`

---

### 4️⃣ Redeploy Your Site

**CRITICAL:** Environment variables only apply to NEW deployments!

1. Click **"Deployments"** tab
2. Find the latest deployment (top of list)
3. Click the **"..."** (three dots) button
4. Click **"Redeploy"**
5. ✅ Confirm "Redeploy"
6. ⏳ Wait 1-2 minutes for build to complete

---

### 5️⃣ Test Your Site

1. Go to: **https://ladybugai.us**
2. Scroll to the "Try It Free" section
3. Paste this test text:
   ```
   This is AI generated text that needs to be humanized for my essay.
   ```
4. Click **"Humanize Text"**
5. ✅ Should work in 2-3 seconds!

---

## 🔍 Verification Checklist

Before testing, verify:

- [ ] Added ALL 9 environment variables to Vercel
- [ ] Selected all 3 environments (Production, Preview, Development)
- [ ] Clicked "Save" for each variable
- [ ] Redeployed the site (critical!)
- [ ] Waited for build to complete (green checkmark)
- [ ] Cleared browser cache (Cmd+Shift+R or Ctrl+Shift+R)

---

## 🐛 If Still Not Working

### Check Build Logs:

1. In Vercel, click "Deployments"
2. Click on the latest deployment
3. Look for errors in the build log
4. Common issues:
   - ❌ "OPENAI_API_KEY is not defined" → Variable not saved properly
   - ❌ "401 Unauthorized" → OpenAI key is invalid
   - ❌ Build successful but API fails → Forgot to redeploy after adding vars

### Check Runtime Logs:

1. Click "Deployments"
2. Click on your live deployment
3. Click "Functions" tab
4. Click on `/api/humanize`
5. Check logs for errors

### Test Specific Endpoint:

Open your browser console (F12) and run:

```javascript
fetch('https://ladybugai.us/api/humanize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Test text' })
})
.then(r => r.json())
.then(console.log)
```

Expected result:
```json
{
  "result": "Humanized text here...",
  "tokensUsed": 5,
  "usesRemaining": 1
}
```

---

## ✅ Expected Behavior After Setup

### Free Tier (No Login):
- ✅ 2 uses per day per tool
- ✅ 500 token limit per request
- ✅ Shows "1 use remaining" after first use
- ✅ Shows upgrade modal after 2 uses

### With Account:
- ✅ Unlimited uses (with active subscription)
- ✅ No token limits
- ✅ Usage tracked in dashboard

---

## 🎯 Architecture Confirmation

Your setup is **ALREADY CORRECT:**

```
Browser (Client)
    ↓
    | fetch('/api/humanize', { ... })
    ↓
Next.js API Route (Server)
/app/api/humanize/route.ts
    ↓
    | openai.chat.completions.create({ ... })
    ↓
OpenAI API (External)
    ↓
    | Returns humanized text
    ↓
Back to Browser
```

**✅ OpenAI API key never exposed to client**  
**✅ All AI calls happen server-side**  
**✅ Secure and correct implementation**

---

## 📞 Quick Support

If you get an error, tell me:

1. **Exact error message** (from alert or console)
2. **Screenshot** of Vercel environment variables page
3. **Build logs** (if deployment failed)

Most likely fix: Make sure you clicked "Redeploy" after adding variables!

---

## 🚀 Ready?

1. ✅ Copy environment variables from above
2. ✅ Add to Vercel Settings → Environment Variables
3. ✅ Redeploy from Deployments tab
4. ✅ Test on https://ladybugai.us
5. ✅ Enjoy your working site!

**Time needed:** 5-10 minutes  
**Difficulty:** Easy (just copy & paste)

