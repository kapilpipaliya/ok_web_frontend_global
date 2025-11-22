import type { APIEvent } from "@solidjs/start/server";
import crypto from "crypto";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { logger } from "~/lib/logger";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    // Get webhook signature from headers
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      throw new APIError("Missing webhook signature", 400);
    }

    // Parse webhook body
    const body = await request.text();
    const event = JSON.parse(body);

    // Fetch Razorpay settings to get webhook secret
    const settingsResult = await dbSession.run(
      "MATCH (s:Setting {type: 'razorpay'}) WHERE s.razorpayEnabled = true RETURN s LIMIT 1",
    );

    if (settingsResult.records.length === 0) {
      throw new APIError("Payment system not configured", 503);
    }

    const settingsNode = settingsResult.records[0].get("s");
    const settings = convertNodeToJson(settingsNode);

    // Verify webhook signature if webhook secret is configured
    if (settings.P.razorpayWebhookSecret) {
      const webhookSecret = Buffer.from(
        settings.P.razorpayWebhookSecret,
        "base64",
      ).toString("utf-8");

      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");

      if (expectedSignature !== signature) {
        throw new APIError("Invalid webhook signature", 401);
      }
    }

    // Process the webhook event
    const eventType = event.event;
    const payload = event.payload;

    switch (eventType) {
      case "payment.captured": {
        // Payment was successful
        const paymentEntity = payload.payment?.entity;

        if (paymentEntity) {
          const orderId = paymentEntity.order_id;
          const paymentId = paymentEntity.id;
          const amount = paymentEntity.amount;
          const currency = paymentEntity.currency;

          // Update subscription status
          const result = await dbSession.run(
            `MATCH (s:UserSubscription {razorpayOrderId: $orderId, status: 'pending'})
             SET s.razorpayPaymentId = $paymentId,
                 s.status = 'active',
                 s.updatedAt = datetime()
             RETURN s`,
            {
              orderId: orderId,
              paymentId: paymentId,
            },
          );

          const subscription =
            result.records.length > 0
              ? convertNodeToJson(result.records[0].get("s"))
              : null;

          // Log payment success
          logger.logPayment({
            orderId,
            paymentId,
            amount: amount ? amount / 100 : undefined, // Razorpay stores amount in paise
            currency,
            status: "captured",
            userId: subscription?.P?.userId,
          });
        }
        break;
      }

      case "payment.failed": {
        // Payment failed
        const paymentEntity = payload.payment?.entity;

        if (paymentEntity) {
          const orderId = paymentEntity.order_id;
          const paymentId = paymentEntity.id;
          const amount = paymentEntity.amount;
          const currency = paymentEntity.currency;

          // Update subscription status to failed
          const result = await dbSession.run(
            `MATCH (s:UserSubscription {razorpayOrderId: $orderId, status: 'pending'})
             SET s.status = 'failed',
                 s.updatedAt = datetime()
             RETURN s`,
            {
              orderId: orderId,
            },
          );

          const subscription =
            result.records.length > 0
              ? convertNodeToJson(result.records[0].get("s"))
              : null;

          // Log payment failure
          logger.logPayment({
            orderId,
            paymentId,
            amount: amount ? amount / 100 : undefined,
            currency,
            status: "failed",
            userId: subscription?.P?.userId,
          });
        }
        break;
      }

      case "subscription.charged": {
        // Subscription renewed (for recurring subscriptions)
        const subscriptionEntity = payload.subscription?.entity;

        if (subscriptionEntity) {
          logger.logPayment({
            orderId: subscriptionEntity.id,
            status: "subscription_charged",
          });
        }
        break;
      }

      case "subscription.cancelled": {
        // Subscription was cancelled
        const subscriptionEntity = payload.subscription?.entity;

        if (subscriptionEntity) {
          const subscriptionId = subscriptionEntity.id;

          // Update subscription status to cancelled
          const result = await dbSession.run(
            `MATCH (s:UserSubscription {razorpaySubscriptionId: $subscriptionId})
             SET s.status = 'cancelled',
                 s.updatedAt = datetime()
             RETURN s`,
            {
              subscriptionId: subscriptionId,
            },
          );

          const subscription =
            result.records.length > 0
              ? convertNodeToJson(result.records[0].get("s"))
              : null;

          logger.logPayment({
            orderId: subscriptionId,
            status: "subscription_cancelled",
            userId: subscription?.P?.userId,
          });
        }
        break;
      }

      default:
        logger.warn(
          {
            type: "payment_webhook",
            eventType,
          },
          `Unhandled webhook event: ${eventType}`,
        );
    }

    // Return success response
    return {
      result: { received: true, event: eventType },
      message: "Webhook processed successfully",
      timestamp: new Date().getTime(),
    };
  } catch (error) {
    logger.error(
      {
        type: "payment_webhook_error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "Webhook processing error",
    );
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
