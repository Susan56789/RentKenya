<template>
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900">My Listings</h1>
          <router-link
            to="/add-house"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700"
          >
            Add New Listing
          </router-link>
        </div>
  
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
        </div>
  
        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 text-center">
          <p class="text-red-600">{{ error }}</p>
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
          <h3 class="mt-2 text-sm font-medium text-gray-900">No listings yet</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by creating a new listing.</p>
          <div class="mt-6">
            <router-link
              to="/add-house"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
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
              Add New Listing
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
            <img
              :src="listing.images[0] || '/placeholder-house.jpg'"
              :alt="listing.title"
              class="h-48 w-full object-cover"
            />
            <div class="p-4">
              <h3 class="text-lg font-medium text-gray-900">{{ listing.title }}</h3>
              <p class="mt-1 text-sm text-gray-500">{{ listing.location }}</p>
              <div class="mt-2 flex items-center text-sm text-gray-500">
                <svg
                  class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clip-rule="evenodd"
                  />
                </svg>
                <p>KSh {{ listing.price.toLocaleString() }}/month</p>
              </div>
              <div class="mt-4 flex justify-end space-x-3">
                <button
                  @click="editListing(listing._id)"
                  class="px-3 py-1 text-sm text-gray-600 hover:text-gray-500"
                >
                  Edit
                </button>
                <button
                  @click="deleteListing(listing._id)"
                  class="px-3 py-1 text-sm text-red-600 hover:text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'HouseListings',
    data() {
      return {
        listings: [],
        isLoading: true,
        error: null
      };
    },
    methods: {
      async fetchListings() {
        this.isLoading = true;
        this.error = null;
        try {
          const response = await axios.get('https://rentkenya.onrender.com/api/houses/my-listings', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          this.listings = response.data;
        } catch (error) {
          this.error = 'Failed to load listings. Please try again.';
          console.error('Error fetching listings:', error);
        } finally {
          this.isLoading = false;
        }
      },
      editListing(id) {
        this.$router.push(`/edit-house/${id}`);
      },
      async deleteListing(id) {
        if (!confirm('Are you sure you want to delete this listing?')) return;
        
        try {
          await axios.delete(`https://rentkenya.onrender.com/api/houses/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          this.listings = this.listings.filter(listing => listing._id !== id);
        } catch (error) {
          console.error('Error deleting listing:', error);
        }
      }
    },
    mounted() {
      this.fetchListings();
    }
  };
  </script>