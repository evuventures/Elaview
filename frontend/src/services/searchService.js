// frontend/src/services/searchService.js
import algoliasearch from 'algoliasearch/lite';

const searchClient = algoliasearch(
  process.env.REACT_APP_ALGOLIA_APP_ID,
  process.env.REACT_APP_ALGOLIA_SEARCH_KEY
);

export const searchSpaces = async (query, filters) => {
  const index = searchClient.initIndex('ad_spaces');
  
  const searchParams = {
    query,
    filters: buildAlgoliaFilters(filters),
    aroundLatLng: filters.location ? `${filters.location.lat},${filters.location.lng}` : undefined,
    aroundRadius: filters.radius || 10000 // 10km default
  };

  return await index.search('', searchParams);
};