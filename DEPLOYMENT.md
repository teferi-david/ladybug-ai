# Deployment Guide for Ladybug AI

## Pre-Deployment Checklist

### ✅ Required Services Setup
- [ ] Supabase project created
- [ ] Supabase database schema applied
- [ ] OpenAI API key obtained
- [ ] Stripe account created
- [ ] Stripe products/prices created
- [ ] Stripe webhook configured
- [ ] GitHub repository created

## Vercel Deployment Steps

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Ladybug AI"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ladybug-ai.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

### 3. Add Environment Variables

In Vercel project settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_TRIAL_PRICE_ID
STRIPE_MONTHLY_PRICE_ID
STRIPE_ANNUAL_PRICE_ID
STRIPE_SINGLE_USE_PRICE_ID
NEXT_PUBLIC_APP_URL
CRON_SECRET
```

**Important:** Set `NEXT_PUBLIC_APP_URL` to your Vercel domain (e.g., `https://ladybug-ai.vercel.app`)

### 4. Deploy

Click "Deploy" and wait for the build to complete.

## Post-Deployment Configuration

### Update Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Update endpoint URL to: `https://YOUR_VERCEL_DOMAIN.vercel.app/api/stripe/webhook`
3. Ensure these events are selected:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### Update Supabase Auth Settings

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel domain to Site URL: `https://YOUR_VERCEL_DOMAIN.vercel.app`
3. Add Redirect URLs:
   - `https://YOUR_VERCEL_DOMAIN.vercel.app/auth/callback`
   - `https://YOUR_VERCEL_DOMAIN.vercel.app/dashboard`

### Enable Vercel Cron (Optional - Pro Plan Required)

Vercel cron jobs for daily usage reset only work on paid plans. Alternatives:

**Option 1: Use Vercel Cron (Pro Plan)**
- Already configured in `vercel.json`
- Will run automatically at midnight UTC

**Option 2: Use External Cron Service (Free)**
- Set up cron-job.org or similar
- Point to: `https://YOUR_VERCEL_DOMAIN.vercel.app/api/resetDailyUsage`
- Add header: `Authorization: Bearer YOUR_CRON_SECRET`
- Schedule: Daily at 00:00 UTC

**Option 3: Manual Reset**
- Call the endpoint manually when needed
- Or remove daily limits for MVP

## Testing Production Deployment

### 1. Test Public Pages
- [ ] Landing page loads
- [ ] Pricing page displays
- [ ] Login/Register forms work

### 2. Test Authentication
- [ ] Register new account
- [ ] Receive confirmation email
- [ ] Login with credentials
- [ ] Password reset works

### 3. Test Free Tier
- [ ] Use tools without login (2x daily limit)
- [ ] Token limit enforced (500 tokens)
- [ ] Upgrade modal appears

### 4. Test Payments (Use Stripe Test Mode)
- [ ] Select a plan
- [ ] Stripe checkout opens
- [ ] Complete payment with test card: `4242 4242 4242 4242`
- [ ] Redirect to dashboard
- [ ] Plan shows as active
- [ ] Subscription appears in Stripe Dashboard

### 5. Test AI Tools
- [ ] Humanizer processes text
- [ ] Paraphraser works correctly
- [ ] Citation generator creates citations
- [ ] Copy to clipboard functions

### 6. Test Subscription Management
- [ ] "Manage Subscription" opens Stripe portal
- [ ] Can cancel subscription
- [ ] Webhook updates database

## Monitoring & Maintenance

### Logs
- Check Vercel logs for errors
- Monitor Stripe webhook logs
- Review Supabase logs

### Database
- Regularly check Supabase for storage usage
- Monitor daily_usage table growth
- Clean old usage_logs if needed

### API Usage
- Monitor OpenAI API usage and costs
- Set up OpenAI usage limits
- Track Stripe API calls

### Performance
- Use Vercel Analytics
- Monitor response times
- Check Core Web Vitals

## Troubleshooting

### Stripe Webhook Failing
1. Check Vercel logs for errors
2. Verify webhook secret matches
3. Test webhook with Stripe CLI
4. Check Stripe Dashboard for failed events

### Authentication Issues
1. Verify Supabase URLs in environment variables
2. Check Supabase Auth settings
3. Ensure email templates are configured
4. Review Supabase Auth logs

### AI Tools Not Working
1. Verify OpenAI API key is valid
2. Check OpenAI account has credits
3. Review API error messages in Vercel logs
4. Test API endpoints directly

### Database Errors
1. Verify Supabase service role key
2. Check RLS policies are correct
3. Ensure schema is fully applied
4. Test queries in Supabase SQL editor

## Security Checklist

- [ ] All environment variables are set
- [ ] Stripe webhook secret is configured
- [ ] Supabase RLS policies enabled
- [ ] Service role key kept secret
- [ ] CORS properly configured
- [ ] Rate limiting considered
- [ ] Input validation in place
- [ ] SQL injection prevented (using Supabase client)

## Performance Optimization

- [ ] Images optimized
- [ ] Fonts loaded efficiently
- [ ] API routes cached where appropriate
- [ ] Database queries optimized
- [ ] Vercel Edge Functions considered for auth

## Scaling Considerations

When your app grows:
1. **Database**: Upgrade Supabase plan for more connections
2. **AI Processing**: Consider OpenAI rate limits and costs
3. **Payments**: Review Stripe fees and volume discounts
4. **Hosting**: Vercel auto-scales, but monitor usage
5. **Storage**: Plan for user data growth in Supabase

## Backup Strategy

1. **Database**: Enable Supabase automatic backups
2. **Code**: Keep GitHub repository updated
3. **Environment Variables**: Store securely (1Password, etc.)
4. **Stripe Data**: Download reports regularly

## Support & Updates

1. Monitor user feedback
2. Track feature requests
3. Plan regular updates
4. Keep dependencies updated
5. Review security advisories

## Cost Breakdown (Estimated)

- **Vercel**: Free (Hobby) or $20/mo (Pro)
- **Supabase**: Free tier covers ~50K users/mo
- **OpenAI**: Pay-per-use (~$0.002 per request with GPT-4o-mini)
- **Stripe**: 2.9% + $0.30 per transaction
- **Domain**: ~$12/year (if custom domain)

**Total**: Can start completely free, scales with usage.

---

Congratulations! Your Ladybug AI app is now live! 🎉

