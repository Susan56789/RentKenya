<template>
  <nav class="bg-gradient-to-r from-blue-700 to-blue-600 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo Section -->
        <div class="flex-shrink-0">
          <router-link to="/" class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span class="font-bold text-xl text-white tracking-tight">RentKenya</span>
          </router-link>
        </div>

        <!-- Search Section remains the same -->
        <div class="hidden md:block flex-1 max-w-md mx-4">
          <!-- ... search input code ... -->
        </div>

        <!-- Navigation Links -->
        <div class="flex items-center space-x-4">
          <template v-if="isAuthenticated">
            <router-link
              to="/add-house"
              class="text-white hover:bg-blue-800 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
            >
              Post House
            </router-link>
            <div class="relative" @click="toggleDropdown" @keydown.escape="closeDropdown">
              <button 
                class="flex items-center text-white hover:bg-blue-800 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
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
              class="bg-white text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
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

    return {
      isAuthenticated,
      isDropdownOpen,
      toggleDropdown,
      closeDropdown,
      handleLogout
    };
  }
};
</script>