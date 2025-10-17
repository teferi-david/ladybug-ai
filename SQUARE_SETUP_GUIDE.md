# 🛠️ Square Setup Guide - Complete Fix

## 🚨 **Current Issue: Square Checkout Failing**

Your Square integration is not working. Here's the complete fix:

## 📋 **Step 1: Square Account Setup**

### **1.1 Create Square Account:**
1. Go to [Square Developer Dashboard](https://developer.squareup.com/)
2. Sign up or log in
3. Create a new application
4. Note your **Application ID**

### **1.2 Get Credentials:**
1. Go to your application dashboard
2. Click "Credentials" tab
3. Copy your **Access Token** (starts with `EAA...`)
4. Copy your **Location ID** (starts with `L...`)

## 🔑 **Step 2: Environment Variables**

### **2.1 Required Variables:**
```bash
SQUARE_ACCESS_TOKEN=EAA...your_access_token_here
SQUARE_LOCATION_ID=L...your_location_id_here
NEXT_PUBLIC_APP_URL=https://ladybugai.us
```

### **2.2 Update in Vercel:**
1. Go to Vercel Dashboard
2. Click your project
3. Go to "Settings" → "Environment Variables"
4. Add/update the variables above
5. **Redeploy** your site

## 🧪 **Step 3: Test Square Connection**

### **3.1 Test Authentication:**
Visit: `https://ladybugai.us/api/square/simple-test`

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Square authentication working",
  "locationsCount": 1,
  "environment": "production"
}
```

### **3.2 Test Checkout Creation:**
1. Go to your pricing page
2. Click "Get Started" on any plan
3. Check Vercel logs for success messages

## 🔍 **Step 4: Common Issues & Solutions**

### **Issue 1: 401 Unauthorized**
```bash
# Problem: Invalid access token
# Solution: Get new token from Square Dashboard
```

### **Issue 2: Invalid Location ID**
```bash
# Problem: Wrong location ID
# Solution: Get correct Location ID from Square Dashboard
```

### **Issue 3: Environment Mismatch**
```bash
# Problem: Using sandbox token in production
# Solution: Use production token for live site
```

### **Issue 4: Missing Permissions**
```bash
# Problem: Token doesn't have right scopes
# Solution: Check Square app permissions
```

## 📞 **Step 5: Square Support Resources**

### **5.1 Documentation:**
- [Square API Docs](https://developer.squareup.com/docs)
- [Square Checkout API](https://developer.squareup.com/docs/checkout-api)
- [Square Orders API](https://developer.squareup.com/docs/orders-api)

### **5.2 Support:**
- [Square Developer Forum](https://developer.squareup.com/forums)
- [Square Status Page](https://status.squareup.com/)

## ✅ **Step 6: Verification Checklist**

- [ ] Square account is active
- [ ] Application is approved
- [ ] Access token is valid (starts with EAA...)
- [ ] Location ID is correct (starts with L...)
- [ ] Environment variables set in Vercel
- [ ] Site redeployed after variable changes
- [ ] Test endpoint shows success
- [ ] Checkout creation works

## 🎯 **Quick Fix Commands**

### **Test Square Connection:**
```bash
curl https://ladybugai.us/api/square/simple-test
```

### **Check Environment Variables:**
```bash
# In Vercel dashboard, verify these are set:
SQUARE_ACCESS_TOKEN=EAA...
SQUARE_LOCATION_ID=L...
NEXT_PUBLIC_APP_URL=https://ladybugai.us
```

## 🚀 **Expected Success Flow**

1. **User clicks "Get Started"** → Frontend calls `/api/square/create-checkout`
2. **API creates Square order** → Using Square Orders API
3. **API creates checkout session** → Using Square Checkout API
4. **Returns checkout URL** → User redirected to Square
5. **Payment processed** → By Square
6. **Success redirect** → Back to your dashboard

---

**Follow this guide step by step to fix your Square integration!** 🛠️
