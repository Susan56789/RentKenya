<template>
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow rounded-lg">
          <!-- Profile Header -->
          <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="h-16 w-16 rounded-full bg-gray-600 flex items-center justify-center">
                  <span class="text-2xl text-white font-semibold">
                    {{ userInitials }}
                  </span>
                </div>
                <div class="ml-4">
                  <h2 class="text-xl font-bold text-gray-900">{{ userData.fullName }}</h2>
                  <p class="text-sm text-gray-500">{{ userData.email }}</p>
                </div>
              </div>
              <button
                @click="isEditing = !isEditing"
                class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-500"
              >
                {{ isEditing ? 'Cancel' : 'Edit Profile' }}
              </button>
            </div>
          </div>
  
          <!-- Profile Content -->
          <div class="px-4 py-5 sm:px-6">
            <form v-if="isEditing" @submit.prevent="handleUpdateProfile">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    v-model="editForm.fullName"
                    type="text"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    v-model="editForm.phone"
                    type="tel"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    v-model="editForm.location"
                    type="text"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    v-model="editForm.bio"
                    rows="3"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                  ></textarea>
                </div>
                <div class="flex justify-end space-x-3">
                  <button
                    type="button"
                    @click="isEditing = false"
                    class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
            <div v-else class="space-y-4">
              <div>
                <h3 class="text-sm font-medium text-gray-500">Phone</h3>
                <p class="mt-1 text-sm text-gray-900">{{ userData.phone }}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500">Location</h3>
                <p class="mt-1 text-sm text-gray-900">{{ userData.location }}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500">Bio</h3>
                <p class="mt-1 text-sm text-gray-900">{{ userData.bio }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'UserProfile',
    data() {
      return {
        isEditing: false,
        userData: {
          fullName: '',
          email: '',
          phone: '',
          location: '',
          bio: ''
        },
        editForm: {
          fullName: '',
          phone: '',
          location: '',
          bio: ''
        }
      };
    },
    computed: {
      userInitials() {
        return this.userData.fullName
          .split(' ')
          .map(name => name[0])
          .join('')
          .toUpperCase();
      }
    },
    methods: {
      async fetchUserProfile() {
        try {
          const response = await axios.get('https://rentkenya.onrender.com/api/users/profile', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          this.userData = response.data;
          this.editForm = { ...response.data };
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      },
      async handleUpdateProfile() {
        try {
          await axios.put(
            'https://rentkenya.onrender.com/api/users/profile',
            this.editForm,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          this.userData = { ...this.editForm };
          this.isEditing = false;
        } catch (error) {
          console.error('Error updating profile:', error);
        }
      }
    },
    mounted() {
      this.fetchUserProfile();
    }
  };
  </script>
  