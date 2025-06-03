API OVERVIEW

🎯 Required API Endpoints:
Authentication & Users:
* POST /api/auth/signup - User registration
* POST /api/auth/login - Login with JWT
* GET /api/users/me - Current user profile
* PATCH /api/users/me - Update profile
* GET /api/users/:id - Public user profile
* GET /api/users/search - Search users

Listings:
* GET /api/listings - Browse/search listings
* POST /api/listings - Create listing (landlords)
* GET /api/listings/:id - Listing details
* PATCH /api/listings/:id - Update listing
* DELETE /api/listings/:id - Archive listing
* GET /api/listings/:id/availability - Check availability
* POST /api/listings/:id/availability - Update availability

Favorites:
* GET /api/favorites - User's saved listings
* POST /api/favorites - Save listing
* DELETE /api/favorites/:id - Remove favorite
* GET /api/favorites/folders - Get folders
* POST /api/favorites/folders - Create folder

Communication:
* POST /api/messages/start - Start conversation
* GET /api/messages/threads - Get conversations
* GET /api/messages/thread/:id - Get messages
* POST /api/messages/thread/:id - Send message
* PATCH /api/messages/:id/read - Mark as read

Bookings:
* POST /api/inquiries - Create booking inquiry
* GET /api/inquiries - Get user's inquiries
* PATCH /api/inquiries/:id - Respond to inquiry
* POST /api/bookings - Confirm booking
* GET /api/bookings - Get user's bookings
* PATCH /api/bookings/:id - Update booking status

Reviews:
* POST /api/reviews - Create review
* GET /api/reviews/listing/:id - Listing reviews
* GET /api/reviews/user/:id - User reviews

Payments:
* POST /api/payments - Process payment
* GET /api/payments - Payment history
* POST /api/payments/:id/refund - Process refund


Notifications:
* GET /api/notifications - Get notifications
* PATCH /api/notifications/:id/read - Mark as read
* POST /api/notifications/settings - Update preferences