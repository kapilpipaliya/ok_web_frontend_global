# Razorpay Payment Integration Setup Guide

This guide explains how to set up and test the Razorpay payment integration for YouTube Organizer (YTO) subscription plans.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Razorpay Account Setup](#razorpay-account-setup)
3. [Environment Configuration](#environment-configuration)
4. [Admin Settings Configuration](#admin-settings-configuration)
5. [Database Setup](#database-setup)
6. [Testing the Integration](#testing-the-integration)
7. [Subscription Plans](#subscription-plans)
8. [Webhook Configuration](#webhook-configuration)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js and npm installed
- Neo4j database running
- Razorpay account (test mode for development)
- Admin access to the YTO application

---

## Razorpay Account Setup

### 1. Create a Razorpay Account

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up for a new account or log in
3. Complete the KYC verification (for production)

### 2. Get API Keys

1. Navigate to **Settings** > **API Keys** in the Razorpay Dashboard
2. Click on **Generate Test Key** (for development)
3. Note down:
   - **Key ID** (starts with `rzp_test_` for test mode)
   - **Key Secret** (keep this secure)

### 3. Generate Webhook Secret (Optional but Recommended)

1. Go to **Settings** > **Webhooks**
2. Click **+ Add New Webhook**
3. Enter webhook URL: `https://yourdomain.com/api/razorpay/webhook`
4. Select events to listen to:
   - `payment.captured`
   - `payment.failed`
   - `subscription.charged`
   - `subscription.cancelled`
5. Note down the **Webhook Secret**

---

## Environment Configuration

Add the following environment variables to your `.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxx
```

### Environment Variables Explained

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `RAZORPAY_KEY_ID` | Razorpay API Key ID | Yes | `rzp_test_1234567890` |
| `RAZORPAY_KEY_SECRET` | Razorpay API Key Secret | Yes | `abcdefghijklmnop` |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signature verification secret | No* | `whsec_xxxxxxxxxxxxx` |

*While webhook secret is optional, it's highly recommended for security in production.

---

## Admin Settings Configuration

### Configure Razorpay in Admin Panel

1. Log in as an admin user
2. Navigate to `/admin/GlobalSettings`
3. Find the **Razorpay Settings** section
4. Fill in the following fields:
   - **Enable Razorpay**: Toggle ON
   - **Key ID**: Enter your Razorpay Key ID
   - **Key Secret**: Enter your Razorpay Key Secret
   - **Webhook Secret**: (Optional) Enter your webhook secret
5. Click **Save Changes**

The settings are encrypted and stored securely in the Neo4j database.

---

## Database Setup

The Razorpay integration creates the following database structures:

### Vertices

#### RazorpaySettings
```cypher
(:RazorpaySetting {
  razorpayEnabled: boolean,
  razorpayKeyId: string,
  razorpayKeySecret: string (base64 encrypted),
  razorpayWebhookSecret: string (base64 encrypted)
})
```

#### UserSubscription
```cypher
(:UserSubscription {
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySubscriptionId: string,
  razorpaySignature: string,
  plan: string,
  billingCycle: string,
  amount: number,
  currency: string,
  status: string,
  videoQuota: number,
  startDate: datetime,
  expiryDate: datetime,
  createdAt: datetime,
  updatedAt: datetime
})
```

### Relationships

```cypher
User -[:UserSubscription]-> UserSubscription
```

### User Properties

The following properties are added to User vertices:

- `currentPlan`: string (free/basic/pro/unlimited)
- `videoQuotaUsed`: number
- `videoQuotaLimit`: number
- `subscriptionStatus`: string
- `subscriptionExpiryDate`: datetime

---

## Testing the Integration

### Test Mode Setup

Razorpay provides test mode for development. Use test API keys (starting with `rzp_test_`).

### Test Card Numbers

Use these test card numbers for payment testing:

| Card Number | Description | CVV | Expiry |
|-------------|-------------|-----|--------|
| 4111 1111 1111 1111 | Success | Any | Any future date |
| 5555 5555 5555 4444 | Success (Mastercard) | Any | Any future date |
| 4000 0000 0000 0002 | Failure (Insufficient funds) | Any | Any future date |
| 5105 1051 0510 5100 | Card declined | Any | Any future date |

### Testing Flow

#### 1. **Test Free Plan Signup**

```bash
# Navigate to landing page
http://localhost:3000/

# Click "Get Started Free" on Free plan
# Should redirect to /auth/signup
```

#### 2. **Test Paid Plan Checkout (Not Logged In)**

```bash
# Click "Start Basic Plan" on Basic plan
# Should redirect to signup with redirect parameter
# After signup, should redirect to checkout
```

#### 3. **Test Paid Plan Checkout (Logged In)**

```bash
# Login as a user
# Navigate to landing page
# Click "Go Pro" on Pro plan
# Should navigate to /checkout?plan=pro&cycle=monthly
```

#### 4. **Test Payment Flow**

1. Select a plan and billing cycle
2. Review order summary
3. Click "Proceed to Payment"
4. Razorpay checkout modal opens
5. Enter test card: `4111 1111 1111 1111`
6. Click "Pay"
7. Should see success message
8. Should redirect to `/subscription`

#### 5. **Test Subscription Management**

```bash
# Navigate to /subscription
# Should see:
# - Current plan details
# - Video quota usage
# - Billing cycle
# - Expiry date
```

#### 6. **Test Quota Warning**

To test the quota warning component:

1. Manually update user's `videoQuotaUsed` to be close to limit:
   ```cypher
   MATCH (u:User {email: "test@example.com"})
   SET u.videoQuotaUsed = 9500,
       u.videoQuotaLimit = 10000
   RETURN u
   ```

2. Navigate to any page with the YTOQuotaWarning component
3. Should see a warning at the bottom right

---

## Subscription Plans

### Plan Pricing

| Plan | Monthly Price | Annual Price | Video Quota | Features |
|------|--------------|--------------|-------------|----------|
| Free | $0 | $0 | 10,000 | Basic organization, Manual refresh |
| Basic | $2.50 | $25 (2 months free) | 50,000 | Auto-refresh, API access |
| Pro | $5.00 | $50 (2 months free) | 150,000 | Priority support, Custom integrations |
| Unlimited | $10.00 | $100 (2 months free) | Unlimited | Dedicated support, Priority processing |

### Plan Features

**Free Plan**
- 10,000 video quota
- Basic video organization
- Channel tracking
- Manual refresh

**Basic Plan ($2.50/month)**
- 50,000 video quota
- Everything in Free
- Auto-refresh channels
- API access

**Pro Plan ($5.00/month)**
- 150,000 video quota
- Everything in Basic
- Priority support
- Custom integrations

**Unlimited Plan ($10.00/month)**
- Unlimited video quota
- Everything in Pro
- Priority processing
- Dedicated support

---

## Webhook Configuration

### Production Webhook Setup

1. **Configure Webhook URL**
   - URL: `https://yourdomain.com/api/razorpay/webhook`
   - Events: `payment.captured`, `payment.failed`, `subscription.charged`, `subscription.cancelled`

2. **Webhook Signature Verification**
   - Webhooks are automatically verified using the webhook secret
   - Invalid signatures are rejected

3. **Webhook Events Handled**

   - **payment.captured**: Payment successful - subscription activated
   - **payment.failed**: Payment failed - subscription marked as failed
   - **subscription.charged**: Recurring payment successful
   - **subscription.cancelled**: Subscription cancelled by user

### Testing Webhooks Locally

Use ngrok or similar tool to expose local server:

```bash
# Install ngrok
npm install -g ngrok

# Start your app
npm run dev

# In another terminal, expose port 3000
ngrok http 3000

# Use the ngrok URL in Razorpay webhook settings
# Example: https://abc123.ngrok.io/api/razorpay/webhook
```

---

## Troubleshooting

### Common Issues

#### 1. **Payment Order Creation Fails**

**Error**: "Payment system is not configured"

**Solution**:
- Check Razorpay settings in admin panel
- Ensure Razorpay is enabled
- Verify API keys are correct

#### 2. **Payment Verification Fails**

**Error**: "Invalid payment signature"

**Solution**:
- Ensure Key Secret is correct
- Check that payment was actually successful
- Verify no special characters in signature

#### 3. **Webhook Events Not Received**

**Solution**:
- Verify webhook URL is publicly accessible
- Check webhook secret is configured correctly
- Ensure selected events match implemented handlers

#### 4. **Quota Not Updating**

**Solution**:
- Check user's `videoQuotaUsed` and `videoQuotaLimit` properties
- Verify subscription status is "active"
- Check Neo4j queries in `getUserSubscription` function

#### 5. **Razorpay Checkout Not Opening**

**Error**: "Failed to load payment gateway"

**Solution**:
- Check browser console for errors
- Ensure Razorpay script is loading: `https://checkout.razorpay.com/v1/checkout.js`
- Verify no ad blockers are interfering

### Debug Mode

Enable debug logging in server functions:

```javascript
// In server functions, add:
console.log("Order data:", orderData);
console.log("Payment response:", paymentResponse);
```

Check logs in the terminal where the app is running.

### Verify Database State

```cypher
// Check Razorpay settings
MATCH (s:RazorpaySetting) RETURN s

// Check user subscriptions
MATCH (u:User)-[:UserSubscription]->(s:UserSubscription)
RETURN u.email, s.plan, s.status, s.amount

// Check user quota
MATCH (u:User {email: "user@example.com"})
RETURN u.currentPlan, u.videoQuotaUsed, u.videoQuotaLimit
```

---

## Production Checklist

Before going live with Razorpay:

- [ ] Complete Razorpay KYC verification
- [ ] Switch to production API keys (starting with `rzp_live_`)
- [ ] Update environment variables with production keys
- [ ] Configure production webhook URL
- [ ] Test payment flow with real cards
- [ ] Enable webhook signature verification
- [ ] Set up monitoring for failed payments
- [ ] Configure email notifications for subscription events
- [ ] Test subscription renewal flow
- [ ] Implement proper error handling and logging
- [ ] Set up backup payment method
- [ ] Review Razorpay security best practices

---

## Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Checkout Integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/)
- [Razorpay Webhooks Guide](https://razorpay.com/docs/webhooks/)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)

---

## Support

For issues related to:
- **Razorpay API**: Contact Razorpay support
- **YTO Integration**: Check GitHub issues or contact development team
- **Payment Issues**: Review Razorpay dashboard and transaction logs

---

**Last Updated**: 2025-11-09
