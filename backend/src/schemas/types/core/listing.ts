// 002_rental_listings.sql
// rental listings

export interface RentalListing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
}

// 003_listing_availability.sql
// listing availability calendar

export interface ListingAvailability {
  id: string;
  listing_id: string;
  date: string;
  availability_type: 'available' | 'booked' | 'maintenance' | 'blocked';
  price_override: number;
}