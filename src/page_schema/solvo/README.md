# Solvo - Shopify Public Support App

Solvo is a Shopify app schema for customer support. It has two support surfaces:

- Merchant-to-app-admin support under `pages/shopify/support/`.
- Public storefront customer support under `pages/public_support/` and `functions/public_support/`.

This README documents the public support system added for the Shopify Theme App Extension. The extension should embed Solvo pages by URL and pass context through query parameters.

## Public Support Flow

Customers create support tickets from the storefront. The Shopify Theme App Extension should open Solvo in a modal or iframe.

| Flow | URL | Notes |
| --- | --- | --- |
| New public request | `/support/request?sourceUrl={url}` | HJSON page key `SolvoPublicSupportRequest`. Loads app settings, renders configured fields, creates a ticket. |
| Track ticket | `/support/ticket?serial={serial}&token={ticket_access_token}` | HJSON page key `SolvoPublicSupportTicket`. Uses `PublicSupportConversationContent` with `viewerRole: "customer"`. Does not expose Neo4j element ids. |

The create function returns `trackingUrl`, `serial`, `token`, and raw ticket/message vertices. Use the returned `trackingUrl` in storefront success UI and emails.

## Admin Routes

| Page | URL | Purpose |
| --- | --- | --- |
| Support settings | `/settings?section=supportGlobal` | Global, field, theme, and email settings. |
| Public tickets | `/public-support/tickets` | `DynamicPage` configured in-page with row/action handlers and conversation modal. |
| Public conversation | `/public-support/conversation?ticketId={elementId}` | `PublicSupportConversationContent` with `viewerRole: "admin"`. Reply, internal notes, and close. |
| Staff portal tickets | `/portal/tickets` | `DynamicPage` + modal `PublicSupportConversationContent` (`viewerRole: "admin"`). |

Shared conversation UI (orchestrator + subcomponents):

```
components/public_support/
  PublicSupportConversationContent.hjson   # shared fns + layout
  conversation/
    ConversationHeader.hjson
    ConversationTimeline.hjson
    ConversationMessage.hjson
    ConversationComposer.hjson
    ConversationStatusBar.hjson
    ConversationInternalNoteComposer.hjson
    ConversationCredentialsNotice.hjson
    hooks/README.md                          # shared fns reference
```

| Prop | Values | Purpose |
| --- | --- | --- |
| `viewerRole` | `admin` (default) or `customer` | Derives capability flags and server transport (via parent `fns`, not props). |
| `ticketId` | string | Admin/staff load and actions. |
| `serial`, `token` | string | Optional props; customer mode also reads URL query params. |
| `compact` | boolean | Tighter padding for modals. |
| `hideHeader` | boolean | Hide title/meta inside the component. |
| `showInternalNote` | boolean | Admin-only internal note tools (default `true`). |

Child components call flat helpers on **`args.fns`** (e.g. `usesTokenAuth()`, `canShowComposer()`, `isOwnMessage(message)`). See `conversation/hooks/README.md`.

`components/shopify/ShopifyNavigation.hjson` links to public tickets and support settings.

## Settings

`migrateDynamicPageSettings` seeds Solvo-only support settings:

- `PublicSupportTicket_settings_default`
- `PublicSupportMessage_settings_default`
- `support_settings_page_default`
- `GlobalSetting { key: "Default" }`
- `SettingsSectionDocument` rows for `supportGlobal`, `supportFields`, `supportTheme`, and `supportEmail`

Run the migration after importing schemas:

```js
await args.executeNamedServerFunction({
  functionName: "migrateDynamicPageSettings",
  contextData: { dryRun: false }
});
```

Global settings example:

```js
{
  enabled: true,
  serialPrefix: "SOL",
  allowGuestTickets: true,
  allowTicketCloseByCustomer: true,
  sendEmailNotifications: true,
  publicTrackingEnabled: true,
  defaultTicketStatus: "open"
}
```

Field settings use the same FormManagement schema shape as DynamicPage form configs. They are stored as JSON text in `supportFields.fieldSettingsJson`.

Theme settings are app-wide and currently editable as simple fields plus JSON:

```js
{
  modalWidth: 640,
  showLogo: true,
  logoPosition: "top",
  customCss: ""
}
```

## Graph Model

Keep raw vertex format throughout the app. Access properties through `vertex.P.*`.

Main labels:

- `PublicSupportTicket`
  - `serial`
  - `ticketAccessToken`
  - `status`
  - `subject`
  - `customerName`
  - `customerEmail`
  - `initialMessage`
  - `trackingUrl`
  - `emailThreadSubject`
  - `unreadForAdmin`
  - `unreadForCustomer`
- `PublicSupportMessage`
  - `ticketSerial`
  - `senderType`: `customer`, `admin`, or `internal`
  - `internalOnly`
  - `authorName`
  - `authorEmail`
  - `message`
- Relationship: `(ticket)-[:PublicSupportTicketMessage]->(message)`
- Assignment relationship: `(ticket)-[:PublicSupportTicketAssignee]->(user)`
- Sidebar categories: `(ticket)-[:ParentTicketCategory]->(PublicSupportTicketCategory)`; `(message)-[:ParentMessageCategory]->(PublicSupportMessageCategory)`
- `PublicSupportTicketSequence` stores per-day serial increments.

Serial format:

```text
{serialPrefix}-{YYYYMMDD}-{000001}
```

Example:

```text
SOL-20260526-000001
```

## Server Functions

Public support functions live under `functions/public_support/`, grouped by domain:

| Folder | Contains |
| --- | --- |
| `functions/public_support/settings/` | App-wide support settings loaders. |
| `functions/public_support/tickets/` | Ticket create/load/close/reopen functions. |
| `functions/public_support/messages/` | Customer/admin replies and internal notes. |
| `functions/public_support/notifications/` | Queue enqueue helpers. |

| Function | Purpose |
| --- | --- |
| `publicSupportGetSettings` | Loads app-wide support settings from `GlobalSetting(Default)`. |
| `publicSupportCreateTicket` | Validates configured fields, creates ticket/message, generates serial and token, queues notification. |
| `publicSupportGetConversation` | Loads public conversation by `serial + token`, or admin conversation by `ticketId`. Public token reads exclude internal notes. |
| `publicSupportReplyAsCustomer` | Adds a customer reply using `serial + token`. |
| `publicSupportReplyAsAdmin` | Adds an admin reply using `ticketId` or `serial`. |
| `publicSupportCloseTicket` | Closes ticket by public token or admin id. |
| `publicSupportReopenTicket` | Reopens ticket by public token or admin id. |
| `publicSupportAddInternalNote` | Adds admin-only internal note. |
| `publicSupportQueueNotification` | Enqueues notification event in BullMQ. |
| `publicSupportPortalTicketsBeforeFetch` | Staff portal table hook. Admin users see all tickets; other staff only see assigned tickets. |

## Email Notifications

Email templates live under `email_templates/support/`.

| Template key | Event |
| --- | --- |
| `SolvoSupportTicketCreated` | Ticket created, sent to customer. |
| `SolvoSupportCustomerReply` | Customer replied, sent to merchant/staff. |
| `SolvoSupportAdminReply` | Admin replied, sent to customer. |
| `SolvoSupportTicketClosed` | Ticket closed, sent to customer. |

Templates read dynamic values from query parameters such as `serial`, `trackingUrl`, `subject`, `message`, and `customerEmail`.

The current queue worker sends HTML directly via `args.sendEmail`, while keeping the template keys documented for import/editing and future rendered-template integration.

Subjects include the ticket serial. When `keepSameSubjectThread` is enabled, replies reuse `ticket.P.emailThreadSubject`.

## Worker

`functions/jobs/public_support/processPublicSupportNotificationQueue.hjson` starts the BullMQ worker for queue:

```text
solvo-public-support-notifications
```

It handles:

- `ticket_created`
- `customer_replied`
- `admin_replied`
- `ticket_closed`
- `ticket_reopened`

Worker functions return a `stop()` function and are intended to be started automatically by the app worker system.

## Shopify Theme App Extension Contract

The separate Shopify Theme App Extension should:

1. Render a "New support request" button in the storefront theme.
2. Open a modal/iframe pointing to `/support/request?sourceUrl={currentUrl}`.
3. Listen for `postMessage` event type `solvo:support-ticket-created`.
4. Show the returned `serial` and `trackingUrl` after successful creation.
5. Never use incremental DB ids in public URLs.

Public tracking links must use:

```text
/support/ticket?serial={serial}&token={ticket_access_token}
```

## Related Files

- Page/Attr/function authoring rules: `src/routes/api/chat/SYSTEM_PROMPT.md`
- Server function args: `src/cypher/get/executeNamedServerFunctionCore.ts`
- Client HJSON args: `src/components/form/dynamic_component/functions/function_argument/createFunctionArgumentBase.ts`
- Shared DynamicPage docs: `components/dynamic_page/README.md`
