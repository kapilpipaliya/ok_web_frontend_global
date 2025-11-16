import type { APIEvent } from "@solidjs/start/server";
import crypto from "crypto";

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
    const { orderId, paymentId, signature } = body;

    if (!orderId || !paymentId || !signature) {
      throw new APIError(
        "Order ID, payment ID, and signature are required",
        400,
      );
    }

    // Fetch Razorpay settings
    const settingsResult = await dbSession.run(
      "MATCH (s:RazorpaySetting) WHERE s.razorpayEnabled = true RETURN s LIMIT 1",
    );

    if (settingsResult.records.length === 0) {
      throw new APIError("Payment system is not configured", 503);
    }

    const settingsNode = settingsResult.records[0].get("s");
    const settings = convertNodeToJson(settingsNode);
    const keySecret = Buffer.from(
      settings.P.razorpayKeySecret,
      "base64",
    ).toString("utf-8");

    // Verify signature using Razorpay's algorithm
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (generatedSignature !== signature) {
      logger.logPayment({
        orderId,
        paymentId,
        status: "verification_failed",
        userId: user.P.uuid,
      });

      throw new APIError(
        "Invalid payment signature. Payment verification failed.",
        400,
      );
    }

    // Find the pending subscription
    const subscriptionResult = await dbSession.run(
      `MATCH (u:User {uuid: $userId})-[:UserSubscription]->(s:UserSubscription {razorpayOrderId: $orderId, status: 'pending'})
       RETURN s`,
      {
        userId: user.P.uuid,
        orderId: orderId,
      },
    );

    if (subscriptionResult.records.length === 0) {
      throw new APIError("No pending subscription found for this order", 404);
    }

    const subscriptionNode = subscriptionResult.records[0].get("s");
    const subscription = convertNodeToJson(subscriptionNode);

    // Update subscription status to active
    const updateSubscriptionQuery = `
      MATCH (u:User {uuid: $userId})-[:UserSubscription]->(s:UserSubscription {razorpayOrderId: $orderId})
      SET s.razorpayPaymentId = $paymentId,
          s.razorpaySignature = $signature,
          s.status = 'active',
          s.updatedAt = datetime()
      RETURN s
    `;

    await dbSession.run(updateSubscriptionQuery, {
      userId: user.P.uuid,
      orderId: orderId,
      paymentId: paymentId,
      signature: signature,
    });

    // Update user's current plan and quota
    const updateUserQuery = `
      MATCH (u:User {uuid: $userId})
      SET u.currentPlan = $plan,
          u.videoQuotaLimit = $videoQuota,
          u.videoQuotaUsed = COALESCE(u.videoQuotaUsed, 0),
          u.subscriptionStatus = 'active',
          u.subscriptionExpiryDate = datetime($expiryDate)
      RETURN u
    `;

    await dbSession.run(updateUserQuery, {
      userId: user.P.uuid,
      plan: subscription.P.plan,
      videoQuota: subscription.P.videoQuota,
      expiryDate: subscription.P.expiryDate,
    });

    // Log successful payment verification
    logger.logPayment({
      orderId,
      paymentId,
      amount: subscription.P.amount / 100, // Convert cents to dollars
      currency: subscription.P.currency,
      status: "verified_and_activated",
      userId: user.P.uuid,
    });

    return {
      result: {
        plan: subscription.P.plan,
        billingCycle: subscription.P.billingCycle,
        videoQuota: subscription.P.videoQuota,
        expiryDate: subscription.P.expiryDate,
        status: "active",
      },
      message:
        "Payment verified successfully! Your subscription is now active.",
      timestamp: new Date().getTime(),
    };
  } catch (error) {
    logger.error(
      {
        type: "payment_verification_error",
        userId: user?.P?.uuid,
        orderId: body?.orderId,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "Payment verification failed",
    );
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
