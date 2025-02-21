<template>
  <div class="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg">
    <h2 class="text-2xl font-bold mb-6">Add New House</h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Location Input -->
      <div class="space-y-1">
        <label for="location" class="block text-sm font-medium text-gray-700">Location</label>
        <input 
          id="location"
          v-model="house.location"
          type="text"
          required
          placeholder="Enter house location"
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <!-- Price Input -->
      <div class="space-y-1">
        <label for="price" class="block text-sm font-medium text-gray-700">Price (KSh)</label>
        <input 
          id="price"
          v-model.number="house.price"
          type="number"
          required
          placeholder="Enter price"
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <!-- Date Available -->
      <div class="space-y-1">
        <label for="datePosted" class="block text-sm font-medium text-gray-700">Available From</label>
        <input 
          id="datePosted"
          v-model="house.datePosted"
          type="date"
          required
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <!-- House Type Select -->
      <div class="space-y-1">
        <label for="type" class="block text-sm font-medium text-gray-700">House Type</label>
        <select 
          id="type"
          v-model="house.type"
          required
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="" disabled>Select Type</option>
          <option value="Bed Sitter">Bed Sitter</option>
          <option value="Single Room">Single Room</option>
          <option value="One Bedroom">One Bedroom</option>
          <option value="Two Bedroom">Two Bedroom</option>
        </select>
      </div>

      <!-- Purpose Select -->
      <div class="space-y-1">
        <label for="purpose" class="block text-sm font-medium text-gray-700">Purpose</label>
        <select 
          id="purpose"
          v-model="house.purpose"
          required
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="" disabled>Select Purpose</option>
          <option value="Rent">Rent</option>
          <option value="Sale">Sale</option>
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
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        :disabled="isSubmitting || photos.length < 2"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isSubmitting ? 'Adding...' : 'Add House' }}
      </button>

      <!-- Status Messages -->
      <div v-if="message" class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
        {{ message }}
      </div>

      <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
        {{ error }}
      </div>
    </form>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/utils/axios';

export default {
  name: 'AddHouse',
  
  setup() {
    const router = useRouter();
    const isSubmitting = ref(false);
    const message = ref('');
    const error = ref('');
    const photos = ref([]);
    const photoPreviewUrls = ref([]);
    const photoError = ref('');

    const house = reactive({
      location: '',
      price: '',
      datePosted: new Date().toISOString().split('T')[0],
      type: '',
      purpose: ''
    });

    const handleFileUpload = (e) => {
      const selectedFiles = Array.from(e.target.files || []);
      
      if (selectedFiles.length > 5) {
        photoError.value = 'Maximum 5 photos allowed';
        return;
      }

      if (selectedFiles.length < 2) {
        photoError.value = 'Minimum 2 photos required';
        return;
      }

      // Validate file types and sizes
      const validFiles = selectedFiles.every(file => {
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

      if (!validFiles) return;

      photos.value = selectedFiles;
      photoError.value = '';

      // Create preview URLs
      photoPreviewUrls.value = selectedFiles.map(file => URL.createObjectURL(file));
    };

    const removePhoto = (index) => {
      URL.revokeObjectURL(photoPreviewUrls.value[index]);
      
      photos.value = photos.value.filter((_, i) => i !== index);
      photoPreviewUrls.value = photoPreviewUrls.value.filter((_, i) => i !== index);
      
      if (photos.value.length < 2) {
        photoError.value = 'Minimum 2 photos required';
      }
    };

    const handleSubmit = async () => {
      if (photos.value.length < 2) {
        photoError.value = 'Minimum 2 photos required';
        return;
      }

      isSubmitting.value = true;
      error.value = '';
      message.value = '';

      try {
        const formData = new FormData();
        Object.entries(house).forEach(([key, value]) => {
          formData.append(key, value);
        });
        
        photos.value.forEach(photo => {
          formData.append('photos', photo);
        });

        const response = await api.post('/api/houses', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        message.value = response.data.message || 'House added successfully!';
        
        // Clear form data
        house.location = '';
        house.price = '';
        house.type = '';
        house.purpose = '';
        house.datePosted = new Date().toISOString().split('T')[0];
        photos.value = [];
        photoPreviewUrls.value = [];

        // Redirect after success
        setTimeout(() => router.push('/my-listings'), 2000);
        
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to add house';
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      house,
      isSubmitting,
      message,
      error,
      photos,
      photoPreviewUrls,
      photoError,
      handleFileUpload,
      removePhoto,
      handleSubmit
    };
  }
};
</script>