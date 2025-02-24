<template>
  <div class="max-w-4xl mx-auto p-4">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
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

    <!-- Empty State -->
    <div v-else-if="!house" class="text-center py-12">
      <p class="text-gray-600 text-lg">House not found</p>
      <router-link 
        to="/"
        class="mt-4 inline-block text-gray-600 hover:text-gray-800 underline"
      >
        Back to Home
      </router-link>
    </div>

    <!-- House Details -->
    <div v-else class="bg-white rounded-lg shadow-lg overflow-hidden">
      <!-- Image Gallery -->
      <div class="relative h-96">
        <img 
          :src="getHouseImageSrc"
          :alt="`${house.type} in ${house.location}`"
          class="w-full h-96 object-cover"
          @error="handleImageError"
          @load="handleImageLoad"
        />
        
        <div 
          v-if="imageLoading"
          class="absolute inset-0 bg-gray-100 flex items-center justify-center"
        >
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
        </div>
        
        <!-- Gallery Navigation -->
        <div v-if="house.photos?.length > 1" class="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4">
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
            v-if="currentPhotoIndex < (house.photos.length - 1)"
            @click="currentPhotoIndex++"
            class="bg-black/30 hover:bg-black/50 text-white rounded-full p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Image Dots -->
        <div 
          v-if="house.photos?.length > 1"
          class="absolute bottom-4 left-0 right-0 flex justify-center space-x-2"
        >
          <button
            v-for="(_, index) in house.photos"
            :key="index"
            @click="currentPhotoIndex = index"
            class="w-2 h-2 rounded-full transition-colors"
            :class="currentPhotoIndex === index ? 'bg-white' : 'bg-white/50'"
          ></button>
        </div>
      </div>

      <div class="p-6">
        <!-- Property ID and Status -->
        <div class="flex justify-between items-start mb-4">
          <p class="text-sm text-gray-500">Property ID: {{ house._id }}</p>
          <span 
            class="px-3 py-1 rounded-full text-sm"
            :class="house.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
          >
            {{ house.status }}
          </span>
        </div>

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
            <p class="text-2xl font-bold text-gray-600">
              KES {{ formatPrice(house.price) }}
              <span v-if="house.purpose === 'Rent'" class="text-sm text-gray-600">/month</span>
            </p>
            <p class="text-gray-600">For {{ house.purpose }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-600">Posted on</p>
            <p class="text-gray-800">{{ formatDate(house.datePosted) }}</p>
          </div>
        </div>

        <!-- Dates -->
        <div class="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p class="text-gray-600">Created</p>
            <p class="text-gray-800">{{ formatDate(house.createdAt) }}</p>
          </div>
          <div v-if="house.updatedAt">
            <p class="text-gray-600">Last Updated</p>
            <p class="text-gray-800">{{ formatDate(house.updatedAt) }}</p>
          </div>
        </div>

        <!-- Seller Information -->
        <div class="border-t pt-6">
          <h2 class="text-xl font-semibold mb-4">Contact Information</h2>
          <div v-if="house.seller" class="bg-gray-50 p-4 rounded-lg">
            <div class="flex items-center gap-4 mb-4">
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
                v-if="house.seller.phone"
                :href="'tel:' + house.seller.phone"
                class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg text-center hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call
              </a>
              <a 
                v-if="house.seller.email"
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
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

export default {
  name: 'HouseDetail',
  
  setup() {
    const route = useRoute();
    const house = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const currentPhotoIndex = ref(0);
    const imageLoading = ref(true);

    const apiBaseUrl = process.env.NODE_ENV === 'production'
      ? 'https://rentkenya.onrender.com'
      : 'http://localhost:5000';

    const getHouseImageSrc = computed(() => {
      if (!house.value?.photos?.length) return '/placeholder-house.png';
      return `${apiBaseUrl}/api/houses/image/${house.value._id}/${currentPhotoIndex.value}`;
    });

    const formatPrice = (price) => {
      try {
        return new Intl.NumberFormat('en-KE').format(Number(price) || 0);
      } catch {
        return '0';
      }
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return 'Not available';
      
      try {
        const date = new Date(dateStr);
        if (!date || isNaN(date.getTime())) {
          return 'Not available';
        }
        
        const options = {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        };
        
        return new Intl.DateTimeFormat('en-KE', options).format(date);
      } catch {
        return dateStr || 'Not available';
      }
    };

    const handleImageLoad = () => {
      imageLoading.value = false;
    };

    const handleImageError = (event) => {
      event.target.src = '/placeholder-house.png';
      imageLoading.value = false;
    };

    const fetchHouseDetails = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        console.log('Fetching house details for ID:', route.params.id);
        
        const response = await axios.get(`${apiBaseUrl}/api/houses/${route.params.id}`);
        console.log('Raw API Response:', JSON.stringify(response.data, null, 2));
        
        if (!response.data?.house) {
          throw new Error('House data not found');
        }

        // Get the raw house data
        const rawData = response.data.house;
        console.log('Raw house data:', JSON.stringify(rawData, null, 2));

        // Create a new object with ONLY the fields we need, keeping dates as strings
        const processedHouse = {
          _id: rawData._id,
          location: rawData.location || '',
          price: Number(rawData.price) || 0,
          datePosted: String(rawData.datePosted || ''),
          type: rawData.type || '',
          purpose: rawData.purpose || '',
          photos: Array.isArray(rawData.photos) ? rawData.photos : [],
          seller: {
            id: rawData.seller?.id || '',
            name: rawData.seller?.name || '',
            email: rawData.seller?.email || '',
            phone: rawData.seller?.phone || ''
          },
          createdAt: String(rawData.createdAt || ''),
          status: rawData.status || ''
        };

        console.log('Processed house data:', JSON.stringify(processedHouse, null, 2));
        
        // Assign to reactive ref
        house.value = processedHouse;
        imageLoading.value = true;

      } catch (err) {
        console.error('Detailed error:', {
          message: err.message,
          stack: err.stack,
          data: err.response?.data
        });
        error.value = 'Failed to load house details. Please try again later.';
        house.value = null;
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
      imageLoading,
      getHouseImageSrc,
      formatPrice,
      formatDate,
      handleImageLoad,
      handleImageError,
      fetchHouseDetails
    };
  }
};
</script>