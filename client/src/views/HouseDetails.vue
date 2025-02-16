<template>
    <div class="max-w-md mx-auto p-4">
      <img :src="house.image" alt="House" class="w-full h-40 object-cover rounded" />
      <h1 class="text-2xl font-bold mt-2">{{ house.title }}</h1>
      <p>{{ house.location }}</p>
      <p>KES {{ house.price }}</p>
      <p class="mt-2">{{ house.description }}</p>
    </div>
  </template>
  
  <script>
  import axios from '../axios';
  
  export default {
    data() {
      return {
        house: {},
      };
    },
    created() {
      axios.get(`/houses/${this.$route.params.id}`).then(response => {
        this.house = response.data;
      });
    },
  };
  </script>