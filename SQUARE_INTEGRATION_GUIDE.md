# Square Payments Integration Guide

## 🚀 Complete Square Payments Integration for Ladybug AI

This guide covers the complete Square payments integration with Supabase user tier management.

## 📋 Prerequisites

- Square Developer Account
- Square Application ID and Access Token
- Supabase Project with Service Role Key
- Next.js 14+ Application

## 🔧 Environment Variables

Add these to your `.env.local` file:

```bash
# Square Configuration
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_LOCATION_ID=your_square_location_id
SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_signature_key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🗄️ Database Setup

### 1. Run the Supabase Schema

Execute the SQL in `supabase/schema.sql` in your Supabase SQL editor:

```sql
-- Creates payments table with proper indexes and RLS policies
-- Updates users table with required columns
-- Adds helper functions for plan management
```

### 2. Verify Table Structure

Ensure your `users` table has these columns:
- `current_plan` (text)
- `plan_expiry` (timestamptz)
- `subscription_status` (text)
- `uses_left` (int)
- `words_used` (int)
- `updated_at` (timestamptz)

## 🔗 Square Configuration

### 1. Create Square Application

1. Go to [Square Developer Dashboard](https://developer.squareup.com/)
2. Create a new application
3. Get your Application ID and Access Token
4. Note your Location ID

### 2. Configure Webhooks

1. In Square Developer Dashboard, go to Webhooks
2. Add webhook endpoint: `https://your-domain.com/api/square/webhook`
3. Select events: `payment.created`, `payment.updated`
4. Copy the webhook signature key

### 3. Test in Sandbox

- Use Square's sandbox environment for testing
- Test with Square's test card numbers
- Verify webhook delivery

## 🛠️ Implementation Details

### Core Files Created

1. **`lib/squareClient.ts`** - Square SDK client and helper functions
2. **`lib/supabaseServer.ts`** - Supabase server client with user management
3. **`app/api/square/create-checkout/route.ts`** - Checkout creation endpoint
4. **`app/api/square/webhook/route.ts`** - Webhook handler with verification
5. **`app/api/square/return/route.ts`** - Return URL handler
6. **`components/BuyButton.tsx`** - Frontend purchase component
7. **`supabase/schema.sql`** - Database schema and policies

### Plan Configuration

```typescript
const PLAN_CONFIG = {
  trial: {
    name: '3-Day Trial',
    amount: 149, // $1.49
    duration: 3, // days
    wordLimit: 5000,
  },
  monthly: {
    name: 'Monthly Plan',
    amount: 1549, // $15.49
    duration: 30, // days
    wordLimit: 25000,
  },
  annual: {
    name: 'Annual Plan',
    amount: 14949, // $149.49
    duration: 365, // days
    wordLimit: 25000,
  },
  'single-use': {
    name: 'Single Use',
    amount: 399, // $3.99
    duration: 1, // day
    wordLimit: 2000,
  },
}
```

## 🔒 Security Features

### 1. Webhook Verification
- HMAC-SHA256 signature verification
- Prevents unauthorized webhook calls
- Uses `SQUARE_WEBHOOK_SIGNATURE_KEY`

### 2. Authentication
- Requires Supabase session for checkout creation
- Validates user tokens server-side
- No client-side payment processing

### 3. Idempotency
- Payment tracking prevents duplicate processing
- Unique reference IDs for each checkout
- Database constraints prevent duplicate payments

### 4. Input Validation
- Plan type validation
- User authentication checks
- Amount and currency validation

## 🚀 Usage Examples

### Frontend Integration

```tsx
import { BuyButton } from '@/components/BuyButton'

// In your pricing page
<BuyButton plan="trial" />
<BuyButton plan="monthly" />
<BuyButton plan="annual" />
<BuyButton plan="single-use" />
```

### API Usage

```typescript
// Create checkout
const response = await fetch('/api/square/create-checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    plan: 'monthly',
    supabaseAccessToken: session.access_token,
  }),
})

const { checkoutUrl } = await response.json()
window.location.href = checkoutUrl
```

## 🔄 Payment Flow

### 1. User Clicks Buy Button
- Frontend calls `/api/square/create-checkout`
- Server validates user authentication
- Creates Square order with reference ID
- Returns checkout URL

### 2. Square Checkout
- User completes payment on Square's hosted page
- Square processes payment
- User redirected to return URL

### 3. Webhook Processing
- Square sends webhook to `/api/square/webhook`
- Server verifies webhook signature
- Extracts user ID and plan from reference ID
- Updates user plan in Supabase
- Records payment for idempotency

### 4. User Redirect
- Return handler redirects to dashboard
- Dashboard shows updated plan status
- User can now use paid features

## 🧪 Testing

### 1. Sandbox Testing
- Use Square's sandbox environment
- Test with Square's test cards
- Verify webhook delivery

### 2. Test Cards
```
Visa: 4111 1111 1111 1111
Mastercard: 5555 5555 5555 4444
American Express: 3782 822463 10005
```

### 3. Webhook Testing
- Use Square's webhook testing tools
- Verify signature validation
- Test idempotency handling

## 🚨 Troubleshooting

### Common Issues

1. **Webhook Signature Verification Fails**
   - Check `SQUARE_WEBHOOK_SIGNATURE_KEY`
   - Ensure webhook URL is correct
   - Verify Square webhook configuration

2. **Checkout Creation Fails**
   - Verify `SQUARE_ACCESS_TOKEN`
   - Check `SQUARE_LOCATION_ID`
   - Ensure user is authenticated

3. **User Plan Not Updated**
   - Check webhook delivery
   - Verify reference ID format
   - Check Supabase permissions

4. **Build Errors**
   - Ensure Square SDK is installed: `npm install square`
   - Check import statements
   - Verify environment variables

### Debug Logs

Enable detailed logging by checking:
- Square API responses
- Webhook payloads
- Supabase operations
- User authentication status

## 📊 Monitoring

### Key Metrics to Track
- Checkout creation success rate
- Webhook delivery success rate
- Payment processing time
- User plan activation rate

### Logs to Monitor
- Square API errors
- Webhook signature failures
- Supabase update errors
- Authentication failures

## 🔄 Production Deployment

### 1. Environment Setup
- Switch to Square Production environment
- Update webhook URLs to production domain
- Configure production Supabase instance

### 2. Security Checklist
- ✅ Webhook signature verification enabled
- ✅ HTTPS endpoints only
- ✅ Environment variables secured
- ✅ Database RLS policies active
- ✅ Input validation implemented

### 3. Testing Checklist
- ✅ Test all plan types
- ✅ Verify webhook processing
- ✅ Check user plan updates
- ✅ Test error scenarios
- ✅ Validate security measures

## 📚 Additional Resources

- [Square Developer Documentation](https://developer.squareup.com/docs)
- [Square Webhooks Guide](https://developer.squareup.com/docs/webhooks-api/overview)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 🆘 Support

For issues with this integration:
1. Check the troubleshooting section
2. Review Square and Supabase documentation
3. Verify environment variables
4. Test in sandbox environment first
5. Check server logs for detailed error messages

---

**🎉 Your Square payments integration is now complete and production-ready!**
