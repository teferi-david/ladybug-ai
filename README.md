# Ladybug AI

A complete, production-ready AI web application offering three powerful tools:
1. **AI Humanizer** – Rewrites AI-generated text to sound natural and human-like
2. **Paraphraser** – Rephrases text for clarity and variation
3. **Citation Generator** – Formats citations in APA and MLA styles

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Shadcn/UI
- **Backend:** Next.js API routes
- **Database & Auth:** Supabase (PostgreSQL + Auth)
- **AI Model:** OpenAI GPT-4o-mini
- **Payments:** Stripe Checkout + Customer Portal
- **Hosting:** Vercel

## Features

- ✅ Three AI-powered writing tools
- ✅ User authentication (login, register, password reset)
- ✅ Subscription management with Stripe
- ✅ Free tier (2 uses per day per tool, 500 token limit)
- ✅ Multiple pricing plans (Trial, Monthly, Annual, Single-use)
- ✅ User dashboard with usage tracking
- ✅ Responsive design with modern UI
- ✅ Production-ready with TypeScript

## Pricing Plans

1. **Trial Plan** – $1.49 for 3-day access
2. **Monthly Plan** – $15.49 per month
3. **Annual Plan** – $149.49 per year ($12.49/mo equivalent)
4. **Single Use** – $3.99 for one-time access (24 hours, 2000 tokens)

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Supabase account
- OpenAI API key
- Stripe account

### 2. Clone and Install

```bash
git clone <your-repo-url>
cd "Ladybug AI"
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Stripe Price IDs (create these in Stripe Dashboard)
STRIPE_TRIAL_PRICE_ID=price_xxx_trial
STRIPE_MONTHLY_PRICE_ID=price_xxx_monthly
STRIPE_ANNUAL_PRICE_ID=price_xxx_annual
STRIPE_SINGLE_USE_PRICE_ID=price_xxx_single_use

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron Secret (for daily reset endpoint)
CRON_SECRET=your_random_secret_key
```

### 4. Setup Supabase

1. Create a new Supabase project
2. Run the SQL schema from `supabase/schema.sql` in the Supabase SQL editor
3. Enable email authentication in Supabase Auth settings
4. Copy your project URL and keys to `.env.local`

### 5. Setup Stripe

1. Create a Stripe account and get your API keys
2. Create four products/prices in Stripe Dashboard:
   - Trial: $1.49 one-time payment
   - Monthly: $15.49 recurring monthly subscription
   - Annual: $149.49 recurring yearly subscription
   - Single Use: $3.99 one-time payment
3. Copy the price IDs to `.env.local`
4. Set up a webhook endpoint pointing to `/api/stripe/webhook`
5. Add webhook events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
6. Copy the webhook secret to `.env.local`

### 6. Setup OpenAI

1. Get your OpenAI API key from https://platform.openai.com/api-keys
2. Add it to `.env.local`

### 7. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see the app.

### 8. Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add all environment variables in Vercel project settings
4. Deploy!

## Project Structure

```
Ladybug AI/
├── app/
│   ├── api/                    # API routes
│   │   ├── humanize/
│   │   ├── paraphrase/
│   │   ├── citation/
│   │   ├── stripe/
│   │   ├── resetDailyUsage/
│   │   └── user/
│   ├── citation/               # Citation generator page
│   ├── dashboard/              # User dashboard
│   ├── forgot-password/        # Password reset
│   ├── humanizer/              # AI Humanizer tool
│   ├── login/                  # Login page
│   ├── paraphraser/            # Paraphraser tool
│   ├── pricing/                # Pricing page
│   ├── register/               # Registration page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   └── globals.css             # Global styles
├── components/
│   ├── ui/                     # Shadcn UI components
│   ├── loading-spinner.tsx
│   ├── navbar.tsx
│   └── upgrade-modal.tsx
├── lib/
│   ├── supabase/               # Supabase clients
│   ├── auth-helpers.ts         # Auth utilities
│   ├── openai.ts               # OpenAI integration
│   ├── stripe.ts               # Stripe configuration
│   └── utils.ts                # Helper functions
├── supabase/
│   └── schema.sql              # Database schema
├── types/
│   └── database.types.ts       # TypeScript types
├── public/
│   └── logo.png                # Logo placeholder
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## API Routes

### AI Tools
- `POST /api/humanize` – Humanize AI-generated text
- `POST /api/paraphrase` – Paraphrase text
- `POST /api/citation` – Generate citations

### Stripe
- `POST /api/stripe/create-checkout-session` – Create Stripe checkout
- `POST /api/stripe/create-portal-session` – Create customer portal session
- `POST /api/stripe/webhook` – Handle Stripe webhooks

### User
- `GET /api/user` – Get current user data

### Cron
- `GET /api/resetDailyUsage` – Reset daily free tier usage (secured with CRON_SECRET)

## Free Tier Logic

- Unauthenticated users: 2 uses per day per tool (500 tokens max per request)
- Usage tracked by IP address or user ID
- Automatically resets at UTC midnight via cron job
- After limit reached, users are prompted to upgrade

## Subscription Flow

1. User selects a plan on pricing page
2. Redirected to Stripe Checkout
3. After successful payment, Stripe webhook updates user plan in database
4. User gains access to tools based on their plan
5. Users can manage subscriptions via Stripe Customer Portal

## Development Notes

- All AI tools check authentication and subscription status
- Free tier users have token limits enforced
- Single-use plan tracks remaining tokens
- Expired plans are blocked from using tools
- Mobile-responsive design throughout

## Support

For issues or questions, please create an issue in the repository.

## License

MIT License - feel free to use this project for your own purposes.

