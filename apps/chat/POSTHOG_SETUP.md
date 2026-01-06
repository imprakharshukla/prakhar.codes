# PostHog Integration Setup

## Installation Required

To complete the PostHog integration, you need to install the required packages:

```bash
pnpm add posthog-js posthog-node
```

## Configuration

The following files have been created and configured:

### Environment Variables
- `.env.local` - Contains PostHog API key and host configuration

### Core Files Created
- `src/lib/posthog.ts` - Client-side PostHog initialization
- `src/lib/posthog-server.ts` - Server-side PostHog client
- `src/providers/posthog-provider.tsx` - React context provider with automatic pageview tracking
- `src/hooks/use-posthog-identify.tsx` - User identification hook that syncs with Clerk auth

### Modified Files
- `src/components/providers.tsx` - Added PostHog provider and user identification
- `src/app/(with-sidebar)/[conversationId]/chat-client.tsx` - Added event tracking for:
  - `message_sent` - When user sends a message
  - `question_answered` - When user answers AI questions
  - `suggestion_clicked` - When user clicks suggested prompts
  - `recommendations_received` - When AI generates recommendations
  - `share_created` - When user creates a shareable link

- `src/app/(with-sidebar)/[conversationId]/conversation-list-client.tsx` - Added:
  - `conversation_started` - When user creates new conversation

- `src/components/adoption/conversation-list.tsx` - Added:
  - `conversation_deleted` - When user deletes a conversation

- `src/components/adoption/recommendation-message.tsx` - Added:
  - `idea_saved` - When user saves a recommendation
  - `idea_unsaved` - When user unsaves a recommendation

- `src/app/(with-sidebar)/ideas/page.tsx` - Added:
  - `saved_ideas_viewed` - When user views saved ideas page

- `src/app/share/[share_id]/page.tsx` - Added:
  - `shared_conversation_viewed` - When someone views a shared conversation (server-side)

- `src/app/api/adoption/route.ts` - Added:
  - `rate_limit_hit` - When user hits rate limit (server-side)
  - `error_occurred` - When API errors occur (server-side)

- `src/app/global-error.tsx` - Added:
  - `error_occurred` - Global error tracking

## Event Properties

Each event includes relevant contextual properties:

### Client-Side Events
- User identification via Clerk (email, name, username)
- Conversation IDs for tracking user journeys
- Message/content characteristics (length, type, count)
- Interaction context (was_active, has_attachments, etc.)

### Server-Side Events
- User ID (when authenticated) or IP-based distinct ID
- Error details (message, type, stack)
- Rate limit information
- Request context

## Features

✅ Automatic pageview tracking
✅ User identification synced with Clerk authentication
✅ Client-side event tracking for all user interactions
✅ Server-side event tracking for API endpoints
✅ Error tracking (both global and API-level)
✅ Rate limit monitoring
✅ No use of useEffect for event tracking (event handlers only)

## Next Steps

1. Install packages: `pnpm add posthog-js posthog-node`
2. Restart development server
3. Test that events are appearing in your PostHog dashboard at https://eu.i.posthog.com
