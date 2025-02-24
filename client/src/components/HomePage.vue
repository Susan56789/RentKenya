<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Filters -->
      <div class="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <h2 class="text-lg font-semibold mb-4">Filters</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div class="relative">
            <input 
              v-model="filters.location"
              @input="handleFilterChange"
              placeholder="Search location..."
              class="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
            <button 
              v-if="filters.location"
              @click="clearFilter('location')"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div class="relative">
            <input 
              v-model.number="filters.minPrice"
              @input="handleFilterChange"
              type="number"
              min="0"
              placeholder="Min Price (KES)"
              class="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
            <button 
              v-if="filters.minPrice"
              @click="clearFilter('minPrice')"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div class="relative">
            <input 
              v-model.number="filters.maxPrice"
              @input="handleFilterChange"
              type="number"
              min="0"
              placeholder="Max Price (KES)"
              class="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
            <button 
              v-if="filters.maxPrice"
              @click="clearFilter('maxPrice')"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <select 
            v-model="filters.type"
            @change="handleFilterChange"
            class="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option v-for="type in houseTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>

          <select 
            v-model="filters.purpose"
            @change="handleFilterChange"
            class="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            <option value="">All Purposes</option>
            <option value="Rent">Rent</option>
            <option value="Sale">Sale</option>
          </select>
        </div>

        <div class="mt-4 flex justify-between items-center">
          <p class="text-sm text-gray-600">
            Found {{ houses.length }} {{ houses.length === 1 ? 'house' : 'houses' }}
          </p>
          <button 
            @click="resetFilters"
            :disabled="!hasActiveFilters"
            class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600">{{ error }}</p>
        <button 
          @click="fetchHouses"
          class="mt-4 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Try Again
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="!houses.length" class="text-center py-12">
        <p class="text-gray-600 text-lg">No houses found matching your criteria</p>
        <button 
          v-if="hasActiveFilters"
          @click="resetFilters"
          class="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Clear Filters
        </button>
      </div>

      <!-- House Listings -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="house in houses"
          :key="house._id"
          class="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
        >
          <!-- Image Section -->
          <div class="relative h-48">
            <img
              :src="getHouseImageSrc(house._id)"
              :alt="house.location"
              class="h-full w-full object-cover"
              @load="handleImageLoad(house._id)"
              @error="handleImageError($event, house._id)"
            />
            
            <!-- Loading Overlay -->
            <div 
              v-if="!loadedImages[house._id]" 
              class="absolute inset-0 bg-gray-100 flex items-center justify-center"
            >
              <div class="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            </div>

            <!-- Image Navigation -->
            <div 
              v-if="loadedImages[house._id] && house.photos?.length > 1" 
              class="absolute inset-0 flex items-center justify-between px-2"
            >
              <button 
                @click="changePhoto(house._id, -1)"
                class="p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                @click="changePhoto(house._id, 1)"
                class="p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <!-- Image Dots -->
            <div 
              v-if="loadedImages[house._id] && house.photos?.length > 1"
              class="absolute bottom-2 left-0 right-0 flex justify-center space-x-1"
            >
              <button
                v-for="(_, index) in house.photos"
                :key="index"
                @click="setPhotoIndex(house._id, index)"
                class="w-2 h-2 rounded-full transition-colors"
                :class="currentPhotoIndices[house._id] === index ? 'bg-white' : 'bg-white bg-opacity-50'"
              ></button>
            </div>
          </div>

          <!-- House Details -->
          <div class="p-4">
            <div class="flex justify-between items-start mb-2">
              <div>
                <h3 class="text-lg font-medium text-gray-900">{{ house.type }}</h3>
                <p class="mt-1 text-sm text-gray-500">{{ house.location }}</p>
              </div>
              <span 
                class="px-2 py-1 text-xs font-medium rounded"
                :class="house.purpose === 'Rent' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'"
              >
                {{ house.purpose }}
              </span>
            </div>

            <div class="mt-2 flex items-center text-sm text-gray-500">
              <span class="font-medium">KSh {{ formatPrice(house.price) }}</span>
              <span v-if="house.purpose === 'Rent'">/month</span>
            </div>

            <router-link
              :to="`/house/${house._id}`"
              class="mt-4 block w-full px-4 py-2 bg-gray-800 text-white text-center rounded-md hover:bg-gray-700 transition-colors"
            >
              View Details
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue';

const HOUSE_TYPES = [
  'Bed Sitter',
  'Single Room',
  'One Bedroom',
  'Two Bedroom',
  'Three Bedroom',
  'Four Bedroom',
  'Five Bedroom'
];

export default {
  name: 'HomeView',
  
  setup() {
    const houses = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const currentPhotoIndices = ref({});
    const loadedImages = ref({});
    const filterTimeout = ref(null);
    
    const filters = reactive({
      location: '',
      minPrice: '',
      maxPrice: '',
      type: '',
      purpose: ''
    });

    const apiBaseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://rentkenya.onrender.com' 
      : 'http://localhost:5000';

    const hasActiveFilters = computed(() => {
      return Object.values(filters).some(value => value !== '' && value !== null);
    });

    const fetchHouses = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        const queryParams = new URLSearchParams();
        
        if (filters.location) {
          queryParams.append('location', filters.location);
        }
        if (filters.minPrice) {
          queryParams.append('minPrice', filters.minPrice);
        }
        if (filters.maxPrice) {
          queryParams.append('maxPrice', filters.maxPrice);
        }
        if (filters.type) {
          queryParams.append('type', filters.type);
        }
        if (filters.purpose) {
          queryParams.append('purpose', filters.purpose);
        }

        const url = `${apiBaseUrl}/api/houses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        houses.value = Array.isArray(data) ? data : data.houses || [];
        
        // Initialize image states for new houses
        houses.value.forEach(house => {
          if (!currentPhotoIndices.value[house._id]) {
            currentPhotoIndices.value[house._id] = 0;
            loadedImages.value[house._id] = false;
          }
        });

      } catch (err) {
        console.error('Error fetching houses:', err);
        error.value = 'Failed to load houses. Please try again later.';
      } finally {
        loading.value = false;
      }
    };

    const getHouseImageSrc = (houseId) => {
      const house = houses.value.find(h => h._id === houseId);
      if (!house?.photos?.length) return '/placeholder-house.png';
      
      const index = currentPhotoIndices.value[houseId] || 0;
      return `${apiBaseUrl}/api/houses/image/${houseId}/${index}`;
    };

    const handleImageLoad = (houseId) => {
      loadedImages.value[houseId] = true;
    };

    const handleImageError = (event, houseId) => {
      event.target.src = '/placeholder-house.png';
      loadedImages.value[houseId] = true;
    };

    const changePhoto = (houseId, direction) => {
      const house = houses.value.find(h => h._id === houseId);
      if (!house?.photos?.length) return;
      
      const currentIndex = currentPhotoIndices.value[houseId] || 0;
      const totalPhotos = house.photos.length;
      currentPhotoIndices.value[houseId] = (currentIndex + direction + totalPhotos) % totalPhotos;
      loadedImages.value[houseId] = false;
    };

    const setPhotoIndex = (houseId, index) => {
      currentPhotoIndices.value[houseId] = index;
      loadedImages.value[houseId] = false;
    };

    const handleFilterChange = () => {
      if (filterTimeout.value) {
        clearTimeout(filterTimeout.value);
      }
      
      filterTimeout.value = setTimeout(() => {
        fetchHouses();
      }, 300);
    };

    const clearFilter = (filterName) => {
      filters[filterName] = '';
      fetchHouses();
    };

    const resetFilters = () => {
      Object.keys(filters).forEach(key => {
        filters[key] = '';
      });
      fetchHouses();
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat('en-KE').format(price || 0);
    };

    // Watchers
    watch(() => filters.location, (newVal, oldVal) => {
      if (newVal !== oldVal) handleFilterChange();
    });

    watch(() => filters.minPrice, (newVal, oldVal) => {
      if (newVal !== oldVal) {
        if (filters.maxPrice && Number(newVal) > Number(filters.maxPrice)) {
          filters.minPrice = filters.maxPrice;
        }
        handleFilterChange();
      }
    });

    watch(() => filters.maxPrice, (newVal, oldVal) => {
      if (newVal !== oldVal) {
        if (filters.minPrice && Number(newVal) < Number(filters.minPrice)) {
          filters.maxPrice = filters.minPrice;
        }
        handleFilterChange();
      }
    });

    watch(() => filters.type, (newVal, oldVal) => {
      if (newVal !== oldVal) handleFilterChange();
    });

    watch(() => filters.purpose, (newVal, oldVal) => {
      if (newVal !== oldVal) handleFilterChange();
    });

    // Lifecycle hooks
    onMounted(() => {
      fetchHouses();
    });

    onBeforeUnmount(() => {
      if (filterTimeout.value) {
        clearTimeout(filterTimeout.value);
      }
    });

    return {
      houses,
      loading,
      error,
      currentPhotoIndices,
      loadedImages,
      filters,
      houseTypes: HOUSE_TYPES,
      hasActiveFilters,
      fetchHouses,
      getHouseImageSrc,
      handleImageLoad,
      handleImageError,
      changePhoto,
      setPhotoIndex,
      handleFilterChange,
      clearFilter,
      resetFilters,
      formatPrice
    };
  }
};
</script>