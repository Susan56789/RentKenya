<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
      <div class="text-center mb-6">
        <h2 class="text-3xl font-bold text-gray-900">Create an account</h2>
        <p class="mt-2 text-sm text-gray-600">
          Already have an account?
          <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </router-link>
        </p>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
            <input
              id="username"
              v-model="username"
              type="text"
              required
              class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              id="phone"
              v-model="phoneNumber"
              type="tel"
              required
              class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <div class="relative mt-1">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button 
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <eye-icon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
                <eye-off-icon v-else class="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <p class="mt-1 text-sm text-gray-500">
              Password must be at least 8 characters long
            </p>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? 'Creating account...' : 'Create account' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { Eye as EyeIcon, EyeOff as EyeOffIcon } from 'lucide-vue-next';
import axios from 'axios';

export default {
  name: 'RegisterForm',
  components: {
    EyeIcon,
    EyeOffIcon
  },
  data() {
    return {
      username: '',
      email: '',
      password: '',
      phoneNumber: '',
      error: '',
      isLoading: false,
      showPassword: false
    };
  },
  methods: {
    async handleRegister() {
      this.error = '';
      this.isLoading = true;

      if (!this.validateForm()) {
        this.isLoading = false;
        return;
      }

      try {
        await axios.post('https://rentkenya.onrender.com/api/users/register', {
          username: this.username.trim(),
          email: this.email.trim(),
          password: this.password,
          phoneNumber: this.phoneNumber.trim()
        });

        this.$router.push('/login');
      } catch (err) {
        console.error('Registration Error:', err);
        this.error = err.response?.data?.message || 'Registration failed. Please try again.';
      } finally {
        this.isLoading = false;
      }
    },
    validateForm() {
      if (!this.username || !this.email || !this.password || !this.phoneNumber) {
        this.error = 'Please fill in all fields';
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        this.error = 'Please enter a valid email address';
        return false;
      }

      if (this.password.length < 8) {
        this.error = 'Password must be at least 8 characters long';
        return false;
      }

      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(this.phoneNumber)) {
        this.error = 'Please enter a valid phone number';
        return false;
      }

      return true;
    }
  }
};
</script>