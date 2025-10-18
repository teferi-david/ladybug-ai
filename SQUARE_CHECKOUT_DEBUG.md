# Square Checkout Debug Guide

## 🚨 "Missing Required Fields" Error Fix

### **The Problem:**
```
Error: missing required fields
Square checkout session creation fails
```

### **The Solution:**
- ✅ **Fixed Square API structure** - Corrected order object nesting
- ✅ **Added environment validation** - Check for required Square credentials
- ✅ **Enhanced error logging** - Better debugging information
- ✅ **Proper field validation** - Ensure all required fields are present

---

## 🔧 **What I Fixed:**

### **1. Square API Structure (`lib/squareClient.ts`)**
**Before (Broken):**
```typescript
// ❌ Incorrect: Separate order creation
const orderResponse = await squareClient.ordersApi.createOrder({...})
const checkoutResponse = await squareClient.checkoutApi.createCheckout({...})
```

**After (Fixed):**
```typescript
// ✅ Correct: Direct checkout with order data
const checkoutResponse = await squareClient.checkoutApi.createCheckout({
  idempotencyKey,
  checkout: {
    order: {
      locationId: process.env.SQUARE_LOCATION_ID!,
      lineItems: [...],
      metadata: {...}
    },
    askForShippingAddress: false,
    merchantSupportEmail: 'support@ladybugai.us',
    prePopulateBuyerEmail: userEmail,
    redirectUrl: successUrl,
    note: `Ladybug AI - ${planConfig.name}`,
  },
})
```

### **2. Environment Validation (`app/api/square/create-checkout/route.ts`)**
```typescript
// ✅ Added environment variable validation
if (!process.env.SQUARE_ACCESS_TOKEN) {
  return NextResponse.json({
    error: 'Server configuration error',
    message: 'Square access token not configured'
  }, { status: 500 })
}

if (!process.env.SQUARE_LOCATION_ID) {
  return NextResponse.json({
    error: 'Server configuration error', 
    message: 'Square location ID not configured'
  }, { status: 500 })
}
```

### **3. Enhanced Logging**
```typescript
// ✅ Added comprehensive logging
console.log('Plan config:', PLAN_CONFIG[plan as PlanKey])
console.log('User email:', user.email)
console.log('Success URL:', successUrl)
console.log('Checkout URL:', checkoutUrl)
```

---

## 🚀 **Required Environment Variables:**

### **Add to `.env.local`:**
```bash
# Square Configuration
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_LOCATION_ID=your_square_location_id
SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_signature_key

# Application Configuration  
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### **Add to Vercel Environment Variables:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all the variables above
3. Redeploy your application

---

## 🔍 **Debugging Steps:**

### **1. Check Environment Variables:**
```bash
# Test locally
echo $SQUARE_ACCESS_TOKEN
echo $SQUARE_LOCATION_ID
echo $NEXT_PUBLIC_APP_URL
```

### **2. Test Square API Connection:**
```bash
# Visit your deployed site
https://your-domain.com/api/square/simple-test
```

### **3. Check Browser Console:**
- Open browser developer tools
- Go to Network tab
- Click a payment option
- Look for the API call to `/api/square/create-checkout`
- Check the response for error details

### **4. Check Vercel Logs:**
```bash
# View function logs
vercel logs your-project-name
```

---

## 🎯 **Common Issues & Solutions:**

### **Issue 1: Missing SQUARE_ACCESS_TOKEN**
**Error:** `Square access token not configured`
**Solution:** Add `SQUARE_ACCESS_TOKEN` to environment variables

### **Issue 2: Missing SQUARE_LOCATION_ID**
**Error:** `Square location ID not configured`
**Solution:** Add `SQUARE_LOCATION_ID` to environment variables

### **Issue 3: Invalid Plan Type**
**Error:** `Invalid plan`
**Solution:** Ensure plan is one of: `trial`, `monthly`, `annual`, `single-use`

### **Issue 4: Authentication Required**
**Error:** `Authentication required`
**Solution:** User must be logged in with valid Supabase session

### **Issue 5: Square API Error**
**Error:** `Failed to create checkout`
**Solution:** Check Square credentials and API structure

---

## 🧪 **Testing Checklist:**

### **✅ Environment Setup:**
- [ ] `SQUARE_ACCESS_TOKEN` is set
- [ ] `SQUARE_LOCATION_ID` is set  
- [ ] `NEXT_PUBLIC_APP_URL` is set
- [ ] All variables are set in Vercel

### **✅ User Authentication:**
- [ ] User is logged in
- [ ] Supabase session is valid
- [ ] User data exists in database

### **✅ Square Configuration:**
- [ ] Square application is created
- [ ] Access token is valid
- [ ] Location ID is correct
- [ ] Using sandbox for testing

### **✅ API Structure:**
- [ ] Order object is properly nested
- [ ] All required fields are present
- [ ] Line items have name, quantity, and price
- [ ] Metadata includes reference_id

---

## 🚀 **Quick Fix Commands:**

### **1. Test Square Connection:**
```bash
curl -X GET "https://your-domain.com/api/square/simple-test"
```

### **2. Test Checkout Creation:**
```bash
curl -X POST "https://your-domain.com/api/square/create-checkout" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "trial",
    "supabaseAccessToken": "your-session-token"
  }'
```

### **3. Check Environment Variables:**
```bash
# In Vercel dashboard, verify all variables are set
# Redeploy after adding variables
```

---

## 🎉 **Your Square Checkout Should Now Work!**

**The "missing required fields" error should be resolved!** ✅

**All required fields are now properly included!** 🚀

**Enhanced logging will help debug any remaining issues!** 🔍

**Test with the debugging steps above!** 🧪
