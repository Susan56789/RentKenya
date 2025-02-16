<template>
    <div class="max-w-md mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Register</h1>
      <form @submit.prevent="register">
        <input v-model="username" placeholder="Username" class="w-full p-2 border mb-2 rounded" />
        <input v-model="email" placeholder="Email" class="w-full p-2 border mb-2 rounded" />
        <input v-model="phoneNumber" placeholder="Phone Number" class="w-full p-2 border mb-2 rounded" />
        <input v-model="password" type="password" placeholder="Password" class="w-full p-2 border mb-2 rounded" />
        <button type="submit" class="bg-blue-600 text-white p-2 rounded w-full">Register</button>
      </form>
    </div>
  </template>
  
  <script>
  import axios from '../axios';
  
  export default {
    data() {
      return {
        username: '',
        email: '',
        password: '',
        phoneNumber: '',
      };
    },
    methods: {
      register() {
        axios.post('https://rentkenya.onrender.com/api/users/register', {
          username: this.username,
          email: this.email,
          password: this.password,
          phoneNumber: this.phoneNumber,
        }).then(() => {
          this.$router.push('/login');
        });
      },
    },
  };
  </script>