// 010_reviews.sql
// reviews for listings and users

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  listing_id: string;
  rating: number;
  title: string;
  comment: string;
}