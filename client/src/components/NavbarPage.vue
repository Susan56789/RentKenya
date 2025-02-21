<template>
  <nav class="bg-gradient-to-r from-gray-700 to-gray-600 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo Section -->
        <div class="flex-shrink-0">
          <router-link to="/" class="flex items-center">
            <img 
              src="@/assets/Logo.png"
              alt="RentKenya Logo"
              class="h-8 w-auto mr-2"
            />
            <span class="font-bold text-xl text-white tracking-tight">RentKenya</span>
          </router-link>
        </div>

        <!-- Search Section -->
        <div class="hidden md:block flex-1 max-w-md mx-4">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search for houses..."
              class="block w-full bg-gray-600 border border-gray-500 rounded-lg py-2 pl-10 pr-3 text-white placeholder-gray-100 focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
              @keyup.enter="handleSearch"
            />
          </div>
        </div>

        <!-- Navigation Links -->
        <div class="flex items-center space-x-4">
          <template v-if="isAuthenticated">
            <router-link
              to="/add-house"
              class="text-white hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
            >
              Post House
            </router-link>
            <div class="relative" @click="toggleDropdown" @keydown.escape="closeDropdown">
              <button 
                class="flex items-center text-white hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
              >
                <span class="mr-2">Profile</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div v-if="isDropdownOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  View Profile
                </router-link>
                <router-link
                  to="/my-listings"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  My Listings
                </router-link>
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          </template>
          
          <template v-else>
            <router-link
              to="/login"
              class="bg-white text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
            >
              Login
            </router-link>
          </template>
        </div>
      </div>
    </div>

    <!-- Mobile Search remains the same -->
    <div class="md:hidden px-4 pb-3">
      <!-- ... mobile search code ... -->
    </div>
  </nav>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

export default {
  name: 'NavbarPage',
  
  setup() {
    const router = useRouter();
    const { isAuthenticated, setToken } = useAuth();
    const isDropdownOpen = ref(false);
    const searchQuery = ref('');

    const toggleDropdown = () => {
      isDropdownOpen.value = !isDropdownOpen.value;
    };

    const closeDropdown = () => {
      isDropdownOpen.value = false;
    };

    const handleLogout = () => {
      setToken(null);
      closeDropdown();
      router.push('/');
    };

    const handleClickOutside = (e) => {
      if (!e.target.closest('.relative')) {
        closeDropdown();
      }
    };

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    const handleSearch = () => {
      if (searchQuery.value.trim()) {
        router.push({
          name: 'search',
          query: { q: searchQuery.value.trim() }
        });
      }
    };

    return {
      isAuthenticated,
      isDropdownOpen,
      searchQuery,
      toggleDropdown,
      closeDropdown,
      handleLogout,
      handleSearch
    };
  }
};
</script>