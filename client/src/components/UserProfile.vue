<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white shadow rounded-lg p-6 text-center">
        <p class="text-red-600">{{ error }}</p>
        <button 
          @click="fetchUserProfile"
          class="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Retry
        </button>
      </div>

      <div v-else class="bg-white shadow rounded-lg">
        <!-- Profile Header -->
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="h-16 w-16 rounded-full bg-gray-600 flex items-center justify-center">
                <span class="text-2xl text-white font-semibold">{{ userInitials }}</span>
              </div>
              <div class="ml-4">
                <h2 class="text-xl font-bold text-gray-900">{{ userData.username }}</h2>
                <p class="text-sm text-gray-500">{{ userData.email }}</p>
              </div>
            </div>
            <button
              @click="toggleEdit"
              class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-500"
            >
              {{ isEditing ? 'Cancel' : 'Edit Profile' }}
            </button>
          </div>
        </div>

        <!-- Profile Content -->
        <div class="px-4 py-5 sm:px-6">
          <form v-if="isEditing" @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Username -->
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
              <input
                id="username"
                v-model="editForm.username"
                type="text"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
              />
              <p v-if="validationErrors.username" class="mt-1 text-sm text-red-600">
                {{ validationErrors.username }}
              </p>
            </div>

            <!-- Phone Number -->
            <div>
              <label for="phoneNumber" class="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                id="phoneNumber"
                v-model="editForm.phoneNumber"
                type="tel"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
              />
              <p v-if="validationErrors.phoneNumber" class="mt-1 text-sm text-red-600">
                {{ validationErrors.phoneNumber }}
              </p>
            </div>

            <!-- Location -->
            <div>
              <label for="location" class="block text-sm font-medium text-gray-700">Location</label>
              <input
                id="location"
                v-model="editForm.location"
                type="text"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
              />
            </div>

            <!-- Bio -->
            <div>
              <label for="bio" class="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                id="bio"
                v-model="editForm.bio"
                rows="3"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
              ></textarea>
            </div>

            <!-- Submit Buttons -->
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="toggleEdit"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
              >
                <span v-if="isSubmitting" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
                <span v-else>Save Changes</span>
              </button>
            </div>
          </form>

          <!-- Display Profile -->
          <div v-else class="space-y-4">
            <div>
              <h3 class="text-sm font-medium text-gray-500">Phone Number</h3>
              <p class="mt-1 text-sm text-gray-900">{{ userData.phoneNumber || 'Not provided' }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500">Location</h3>
              <p class="mt-1 text-sm text-gray-900">{{ userData.location || 'Not provided' }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500">Bio</h3>
              <p class="mt-1 text-sm text-gray-900">{{ userData.bio || 'No bio provided' }}</p>
            </div>
            <div class="pt-4 border-t border-gray-200">
              <h3 class="text-sm font-medium text-gray-500">Account Details</h3>
              <div class="mt-2 space-y-2">
                <div>
                  <span class="text-xs text-gray-500">Member since:</span>
                  <p class="text-sm text-gray-900">{{ formatDate(userData.createdAt) }}</p>
                </div>
                <div>
                  <span class="text-xs text-gray-500">Last login:</span>
                  <p class="text-sm text-gray-900">{{ formatDate(userData.lastLoginAt) }}</p>
                </div>
                <div>
                  <span class="text-xs text-gray-500">Last updated:</span>
                  <p class="text-sm text-gray-900">{{ formatDate(userData.updatedAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Messages -->
        <div v-if="successMessage || errorMessage" class="px-4 py-3 border-t border-gray-200">
          <div
            v-if="successMessage"
            class="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md"
          >
            {{ successMessage }}
          </div>
          <div
            v-if="errorMessage"
            class="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md"
          >
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive,computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import axios from 'axios';


export default {
  name: 'UserProfile',
  
  setup() {
    const router = useRouter();
    const auth = useAuth();
    
    const isLoading = ref(true);
    const isEditing = ref(false);
    const isSubmitting = ref(false);
    const error = ref(null);
    const successMessage = ref('');
    const errorMessage = ref('');

    const userData = reactive({
      _id: '',
      username: '',
      email: '',
      phoneNumber: '',
      location: '',
      bio: '',
      createdAt: '',
      lastLoginAt: '',
      updatedAt: ''
    });

    const editForm = reactive({
      username: '',
      phoneNumber: '',
      location: '',
      bio: ''
    });

    const validationErrors = reactive({
      username: '',
      phoneNumber: ''
    });

    const apiBaseUrl = process.env.NODE_ENV === 'production'
      ? 'https://rentkenya.onrender.com'
      : 'http://localhost:5000';

    const fetchUserProfile = async () => {
      error.value = null;
      isLoading.value = true;

      try {
        // Get token from auth service
        const token = auth.getToken();
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await axios.get(`${apiBaseUrl}/api/users/profile`, {
          headers: {
            Authorization: token
          }
        });

        Object.assign(userData, response.data);
        resetForm();
      } catch (err) {
        console.error('Error fetching profile:', err);
        error.value = err.response?.data?.message || 'Failed to load profile';
        if (err.response?.status === 401) {
          auth.setToken(null);
          router.push('/login');
        }
      } finally {
        isLoading.value = false;
      }
    };

    const resetForm = () => {
      Object.assign(editForm, {
        username: userData.username || '',
        phoneNumber: userData.phoneNumber || '',
        location: userData.location || '',
        bio: userData.bio || ''
      });
      Object.assign(validationErrors, {
        username: '',
        phoneNumber: ''
      });
      successMessage.value = '';
      errorMessage.value = '';
    };

    const toggleEdit = () => {
      isEditing.value = !isEditing.value;
      if (!isEditing.value) {
        resetForm();
      }
    };

    const validateForm = () => {
      let isValid = true;
      Object.assign(validationErrors, {
        username: '',
        phoneNumber: ''
      });

      if (!editForm.username.trim()) {
        validationErrors.username = 'Username is required';
        isValid = false;
      }

      if (editForm.phoneNumber) {
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(editForm.phoneNumber)) {
          validationErrors.phoneNumber = 'Please enter a valid phone number';
          isValid = false;
        }
      }

      return isValid;
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'Not available';
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const handleSubmit = async () => {
      if (!validateForm() || isSubmitting.value) return;

      isSubmitting.value = true;
      successMessage.value = '';
      errorMessage.value = '';

      try {
        const token = auth.getToken();
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await axios.put(
          `${apiBaseUrl}/api/users/profile`,
          editForm,
          {
            headers: {
              Authorization: token
            }
          }
        );

        Object.assign(userData, response.data.user);
        successMessage.value = 'Profile updated successfully';
        isEditing.value = false;
      } catch (err) {
        console.error('Error updating profile:', err);
        errorMessage.value = err.response?.data?.message || 'Failed to update profile';
        if (err.response?.status === 401) {
          auth.setToken(null);
          router.push('/login');
        }
      } finally {
        isSubmitting.value = false;
      }
    };

    const userInitials = computed(() => {
  if (!userData.username) return "";
  return userData.username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
});


    // Fetch profile data on component mount
    fetchUserProfile();

    return {
      isLoading,
      isEditing,
      isSubmitting,
      error,
      userData,
      editForm,
      validationErrors,
      successMessage,
      errorMessage,
      userInitials,
      toggleEdit,
      handleSubmit,
      fetchUserProfile,
      formatDate
    };
  }
};
</script>