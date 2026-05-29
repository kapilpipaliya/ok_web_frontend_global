# Conversation hooks (controller modules)

Logic for public support conversations lives in `PublicSupportConversationContent` component `fns` (orchestrator). It is organized into these logical modules:

| Module | Responsibility |
| --- | --- |
| **useConversationAuth** | `getSerial`, `getToken`, `getTicketId`, `hasCredentials`, `buildAuthContext` |
| **useConversationCapabilities** | `getCapabilities()` — capability flags derived once from `viewerRole` + props |
| **useConversationApi** | `conversationApi.load`, `.reply`, `.addInternalNote`, `.close`, `.reopen` |
| **useConversationMessages** | `getMessageType`, `isOwnMessage`, `getVisibleMessages`, `normalizeMessage`, timestamps |

UI subcomponents use `args.fns` directly (inherited from `PublicSupportConversationContent` via parent render context). They must not call server functions directly.

## Capabilities (derived from `viewerRole`)

| Flag | Admin default | Customer default |
| --- | --- | --- |
| `canReply` | true | true |
| `canReplyWhenClosed` | false | false |
| `canCloseTicket` | true | true |
| `canReopenTicket` | false | true |
| `canInternalNote` | true (if `showInternalNote`) | false |
| `canSeeInternalNotes` | true | false |

## Message types

Normalized on load:

- `customer_message`
- `admin_reply`
- `internal_note`

Customer timeline filters out `internal_note`. Bubble alignment uses `isOwnMessage(message)` (sender-based), not `viewerRole`.
