# 🐞 START HERE - Ladybug AI

Welcome to **Ladybug AI**! This is a complete, production-ready Next.js SaaS application.

## 🎯 What is Ladybug AI?

A professional AI writing assistant with three powerful tools:
- **AI Humanizer** - Makes AI text sound natural
- **Paraphraser** - Rephrases content clearly
- **Citation Generator** - Creates APA/MLA citations

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Environment
Create `.env.local` with your API keys:
```env
# Get these from supabase.com
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key

# Get this from platform.openai.com
OPENAI_API_KEY=your_key

# Get these from stripe.com
STRIPE_SECRET_KEY=your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_key
STRIPE_WEBHOOK_SECRET=your_secret
STRIPE_TRIAL_PRICE_ID=price_xxx
STRIPE_MONTHLY_PRICE_ID=price_xxx
STRIPE_ANNUAL_PRICE_ID=price_xxx
STRIPE_SINGLE_USE_PRICE_ID=price_xxx

# App config
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=random_secret_123
```

### Step 3: Run
```bash
npm run dev
```

Visit http://localhost:3000 🎉

## 📚 Documentation

Choose your path:

### 🏃 **Just want to get it running?**
→ Read **[QUICKSTART.md](QUICKSTART.md)** (10 minutes)

### 📖 **Want detailed setup instructions?**
→ Read **[SETUP.md](SETUP.md)** (comprehensive guide)

### 🚀 **Ready to deploy to production?**
→ Read **[DEPLOYMENT.md](DEPLOYMENT.md)** (Vercel deployment)

### 🔍 **Want to understand the project?**
→ Read **[README.md](README.md)** (full documentation)

### ✅ **Curious what's included?**
→ Read **[CHECKLIST.md](CHECKLIST.md)** (feature checklist)

### 📊 **Want project overview?**
→ Read **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** (architecture & stats)

## 🎓 What You Need

### Required Accounts (All Free to Start):
1. **Supabase** - Database & Auth
   - Sign up: https://supabase.com
   - Free tier: 500MB database

2. **OpenAI** - AI Processing
   - Sign up: https://platform.openai.com
   - Pay per use: ~$0.002/request

3. **Stripe** - Payments
   - Sign up: https://stripe.com
   - Free for testing

### Required Tools:
- Node.js 18+ 
- npm or yarn
- Git (optional)
- Code editor

## 📁 Project Structure

```
📦 Ladybug AI
├── 📂 app/              # Next.js pages & API routes
├── 📂 components/       # React components
├── 📂 lib/              # Utilities & helpers
├── 📂 supabase/         # Database schema
├── 📂 types/            # TypeScript types
├── 📂 public/           # Static assets
├── 📄 Documentation files
└── 📄 Config files
```

## ✨ Features Included

✅ **Three AI Tools**
- AI Humanizer
- Paraphraser  
- Citation Generator (APA & MLA)

✅ **Authentication**
- Email/password signup
- Login & logout
- Password reset
- Protected routes

✅ **Subscriptions**
- 4 pricing plans
- Stripe checkout
- Subscription management
- Automatic renewals

✅ **Free Tier**
- 2 uses per day per tool
- 500 token limit
- No credit card needed

✅ **User Dashboard**
- Plan status
- Usage tracking
- Subscription management

✅ **Modern UI**
- Responsive design
- Tailwind CSS
- Shadcn/UI components
- Smooth animations

## 🎨 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: OpenAI GPT-4o-mini
- **Payments**: Stripe
- **Hosting**: Vercel

## 💰 Pricing Plans

Your app includes 4 ready-to-use pricing plans:

1. **Trial** - $1.49 (3 days)
2. **Monthly** - $15.49/month
3. **Annual** - $149.49/year (save $36)
4. **Single Use** - $3.99 (2000 tokens, 24h)

## 🧪 Testing

### Test with Free Tier:
1. Visit homepage (without logging in)
2. Scroll to "Try It Free"
3. Use AI Humanizer (works 2x per day)

### Test with Subscription:
1. Create account
2. Go to Pricing
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout
5. Use tools unlimited!

## 🆘 Need Help?

### Common Issues:

**"Can't connect to Supabase"**
- Check `.env.local` exists
- Verify Supabase URL and keys
- Restart dev server

**"OpenAI error"**
- Verify API key is correct
- Check you have OpenAI credits
- Ensure billing is set up

**"Stripe checkout not working"**
- Use Stripe test mode keys
- Create products in Stripe Dashboard
- Use test card: 4242 4242 4242 4242

### Where to Get Help:
1. Check the documentation files
2. Read error messages carefully
3. Review browser console
4. Check service dashboards

## 🎯 Next Steps

1. ✅ **Install** → `npm install`
2. ✅ **Configure** → Create `.env.local`
3. ✅ **Run** → `npm run dev`
4. ✅ **Test** → Try the features
5. ✅ **Deploy** → Push to Vercel

## 📝 Quick Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 🌟 What Makes This Special?

✅ **Production-Ready** - Not a demo, real SaaS app  
✅ **Complete** - Everything you need included  
✅ **Modern** - Latest Next.js 14, TypeScript  
✅ **Documented** - 6+ documentation files  
✅ **Type-Safe** - TypeScript throughout  
✅ **Scalable** - Starts free, grows with you  
✅ **Beautiful** - Professional UI/UX  
✅ **Tested** - Working code, no hallucinations  

## 🚀 You're Ready!

Everything is set up and ready to go. Just:

1. Install dependencies
2. Add your API keys
3. Start the dev server
4. Start building!

---

**Questions?** → Check the documentation files  
**Ready to deploy?** → Read DEPLOYMENT.md  
**Want to customize?** → All code is yours!

Good luck! 🍀

