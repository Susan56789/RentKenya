<template>
  <div class="max-w-4xl mx-auto p-4">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
      <p class="text-red-700">{{ error }}</p>
      <button 
        @click="fetchHouseDetails" 
        class="mt-2 text-red-600 hover:text-red-800 underline"
      >
        Try Again
      </button>
    </div>

    <!-- House Details -->
    <div v-else class="bg-white rounded-lg shadow-lg overflow-hidden">
      <!-- Image Gallery -->
      <div class="relative h-96">
        <template v-if="house.photos && house.photos.length > 0">
          <img 
            :src="house.photos[currentPhotoIndex]" 
            :alt="house.title" 
            class="w-full h-96 object-cover"
          />
          <!-- Gallery Navigation -->
          <div v-if="house.photos.length > 1" class="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            <button 
              v-for="(photo, index) in house.photos" 
              :key="index"
              @click="currentPhotoIndex = index"
              class="w-2 h-2 rounded-full"
              :class="index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'"
            />
          </div>
          <!-- Arrow Navigation -->
          <div class="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4">
            <button 
              v-if="currentPhotoIndex > 0"
              @click="currentPhotoIndex--"
              class="bg-black/30 hover:bg-black/50 text-white rounded-full p-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              v-if="currentPhotoIndex < house.photos.length - 1"
              @click="currentPhotoIndex++"
              class="bg-black/30 hover:bg-black/50 text-white rounded-full p-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </template>
        <div v-else class="w-full h-96 bg-gray-200 flex items-center justify-center">
          <span class="text-gray-400">No photos available</span>
        </div>
      </div>

      <div class="p-6">
        <!-- Basic Info -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900">{{ house.type }}</h1>
          <div class="flex items-center gap-2 mt-2 text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{{ house.location }}</span>
          </div>
        </div>

        <!-- Price and Purpose -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <p class="text-2xl font-bold text-blue-600">
              KES {{ Number(house.price).toLocaleString() }}
            </p>
            <p class="text-gray-600">For {{ house.purpose }}</p>
          </div>
          <div class="bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
            Available {{ new Date(house.datePosted).toLocaleDateString() }}
          </div>
        </div>

        <!-- Description -->
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-2">Description</h2>
          <p class="text-gray-600">{{ house.description || 'No description available' }}</p>
        </div>

        <!-- Contact Information -->
        <div class="border-t pt-6">
          <h2 class="text-xl font-semibold mb-4">Contact Information</h2>
          <div class="space-y-3">
            <div v-if="house.seller" class="flex items-center gap-4">
              <div class="bg-gray-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p class="font-medium">{{ house.seller.name }}</p>
                <p class="text-gray-600 text-sm">Property Owner</p>
              </div>
            </div>

            <div class="flex gap-4">
              <a 
                v-if="house.seller?.phone"
                :href="'tel:' + house.seller.phone"
                class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-center hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call
              </a>
              <a 
                v-if="house.seller?.email"
                :href="'mailto:' + house.seller.email"
                class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-center hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/utils/axios';

export default {
  name: 'HouseDetail',
  
  setup() {
    const route = useRoute();
    const house = ref({});
    const loading = ref(true);
    const error = ref(null);
    const currentPhotoIndex = ref(0);

    const fetchHouseDetails = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await api.get(`/houses/${route.params.id}`);
        house.value = response.data;
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to load house details';
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchHouseDetails);

    return {
      house,
      loading,
      error,
      currentPhotoIndex,
      fetchHouseDetails
    };
  }
};
</script>