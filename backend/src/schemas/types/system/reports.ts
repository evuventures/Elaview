// 015_reports.sql
// content moderation

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reported_listing_id: string;
  report_type: 'inappropriate_content' | 'spam' | 'fraud' | 'harassment' | 'fake_listing' | 'other';
}