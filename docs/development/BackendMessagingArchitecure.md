Elaview Messaging System - Backend Architecture Documentation
Project Overview
Elaview is a B2B advertising marketplace with complex user roles, listing management, and messaging capabilities. This documentation covers the implementation of a secure messaging system between renters and landlords, built on Supabase (PostgreSQL) with Row Level Security.
Messaging Flow Design

Inquiry Submission: Renter clicks "Contact Owner" → submits inquiry with optional dates/pricing
Owner Notification: Owner receives notification of new inquiry in their inbox
Approval/Dismissal: Owner can approve (creates conversation) or dismiss the inquiry
Conversation Creation: Upon approval, a conversation is created with the initial message
Bidirectional Messaging: Both parties can exchange messages in real-time
Read Tracking: Separate unread counts for landlord and renter

Database Schema
Core Tables Structure
listing_inquiries
sql- id: UUID (PK)
- listing_id: UUID (FK → rental_listings)
- inquirer_id: UUID (FK → auth.users)
- start_date: DATE
- end_date: DATE
- total_days: INTEGER
- quoted_price: NUMERIC
- message: TEXT
- initial_message: TEXT
- status: VARCHAR ('pending', 'approved', 'dismissed')
- created_at: TIMESTAMPTZ
- responded_at: TIMESTAMPTZ
- expires_at: TIMESTAMPTZ
- approved_at: TIMESTAMPTZ
- dismissed_at: TIMESTAMPTZ
conversations
sql- id: UUID (PK)
- listing_id: UUID (FK → rental_listings)
- landlord_id: UUID (FK → auth.users)
- renter_id: UUID (FK → auth.users)
- participants: UUID[] (array of participant IDs)
- inquiry_id: UUID (FK → listing_inquiries)
- subject: VARCHAR
- status: USER-DEFINED enum ('active', 'archived', 'blocked')
- last_message_text: TEXT
- last_message_at: TIMESTAMPTZ
- last_message_sender_id: UUID
- total_messages: INTEGER
- unread_by_landlord: INTEGER
- unread_by_renter: INTEGER
- is_archived_by_landlord: BOOLEAN
- is_archived_by_renter: BOOLEAN
- is_muted_by_landlord: BOOLEAN
- is_muted_by_renter: BOOLEAN
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
messages
sql- id: UUID (PK)
- conversation_id: UUID (FK → conversations)
- sender_id: UUID (FK → auth.users)
- content: TEXT
- is_read: BOOLEAN (added during implementation)
- read_at: TIMESTAMPTZ (added during implementation)
- created_at: TIMESTAMPTZ
- [other columns may exist]
notifications
sql- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- type: notification_type enum
- message: TEXT
- metadata: JSONB
- is_read: BOOLEAN
- created_at: TIMESTAMPTZ
- [other columns may exist]
rental_listings (relevant columns)
sql- id: UUID (PK)
- landlord_id: UUID (FK → auth.users) [NOT owner_id]
- title: VARCHAR [NOT name]
- description: TEXT
- [other columns exist but not relevant to messaging]
Enums Created
notification_type
sqlCREATE TYPE notification_type AS ENUM (
  'new_inquiry',
  'inquiry_approved', 
  'new_message',
  'inquiry_dismissed'
);
Indexes (Already Exist)

Conversations: 8 indexes including participants, landlord, renter, unread counts
Listing Inquiries: 4 indexes including listing, renter, status
Messages: 6 indexes including sender, conversation, unread counts

PostgreSQL Functions Implemented
1. submit_listing_inquiry
sql-- Signature: (p_listing_id UUID, p_message TEXT, p_start_date DATE, p_end_date DATE, p_quoted_price NUMERIC)
-- Returns: UUID (inquiry_id)
-- Purpose: Creates new inquiry and notifies landlord
-- Security: SECURITY DEFINER, uses auth.uid() for inquirer
2. approve_inquiry
sql-- Signature: (p_inquiry_id UUID)
-- Returns: UUID (conversation_id)
-- Purpose: Approves inquiry, creates conversation with initial message
-- Security: Validates landlord ownership before approval
3. dismiss_inquiry
sql-- Signature: (p_inquiry_id UUID)
-- Returns: void
-- Purpose: Dismisses inquiry and notifies inquirer
-- Security: Validates landlord ownership
4. send_message
sql-- Signature: (p_conversation_id UUID, p_content TEXT)
-- Returns: UUID (message_id)
-- Purpose: Sends message, updates conversation metadata, notifies recipient
-- Security: Validates sender is participant
5. mark_conversation_as_read
sql-- Signature: (p_conversation_id UUID)
-- Returns: void
-- Purpose: Marks all unread messages as read, resets unread count
-- Security: Validates user is participant
6. get_user_conversations
sql-- Signature: ()
-- Returns: TABLE with conversation details
-- Purpose: Helper function to retrieve user's conversations with participant info
-- Security: SECURITY DEFINER, filtered by auth.uid()
Row Level Security (RLS) Policies
Conversations Table

"Users can view conversations they participate in" - SELECT policy
"Participants can update conversation settings" - UPDATE policy
"Renters can create conversations" - INSERT policy

Messages Table

"Users can view messages in their conversations" - SELECT policy
"Conversation participants can send messages" - INSERT policy
"Message senders can edit their own messages" - UPDATE policy

Listing Inquiries Table

"Users can view own inquiries" - SELECT policy (inquirer or landlord)
"Renters can create inquiries" - INSERT policy
"Landlords can respond to inquiries" - UPDATE policy

All tables have RLS ENABLED
Key Implementation Decisions

Dual User Identification: Tables use both specific roles (landlord_id, renter_id) AND participants array for flexibility
Separate Unread Counts: Instead of a single unread count, we track unread_by_landlord and unread_by_renter separately
Initial Message Handling: The inquiry message becomes the first message in the conversation upon approval
Security Model: All functions use SECURITY DEFINER with auth.uid() checks to ensure users can only access their own data
Notification System: Integrated notification creation within core functions rather than using triggers
Status Tracking: Inquiries have three states (pending, approved, dismissed) with corresponding timestamps

Missing Frontend Components (Not Implemented)

Contact Owner Modal (TSX)
Owner Inbox Component (TSX)
Conversation/Chat UI
Real-time subscription hooks
Express.js API endpoints

Current System State
✅ Database schema fully implemented
✅ All core functions created and tested
✅ RLS policies active on all tables
✅ Notification system integrated
✅ Helper functions for data retrieval
❌ Frontend components not implemented
❌ Express.js API layer not created
❌ Real-time subscriptions not set up
Next Steps Recommendations

Build the Chat UI Component for message display
Implement real-time subscriptions for live updates
Create Express.js API endpoints for Next.js integration
Add typing indicators and online status
Implement message search and filtering

Critical Notes

The rental_listings table uses landlord_id NOT owner_id
The rental_listings table uses title NOT name for the listing title
All test data flags (is_admin_mock) have been removed
The system assumes user profiles exist in user_profiles table with user_id and full_name

This messaging system provides a secure, scalable foundation for renter-landlord communication with proper authorization at every level.