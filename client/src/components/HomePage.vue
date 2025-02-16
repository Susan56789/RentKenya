<template>
  <div class="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
    <div v-for="house in houses" :key="house._id" class="border rounded p-4 shadow">
      <img :src="house.image" alt="House" class="w-full h-40 object-cover rounded" />
      <h2 class="font-bold text-xl mt-2">{{ house.title }}</h2>
      <p class="text-gray-600">{{ house.location }}</p>
      <p class="text-blue-500 font-semibold">KES {{ house.price }}</p>
      <router-link :to="`/house/${house._id}`" class="text-blue-600">View Details</router-link>
    </div>
  </div>
</template>

<script>
import axios from '../axios';

export default {
  data() {
    return {
      houses: [],
    };
  },
  created() {
    axios.get('/houses').then(response => {
      this.houses = response.data;
    });
  },
};
</script>