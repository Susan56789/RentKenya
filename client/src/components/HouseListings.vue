<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Header with Filters -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 class="text-2xl font-bold text-gray-900">My Listings</h1>
        
        <div class="flex flex-wrap gap-4 items-center">
          <select 
            v-model="filters.type"
            @change="fetchListings"
            class="px-3 py-2 border rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="">All Types</option>
            <option v-for="type in houseTypes" :key="type" :value="type">{{ type }}</option>
          </select>

          <select 
            v-model="filters.purpose"
            @change="fetchListings"
            class="px-3 py-2 border rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="">All Purposes</option>
            <option value="Rent">Rent</option>
            <option value="Sale">Sale</option>
          </select>
          
          <!-- Amenities Filter Dropdown -->
          <div class="relative" ref="amenitiesDropdown">
            <button 
              type="button"
              @click="isAmenitiesDropdownOpen = !isAmenitiesDropdownOpen"
              class="px-3 py-2 border rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center gap-2"
            >
              <span>Amenities</span>
              <span v-if="selectedAmenitiesCount > 0" class="bg-gray-200 text-xs px-2 py-0.5 rounded-full">
                {{ selectedAmenitiesCount }}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <!-- Dropdown Content -->
            <div 
              v-if="isAmenitiesDropdownOpen"
              class="absolute top-full mt-1 left-0 z-10 w-64 p-4 bg-white shadow-lg rounded-md border border-gray-200"
            >
              <!-- Amenities Categories Tabs -->
              <div class="flex border-b border-gray-200 mb-3">
                <button
                  v-for="(label, category) in amenitiesCategories"
                  :key="category"
                  type="button"
                  @click="activeAmenitiesCategory = category"
                  class="px-3 py-1 text-sm font-medium border-b-2 transition-colors"
                  :class="activeAmenitiesCategory === category 
                    ? 'border-gray-800 text-gray-800' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                >
                  {{ label }}
                </button>
              </div>
              
              <!-- Amenities Checkboxes -->
              <div class="max-h-52 overflow-y-auto">
                <div class="space-y-1">
                  <div 
                    v-for="amenity in amenitiesOptions[activeAmenitiesCategory]"
                    :key="amenity"
                    class="flex items-center"
                  >
                    <input
                      :id="`filter-${activeAmenitiesCategory}-${amenity}`"
                      type="checkbox"
                      :value="amenity"
                      v-model="selectedAmenities[activeAmenitiesCategory]"
                      class="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                      @change="fetchListings"
                    />
                    <label 
                      :for="`filter-${activeAmenitiesCategory}-${amenity}`"
                      class="ml-2 block text-sm text-gray-700"
                    >
                      {{ amenity }}
                    </label>
                  </div>
                </div>
              </div>
              
              <!-- Actions -->
              <div class="flex justify-between pt-3 mt-3 border-t border-gray-200">
                <button
                  type="button"
                  @click="clearAmenityFilters"
                  class="text-xs text-gray-600 hover:text-gray-800"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  @click="isAmenitiesDropdownOpen = false"
                  class="text-xs text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          <router-link
            to="/add-house"
            class="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Add New Listing
          </router-link>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600">{{ error }}</p>
        <button 
          @click="fetchListings"
          class="mt-4 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Try Again
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="!listings.length" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No listings found</h3>
        <p class="mt-1 text-sm text-gray-500">Start by adding your first property listing</p>
        <div class="mt-6">
          <router-link
            to="/add-house"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700"
          >
            Add Your First Listing
          </router-link>
        </div>
      </div>

      <!-- Listings Grid -->
      <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="listing in listings"
          :key="listing._id"
          class="bg-white shadow rounded-lg overflow-hidden"
        >
          <!-- Image Section -->
          <div class="relative h-48">
            <img
              :src="getListingImageSrc(listing._id)"
              :alt="listing.location"
              class="h-full w-full object-cover"
              @error="handleImageError($event, listing._id)"
              @load="handleImageLoad(listing._id)"
            />
            
            <!-- Loading Overlay -->
            <div 
              v-if="!loadedImages[listing._id]" 
              class="absolute inset-0 bg-gray-100 flex items-center justify-center"
            >
              <div class="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            </div>

            <!-- Image Navigation -->
            <div 
              v-if="loadedImages[listing._id] && listing.photos?.length > 1" 
              class="absolute inset-0 flex items-center justify-between px-2"
            >
              <button 
                @click="changePhoto(listing._id, -1)"
                class="p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                @click="changePhoto(listing._id, 1)"
                class="p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <!-- Image Dots -->
            <div 
              v-if="loadedImages[listing._id] && listing.photos?.length > 1"
              class="absolute bottom-2 left-0 right-0 flex justify-center space-x-1"
            >
              <button
                v-for="(_, index) in listing.photos"
                :key="index"
                @click="setPhotoIndex(listing._id, index)"
                class="w-2 h-2 rounded-full transition-colors"
                :class="currentPhotoIndices[listing._id] === index ? 'bg-white' : 'bg-white bg-opacity-50'"
              ></button>
            </div>
          </div>

          <!-- Listing Details -->
          <div class="p-4">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-medium text-gray-900">{{ listing.location }}</h3>
                <p class="mt-1 text-sm text-gray-500">{{ listing.type }}</p>
              </div>
              <span 
                class="px-2 py-1 text-xs font-medium rounded"
                :class="listing.purpose === 'Rent' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'"
              >
                {{ listing.purpose }}
              </span>
            </div>

            <div class="mt-2 flex items-center text-sm text-gray-500">
              <span class="font-medium">KSh {{ formatPrice(listing.price) }}</span>
              <span v-if="listing.purpose === 'Rent'">/month</span>
            </div>
            
            <!-- Amenities Pills -->
            <div v-if="hasAmenities(listing)" class="mt-3 flex flex-wrap gap-1">
              <span 
                v-for="(amenity, index) in getTopAmenities(listing)" 
                :key="index"
                class="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {{ amenity }}
              </span>
              <span 
                v-if="countTotalAmenities(listing) > 3" 
                class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                +{{ countTotalAmenities(listing) - 3 }} more
              </span>
            </div>

            <div class="mt-4 flex justify-end space-x-3">
              <router-link
                :to="`/house/${listing._id}`"
                class="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round"
                   stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" 
                  stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View
              </router-link>
              <router-link
                :to="`/edit-house/${listing._id}`"
                class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit
              </router-link>
              <button
                @click="confirmDelete(listing._id)"
                class="px-3 py-1 text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="showDeleteModal = false"
      >
        <div class="bg-white rounded-lg p-6 max-w-sm mx-4">
          <h3 class="text-lg font-semibold mb-4">Confirm Deletion</h3>
          <p class="text-gray-600 mb-6">Are you sure you want to delete this listing? This action cannot be undone.</p>
          <div class="flex justify-end space-x-3">
            <button
              @click="showDeleteModal = false"
              class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              @click="deleteListing"
              :disabled="isDeleting"
              class="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch, computed, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import axios from 'axios';

const HOUSE_TYPES = [
  'Bed Sitter',
  'Single Room',
  'One Bedroom',
  'Two Bedroom',
  'Three Bedroom',
  'Four Bedroom',
  'Five Bedroom'
];

// Amenities Constants
const AMENITIES_OPTIONS = {
  internal: [
    'Aircon',
    'Alarm',
    'Backup Generator',
    'En Suite',
    'Fibre Internet',
    'Furnished',
    'Serviced',
    'Service Charge Included',
    'Walk In Closet'
  ],
  external: [
    'Balcony',
    'BBQ',
    'CCTV',
    'Electric Fence',
    'Borehole',
    'Garden',
    'Gym',
    'Parking',
    'Staff Quarters',
    'Swimming Pool',
    'Wheelchair Access',
    'Gated Community',
    'Kids Play Area'
  ],
  nearby: [
    'Bus Stop',
    'Golf Course',
    'Hospital',
    'Scenic View',
    'School',
    'Shopping Centre'
  ]
};

const AMENITIES_CATEGORIES = {
  internal: 'Internal',
  external: 'External',
  nearby: 'Nearby'
};

// Date validation utility
const isValidDate = (dateValue) => {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  return date instanceof Date && !isNaN(date);
};

// Date sanitization utility
const sanitizeDate = (dateValue) => {
  return isValidDate(dateValue) ? new Date(dateValue).toISOString() : new Date().toISOString();
};

export default {
  name: 'MyListings',
  
  setup() {
    const router = useRouter();
    const auth = useAuth();
    
    // State
    const listings = ref([]);
    const isLoading = ref(true);
    const error = ref(null);
    const currentPhotoIndices = ref({});
    const loadedImages = ref({});
    const showDeleteModal = ref(false);
    const selectedListingId = ref(null);
    const isDeleting = ref(false);
    const filters = reactive({ 
      type: '', 
      purpose: '',
    });
    
    // Amenities dropdown state
    const amenitiesDropdown = ref(null);
    const isAmenitiesDropdownOpen = ref(false);
    const activeAmenitiesCategory = ref('internal');
    const selectedAmenities = reactive({
      internal: [],
      external: [],
      nearby: []
    });
    
    // API Configuration
    const apiBaseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://rentkenya.onrender.com' 
      : 'http://localhost:5000';
    
    // Computed values
    const selectedAmenitiesCount = computed(() => {
      return selectedAmenities.internal.length + 
             selectedAmenities.external.length + 
             selectedAmenities.nearby.length;
    });
    
    // Combined amenities list for API
    const amenitiesForApi = computed(() => {
      const allAmenities = [
        ...selectedAmenities.internal,
        ...selectedAmenities.external,
        ...selectedAmenities.nearby
      ];
      return allAmenities.length > 0 ? allAmenities.join(',') : null;
    });

    // Fetch Listings with date sanitization
    const fetchListings = async () => {
      isLoading.value = true;
      error.value = null;

      try {
        const token = auth.getToken();
        if (!token) {
          router.push('/login');
          return;
        }

        const params = new URLSearchParams();
        if (filters.type) params.append('type', filters.type);
        if (filters.purpose) params.append('purpose', filters.purpose);
        
        // Add amenities filter if any are selected
        if (amenitiesForApi.value) {
          params.append('amenity', amenitiesForApi.value);
        }

        const response = await axios.get(
          `${apiBaseUrl}/api/houses/my-listings${params.toString() ? `?${params.toString()}` : ''}`,
          {
            headers: {
              Authorization: token
            }
          }
        );

        // Sanitize dates in the response data
        const sanitizedListings = (response.data.houses || response.data || []).map(listing => ({
          ...listing,
          createdAt: sanitizeDate(listing.createdAt),
          updatedAt: sanitizeDate(listing.updatedAt)
        }));

        listings.value = sanitizedListings;
        
        // Initialize photo indices and loading states
        listings.value.forEach(listing => {
          if (typeof currentPhotoIndices.value[listing._id] === 'undefined') {
            currentPhotoIndices.value[listing._id] = 0;
          }
          loadedImages.value[listing._id] = false;
        });

      } catch (err) {
        console.error('Error fetching listings:', err);
        error.value = err.response?.data?.message || 'Failed to load listings';
        if (err.response?.status === 401) {
          auth.setToken(null);
          router.push('/login');
        }
      } finally {
        isLoading.value = false;
      }
    };

    // Image Handling
    const getListingImageSrc = (listingId) => {
      const token = auth.getToken();
      if (!token) return '/placeholder-house.png';
      
      const index = currentPhotoIndices.value[listingId] || 0;
      return `${apiBaseUrl}/api/houses/image/${listingId}/${index}?token=${token}`;
    };

    const handleImageLoad = (listingId) => {
      loadedImages.value[listingId] = true;
    };

    const handleImageError = (event, listingId) => {
      loadedImages.value[listingId] = true;
      event.target.src = '/placeholder-house.png';
    };

    const changePhoto = (listingId, direction) => {
      const listing = listings.value.find(l => l._id === listingId);
      if (!listing?.photos?.length) return;
      
      const currentIndex = currentPhotoIndices.value[listingId] || 0;
      const totalPhotos = listing.photos.length;
      currentPhotoIndices.value[listingId] = 
        (currentIndex + direction + totalPhotos) % totalPhotos;
      
      loadedImages.value[listingId] = false;
    };

    const setPhotoIndex = (listingId, index) => {
      currentPhotoIndices.value[listingId] = index;
      loadedImages.value[listingId] = false;
    };
    
    // Amenities helper functions
    const hasAmenities = (listing) => {
      if (!listing.amenities) return false;
      
      return (
        Array.isArray(listing.amenities.internal) && listing.amenities.internal.length > 0 ||
        Array.isArray(listing.amenities.external) && listing.amenities.external.length > 0 ||
        Array.isArray(listing.amenities.nearby) && listing.amenities.nearby.length > 0
      );
    };
    
    const countTotalAmenities = (listing) => {
      if (!listing.amenities) return 0;
      
      return (
        (Array.isArray(listing.amenities.internal) ? listing.amenities.internal.length : 0) +
        (Array.isArray(listing.amenities.external) ? listing.amenities.external.length : 0) +
        (Array.isArray(listing.amenities.nearby) ? listing.amenities.nearby.length : 0)
      );
    };
    
    const getTopAmenities = (listing) => {
      if (!listing.amenities) return [];
      
      // Combine all amenities
      const allAmenities = [
        ...(Array.isArray(listing.amenities.internal) ? listing.amenities.internal : []),
        ...(Array.isArray(listing.amenities.external) ? listing.amenities.external : []),
        ...(Array.isArray(listing.amenities.nearby) ? listing.amenities.nearby : [])
      ];
      
      // Return up to 3 amenities
      return allAmenities.slice(0, 3);
    };
    
    // Clear all amenity filters
    const clearAmenityFilters = () => {
      selectedAmenities.internal = [];
      selectedAmenities.external = [];
      selectedAmenities.nearby = [];
      fetchListings();
    };
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (amenitiesDropdown.value && !amenitiesDropdown.value.contains(event.target)) {
        isAmenitiesDropdownOpen.value = false;
      }
    };

    // Delete Functionality with date handling
    const confirmDelete = (id) => {
      if (!auth.isAuthenticated()) {
        router.push('/login');
        return;
      }
      selectedListingId.value = id;
      showDeleteModal.value = true;
    };

    const deleteListing = async () => {
      if (!selectedListingId.value || isDeleting.value) return;

      isDeleting.value = true;
      try {
        const token = auth.getToken();
        if (!token) {
          router.push('/login');
          return;
        }

        await axios.delete(
          `${apiBaseUrl}/api/houses/${selectedListingId.value}`,
          {
            headers: {
              Authorization: token
            }
          }
        );

        // Remove listing from state
        listings.value = listings.value.filter(
          listing => listing._id !== selectedListingId.value
        );

        // Cleanup states
        delete currentPhotoIndices.value[selectedListingId.value];
        delete loadedImages.value[selectedListingId.value];
        
        showDeleteModal.value = false;
        selectedListingId.value = null;

      } catch (err) {
        console.error('Error deleting listing:', err);
        error.value = err.response?.data?.message || 'Failed to delete listing';
        if (err.response?.status === 401) {
          auth.setToken(null);
          router.push('/login');
        }
      } finally {
        isDeleting.value = false;
      }
    };

    // Utility Functions
    const formatPrice = (price) => {
      return price?.toLocaleString() || '0';
    };

    // Format date utility
    const formatDate = (dateString) => {
      if (!isValidDate(dateString)) return '';
      return new Date(dateString).toLocaleDateString();
    };

    // Initialize component
    onMounted(() => {
      if (auth.isAuthenticated()) {
        fetchListings();
      } else {
        router.push('/login');
      }
      
      // Add click outside listener
      document.addEventListener('mousedown', handleClickOutside);
    });
    
    // Remove event listener on component unmount
    onBeforeUnmount(() => {
      document.removeEventListener('mousedown', handleClickOutside);
    });

    // Watch for filter changes
    watch([filters, amenitiesForApi], () => {
      if (auth.isAuthenticated()) {
        nextTick(() => {
          fetchListings();
        });
      }
    });

    return {
      // State
      listings,
      isLoading,
      error,
      currentPhotoIndices,
      loadedImages,
      showDeleteModal,
      isDeleting,
      selectedListingId,
      filters,
      houseTypes: HOUSE_TYPES,
      
      // Amenities
      amenitiesOptions: AMENITIES_OPTIONS,
      amenitiesCategories: AMENITIES_CATEGORIES,
      isAmenitiesDropdownOpen,
      amenitiesDropdown,
      activeAmenitiesCategory,
      selectedAmenities,
      selectedAmenitiesCount,
      hasAmenities,
      countTotalAmenities,
      getTopAmenities,
      clearAmenityFilters,

      // Functions
      getListingImageSrc,
      handleImageLoad,
      handleImageError,
      changePhoto,
      setPhotoIndex,
      fetchListings,
      confirmDelete,
      deleteListing,
      formatPrice,
      formatDate,
      isValidDate
    };
  }
};
</script>