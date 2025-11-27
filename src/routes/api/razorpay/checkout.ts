import type { APIEvent } from "@solidjs/start/server";
import Razorpay from "razorpay";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { logger } from "~/lib/logger";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    // Get authenticated user
    const user = await getUserFromSession(request);

    if (!user) {
      throw new APIError("User not found. Please log in.", 401);
    }

    // Parse request body
    const body = await request.json();
    const { plan, billingCycle } = body;

    if (!(plan && billingCycle)) {
      throw new APIError("Plan and billing cycle are required", 400);
    }

    // Validate plan
    const validPlans = ["free", "basic", "pro", "unlimited"];
    const validCycles = ["monthly", "annual"];

    if (!validPlans.includes(plan)) {
      throw new APIError("Invalid plan selected", 400);
    }

    if (!validCycles.includes(billingCycle)) {
      throw new APIError("Invalid billing cycle", 400);
    }

    if (plan === "free") {
      throw new APIError("Free plan does not require payment", 400);
    }

    // Calculate amount based on plan and billing cycle
    const monthlyPrices: Record<string, number> = {
      basic: 250, // $2.50 = 250 cents
      pro: 500, // $5.00 = 500 cents
      unlimited: 1000, // $10.00 = 1000 cents
    };

    let amount = monthlyPrices[plan];

    if (billingCycle === "annual") {
      // Annual: 12 months - 2 months free = 10 months
      amount = amount * 10;
    }

    // Calculate video quota
    const quotaLimits: Record<string, number> = {
      basic: 50000,
      pro: 150000,
      unlimited: 999999999,
    };

    const videoQuota = quotaLimits[plan];

    // Fetch Razorpay settings
    const settingsResult = await dbSession.run(
      "MATCH (s:Setting {type: 'razorpay'}) WHERE s.razorpayEnabled = true RETURN s LIMIT 1",
    );

    if (settingsResult.records.length === 0) {
      throw new APIError(
        "Payment system is not configured. Please contact support.",
        503,
      );
    }

    const settingsNode = settingsResult.records[0].get("s");
    const settings = convertNodeToJson(settingsNode);

    // Decrypt the key secret
    const keySecret = Buffer.from(
      settings.P.razorpayKeySecret,
      "base64",
    ).toString("utf-8");

    // Create Razorpay order using API
    const razorpayInstance = new Razorpay({
      key_id: settings.P.razorpayKeyId,
      key_secret: keySecret,
    });

    // Generate unique receipt ID
    const receiptId = `rcpt_${plan}_${billingCycle}_${Date.now()}`;

    const orderOptions = {
      amount: amount,
      currency: "USD",
      receipt: receiptId,
      notes: {
        userId: user.P.uuid,
        userEmail: user.P.email,
        plan: plan,
        billingCycle: billingCycle,
        videoQuota: videoQuota,
      },
    };

    const razorpayOrder = await razorpayInstance.orders.create(orderOptions);

    // Calculate expiry date
    const currentDate = new Date();
    const expiryDate = new Date(currentDate);

    if (billingCycle === "monthly") {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    // Store order in database as pending subscription
    const createSubscriptionQuery = `
      MATCH (u:User {uuid: $userId})
      CREATE (s:UserSubscription {
        razorpayOrderId: $orderId,
        razorpayPaymentId: null,
        razorpaySubscriptionId: null,
        razorpaySignature: null,
        plan: $plan,
        billingCycle: $billingCycle,
        amount: $amount,
        currency: $currency,
        status: 'pending',
        videoQuota: $videoQuota,
        startDate: datetime(),
        expiryDate: datetime($expiryDate),
        createdAt: datetime(),
        updatedAt: datetime()
      })
      CREATE (u)-[:UserSubscription]->(s)
      RETURN s
    `;

    await dbSession.run(createSubscriptionQuery, {
      userId: user.P.uuid,
      orderId: razorpayOrder.id,
      plan: plan,
      billingCycle: billingCycle,
      amount: amount,
      currency: "USD",
      videoQuota: videoQuota,
      expiryDate: expiryDate.toISOString(),
    });

    // Log order creation
    logger.logPayment({
      orderId: razorpayOrder.id,
      amount: amount / 100, // Convert cents to dollars
      currency: "USD",
      status: "order_created",
      userId: user.P.uuid,
    });

    return {
      result: {
        orderId: razorpayOrder.id,
        amount: amount,
        currency: "USD",
        keyId: settings.P.razorpayKeyId,
        plan: plan,
        billingCycle: billingCycle,
        videoQuota: videoQuota,
      },
      message: "Payment order created successfully",
      timestamp: new Date().getTime(),
    };
  } catch (error) {
    logger.error(
      {
        type: "payment_order_error",
        userId: user?.P?.uuid,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "Failed to create payment order",
    );
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
