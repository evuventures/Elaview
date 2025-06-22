// backend/services/verificationService.js
import vision from '@google-cloud/vision';
import { createClient } from '@supabase/supabase-js';

export const verifyListing = async (listingData, images) => {
  const verificationResults = {
    photoQuality: await checkPhotoQuality(images),
    locationValidation: await validateLocation(listingData.address),
    spaceTypeMatch: await verifySpaceType(images, listingData.space_type),
    priceCheck: await flagPriceOutliers(listingData),
    completenessScore: calculateCompleteness(listingData)
  };

  return verificationResults;
};