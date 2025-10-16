# 🔧 Square Authentication Fix Guide

## 🚨 **Current Issue: 401 Unauthorized Error**

Your Square access token is not working. Here's how to fix it:

## 📋 **Step 1: Check Your Square Account**

### **1.1 Verify Square Account Status:**
- Go to [Square Developer Dashboard](https://developer.squareup.com/)
- Make sure your account is active
- Check if you have a valid Square account (not just developer account)

### **1.2 Check Application Status:**
- Go to your Square application
- Make sure it's approved and active
- Check if you have the right permissions

## 🔑 **Step 2: Get Correct Access Token**

### **2.1 For Production (Live Site):**
```bash
# You need a PRODUCTION access token
# Go to Square Developer Dashboard → Your App → Credentials
# Copy the "Production Access Token" (starts with EAA...)
```

### **2.2 For Sandbox (Testing):**
```bash
# You need a SANDBOX access token  
# Go to Square Developer Dashboard → Your App → Credentials
# Copy the "Sandbox Access Token" (starts with EAA...)
```

## 🏪 **Step 3: Get Location ID**

### **3.1 For Production:**
```bash
# Go to Square Dashboard → Locations
# Copy the Location ID from your live location
```

### **3.2 For Sandbox:**
```bash
# Go to Square Developer Dashboard → Sandbox
# Copy the Sandbox Location ID
```

## ⚙️ **Step 4: Update Vercel Environment Variables**

### **4.1 Go to Vercel Dashboard:**
1. Go to your project settings
2. Click "Environment Variables"
3. Update these variables:

```bash
SQUARE_ACCESS_TOKEN=EAA...your_production_token_here
SQUARE_LOCATION_ID=your_production_location_id_here
NEXT_PUBLIC_APP_URL=https://ladybugai.us
```

### **4.2 Redeploy:**
- After updating variables, redeploy your site
- Or trigger a new deployment

## 🧪 **Step 5: Test Authentication**

### **5.1 Test API Endpoint:**
Visit: `https://ladybugai.us/api/square/test-auth`

This will test your Square credentials and show:
- ✅ If authentication works
- ❌ What specific error you're getting
- 📊 Your location count

## 🔍 **Step 6: Common Issues & Solutions**

### **Issue 1: Wrong Environment**
```bash
# Problem: Using sandbox token in production
# Solution: Use production token for live site
```

### **Issue 2: Invalid Token**
```bash
# Problem: Token is expired or wrong
# Solution: Generate new token from Square Dashboard
```

### **Issue 3: Wrong Location ID**
```bash
# Problem: Location ID doesn't match your account
# Solution: Get correct Location ID from Square Dashboard
```

### **Issue 4: Insufficient Permissions**
```bash
# Problem: Token doesn't have right scopes
# Solution: Check your Square app permissions
```

## 📞 **Step 7: Square Support**

If still having issues:
1. **Square Developer Support** - [Square Developer Forum](https://developer.squareup.com/forums)
2. **Square Documentation** - [Square API Docs](https://developer.squareup.com/docs)
3. **Square Status** - [Square Status Page](https://status.squareup.com/)

## ✅ **Step 8: Verify Fix**

After updating credentials:
1. **Test the auth endpoint** - `/api/square/test-auth`
2. **Try checkout again** - Click "Get Started" on pricing page
3. **Check logs** - Look for successful Square API calls

## 🎯 **Quick Checklist:**

- [ ] Square account is active
- [ ] Application is approved
- [ ] Using correct environment (production vs sandbox)
- [ ] Access token is valid and current
- [ ] Location ID matches your account
- [ ] Environment variables updated in Vercel
- [ ] Site redeployed after variable changes
- [ ] Test endpoint shows success

---

**Once you've updated your Square credentials, try the checkout again!** 🚀
