<template>
  <div class="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg dark:bg-gray-800">
    <h2 class="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Add New House</h2>
    
    <form @submit.prevent="addHouse" class="space-y-4" enctype="multipart/form-data">
      <!-- Location Input -->
      <div class="space-y-1">
        <label for="location" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
        <input 
          id="location"
          v-model="house.location" 
          placeholder="Enter house location" 
          required 
          class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      
      <!-- Price Input -->
      <div class="space-y-1">
        <label for="price" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Price (KSh)</label>
        <input 
          id="price"
          v-model.number="house.price" 
          type="number" 
          placeholder="Enter house price" 
          required 
          class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      
      <!-- Date Posted -->
      <div class="space-y-1">
        <label for="datePosted" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Date Available</label>
        <input 
          id="datePosted"
          v-model="house.datePosted" 
          type="date" 
          required 
          class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      
      <!-- House Type Select -->
      <div class="space-y-1">
        <label for="type" class="block text-sm font-medium text-gray-700 dark:text-gray-300">House Type</label>
        <select 
          id="type"
          v-model="house.type" 
          required 
          class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="" disabled>Select House Type</option>
          <option value="Bed Sitter">Bed Sitter</option>
          <option value="Single Room">Single Room</option>
          <option value="One Bedroom">One Bedroom</option>
          <option value="Two Bedroom">Two Bedroom</option>
        </select>
      </div>
      
      <!-- Purpose Select -->
      <div class="space-y-1">
        <label for="purpose" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Purpose</label>
        <select 
          id="purpose"
          v-model="house.purpose" 
          required 
          class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="" disabled>Select Purpose</option>
          <option value="Rent">Rent</option>
          <option value="Sale">Sale</option>
        </select>
      </div>
      
      <!-- File Upload -->
      <div class="space-y-2">
        <label for="photos" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Upload Photos (minimum 2, maximum 5)
        </label>
        <input 
          id="photos"
          type="file" 
          @change="handleFileUpload" 
          multiple 
          accept="image/*" 
          required 
          class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        
        <div v-if="photoError" class="text-sm text-red-600 dark:text-red-400">{{ photoError }}</div>
        
        <div v-if="photos.length > 0" class="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {{ photos.length }} photo(s) selected
        </div>
        
        <!-- Photo Previews -->
        <div v-if="photoPreviewUrls.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          <div v-for="(url, index) in photoPreviewUrls" :key="index" class="relative group">
            <img 
              :src="url" 
              alt="Preview" 
              class="h-24 w-full object-cover rounded-md border border-gray-300"
            />
            <button 
              type="button"
              @click="removePhoto(index)" 
              class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove photo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Submit Button -->
      <button 
        type="submit" 
        class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50"
        :disabled="isSubmitting || photos.length < 2"
      >
        <span v-if="isSubmitting">Adding...</span>
        <span v-else>Add House</span>
      </button>
    </form>
    
    <!-- Status Messages -->
    <div v-if="message" class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
      {{ message }}
    </div>
    
    <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ error }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      house: {
        location: '',
        price: '',
        datePosted: '',
        type: '',
        purpose: ''
      },
      photos: [],
      photoPreviewUrls: [],
      photoError: '',
      message: '',
      error: '',
      isSubmitting: false
    };
  },
  methods: {
    handleFileUpload(event) {
      const selectedFiles = Array.from(event.target.files);
      
      // Check if adding these would exceed the maximum
      if (selectedFiles.length > 5) {
        this.photoError = 'Maximum 5 photos allowed.';
        event.target.value = ''; // Reset input
        return;
      }
      
      this.photos = selectedFiles;
      this.createPhotoPreviewUrls();
      
      if (this.photos.length < 2) {
        this.photoError = 'Please upload at least 2 photos.';
      } else if (this.photos.length > 5) {
        this.photoError = 'Maximum 5 photos allowed.';
        this.photos = this.photos.slice(0, 5);
        this.createPhotoPreviewUrls();
      } else {
        this.photoError = '';
      }
    },
    
    createPhotoPreviewUrls() {
      // Revoke any existing object URLs to avoid memory leaks
      this.photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
      
      // Create new preview URLs
      this.photoPreviewUrls = this.photos.map(photo => URL.createObjectURL(photo));
    },
    
    removePhoto(index) {
      // Remove the photo and its preview
      URL.revokeObjectURL(this.photoPreviewUrls[index]);
      this.photoPreviewUrls.splice(index, 1);
      this.photos.splice(index, 1);
      
      // Update error message if needed
      if (this.photos.length < 2) {
        this.photoError = 'Please upload at least 2 photos.';
      } else {
        this.photoError = '';
      }
      
      // Reset file input if all photos are removed
      if (this.photos.length === 0) {
        const fileInput = document.getElementById('photos');
        if (fileInput) {
          fileInput.value = '';
        }
      }
    },
    
    async addHouse() {
      if (this.photos.length < 2) {
        this.photoError = 'Please upload at least 2 photos.';
        return;
      }
      
      if (this.photos.length > 5) {
        this.photoError = 'Maximum 5 photos allowed.';
        return;
      }
      
      this.isSubmitting = true;
      const formData = new FormData();
      formData.append('location', this.house.location);
      formData.append('price', this.house.price);
      formData.append('datePosted', this.house.datePosted);
      formData.append('type', this.house.type);
      formData.append('purpose', this.house.purpose);
      
      this.photos.forEach((photo) => {
        formData.append('photos', photo);
      });
      
      try {
        await axios.post('https://rentkenya.onrender.com/api/houses', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        this.message = 'House added successfully!';
        this.error = '';
        this.house = { location: '', price: '', datePosted: '', type: '', purpose: '' };
        this.photos = [];
        this.photoPreviewUrls = [];
        
        // Reset file input
        const fileInput = document.getElementById('photos');
        if (fileInput) {
          fileInput.value = '';
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to add house';
        this.message = '';
      } finally {
        this.isSubmitting = false;
      }
    },
    
    // Clean up object URLs when component is destroyed
    beforeUnmount() {
      this.photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    }
  }
};
</script>