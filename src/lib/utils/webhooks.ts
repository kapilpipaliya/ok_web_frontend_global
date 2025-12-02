/**
 * Webhook System
 *
 * HTTP callbacks for event notifications with retry logic
 */

import type { Session } from "neo4j-driver";

/**
 * Webhook event
 */
export interface WebhookEvent {
  id: string;
  event: string;
  url: string;
  payload: any;
  headers?: Record<string, string>;
  createdAt: string;
  attempts: number;
  maxAttempts: number;
  status: "pending" | "success" | "failed";
  lastAttemptAt?: string;
  lastError?: string;
  nextRetryAt?: string;
}

/**
 * Webhook registration
 */
export interface WebhookRegistration {
  id: string;
  event: string;
  url: string;
  headers?: Record<string, string>;
  secret?: string;
  active: boolean;
  createdAt: string;
}

/**
 * Webhook options
 */
export interface WebhookOptions {
  headers?: Record<string, string>;
  secret?: string;
  maxAttempts?: number;
  retryDelay?: number;
  timeout?: number;
}

/**
 * Generate webhook ID
 */
function generateWebhookId(): string {
  return `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate retry delay with exponential backoff
 */
function calculateRetryDelay(attempt: number, baseDelay: number = 1000): number {
  return baseDelay * Math.pow(2, attempt);
}

/**
 * Sign webhook payload
 */
function signPayload(payload: string, secret: string): string {
  const crypto = require("crypto");
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Register webhook
 */
export async function registerWebhook(
  session: Session,
  event: string,
  url: string,
  options: Omit<WebhookOptions, "maxAttempts" | "retryDelay" | "timeout"> = {}
): Promise<WebhookRegistration> {
  const registration: WebhookRegistration = {
    id: generateWebhookId(),
    event,
    url,
    headers: options.headers,
    secret: options.secret,
    active: true,
    createdAt: new Date().toISOString(),
  };

  await session.run(
    `CREATE (w:Webhook {
      id: $id,
      event: $event,
      url: $url,
      headers: $headers,
      secret: $secret,
      active: $active,
      createdAt: $createdAt
    })`,
    {
      id: registration.id,
      event: registration.event,
      url: registration.url,
      headers: registration.headers ? JSON.stringify(registration.headers) : null,
      secret: registration.secret || null,
      active: registration.active,
      createdAt: registration.createdAt,
    }
  );

  return registration;
}

/**
 * Get webhook registrations for event
 */
export async function getWebhooks(
  session: Session,
  event: string,
  activeOnly: boolean = true
): Promise<WebhookRegistration[]> {
  const query = `
    MATCH (w:Webhook {event: $event${activeOnly ? ", active: true" : ""}})
    RETURN w
  `;

  const result = await session.run(query, { event });

  return result.records.map((record) => {
    const webhook = record.get("w").properties;
    return {
      id: webhook.id,
      event: webhook.event,
      url: webhook.url,
      headers: webhook.headers ? JSON.parse(webhook.headers) : undefined,
      secret: webhook.secret || undefined,
      active: webhook.active,
      createdAt: webhook.createdAt,
    };
  });
}

/**
 * Trigger webhooks for event
 */
export async function triggerWebhooks(
  session: Session,
  event: string,
  payload: any,
  options: Pick<WebhookOptions, "maxAttempts" | "retryDelay"> = {}
): Promise<WebhookEvent[]> {
  const webhooks = await getWebhooks(session, event);
  const events: WebhookEvent[] = [];

  for (const webhook of webhooks) {
    const webhookEvent: WebhookEvent = {
      id: generateWebhookId(),
      event,
      url: webhook.url,
      payload,
      headers: webhook.headers,
      createdAt: new Date().toISOString(),
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      status: "pending",
    };

    // Save webhook event
    await session.run(
      `CREATE (e:WebhookEvent {
        id: $id,
        event: $event,
        url: $url,
        payload: $payload,
        headers: $headers,
        createdAt: $createdAt,
        attempts: $attempts,
        maxAttempts: $maxAttempts,
        status: $status
      })`,
      {
        id: webhookEvent.id,
        event: webhookEvent.event,
        url: webhookEvent.url,
        payload: JSON.stringify(webhookEvent.payload),
        headers: webhookEvent.headers ? JSON.stringify(webhookEvent.headers) : null,
        createdAt: webhookEvent.createdAt,
        attempts: webhookEvent.attempts,
        maxAttempts: webhookEvent.maxAttempts,
        status: webhookEvent.status,
      }
    );

    // Trigger webhook (async, don't wait)
    deliverWebhook(session, webhookEvent.id, webhook.secret, options.retryDelay).catch(
      (err) => {
        console.error(`Failed to deliver webhook ${webhookEvent.id}:`, err);
      }
    );

    events.push(webhookEvent);
  }

  return events;
}

/**
 * Deliver webhook
 */
async function deliverWebhook(
  session: Session,
  webhookEventId: string,
  secret?: string,
  retryDelay: number = 1000
): Promise<void> {
  // Get webhook event
  const result = await session.run(
    "MATCH (e:WebhookEvent {id: $id}) RETURN e",
    { id: webhookEventId }
  );

  if (result.records.length === 0) {
    return;
  }

  const eventData = result.records[0].get("e").properties;
  const webhookEvent: WebhookEvent = {
    id: eventData.id,
    event: eventData.event,
    url: eventData.url,
    payload: JSON.parse(eventData.payload),
    headers: eventData.headers ? JSON.parse(eventData.headers) : undefined,
    createdAt: eventData.createdAt,
    attempts: eventData.attempts,
    maxAttempts: eventData.maxAttempts,
    status: eventData.status,
    lastAttemptAt: eventData.lastAttemptAt || undefined,
    lastError: eventData.lastError || undefined,
  };

  // Check if should retry
  if (
    webhookEvent.status === "success" ||
    webhookEvent.attempts >= webhookEvent.maxAttempts
  ) {
    return;
  }

  // Increment attempts
  webhookEvent.attempts++;
  webhookEvent.lastAttemptAt = new Date().toISOString();

  try {
    // Prepare request
    const payloadStr = JSON.stringify(webhookEvent.payload);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "Webhook-Service/1.0",
      ...(webhookEvent.headers || {}),
    };

    // Add signature if secret provided
    if (secret) {
      headers["X-Webhook-Signature"] = signPayload(payloadStr, secret);
    }

    // Send webhook
    const response = await fetch(webhookEvent.url, {
      method: "POST",
      headers,
      body: payloadStr,
    });

    if (response.ok) {
      // Success
      webhookEvent.status = "success";

      await session.run(
        `MATCH (e:WebhookEvent {id: $id})
         SET e.attempts = $attempts,
             e.status = $status,
             e.lastAttemptAt = $lastAttemptAt`,
        {
          id: webhookEvent.id,
          attempts: webhookEvent.attempts,
          status: webhookEvent.status,
          lastAttemptAt: webhookEvent.lastAttemptAt,
        }
      );
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    // Failed
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    webhookEvent.lastError = errorMessage;

    if (webhookEvent.attempts >= webhookEvent.maxAttempts) {
      webhookEvent.status = "failed";
    } else {
      // Schedule retry
      const delay = calculateRetryDelay(webhookEvent.attempts, retryDelay);
      webhookEvent.nextRetryAt = new Date(
        Date.now() + delay
      ).toISOString();
    }

    await session.run(
      `MATCH (e:WebhookEvent {id: $id})
       SET e.attempts = $attempts,
           e.status = $status,
           e.lastAttemptAt = $lastAttemptAt,
           e.lastError = $lastError,
           e.nextRetryAt = $nextRetryAt`,
      {
        id: webhookEvent.id,
        attempts: webhookEvent.attempts,
        status: webhookEvent.status,
        lastAttemptAt: webhookEvent.lastAttemptAt,
        lastError: webhookEvent.lastError,
        nextRetryAt: webhookEvent.nextRetryAt || null,
      }
    );

    // Retry if not at max attempts
    if (webhookEvent.attempts < webhookEvent.maxAttempts) {
      const delay = calculateRetryDelay(webhookEvent.attempts, retryDelay);
      setTimeout(() => {
        deliverWebhook(session, webhookEventId, secret, retryDelay).catch((err) => {
          console.error(`Retry failed for webhook ${webhookEventId}:`, err);
        });
      }, delay);
    }
  }
}

/**
 * Retry failed webhooks
 */
export async function retryFailedWebhooks(session: Session): Promise<number> {
  const result = await session.run(
    `MATCH (e:WebhookEvent)
     WHERE e.status = 'failed' OR (e.status = 'pending' AND e.nextRetryAt < $now)
     RETURN e.id as id, e.url as url
     LIMIT 100`,
    { now: new Date().toISOString() }
  );

  let retried = 0;

  for (const record of result.records) {
    const eventId = record.get("id");

    // Get webhook to find secret
    const webhookResult = await session.run(
      `MATCH (w:Webhook {url: $url})
       RETURN w.secret as secret`,
      { url: record.get("url") }
    );

    const secret = webhookResult.records[0]?.get("secret") || undefined;

    // Deliver webhook
    await deliverWebhook(session, eventId, secret);
    retried++;
  }

  return retried;
}

/**
 * Deactivate webhook
 */
export async function deactivateWebhook(
  session: Session,
  webhookId: string
): Promise<void> {
  await session.run(
    "MATCH (w:Webhook {id: $id}) SET w.active = false",
    { id: webhookId }
  );
}

/**
 * Delete webhook
 */
export async function deleteWebhook(
  session: Session,
  webhookId: string
): Promise<void> {
  await session.run(
    "MATCH (w:Webhook {id: $id}) DELETE w",
    { id: webhookId }
  );
}

/**
 * Get webhook stats
 */
export async function getWebhookStats(
  session: Session,
  event?: string
): Promise<{
  total: number;
  pending: number;
  success: number;
  failed: number;
  successRate: number;
}> {
  const whereClause = event ? "WHERE e.event = $event" : "";

  const query = `
    MATCH (e:WebhookEvent)
    ${whereClause}
    RETURN
      count(e) as total,
      sum(CASE WHEN e.status = 'pending' THEN 1 ELSE 0 END) as pending,
      sum(CASE WHEN e.status = 'success' THEN 1 ELSE 0 END) as success,
      sum(CASE WHEN e.status = 'failed' THEN 1 ELSE 0 END) as failed
  `;

  const result = await session.run(query, event ? { event } : {});

  const total = result.records[0]?.get("total").toNumber() || 0;
  const pending = result.records[0]?.get("pending").toNumber() || 0;
  const success = result.records[0]?.get("success").toNumber() || 0;
  const failed = result.records[0]?.get("failed").toNumber() || 0;

  return {
    total,
    pending,
    success,
    failed,
    successRate: total > 0 ? success / total : 0,
  };
}

/**
 * Webhooks helper factory
 */
export const webhooks = {
  /**
   * Register webhook
   */
  register: registerWebhook,

  /**
   * Get webhooks
   */
  get: getWebhooks,

  /**
   * Trigger webhooks
   */
  trigger: triggerWebhooks,

  /**
   * Retry failed
   */
  retryFailed: retryFailedWebhooks,

  /**
   * Deactivate webhook
   */
  deactivate: deactivateWebhook,

  /**
   * Delete webhook
   */
  delete: deleteWebhook,

  /**
   * Get stats
   */
  stats: getWebhookStats,
};
