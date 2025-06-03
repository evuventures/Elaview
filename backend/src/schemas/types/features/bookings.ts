// 008_listing_inquiries.sql
// booking requests

export interface ListingInquiry {
  id: string;
  listing_id: string;
  renter_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  quoted_price: number;
  message: string;
}

// 009_bookings.sql

export interface Booking {
  id: string;
  inquiry_id: string;
  listing_id: string;
  landlord_id: string;
  renter_id: string;
}