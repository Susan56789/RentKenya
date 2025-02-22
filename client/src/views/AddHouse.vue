# AddHouse.vue
<template>
  <div class="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg">
    <h2 class="text-2xl font-bold mb-6">Add New House</h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Location Input -->
      <div class="space-y-1">
        <label for="location" class="block text-sm font-medium text-gray-700">Location</label>
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
        <label for="price" class="block text-sm font-medium text-gray-700">Price (KSh)</label>
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
        <label for="datePosted" class="block text-sm font-medium text-gray-700">Available From</label>
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
        <label for="type" class="block text-sm font-medium text-gray-700">House Type</label>
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
        <label for="purpose" class="block text-sm font-medium text-gray-700">Purpose</label>
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

      <!-- Photo Upload -->
      <div class="space-y-2">
        <label for="photos" class="block text-sm font-medium text-gray-700">
          Upload Photos (2-5 photos required)
        </label>
        <input 
          id="photos"
          type="file"
          @change="handleFileUpload"
          multiple
          accept="image/jpeg,image/jpg,image/png"
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
        />
        
        <p v-if="photoError" class="text-sm text-red-500 mt-1">{{ photoError }}</p>

        <!-- Photo Previews -->
        <div v-if="photoPreviewUrls.length > 0" class="grid grid-cols-3 gap-2 mt-2">
          <div v-for="(url, index) in photoPreviewUrls" :key="index" class="relative group">
            <img 
              :src="url"
              :alt="'Preview ' + (index + 1)"
              class="w-full h-24 object-cover rounded-md"
            />
            <button 
              type="button"
              @click="removePhoto(index)"
              class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
        :disabled="isSubmitting || !isFormValid"
        class="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isSubmitting ? 'Adding...' : 'Add House' }}
      </button>

      <!-- Status Messages -->
      <div v-if="successMessage" class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
        {{ errorMessage }}
      </div>
    </form>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
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
  MAX_PHOTOS: 5,
  MAX_PRICE: 1000000000 // 1 billion KES
};

export default {
  name: 'AddHouse',
  
  setup() {
    const router = useRouter();
    const auth = useAuth();

    // Check authentication on mount
    onMounted(() => {
      if (!auth.isAuthenticated()) {
        router.push('/login');
        return;
      }
    });

    // State
    const formData = reactive({
      location: '',
      price: '',
      datePosted: new Date().toISOString().split('T')[0],
      type: '',
      purpose: '',
      description: '',
      amenities: [],
      status: 'available'
    });

    const photos = ref([]);
    const photoPreviewUrls = ref([]);
    const photoError = ref('');
    const isSubmitting = ref(false);
    const successMessage = ref('');
    const errorMessage = ref('');

    // Create API instance with auth token
    const api = axios.create({
      baseURL: process.env.NODE_ENV === 'production' 
        ? 'https://rentkenya.onrender.com' 
        : 'http://localhost:5000',
      withCredentials: true
    });

    // Add auth token to requests
    api.interceptors.request.use(config => {
      const token = auth.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle auth errors
    api.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          auth.setToken(null);
          router.push('/login');
        }
        return Promise.reject(error);
      }
    );

    // Validation functions
    const validators = {
      price: (price) => {
        const numPrice = Number(price);
        if (isNaN(numPrice) || numPrice <= 0) return 'Price must be a positive number';
        if (numPrice > VALIDATION.MAX_PRICE) return 'Price is too high';
        return '';
      },

      photos: (files) => {
        if (!files || files.length < VALIDATION.MIN_PHOTOS) return 'Minimum 2 photos required';
        if (files.length > VALIDATION.MAX_PHOTOS) return 'Maximum 5 photos allowed';

        for (const file of files) {
          if (!VALIDATION.VALID_PHOTO_TYPES.includes(file.type)) {
            return 'Only JPG, JPEG and PNG files allowed';
          }
          if (file.size > VALIDATION.PHOTO_MAX_SIZE) {
            return 'Each file must be less than 5MB';
          }
        }

        return '';
      }
    };

    // Computed properties
    const isFormValid = computed(() => {
      return (
        formData.location.trim() &&
        formData.price > 0 &&
        formData.datePosted &&
        formData.type &&
        formData.purpose &&
        photos.value.length >= VALIDATION.MIN_PHOTOS &&
        photos.value.length <= VALIDATION.MAX_PHOTOS &&
        !photoError.value
      );
    });

    // File handling
    const handleFileUpload = (event) => {
      const files = Array.from(event.target.files || []);
      const error = validators.photos(files);
      
      if (error) {
        photoError.value = error;
        event.target.value = '';
        return;
      }

      photoPreviewUrls.value.forEach(url => URL.revokeObjectURL(url));
      photos.value = files;
      photoError.value = '';
      photoPreviewUrls.value = files.map(file => URL.createObjectURL(file));
    };

    const removePhoto = (index) => {
      URL.revokeObjectURL(photoPreviewUrls.value[index]);
      photos.value = photos.value.filter((_, i) => i !== index);
      photoPreviewUrls.value = photoPreviewUrls.value.filter((_, i) => i !== index);
      photoError.value = validators.photos(photos.value);
    };

    // Form submission
    const handleSubmit = async () => {
      if (!isFormValid.value || !auth.isAuthenticated()) return;

      isSubmitting.value = true;
      errorMessage.value = '';
      successMessage.value = '';

      try {
        const formPayload = new FormData();

        // Append form fields
        Object.entries(formData).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(item => formPayload.append(`${key}[]`, item));
          } else {
            formPayload.append(key, value.toString().trim());
          }
        });

        // Append photos
        photos.value.forEach(photo => formPayload.append('photos', photo));

        const response = await api.post('/api/houses', formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        successMessage.value = response.data.message || 'House added successfully!';
        setTimeout(() => router.push('/my-listings'), 2000);

      } catch (error) {
        console.error('Submission error:', error);
        
        if (error.response?.status === 401) {
          errorMessage.value = 'Please log in again to continue.';
          setTimeout(() => router.push('/login'), 2000);
        } else {
          errorMessage.value = error.response?.data?.message || 'Failed to add house. Please try again.';
        }
      } finally {
        isSubmitting.value = false;
      }
    };

    // Watch price changes
    watch(() => formData.price, (newPrice) => {
      const error = validators.price(newPrice);
      errorMessage.value = error || '';
    });

    return {
      formData,
      photos,
      photoPreviewUrls,
      photoError,
      isSubmitting,
      successMessage,
      errorMessage,
      houseTypes: HOUSE_TYPES,
      purposes: PURPOSES,
      isFormValid,
      handleFileUpload,
      removePhoto,
      handleSubmit
    };
  }
};
</script>