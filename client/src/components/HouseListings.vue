<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header with Filters -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 class="text-2xl font-bold text-gray-900">My Listings</h1>
        
        <!-- Filters -->
        <div class="flex flex-wrap gap-4 items-center">
          <select 
            v-model="filters.type"
            @change="fetchListings"
            class="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="">All Types</option>
            <option value="Bed Sitter">Bed Sitter</option>
            <option value="Single Room">Single Room</option>
            <option value="One Bedroom">One Bedroom</option>
            <option value="Two Bedroom">Two Bedroom</option>
            <option value="Three Bedroom">Three Bedroom</option>
            <option value="Four Bedroom">Four Bedroom</option>
            <option value="Five Bedroom">Five Bedroom</option>
          </select>

          <select 
            v-model="filters.purpose"
            @change="fetchListings"
            class="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="">All Purposes</option>
            <option value="Rent">Rent</option>
            <option value="Sale">Sale</option>
          </select>

          <router-link
            to="/add-house"
            class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
          >
            Add New Listing
          </router-link>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 text-center">
        <p class="text-red-600">{{ error }}</p>
        <button 
          @click="fetchListings"
          class="mt-2 text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Try Again
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="!listings.length" class="text-center py-12">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">You haven't posted any houses yet</h3>
        <p class="mt-1 text-sm text-gray-500">Start by adding your first property listing</p>
        <div class="mt-6">
          <router-link
            to="/add-house"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
          >
            <svg
              class="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clip-rule="evenodd"
              />
            </svg>
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
          <!-- Image Carousel -->
          <div class="relative h-48">
            <img
              :src="getPhotoUrl(listing.photos[currentPhotoIndex[listing._id] || 0])"
              :alt="listing.location"
              class="h-full w-full object-cover"
              @error="handleImageError"
            />
            <!-- Image Navigation -->
            <div v-if="listing.photos.length > 1" class="absolute inset-0 flex items-center justify-between">
              <button 
                @click="prevPhoto(listing._id)"
                class="p-1 bg-black bg-opacity-50 text-white rounded-r hover:bg-opacity-75"
              >
                &lt;
              </button>
              <button 
                @click="nextPhoto(listing._id)"
                class="p-1 bg-black bg-opacity-50 text-white rounded-l hover:bg-opacity-75"
              >
                &gt;
              </button>
            </div>
            <!-- Image Dots -->
            <div v-if="listing.photos.length > 1" class="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
              <button
                v-for="(photo, index) in listing.photos"
                :key="index"
                @click="currentPhotoIndex[listing._id] = index"
                class="w-2 h-2 rounded-full"
                :class="currentPhotoIndex[listing._id] === index ? 'bg-white' : 'bg-gray-400'"
              ></button>
            </div>
          </div>

          <div class="p-4">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-medium text-gray-900">{{ listing.location }}</h3>
                <p class="mt-1 text-sm text-gray-500">{{ listing.type }}</p>
              </div>
              <span class="px-2 py-1 text-xs font-medium rounded" 
                :class="listing.purpose === 'Rent' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'"
              >
                {{ listing.purpose }}
              </span>
            </div>

            <div class="mt-2 flex items-center text-sm text-gray-500">
              <svg
                class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>KSh {{ formatPrice(listing.price) }}/{{ listing.purpose === 'Rent' ? 'month' : '' }}</p>
            </div>

            <div class="mt-2 flex items-center justify-between text-sm text-gray-500">
              <div class="flex items-center">
                <svg
                  class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <p>Posted by: {{ listing.seller.name }}</p>
              </div>
            </div>

            <div class="mt-2 text-sm text-gray-500">
              <p>Contact: {{ listing.seller.phone }}</p>
              <p>Posted: {{ formatDate(listing.datePosted) }}</p>
            </div>

            <div class="mt-4 flex justify-end space-x-3">
              <router-link
                :to="`/edit-house/${listing._id}`"
                class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 flex items-center"
              >
                <svg
                  class="w-4 h-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </router-link>
              <button
                @click="confirmDelete(listing._id)"
                class="px-3 py-1 text-sm text-red-600 hover:text-red-800 flex items-center"
              >
                <svg
                  class="w-4 h-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
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
          <p class="text-gray-600 mb-6">
            Are you sure you want to delete this listing? This action cannot be undone.
          </p>
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
              class="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <svg
                v-if="isDeleting"
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import axios from 'axios';

export default {
  name: 'HouseListings',
  setup() {
    const router = useRouter();
    const auth = useAuth();
    
    const listings = ref([]);
    const isLoading = ref(true);
    const error = ref(null);
    const showDeleteModal = ref(false);
    const selectedListingId = ref(null);
    const isDeleting = ref(false);
    const currentPhotoIndex = ref({});
    const filters = reactive({
      type: '',
      purpose: ''
    });

    const apiBaseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://rentkenya.onrender.com'
      : 'http://localhost:5000';

    const fetchListings = async () => {
      isLoading.value = true;
      error.value = null;
      try {
        const token = auth.getToken();
        if (!token) {
          router.push({
            name: 'Login',
            query: { redirect: router.currentRoute.value.fullPath }
          });
          return;
        }

        const params = new URLSearchParams();
        if (filters.type) params.append('type', filters.type);
        if (filters.purpose) params.append('purpose', filters.purpose);

        const response = await axios.get(
          `${apiBaseUrl}/api/houses/my-listings${params.toString() ? `?${params.toString()}` : ''}`,
          {
            headers: {
              Authorization: token
            }
          }
        );
        
        if (!response.data) {
          throw new Error('No data received from server');
        }

        listings.value = response.data;
        
        // Initialize photo indices
        const photoIndices = {};
        listings.value.forEach(listing => {
          photoIndices[listing._id] = 0;
        });
        currentPhotoIndex.value = photoIndices;

      } catch (error) {
        console.error('Error fetching listings:', error);
        
        if (error.response?.status === 401) {
          auth.setToken(null);
          router.push({
            name: 'Login',
            query: { redirect: router.currentRoute.value.fullPath }
          });
          return;
        }

        error.value = error.response?.data?.message || 'Failed to load your listings. Please try again.';
      } finally {
        isLoading.value = false;
      }
    };

    const deleteListing = async () => {
      if (!selectedListingId.value || isDeleting.value) return;

      isDeleting.value = true;
      try {
        const token = auth.getToken();
        await axios.delete(`${apiBaseUrl}/api/houses/${selectedListingId.value}`, {
          headers: {
            Authorization: token
          }
        });
        
        // Remove the deleted listing from the array
        listings.value = listings.value.filter(listing => listing._id !== selectedListingId.value);
        
        // Clean up
        showDeleteModal.value = false;
        selectedListingId.value = null;
      } catch (error) {
        console.error('Error deleting listing:', error);
        if (error.response?.status === 401) {
          auth.setToken(null);
          router.push({
            name: 'Login',
            query: { redirect: router.currentRoute.value.fullPath }
          });
        }
      } finally {
        isDeleting.value = false;
      }
    };

    const handleImageError = (event) => {
      event.target.src = '/placeholder-house.png';
    };

    const getPhotoUrl = (photo) => {
      try {
        if (!photo) return '/placeholder-house.png';
        
        if (photo.path) {
          return `${apiBaseUrl}${photo.path}`;
        }
        
        if (typeof photo === 'string') {
          return photo.startsWith('http') ? photo : `${apiBaseUrl}${photo}`;
        }
        
        return '/placeholder-house.png';
      } catch (error) {
        console.error('Error processing photo URL:', error);
        return '/placeholder-house.png';
      }
    };

    const confirmDelete = (id) => {
      selectedListingId.value = id;
      showDeleteModal.value = true;
    };

    const formatPrice = (price) => {
      return price.toLocaleString();
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    // Handle photo navigation
    const nextPhoto = (listingId) => {
      const listing = listings.value.find(l => l._id === listingId);
      if (!listing || !listing.photos.length) return;
      
      currentPhotoIndex.value[listingId] = 
        (currentPhotoIndex.value[listingId] + 1) % listing.photos.length;
    };

    const prevPhoto = (listingId) => {
      const listing = listings.value.find(l => l._id === listingId);
      if (!listing || !listing.photos.length) return;
      
      currentPhotoIndex.value[listingId] = 
        (currentPhotoIndex.value[listingId] - 1 + listing.photos.length) % listing.photos.length;
    };

    // Fetch listings on component mount
    fetchListings();

    return {
      listings,
      isLoading,
      error,
      showDeleteModal,
      isDeleting,
      currentPhotoIndex,
      filters,
      handleImageError,
      getPhotoUrl,
      confirmDelete,
      deleteListing,
      formatPrice,
      formatDate,
      fetchListings,
      nextPhoto,
      prevPhoto
    };
  }
};
</script>