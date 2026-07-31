# Conversation shared fns (parent `PublicSupportConversationContent`)

State and behavior live in **`PublicSupportConversationContent.hjson` `fns`**. Child components use **`_.fns`** only (no controller object, no passing API bundles through props).

| Concern | `_.fns` examples |
| --- | --- |
| Auth / credentials | `usesTokenAuth()`, `hasCredentials()`, `viewerRole()` |
| Capabilities | `canInternalNote()`, `canSeeInternalNotes()`, `getReplyPlaceholder()` |
| Ticket UI state | `isTicketClosed()`, `canShowComposer()`, `canCloseTicketNow()`, `canReopenTicketNow()`, `canShowInternalNoteTools()` |
| Messages | `getVisibleMessages()`, `getMessageType()`, `isOwnMessage()`, `getRowJustify()`, `formatMessageTime()` |
| Actions | `sendReply()`, `addInternalNote()`, `closeTicket()`, `reopenTicket()` |
| Signals | `ticketVertex()`, `replyMessageText()`, `setReplyMessageText()`, … |

Server calls (`fetchConversation`, etc.) stay private to the parent `fns` body and are not exported on `_.fns`.
