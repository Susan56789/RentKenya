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

      <!-- Amenities Section -->
      <div class="space-y-3 border border-gray-200 rounded-md p-4 bg-gray-50">
        <h3 class="font-semibold text-lg text-gray-700">Amenities</h3>
        
        <!-- Internal Features -->
        <div class="space-y-2">
          <h4 class="font-medium text-gray-700">Internal Features</h4>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div v-for="feature in amenitiesOptions.internal" :key="feature" class="flex items-center">
              <input 
                :id="'internal-' + feature"
                type="checkbox"
                :value="feature"
                v-model="amenities.internal"
                class="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
              />
              <label :for="'internal-' + feature" class="ml-2 block text-sm text-gray-700">
                {{ feature }}
              </label>
            </div>
          </div>
        </div>
        
        <!-- External Features -->
        <div class="space-y-2">
          <h4 class="font-medium text-gray-700">External Features</h4>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div v-for="feature in amenitiesOptions.external" :key="feature" class="flex items-center">
              <input 
                :id="'external-' + feature"
                type="checkbox"
                :value="feature"
                v-model="amenities.external"
                class="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
              />
              <label :for="'external-' + feature" class="ml-2 block text-sm text-gray-700">
                {{ feature }}
              </label>
            </div>
          </div>
        </div>
        
        <!-- Nearby Amenities -->
        <div class="space-y-2">
          <h4 class="font-medium text-gray-700">Nearby</h4>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div v-for="feature in amenitiesOptions.nearby" :key="feature" class="flex items-center">
              <input 
                :id="'nearby-' + feature"
                type="checkbox"
                :value="feature"
                v-model="amenities.nearby"
                class="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
              />
              <label :for="'nearby-' + feature" class="ml-2 block text-sm text-gray-700">
                {{ feature }}
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Photo Upload -->
      <div class="space-y-2">
        <label for="photos" class="block text-sm font-medium text-gray-700">
          Upload Photos (2-5 photos required)
        </label>
        <input 
          id="photos"
          ref="fileInput"
          type="file"
          @change="handleFileUpload"
          multiple
          accept=".jpg,.jpeg,.png"
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
        <template v-if="isSubmitting">
          <span class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Adding House...
          </span>
        </template>
        <span v-else>Add House</span>
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
import { ref, reactive, computed, watch } from 'vue';
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

// Amenities options
const AMENITIES_OPTIONS = {
  internal: [
    'Aircon',
    'Alarm',
    'Backup Generator',
    'En Suite',
    'Fibre Internet',
    'Furnished',
    'Serviced',
    'Service Charge Included',
    'Walk In Closet'
  ],
  external: [
    'Balcony',
    'BBQ',
    'CCTV',
    'Electric Fence',
    'Borehole',
    'Garden',
    'Gym',
    'Parking',
    'Staff Quarters',
    'Swimming Pool',
    'Wheelchair Access',
    'Gated Community',
    'Kids Play Area'
  ],
  nearby: [
    'Bus Stop',
    'Golf Course',
    'Hospital',
    'Scenic View',
    'School',
    'Shopping Centre'
  ]
};

const VALIDATION = {
  PHOTO_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  VALID_PHOTO_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
  MIN_PHOTOS: 2,
  MAX_PHOTOS: 5
};

export default {
  name: 'AddHouse',
  
  setup() {
    const router = useRouter();
    const auth = useAuth();
    const fileInput = ref(null);
    
    // State
    const formData = reactive({
      location: '',
      price: '',
      datePosted: new Date().toISOString().split('T')[0],
      type: '',
      purpose: '',
    });

    // Amenities state
    const amenities = reactive({
      internal: [],
      external: [],
      nearby: []
    });

    const photos = ref([]);
    const photoPreviewUrls = ref([]);
    const photoError = ref('');
    const isSubmitting = ref(false);
    const successMessage = ref('');
    const errorMessage = ref('');

    // Create API instance
    const api = axios.create({
      baseURL: process.env.NODE_ENV === 'production' 
        ? 'https://rentkenya.onrender.com' 
        : 'http://localhost:5000',
         responseType: 'arraybuffer' 
    });


    // Add auth token to requests
    api.interceptors.request.use(config => {
      const token = auth.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      config.headers.Authorization = token;
      return config;
    });

    // File validation
    const validateFile = (file) => {
      if (!VALIDATION.VALID_PHOTO_TYPES.includes(file.type)) {
        return 'Only JPG, JPEG and PNG files allowed';
      }
      if (file.size > VALIDATION.PHOTO_MAX_SIZE) {
        return `${file.name} is too large. Maximum size is 5MB`;
      }
      return null;
    };

    // File handling
    const handleFileUpload = (event) => {
      const files = Array.from(event.target.files || []);
      
      if (files.length < VALIDATION.MIN_PHOTOS) {
        photoError.value = 'Minimum 2 photos required';
        return;
      }

      if (files.length > VALIDATION.MAX_PHOTOS) {
        photoError.value = 'Maximum 5 photos allowed';
        return;
      }

      // Validate each file
      for (const file of files) {
        const error = validateFile(file);
        if (error) {
          photoError.value = error;
          event.target.value = '';
          return;
        }
      }

      // Clear previous previews
      photoPreviewUrls.value.forEach(url => URL.revokeObjectURL(url));
      
      // Update state
      photos.value = files;
      photoError.value = '';
      photoPreviewUrls.value = files.map(file => URL.createObjectURL(file));
    };

    const removePhoto = (index) => {
      URL.revokeObjectURL(photoPreviewUrls.value[index]);
      photos.value = photos.value.filter((_, i) => i !== index);
      photoPreviewUrls.value = photoPreviewUrls.value.filter((_, i) => i !== index);
      
      // Reset file input if all photos are removed
      if (photos.value.length === 0 && fileInput.value) {
        fileInput.value.value = '';
      }
      
      photoError.value = photos.value.length < VALIDATION.MIN_PHOTOS ? 'Minimum 2 photos required' : '';
    };

    // Form validation
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

    // Helper function to get image URL
    const getImageUrl = (houseId, photoIndex) => {
      return `${api.defaults.baseURL}/api/houses/image/${houseId}/${photoIndex}`;
    };

    // Display image helper
    const displayImage = async (houseId, photoIndex) => {
      try {
        const response = await api.get(`/api/houses/image/${houseId}/${photoIndex}`);
        const blob = new Blob([response.data], { 
          type: response.headers['content-type'] 
        });
        return URL.createObjectURL(blob);
      } catch (error) {
        console.error('Error loading image:', error);
        return null;
      }
    };

    // Form submission
    const handleSubmit = async () => {
      if (!isFormValid.value) return;

      isSubmitting.value = true;
      errorMessage.value = '';
      successMessage.value = '';

      try {
        const formPayload = new FormData();

        // Append form fields
        Object.entries(formData).forEach(([key, value]) => {
          formPayload.append(key, value.toString().trim());
        });

        // Append amenities as JSON string
        formPayload.append('amenities', JSON.stringify(amenities));

        // Append photos
        photos.value.forEach(photo => {
          formPayload.append('photos', photo);
        });

        const response = await api.post('/api/houses', formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        successMessage.value = response.data.message || 'House added successfully!';
        
        // Clear form and previews
        formData.location = '';
        formData.price = '';
        formData.type = '';
        formData.purpose = '';
        
        // Reset amenities
        amenities.internal = [];
        amenities.external = [];
        amenities.nearby = [];
        
        // Reset photos
        photos.value = [];
        photoPreviewUrls.value.forEach(url => URL.revokeObjectURL(url));
        photoPreviewUrls.value = [];
        if (fileInput.value) fileInput.value.value = '';

        // Navigate after a short delay
        setTimeout(() => router.push('/my-listings'), 2000);

      } catch (error) {
        console.error('Submission error:', error);
        handleSubmissionError(error);
      } finally {
        isSubmitting.value = false;
      }
    };

    
    // Error handling helper
    const handleSubmissionError = (error) => {
      if (error.message === 'No authentication token found') {
        router.push('/login');
      } else {
        errorMessage.value = error.response?.data?.message || 'Failed to add house. Please try again.';
      }
    };

    // Price validation
    watch(() => formData.price, (newPrice) => {
      if (newPrice < 0) {
        errorMessage.value = 'Price cannot be negative';
      } else if (newPrice > 1000000000) {
        errorMessage.value = 'Price is too high';
      } else {
        errorMessage.value = '';
      }
    });

    return {
      formData,
      photos,
      photoPreviewUrls,
      photoError,
      isSubmitting,
      successMessage,
      errorMessage,
      fileInput,
      houseTypes: HOUSE_TYPES,
      purposes: PURPOSES,
      amenitiesOptions: AMENITIES_OPTIONS,
      amenities,
      isFormValid,
      handleFileUpload,
      removePhoto,
      handleSubmit,
      getImageUrl,
      displayImage
    };
  }
};
</script>