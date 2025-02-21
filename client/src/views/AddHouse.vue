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
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <!-- House Type Select -->
      <div class="space-y-1">
        <label for="type" class="block text-sm font-medium text-gray-700">House Type</label>
        <select 
          id="type"
          v-model="formData.type"
          required
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        :disabled="isSubmitting || !isFormValid"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import axios from '@/utils/axios'

export default {
  name: 'AddHouse',
  
  setup() {
    const router = useRouter()
    const auth = useAuth()

    // Check authentication on mount
    onMounted(() => {
      if (!auth.isAuthenticated()) {
        router.push('/login')
      }
    })

    // Constants
    const houseTypes = [
      'Bed Sitter',
      'Single Room',
      'One Bedroom',
      'Two Bedroom',
      'Three Bedroom',
      'Four Bedroom',
      'Five Bedroom'
    ]

    const purposes = ['Rent', 'Sale']

    // Form state
    const formData = reactive({
      location: '',
      price: '',
      datePosted: new Date().toISOString().split('T')[0],
      type: '',
      purpose: ''
    })

    // File handling state
    const photos = ref([])
    const photoPreviewUrls = ref([])
    const photoError = ref('')

    // Form submission state
    const isSubmitting = ref(false)
    const successMessage = ref('')
    const errorMessage = ref('')

    // Computed property for form validation
    const isFormValid = computed(() => {
      return (
        formData.location &&
        formData.price &&
        formData.datePosted &&
        formData.type &&
        formData.purpose &&
        photos.value.length >= 2 &&
        photos.value.length <= 5
      )
    })

    // Methods
    const handleFileUpload = (event) => {
      const files = Array.from(event.target.files || [])
      
      // Validate number of files
      if (files.length > 5) {
        photoError.value = 'Maximum 5 photos allowed'
        return
      }

      if (files.length < 2) {
        photoError.value = 'Minimum 2 photos required'
        return
      }

      // Validate file types and sizes
      const isValid = files.every(file => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
        const maxSize = 5 * 1024 * 1024 // 5MB

        if (!validTypes.includes(file.type)) {
          photoError.value = 'Only JPG, JPEG and PNG files allowed'
          return false
        }

        if (file.size > maxSize) {
          photoError.value = 'Each file must be less than 5MB'
          return false
        }

        return true
      })

      if (!isValid) return

      // Clean up previous preview URLs
      photoPreviewUrls.value.forEach(url => URL.revokeObjectURL(url))

      // Update state
      photos.value = files
      photoError.value = ''

      // Create and store preview URLs
      photoPreviewUrls.value = files.map(file => URL.createObjectURL(file))
    }

    const removePhoto = (index) => {
      // Revoke the object URL to prevent memory leaks
      URL.revokeObjectURL(photoPreviewUrls.value[index])
      
      // Remove photo from arrays
      photos.value = photos.value.filter((_, i) => i !== index)
      photoPreviewUrls.value = photoPreviewUrls.value.filter((_, i) => i !== index)
      
      // Update validation state
      if (photos.value.length < 2) {
        photoError.value = 'Minimum 2 photos required'
      }
    }

    const resetForm = () => {
      // Reset form data
      Object.keys(formData).forEach(key => {
        formData[key] = key === 'datePosted' 
          ? new Date().toISOString().split('T')[0] 
          : ''
      })

      // Reset file state
      photos.value.forEach( index => {
        URL.revokeObjectURL(photoPreviewUrls.value[index])
      })
      photos.value = []
      photoPreviewUrls.value = []
      photoError.value = ''

      // Reset messages
      successMessage.value = ''
      errorMessage.value = ''
    }

    const handleSubmit = async () => {
      if (!isFormValid.value) return

      isSubmitting.value = true
      errorMessage.value = ''
      successMessage.value = ''

      try {
        const formPayload = new FormData()

        // Append form fields
        Object.entries(formData).forEach(([key, value]) => {
          formPayload.append(key, value)
        })

        // Append photos
        photos.value.forEach(photo => {
          formPayload.append('photos', photo)
        })

        // Add auth token to request
        const response = await axios.post('https://rentkenya.onrender.com/api/houses', formPayload, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${auth.getToken()}`
          }
        })

        successMessage.value = response.data.message || 'House added successfully!'
        resetForm()

        // Redirect after success
        setTimeout(() => router.push('/my-listings'), 2000)

      } catch (error) {
        errorMessage.value = error.response?.data?.message || 'Failed to add house'
        
        // Handle unauthorized error
        if (error.response?.status === 401) {
          auth.setToken(null)
          router.push('/login')
        }
      } finally {
        isSubmitting.value = false
      }
    }

    return {
      // State
      formData,
      photos,
      photoPreviewUrls,
      photoError,
      isSubmitting,
      successMessage,
      errorMessage,

      // Constants
      houseTypes,
      purposes,

      // Computed
      isFormValid,

      // Methods
      handleFileUpload,
      removePhoto,
      handleSubmit
    }
  }
}
</script>