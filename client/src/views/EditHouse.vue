<template>
    <div class="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Edit House</h2>
        <router-link 
          to="/my-listings"
          class="text-gray-600 hover:text-gray-800"
        >
          Back to Listings
        </router-link>
      </div>
  
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
  
      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <p class="text-red-600">{{ error }}</p>
        <button 
          @click="fetchHouseDetails"
          class="mt-2 text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Try Again
        </button>
      </div>
  
      <!-- Edit Form -->
      <form v-else @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Location Input -->
        <div class="space-y-1">
          <label for="location" class="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input 
            id="location"
            v-model="formData.location"
            type="text"
            required
            placeholder="Enter house location"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          />
        </div>
  
        <!-- Price Input -->
        <div class="space-y-1">
          <label for="price" class="block text-sm font-medium text-gray-700">
            Price (KSh)
          </label>
          <input 
            id="price"
            v-model.number="formData.price"
            type="number"
            required
            placeholder="Enter price"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          />
        </div>
  
        <!-- Date Available -->
        <div class="space-y-1">
          <label for="datePosted" class="block text-sm font-medium text-gray-700">
            Available From
          </label>
          <input 
            id="datePosted"
            v-model="formData.datePosted"
            type="date"
            required
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          />
        </div>
  
        <!-- House Type Select -->
        <div class="space-y-1">
          <label for="type" class="block text-sm font-medium text-gray-700">
            House Type
          </label>
          <select 
            id="type"
            v-model="formData.type"
            required
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          >
            <option value="" disabled>Select Type</option>
            <option v-for="type in houseTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>
  
        <!-- Purpose Select -->
        <div class="space-y-1">
          <label for="purpose" class="block text-sm font-medium text-gray-700">
            Purpose
          </label>
          <select 
            id="purpose"
            v-model="formData.purpose"
            required
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          >
            <option value="" disabled>Select Purpose</option>
            <option v-for="purpose in purposes" :key="purpose" :value="purpose">
              {{ purpose }}
            </option>
          </select>
        </div>
  
        <!-- Existing Photos -->
        <div v-if="formData.photos.length" class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Current Photos
          </label>
          <div class="grid grid-cols-3 gap-2">
            <div 
              v-for="(photo, index) in formData.photos" 
              :key="index"
              class="relative group"
            >
              <img 
                :src="getPhotoUrl(photo)"
                :alt="'House photo ' + (index + 1)"
                class="w-full h-24 object-cover rounded-md"
              />
              <button 
                type="button"
                @click="removeExistingPhoto(index)"
                class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
  
        <!-- New Photos Upload -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Add New Photos
            <span class="text-gray-500">
              ({{ formData.photos.length < 2 ? '2-5 photos required' : 'Optional' }})
            </span>
          </label>
          <input 
            type="file"
            ref="fileInput"
            @change="handleFileUpload"
            multiple
            accept=".jpg,.jpeg,.png"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          />
          
          <p v-if="photoError" class="text-sm text-red-500 mt-1">{{ photoError }}</p>
  
          <!-- New Photo Previews -->
          <div v-if="newPhotoPreviewUrls.length" class="grid grid-cols-3 gap-2">
            <div 
              v-for="(url, index) in newPhotoPreviewUrls" 
              :key="index"
              class="relative group"
            >
              <img 
                :src="url"
                :alt="'New photo ' + (index + 1)"
                class="w-full h-24 object-cover rounded-md"
              />
              <button 
                type="button"
                @click="removeNewPhoto(index)"
                class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
  
        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isSubmitting || !isFormValid"
          class="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <template v-if="isSubmitting">
            <span class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating House...
            </span>
          </template>
          <span v-else>Update House</span>
        </button>
  
        <!-- Status Messages -->
        <div v-if="successMessage" class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
          {{ successMessage }}
        </div>
  
        <div v-if="submitError" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {{ submitError }}
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import axios from 'axios';

// Constants
const HOUSE_TYPES = [
  'Bed Sitter',
  'Single Room',
  'One Bedroom',
  'Two Bedroom',
  'Three Bedroom',
  'Four Bedroom',
  'Five Bedroom'
];

const PURPOSES = ['Rent', 'Sale'];

const VALIDATION = {
  PHOTO_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  VALID_PHOTO_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
  MIN_PHOTOS: 2,
  MAX_PHOTOS: 5
};

export default {
  name: 'EditHouse',

  setup() {
    const route = useRoute();
    const router = useRouter();
    const auth = useAuth();
    const fileInput = ref(null);

    // State
    const isLoading = ref(true);
    const error = ref(null);
    const isSubmitting = ref(false);
    const successMessage = ref('');
    const submitError = ref('');
    const photoError = ref('');
    const formData = ref({
      location: '',
      price: '',
      datePosted: '',
      type: '',
      purpose: '',
      photos: []
    });
    const newPhotos = ref([]);
    const newPhotoPreviewUrls = ref([]);
    const removedPhotoIndices = ref([]);

    const apiBaseUrl = process.env.NODE_ENV === 'production'
      ? 'https://rentkenya.onrender.com'
      : 'http://localhost:5000';

    // Computed
    const isFormValid = computed(() => {
      const hasRequiredFields = 
        formData.value.location.trim() &&
        formData.value.price > 0 &&
        formData.value.datePosted &&
        formData.value.type &&
        formData.value.purpose;

      const hasMinPhotos = 
        (formData.value.photos.length + newPhotos.value.length - removedPhotoIndices.value.length) >= VALIDATION.MIN_PHOTOS;

      const withinMaxPhotos = 
        (formData.value.photos.length + newPhotos.value.length - removedPhotoIndices.value.length) <= VALIDATION.MAX_PHOTOS;

      return hasRequiredFields && hasMinPhotos && withinMaxPhotos && !photoError.value;
    });

    // Methods
    const checkAuth = () => {
      const token = auth.getToken();
      if (!token) {
        router.push('/login');
        return false;
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true;
    };

    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      
      try {
        let date;
        if (typeof dateString === 'string') {
          if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateString;
          }
          date = new Date(dateString);
        } else if (dateString instanceof Date) {
          date = dateString;
        } else {
          return '';
        }

        if (isNaN(date.getTime())) {
          return '';
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch (error) {
        console.error('Error formatting date:', error);
        return '';
      }
    };

    const getPhotoUrl = (photo) => {
      try {
        if (!photo) return '/placeholder-house.png';
        
        if (photo.path) {
          return `${apiBaseUrl}${photo.path}`;
        }
        
        if (typeof photo === 'string') {
          return photo.startsWith('http') ? photo : `${apiBaseUrl}${photo}`;
        }
        
        return '/placeholder-house.png';
      } catch (error) {
        console.error('Error processing photo URL:', error);
        return '/placeholder-house.png';
      }
    };

    const validateFile = (file) => {
      if (!VALIDATION.VALID_PHOTO_TYPES.includes(file.type)) {
        return 'Only JPG, JPEG and PNG files allowed';
      }
      if (file.size > VALIDATION.PHOTO_MAX_SIZE) {
        return `${file.name} is too large. Maximum size is 5MB`;
      }
      return null;
    };

    const handleFileUpload = (event) => {
      const files = Array.from(event.target.files || []);
      
      photoError.value = '';

      const totalPhotos = formData.value.photos.length + files.length - removedPhotoIndices.value.length;
      if (totalPhotos > VALIDATION.MAX_PHOTOS) {
        photoError.value = `Maximum ${VALIDATION.MAX_PHOTOS} photos allowed`;
        if (fileInput.value) fileInput.value.value = '';
        return;
      }

      for (const file of files) {
        const error = validateFile(file);
        if (error) {
          photoError.value = error;
          if (fileInput.value) fileInput.value.value = '';
          return;
        }
      }

      newPhotos.value = files;
      
      newPhotoPreviewUrls.value.forEach(url => URL.revokeObjectURL(url));
      newPhotoPreviewUrls.value = files.map(file => URL.createObjectURL(file));
    };

    const removeExistingPhoto = (index) => {
      if (!formData.value.photos[index]) return;
      
      removedPhotoIndices.value.push(index);
      formData.value.photos = formData.value.photos.filter((_, i) => i !== index);
    };

    const removeNewPhoto = (index) => {
      if (!newPhotos.value[index]) return;
      
      URL.revokeObjectURL(newPhotoPreviewUrls.value[index]);
      
      newPhotos.value = newPhotos.value.filter((_, i) => i !== index);
      newPhotoPreviewUrls.value = newPhotoPreviewUrls.value.filter((_, i) => i !== index);
      
      if (newPhotos.value.length === 0 && fileInput.value) {
        fileInput.value.value = '';
      }
    };

    const fetchHouseDetails = async () => {
      if (!checkAuth()) return;
      
      try {
        const response = await axios.get(`${apiBaseUrl}/api/houses/${route.params.id}`);
        
        const house = response.data.house;
        if (!house) throw new Error('House data not found');

        formData.value = {
          location: house.location || '',
          price: house.price || '',
          datePosted: formatDateForInput(house.datePosted),
          type: house.type || '',
          purpose: house.purpose || '',
          photos: Array.isArray(house.photos) ? house.photos : []
        };

      } catch (err) {
        console.error('Error fetching house details:', err);
        error.value = err.response?.data?.message || 'Failed to load house details';
        if (err.response?.status === 401) {
          auth.setToken(null);
          router.push('/login');
        }
      } finally {
        isLoading.value = false;
      }
    };

    const handleSubmit = async () => {
      if (!checkAuth() || !isFormValid.value || isSubmitting.value) return;

      isSubmitting.value = true;
      submitError.value = '';
      successMessage.value = '';

      try {
        const formDataObj = new FormData();

        // Append basic fields
        Object.entries(formData.value).forEach(([key, value]) => {
          if (key !== 'photos') {
            formDataObj.append(key, value.toString().trim());
          }
        });

        // Append new photos
        newPhotos.value.forEach(photo => {
          formDataObj.append('photos', photo);
        });

        // Append removed photo indices
        if (removedPhotoIndices.value.length > 0) {
          formDataObj.append('removedPhotoIndices', JSON.stringify(removedPhotoIndices.value));
        }

        // Append remaining photos
        formDataObj.append('remainingPhotos', JSON.stringify(formData.value.photos));

        const response = await axios.put(
          `${apiBaseUrl}/api/houses/${route.params.id}`,
          formDataObj,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        successMessage.value = response.data.message || 'House updated successfully!';

        // Navigate back to listings after delay
        setTimeout(() => {
          router.push('/my-listings');
        }, 2000);

      } catch (err) {
        console.error('Error updating house:', err);
        submitError.value = err.response?.data?.message || 'Failed to update house';
        if (err.response?.status === 401) {
          auth.setToken(null);
          router.push('/login');
        }
      } finally {
        isSubmitting.value = false;
      }
    };

    // Lifecycle hooks
    onMounted(() => {
      checkAuth();
      fetchHouseDetails();
    });

    onUnmounted(() => {
      // Cleanup preview URLs
      newPhotoPreviewUrls.value.forEach(url => URL.revokeObjectURL(url));
    });

    return {
      // State
      isLoading,
      error,
      isSubmitting,
      successMessage,
      submitError,
      photoError,
      formData,
      newPhotos,
      newPhotoPreviewUrls,
      removedPhotoIndices,
      fileInput,
      
      // Constants
      houseTypes: HOUSE_TYPES,
      purposes: PURPOSES,
      
      // Computed
      isFormValid,
      
      // Methods
      getPhotoUrl,
      handleFileUpload,
      removeExistingPhoto,
      removeNewPhoto,
      handleSubmit,
      fetchHouseDetails
    };
  }
};
  </script>