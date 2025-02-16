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
        
        <!-- Search Section - Hidden on mobile, visible on medium screens and up -->
        <div class="hidden md:block flex-1 max-w-md mx-4">
          <div class="relative">
            <input 
              type="search" 
              placeholder="Search for houses..." 
              class="w-full bg-white rounded-full px-4 py-2 pl-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            />
            <div class="absolute left-3 top-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <!-- Navigation Links -->
        <div class="flex items-center space-x-4">
          <router-link 
            to="/add-house" 
            class="text-white hover:bg-blue-800 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
          >
            Post House
          </router-link>
          <router-link 
            to="/login" 
            class="bg-white text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
          >
            Login
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- Mobile Search - Only visible on small screens -->
    <div class="md:hidden px-4 pb-3">
      <div class="relative">
        <input 
          type="search" 
          placeholder="Search for houses..." 
          class="w-full bg-white rounded-full px-4 py-2 pl-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
        />
        <div class="absolute left-3 top-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>
  </nav>
</template>