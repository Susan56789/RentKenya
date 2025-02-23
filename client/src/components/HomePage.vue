<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center min-h-[60vh]">
      <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      <p class="mt-4 text-gray-600 text-lg">Loading houses...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-2xl mx-auto mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-red-600 text-center">{{ error }}</p>
      <button 
        @click="fetchHouses" 
        class="mt-4 mx-auto block px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Filters -->
      <div class="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <h2 class="text-lg font-semibold mb-4">Filters</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div class="relative">
            <input 
              v-model="filters.location"
              @input="handleFilterChange" 
              placeholder="Search location..." 
              class="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              class="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              class="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            class="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option v-for="type in houseTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
          
          <select 
            v-model="filters.purpose"
            @change="handleFilterChange"
            class="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Purposes</option>
            <option value="Rent">Rent</option>
            <option value="Sale">Sale</option>
          </select>
        </div>
        
        <div class="mt-4 flex justify-between items-center">
          <p class="text-sm text-gray-600">
            Found {{ totalHouses }} {{ totalHouses === 1 ? 'house' : 'houses' }}
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

      <!-- House Listings -->
      <div v-if="paginatedHouses.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="house in paginatedHouses" 
          :key="house._id" 
          class="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]"
        >
          <!-- Image Carousel -->
          <div class="relative w-full h-56">
            <div class="absolute inset-0">
              <div 
                class="flex transition-transform duration-500 h-full"
                :style="{ transform: `translateX(-${carouselIndices[house._id] * 100}%)` }"
              >
                <img 
                  v-for="(photo, index) in house.photos" 
                  :key="index" 
                  :src="getPhotoUrl(photo)"
                  :alt="`${house.type} in ${house.location} - Image ${index + 1}`"
                  @error="handleImageError($event, house._id, index)"
                  class="w-full h-full object-cover flex-shrink-0"
                />
              </div>
            </div>
            
            <!-- Navigation Arrows -->
            <template v-if="house.photos.length > 1">
              <button 
                @click="prevImage(house._id)"
                class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
              >
                ←
              </button>
              <button 
                @click="nextImage(house._id)"
                class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
              >
                →
              </button>
            </template>

            <!-- Image Navigation Dots -->
            <div 
              v-if="house.photos.length > 1" 
              class="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2"
            >
              <button 
                v-for="(_, index) in house.photos" 
                :key="index"
                @click="setImage(house._id, index)"
                class="w-2 h-2 rounded-full transition-colors"
                :class="carouselIndices[house._id] === index ? 'bg-white' : 'bg-white/50'"
              />
            </div>
          </div>

          <!-- House Details -->
          <div class="p-4">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-lg font-semibold text-gray-900">{{ house.type }}</h3>
              <span 
                class="px-2 py-1 text-sm rounded-full"
                :class="house.purpose === 'Rent' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'"
              >
                {{ house.purpose }}
              </span>
            </div>
            
            <p class="text-gray-600 mb-2">
              <span class="mr-1">📍</span>{{ house.location }}
            </p>
            
            <p class="text-xl font-bold text-gray-900 mb-2">
              KES {{ formatPrice(house.price) }}
              <span v-if="house.purpose === 'Rent'" class="text-sm font-normal text-gray-600">/month</span>
            </p>
            
            <div class="flex justify-between items-center mt-4">
              <span 
                class="text-sm px-2 py-1 rounded-full"
                :class="house.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
              >
                {{ house.status }}
              </span>
              <button 
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                @click="viewDetails(house._id)"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div 
        v-else 
        class="text-center py-12 bg-white rounded-lg shadow-sm"
      >
        <p class="text-gray-600 text-lg">
          {{ loading ? 'Loading houses...' : 'No houses found matching your criteria' }}
        </p>
        <button 
          v-if="hasActiveFilters && !loading"
          @click="resetFilters"
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      <!-- Pagination -->
      <div 
        v-if="totalPages > 1" 
        class="mt-8 flex justify-center items-center space-x-4"
      >
        <button 
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
        >
          Previous
        </button>
        
        <div class="flex items-center space-x-2">
          <button
            v-for="page in displayedPages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-1 rounded-md',
              currentPage === page 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            ]"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  
  data() {
    return {
      houses: [],
      loading: true,
      error: null,
      currentPage: 1,
      perPage: 12,
      carouselIndices: {},
      carouselIntervals: {},
      filters: {
        location: '',
        minPrice: '',
        maxPrice: '',
        type: '',
        purpose: ''
      },
      houseTypes: [
        'Bed Sitter',
        'Single Room',
        'One Bedroom',
        'Two Bedroom',
        'Three Bedroom',
        'Four Bedroom',
        'Five Bedroom'
      ],
      apiBaseUrl: 'https://rentkenya.onrender.com' || 'http://localhost:5000'
    };
  },

  computed: {
    paginatedHouses() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.houses.slice(start, start + this.perPage);
    },

    totalPages() {
      return Math.ceil(this.houses.length / this.perPage);
    },

    totalHouses() {
      return this.houses.length;
    },

    hasActiveFilters() {
      return Object.values(this.filters).some(value => value !== '' && value !== null);
    },

    displayedPages() {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];
      let l;

      for (let i = 1; i <= this.totalPages; i++) {
        if (
          i === 1 || 
          i === this.totalPages || 
          (i >= this.currentPage - delta && i <= this.currentPage + delta)
        ) {
          range.push(i);
        }
      }

      range.forEach(i => {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1);
          } else if (i - l !== 1) {
            rangeWithDots.push('...');
          }
        }
        rangeWithDots.push(i);
        l = i;
      });

      return rangeWithDots;
    }
  },

  methods: {
    async fetchHouses() {
      this.loading = true;
      this.error = null;
      
      try {
        const queryParams = new URLSearchParams();
        
        if (this.filters.location) {
          queryParams.append('location', this.filters.location);
        }
        if (this.filters.minPrice) {
          queryParams.append('minPrice', this.filters.minPrice);
        }
        if (this.filters.maxPrice) {
          queryParams.append('maxPrice', this.filters.maxPrice);
        }
        if (this.filters.type) {
          queryParams.append('type', this.filters.type);
        }
        if (this.filters.purpose) {
          queryParams.append('purpose', this.filters.purpose);
        }

        const url = `${this.apiBaseUrl}/api/houses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        this.houses = Array.isArray(data) ? data : [];
        
        // Initialize carousel for new houses
        this.houses.forEach(house => {
          if (!this.carouselIndices[house._id]) {
            this.carouselIndices[house._id] = 0;
            this.startCarouselInterval(house._id);
          }
        });

        // Cleanup carousel indices
        Object.keys(this.carouselIndices).forEach(houseId => {
          if (!this.houses.find(h => h._id === houseId)) {
            delete this.carouselIndices[houseId];
            this.stopCarouselInterval(houseId);
          }
        });
      } catch (err) {
        this.error = 'Failed to load houses. Please try again later.';
        console.error('Error fetching houses:', err);
      } finally {
        this.loading = false;
      }
    },

    startCarouselInterval(houseId) {
      if (this.carouselIntervals[houseId]) {
        clearInterval(this.carouselIntervals[houseId]);
      }
      
      const house = this.houses.find(h => h._id === houseId);
      if (house?.photos?.length > 1) {
        this.carouselIntervals[houseId] = setInterval(() => {
          this.nextImage(houseId);
        }, 5000);
      }
    },

    stopCarouselInterval(houseId) {
      if (this.carouselIntervals[houseId]) {
        clearInterval(this.carouselIntervals[houseId]);
        delete this.carouselIntervals[houseId];
      }
    },

    nextImage(houseId) {
      const house = this.houses.find(h => h._id === houseId);
      if (!house?.photos?.length) return;
      
      this.carouselIndices[houseId] = 
        (this.carouselIndices[houseId] + 1) % house.photos.length;
    },

    prevImage(houseId) {
      const house = this.houses.find(h => h._id === houseId);
      if (!house?.photos?.length) return;
      
      this.carouselIndices[houseId] = 
        (this.carouselIndices[houseId] - 1 + house.photos.length) % house.photos.length;
    },

    setImage(houseId, index) {
      this.carouselIndices[houseId] = index;
      this.startCarouselInterval(houseId);
    },

    getPhotoUrl(photo) {
      try {
        if (!photo) return '/placeholder-house.png';
        
        if (typeof photo === 'string') {
          return photo.startsWith('http') ? photo : `${this.apiBaseUrl}${photo}`;
        }
        
        if (photo.path) {
          return photo.path.startsWith('http') ? photo.path : `${this.apiBaseUrl}${photo.path}`;
        }
        
        return '/placeholder-house.png';
      } catch (error) {
        console.error('Error processing photo URL:', error);
        return '/placeholder-house.png';
      }
    },

    handleImageError(event, houseId, photoIndex) {
      event.target.src = '/placeholder-house.png';
      console.warn(`Failed to load image for house ${houseId}, photo index ${photoIndex}`);
    },

    handleFilterChange() {
      this.currentPage = 1;
      
      if (this.filters.minPrice && this.filters.maxPrice) {
        if (Number(this.filters.minPrice) > Number(this.filters.maxPrice)) {
          const temp = this.filters.minPrice;
          this.filters.minPrice = this.filters.maxPrice;
          this.filters.maxPrice = temp;
        }
      }
      
      this.debouncedFetchHouses();
    },

    clearFilter(filterName) {
      this.filters[filterName] = '';
      this.fetchHouses();
    },

    resetFilters() {
      this.filters = {
        location: '',
        minPrice: '',
        maxPrice: '',
        type: '',
        purpose: ''
      };
      this.currentPage = 1;
      this.fetchHouses();
    },

    goToPage(page) {
      if (typeof page === 'number' && page !== this.currentPage) {
        this.currentPage = page;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.goToPage(this.currentPage + 1);
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.goToPage(this.currentPage - 1);
      }
    },

    formatPrice(price) {
      return new Intl.NumberFormat('en-KE').format(price);
    },

    viewDetails(houseId) {
      this.$router.push(`/house/${houseId}`);
    },

    debounce(fn, delay) {
      let timeoutId;
      return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
      };
    }
  },

  created() {
    this.debouncedFetchHouses = this.debounce(() => {
      this.fetchHouses();
    }, 300);
  },

  mounted() {
    this.fetchHouses();
  },

  beforeUnmount() {
    Object.keys(this.carouselIntervals).forEach(houseId => {
      this.stopCarouselInterval(houseId);
    });
  },

  watch: {
    'filters.location'(newVal, oldVal) {
      if (newVal !== oldVal) this.handleFilterChange();
    },
    'filters.minPrice'(newVal, oldVal) {
      if (newVal !== oldVal) this.handleFilterChange();
    },
    'filters.maxPrice'(newVal, oldVal) {
      if (newVal !== oldVal) this.handleFilterChange();
    },
    'filters.type'(newVal, oldVal) {
      if (newVal !== oldVal) this.handleFilterChange();
    },
    'filters.purpose'(newVal, oldVal) {
      if (newVal !== oldVal) this.handleFilterChange();
    }
  }
};
</script>