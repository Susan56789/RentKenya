<template>
    <div class="max-w-md mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Post a New House</h1>
      <form @submit.prevent="postHouse">
        <input v-model="house.title" placeholder="Title" class="w-full p-2 border mb-2 rounded" />
        <input v-model="house.location" placeholder="Location" class="w-full p-2 border mb-2 rounded" />
        <input v-model="house.price" type="number" placeholder="Price" class="w-full p-2 border mb-2 rounded" />
        <textarea v-model="house.description" placeholder="Description" class="w-full p-2 border mb-2 rounded"></textarea>
        <input type="file" @change="uploadImage" class="w-full p-2 border mb-2 rounded" />
        <button type="submit" class="bg-blue-600 text-white p-2 rounded w-full">Post House</button>
      </form>
    </div>
  </template>
  
  <script>
  import axios from '../axios';
  
  export default {
    data() {
      return {
        house: {
          title: '',
          location: '',
          price: '',
          description: '',
          image: '',
        },
      };
    },
    methods: {
      uploadImage(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          this.house.image = e.target.result;
        };
        reader.readAsDataURL(file);
      },
      postHouse() {
        axios.post('/houses', this.house).then(() => {
          this.$router.push('/');
        });
      },
    },
  };
  </script>