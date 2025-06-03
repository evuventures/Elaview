// 004_saved_listings.sql
// saved listings

export interface SavedListing {
  id: string;
  user_id: string;
  listing_id: string;
  folder_name: string;
  personal_notes: string;
  priority_level: number;
  is_archived: boolean;
}

// 005_saved_listing_folders.sql

export interface SavedListingFolder {
  id: string;
  user_id: string;
  name: string;
  color_hex: string;
  icon_name: string;
}