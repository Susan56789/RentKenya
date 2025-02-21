<template>
  <div class="max-w-7xl mx-auto p-4">
    <!-- Filters Section -->
    <div class="bg-white shadow rounded-lg p-4 mb-6">
      <h2 class="text-lg font-semibold mb-4">Filter Houses</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Location Filter -->
        <div>
          <label for="location" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <select 
            id="location" 
            v-model="filters.location" 
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
          >
            <option value="">All Locations</option>
            <option v-for="location in uniqueLocations" :key="location" :value="location">
              {{ location }}
            </option>
          </select>
        </div>
        
        <!-- Price Range Filter -->
        <div>
          <label for="priceRange" class="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
          <select 
            id="priceRange" 
            v-model="filters.priceRange" 
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
          >
            <option value="">Any Price</option>
            <option value="0-10000">Below 10,000</option>
            <option value="10000-20000">10,000 - 20,000</option>
            <option value="20000-50000">20,000 - 50,000</option>
            <option value="50000-100000">50,000 - 100,000</option>
            <option value="100000-999999999">Above 100,000</option>
          </select>
        </div>
        
        <!-- House Type Filter -->
        <div>
          <label for="houseType" class="block text-sm font-medium text-gray-700 mb-1">House Type</label>
          <select 
            id="houseType" 
            v-model="filters.type" 
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
          >
            <option value="">All Types</option>
            <option value="Bed Sitter">Bed Sitter</option>
            <option value="Single Room">Single Room</option>
            <option value="One Bedroom">One Bedroom</option>
            <option value="Two Bedroom">Two Bedroom</option>
          </select>
        </div>
        
        <!-- Filter Button -->
        <div class="flex items-end">
          <button 
            @click="applyFilters" 
            class="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
    
    <!-- Results Count and Sort -->
    <div class="flex flex-col sm:flex-row justify-between items-center mb-4">
      <p class="text-gray-600 mb-2 sm:mb-0">
        Showing {{ paginatedHouses.length }} of {{ filteredHouses.length }} houses
      </p>
      <div class="flex items-center">
        <label for="sortBy" class="text-sm text-gray-700 mr-2">Sort by:</label>
        <select 
          id="sortBy" 
          v-model="sortBy" 
          class="rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
        >
          <option value="newest">Newest First</option>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
        </select>
      </div>
    </div>
    
    <!-- Houses Grid -->
    <div v-if="paginatedHouses.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div 
        v-for="house in paginatedHouses" 
        :key="house._id" 
        class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
      >
        <div class="relative pb-2/3">
          <img 
            :src="house.photos && house.photos.length > 0 ? house.photos[0] : '/placeholder-house.jpg'" 
            :alt="house.location"
            class="absolute h-full w-full object-cover"
          />
        </div>
        <div class="p-4">
          <div class="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p class="text-gray-700 text-sm truncate">{{ house.location }}</p>
          </div>
          <h2 class="font-semibold text-lg mb-1 text-gray-800">{{ house.type }}</h2>
          <p class="text-gray-600 font-bold mb-2">KES {{ formatPrice(house.price) }}</p>
          <div class="flex items-center text-gray-600 text-sm mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{{ formatDate(house.datePosted) }}</span>
          </div>
          <router-link 
            :to="`/house/${house._id}`" 
            class="block text-center bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
          >
            View Details
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-1">No houses found</h3>
      <p class="text-gray-500">Try adjusting your filters or check back later for new listings.</p>
      <button 
        @click="resetFilters" 
        class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
      >
        Reset Filters
      </button>
    </div>
    
    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center mt-8">
      <nav class="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <button
          @click="currentPage > 1 && (currentPage--)"
          :disabled="currentPage === 1"
          class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          <span class="sr-only">Previous</span>
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
        
        <button 
          v-for="page in displayedPages" 
          :key="page" 
          @click="goToPage(page)"
          :class="[
            'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
            currentPage === page 
              ? 'z-10 bg-gray-50 border-gray-500 text-gray-600' 
              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
          ]"
        >
          {{ page }}
        </button>
        
        <button
          @click="currentPage < totalPages && (currentPage++)"
          :disabled="currentPage === totalPages"
          class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          <span class="sr-only">Next</span>
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </nav>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
        <p class="text-center mt-4 text-gray-700">Loading houses...</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '../axios';

export default {
  data() {
    return {
      allHouses: [],
      filters: {
        location: '',
        priceRange: '',
        type: ''
      },
      sortBy: 'newest',
      currentPage: 1,
      itemsPerPage: 20,
      loading: true
    };
  },
  
  computed: {
    // Get unique locations for the filter dropdown
    uniqueLocations() {
      const locations = this.allHouses.map(house => house.location);
      return [...new Set(locations)].sort();
    },
    
    // Apply filters to houses
    filteredHouses() {
      let result = [...this.allHouses];
      
      // Filter by location
      if (this.filters.location) {
        result = result.filter(house => house.location === this.filters.location);
      }
      
      // Filter by house type
      if (this.filters.type) {
        result = result.filter(house => house.type === this.filters.type);
      }
      
      // Filter by price range
      if (this.filters.priceRange) {
        const [min, max] = this.filters.priceRange.split('-').map(Number);
        result = result.filter(house => {
          const price = parseFloat(house.price);
          return price >= min && price <= max;
        });
      }
      
      // Sort results
      result = this.sortHouses(result);
      
      return result;
    },
    
    // Get paginated subset of houses
    paginatedHouses() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.filteredHouses.slice(startIndex, endIndex);
    },
    
    // Calculate total pages
    totalPages() {
      return Math.ceil(this.filteredHouses.length / this.itemsPerPage);
    },
    
    // Calculate which page numbers to display
    displayedPages() {
      const pages = [];
      const totalPagesToShow = 5;
      
      if (this.totalPages <= totalPagesToShow) {
        // If we have fewer pages than we want to show, display all pages
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Always include first page, last page, and pages around current page
        let startPage = Math.max(1, this.currentPage - 1);
        let endPage = Math.min(this.totalPages, startPage + totalPagesToShow - 1);
        
        // Adjust if we're near the end
        if (endPage === this.totalPages) {
          startPage = Math.max(1, endPage - totalPagesToShow + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
      }
      
      return pages;
    }
  },
  
  methods: {
    // Fetch houses from API
    async fetchHouses() {
      this.loading = true;
      try {
        const response = await axios.get('/houses');
        this.allHouses = response.data;
      } catch (error) {
        console.error('Error fetching houses:', error);
      } finally {
        this.loading = false;
      }
    },
    
    // Sort houses based on selected option
    sortHouses(houses) {
      const sorted = [...houses];
      
      switch(this.sortBy) {
        case 'newest':
          return sorted.sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted));
        case 'priceAsc':
          return sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        case 'priceDesc':
          return sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        default:
          return sorted;
      }
    },
    
    // Apply filters and reset to first page
    applyFilters() {
      this.currentPage = 1;
    },
    
    // Reset all filters
    resetFilters() {
      this.filters = {
        location: '',
        priceRange: '',
        type: ''
      };
      this.sortBy = 'newest';
      this.currentPage = 1;
    },
    
    // Go to specific page
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        // Scroll to top of results
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    
    // Format price with commas
    formatPrice(price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    
    // Format date to readable format
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    }
  },
  
  created() {
    this.fetchHouses();
  },
  
  watch: {
    // Reset to first page when sort method changes
    sortBy() {
      this.currentPage = 1;
    }
  }
};
</script>

<style scoped>
.pb-2\/3 {
  padding-bottom: 66.666667%;
}
</style>