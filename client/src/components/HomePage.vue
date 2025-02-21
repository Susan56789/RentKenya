<template>
  <div class="p-6">
    <!-- Filters -->
    <div class="flex flex-wrap gap-4 mb-6">
      <input v-model="filters.location" placeholder="Filter by location" class="input" />
      <input v-model="filters.minPrice" type="number" placeholder="Min Price" class="input" />
      <input v-model="filters.maxPrice" type="number" placeholder="Max Price" class="input" />
      <select v-model="filters.type" class="input">
        <option value="">All Types</option>
        <option value="One Bedroom">One Bedroom</option>
        <option value="Two Bedroom">Two Bedroom</option>
        <option value="Three Bedroom">Three Bedroom</option>
        <option value="Four Bedroom">Four Bedroom</option>
        <option value="Five Bedroom">Five Bedroom</option>
      </select>
      <select v-model="filters.purpose" class="input">
        <option value="">All Purposes</option>
        <option value="Rent">Rent</option>
        <option value="Sale">Sale</option>
      </select>
      <button @click="resetFilters" class="btn">Reset</button>
    </div>

    <!-- House Listings -->
    <div v-if="paginatedHouses.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="house in paginatedHouses" :key="house._id" class="bg-white shadow-md rounded-lg overflow-hidden">
        <!-- Image Carousel -->
        <div class="relative w-full h-48">
          <div class="absolute w-full h-full overflow-hidden">
            <div class="flex transition-transform duration-500 ease-in-out"
                 :style="{ transform: `translateX(-${currentIndex[house._id] * 100}%)` }">
              <img v-for="(photo, index) in house.photos" :key="index" :src="photo" alt="House Image"
                   class="w-full h-48 object-cover flex-shrink-0">
            </div>
          </div>
          <!-- Auto Scroll -->
          <div v-if="house.photos.length > 1" class="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <div v-for="(photo, index) in house.photos" :key="index"
                 :class="currentIndex[house._id] === index ? 'bg-gray-800' : 'bg-gray-400'"
                 class="w-3 h-3 rounded-full"></div>
          </div>
        </div>

        <!-- House Details -->
        <div class="p-4">
          <h3 class="text-lg font-semibold">{{ house.type }} - {{ house.location }}</h3>
          <p class="text-gray-600">Price: KES {{ house.price }}</p>
          <p class="text-gray-500">Purpose: {{ house.purpose }}</p>
          <p class="text-green-600 font-semibold">{{ house.status }}</p>
        </div>
      </div>
    </div>
    <p v-else class="text-center text-gray-500">No houses available.</p>

    <!-- Pagination -->
    <div class="flex justify-center mt-6 space-x-3">
      <button @click="prevPage" :disabled="currentPage === 1" class="btn">Prev</button>
      <span class="px-4 py-2 bg-gray-200 rounded">{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="btn">Next</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      houses: [], // Initialize with an empty array
      filters: { location: "", minPrice: "", maxPrice: "", type: "", purpose: "" },
      currentPage: 1,
      perPage: 20,
      currentIndex: {} // Track auto-scroll index for each house
    };
  },
  computed: {
    filteredHouses() {
      return this.houses.filter(house => {
        const matchesLocation = this.filters.location
          ? house.location.toLowerCase().includes(this.filters.location.toLowerCase())
          : true;
        const matchesPrice =
          (this.filters.minPrice ? house.price >= this.filters.minPrice : true) &&
          (this.filters.maxPrice ? house.price <= this.filters.maxPrice : true);
        const matchesType = this.filters.type ? house.type === this.filters.type : true;
        const matchesPurpose = this.filters.purpose ? house.purpose === this.filters.purpose : true;

        return matchesLocation && matchesPrice && matchesType && matchesPurpose;
      });
    },
    paginatedHouses() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredHouses.slice(start, start + this.perPage);
    },
    totalPages() {
      return Math.ceil(this.filteredHouses.length / this.perPage);
    }
  },
  async mounted() {
    try {
      const response = await fetch("https://rentkenya.onrender.com/api/houses");
      const data = await response.json();
      this.houses = Array.isArray(data) ? data : [];
      
      // Initialize auto-scroll index for each house
      this.houses.forEach(house => {
        this.currentIndex[house._id] = 0;
        if (house.photos.length > 1) {
          setInterval(() => this.nextImage(house._id, house.photos.length), 3000);
        }
      });
    } catch (error) {
      console.error("Error fetching houses:", error);
    }
  },
  methods: {
    resetFilters() {
      this.filters = { location: "", minPrice: "", maxPrice: "", type: "", purpose: "" };
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextImage(houseId, photoCount) {
      this.currentIndex[houseId] = (this.currentIndex[houseId] + 1) % photoCount;
    }
  }
};
</script>

<style scoped>
.input {
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #ddd;
  outline: none;
}

.btn {
  padding: 8px 12px;
  border-radius: 5px;
  background-color: #3490dc;
  color: white;
  cursor: pointer;
  transition: background 0.3s;
}

.btn:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}
</style>
