User Account (Shared for Both Roles):
- First name
- Last name
- Email
- Password
- Role (Landlord or Advertiser)
- Business name

Landlord-Specific Attributes:
- Listing management (spaces, pricing, availability)
- Visibility score (to maximize earnings)
- Advertiser-Specific Attributes:
- Search filters (preferences for space types, visibility score, price)


Attributes of a review:
- Rating (1-5 stars)
- Comment
- Date of review
- Renter’s (advertiser’s) name
- Renter’s (advertiser’s) company name
- Review display:
- Average rating for the space
- Total number of reviews


Pricing structure:

Base price (fixed rate per week or month)
Discounts (optional, applied by the landlord)

Now, with that foundation in place, let's dive into data structure a bit more.

Next question:
How will you handle the listing's visibility score? Will this be a calculated field based on the traffic, location, and other factors? Or will it be entered manually by the landlord? If it's calculated, do you have specific rules or formulas in mind for how the visibility score will be derived?


Visibility Score:
- Foot Traffic
- Vehicle Traffic
- Visibility Angle
- Location Quality

Availability:
- Available now checkbox
- Available from specific date (date picker)


Pricing Structure:
- Rental Price: Can vary by space and duration (weekly/monthly)
- Installation Fee: Set by the landlord and could vary by space type or other factors

Listings:
- Each listing includes price, availability, traffic info, size, and location.

Visibility score is calculated from foot traffic, vehicle traffic, visibility angle, and location quality.

Landlords can offer discounts and set installation fees.

User Roles:

Users can choose to be landlords or advertisers.

Landlords create and manage listings, set pricing, and receive visibility scores.

Advertisers (renters) search, filter, and interact with listings.

Messaging System:

Conversations are between landlords and advertisers, with a profile picture, message preview, and timestamp.

A message thread with read/unread statuses and the ability to send attachments.

Reviews:

Reviews are left by renters (advertisers) who have rented a space.

Reviews include rating, comments, and visible averages and count for each listing.

Space Availability:

Spaces can be marked as available now or with an available from date.

Service Fee:

A 5% service fee is applied to all bookings.

