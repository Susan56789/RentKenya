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
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import axios from 'axios';

// Create API instance with base URL
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? 'https://rentkenya.onrender.com'
    : 'http://localhost:5000'
});

export default {
  name: 'AddHouse',
  
  setup() {
    const router = useRouter();
    const auth = useAuth();

    // Form state
    const formData = reactive({
      location: '',
      price: '',
      datePosted: new Date().toISOString().split('T')[0],
      type: '',
      purpose: ''
    });

    // File handling state
    const photos = ref([]);
    const photoPreviewUrls = ref([]);
    const photoError = ref('');
    const isSubmitting = ref(false);
    const successMessage = ref('');
    const errorMessage = ref('');

    // Constants
    const houseTypes = [
      'Bed Sitter',
      'Single Room',
      'One Bedroom',
      'Two Bedroom',
      'Three Bedroom',
      'Four Bedroom',
      'Five Bedroom'
    ];

    const purposes = ['Rent', 'Sale'];

    // Computed property for form validation
    const isFormValid = computed(() => {
      return (
        formData.location &&
        formData.price > 0 &&
        formData.datePosted &&
        formData.type &&
        formData.purpose &&
        photos.value.length >= 2 &&
        photos.value.length <= 5 &&
        !photoError.value
      );
    });

    const validateForm = () => {
      if (!formData.location.trim()) {
        errorMessage.value = 'Location is required';
        return false;
      }
      if (!formData.price || formData.price <= 0) {
        errorMessage.value = 'Valid price is required';
        return false;
      }
      if (!formData.datePosted) {
        errorMessage.value = 'Available date is required';
        return false;
      }
      if (!formData.type) {
        errorMessage.value = 'House type is required';
        return false;
      }
      if (!formData.purpose) {
        errorMessage.value = 'Purpose is required';
        return false;
      }
      if (photos.value.length < 2) {
        errorMessage.value = 'Minimum 2 photos required';
        return false;
      }
      if (photos.value.length > 5) {
        errorMessage.value = 'Maximum 5 photos allowed';
        return false;
      }
      return true;
    };

    const handleFileUpload = (event) => {
      const files = Array.from(event.target.files || []);
      
      // Validate number of files
      if (files.length > 5) {
        photoError.value = 'Maximum 5 photos allowed';
        return;
      }

      if (files.length < 2) {
        photoError.value = 'Minimum 2 photos required';
        return;
      }

      // Validate file types and sizes
      const isValid = files.every(file => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
          photoError.value = 'Only JPG, JPEG and PNG files allowed';
          return false;
        }

        if (file.size > maxSize) {
          photoError.value = 'Each file must be less than 5MB';
          return false;
        }

        return true;
      });

      if (!isValid) return;

      // Clean up previous preview URLs
      photoPreviewUrls.value.forEach(url => URL.revokeObjectURL(url));
      
      // Update state
      photos.value = files;
      photoError.value = '';
      photoPreviewUrls.value = files.map(file => URL.createObjectURL(file));
    };

    const removePhoto = (index) => {
      // Revoke URL to prevent memory leaks
      URL.revokeObjectURL(photoPreviewUrls.value[index]);
      
      // Remove photo from arrays
      photos.value = photos.value.filter((_, i) => i !== index);
      photoPreviewUrls.value = photoPreviewUrls.value.filter((_, i) => i !== index);
      
      // Update validation
      if (photos.value.length < 2) {
        photoError.value = 'Minimum 2 photos required';
      }
    };

    const resetForm = () => {
      // Reset form data
      Object.keys(formData).forEach(key => {
        formData[key] = key === 'datePosted' 
          ? new Date().toISOString().split('T')[0] 
          : '';
      });

      // Reset file state
      photoPreviewUrls.value.forEach(url => URL.revokeObjectURL(url));
      photos.value = [];
      photoPreviewUrls.value = [];
      photoError.value = '';

      // Reset messages
      successMessage.value = '';
      errorMessage.value = '';
    };

    const handleSubmit = async () => {
      if (!isFormValid.value || !validateForm()) return;

      isSubmitting.value = true;
      errorMessage.value = '';
      successMessage.value = '';

      try {
        // Get current token
        const token = auth.getToken();
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const formPayload = new FormData();

        // Append form fields
        Object.entries(formData).forEach(([key, value]) => {
          formPayload.append(key, value.toString().trim());
        });

        // Append photos
        photos.value.forEach(photo => {
          formPayload.append('photos', photo);
        });

        // Make request with token
        const response = await api.post('https://rentkenya.onrender.com/api/houses', formPayload, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': token
          }
        });

        successMessage.value = response.data.message || 'House added successfully!';
        
        // Reset form
        resetForm();
        
        // Redirect after success
        setTimeout(() => router.push('/my-listings'), 2000);

      } catch (error) {
        console.error('Submission error:', error);
        
        if (error.response?.status === 401) {
          errorMessage.value = 'Your session has expired. Please log in again.';
          setTimeout(() => {
            auth.setToken(null);
            router.push('/login');
          }, 2000);
        } else {
          errorMessage.value = error.response?.data?.message || 'Failed to add house. Please try again.';
        }
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      formData,
      photos,
      photoPreviewUrls,
      photoError,
      isSubmitting,
      successMessage,
      errorMessage,
      houseTypes,
      purposes,
      isFormValid,
      handleFileUpload,
      removePhoto,
      handleSubmit
    };
  }
};
</script>