<template>
  <div class="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg">
    <h2 class="text-2xl font-bold mb-4">Add New House</h2>
    <form @submit.prevent="addHouse" class="space-y-4" enctype="multipart/form-data">
      <input v-model="house.location" placeholder="Location" required class="w-full p-2 border rounded" />

      <input v-model.number="house.price" type="number" placeholder="Price" required class="w-full p-2 border rounded" />

      <input v-model="house.datePosted" type="date" required class="w-full p-2 border rounded" />

      <select v-model="house.type" required class="w-full p-2 border rounded">
        <option value="">Select House Type</option>
        <option value="Bed Sitter">Bed Sitter</option>
        <option value="Single Room">Single Room</option>
        <option value="One Bedroom">One Bedroom</option>
        <option value="Two Bedroom">Two Bedroom</option>
      </select>

      <select v-model="house.purpose" required class="w-full p-2 border rounded">
        <option value="">Select Purpose</option>
        <option value="Rent">Rent</option>
        <option value="Sale">Sale</option>
      </select>

      <input type="file" @change="handleFileUpload" multiple accept="image/*" required class="w-full p-2 border rounded" />
      <div v-if="photoError" class="text-red-600">{{ photoError }}</div>

      <button type="submit" class="w-full p-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600">
        Add House
      </button>
    </form>

    <div v-if="message" class="mt-4 text-green-600">{{ message }}</div>
    <div v-if="error" class="mt-4 text-red-600">{{ error }}</div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      house: {
        location: '',
        price: '',
        datePosted: '',
        type: '',
        purpose: ''
      },
      photos: [],
      photoError: '',
      message: '',
      error: ''
    };
  },
  methods: {
    handleFileUpload(event) {
      this.photos = Array.from(event.target.files);
      if (this.photos.length < 2) {
        this.photoError = 'Please upload at least 2 photos.';
      } else {
        this.photoError = '';
      }
    },
    async addHouse() {
      if (this.photos.length < 2) {
        this.photoError = 'Please upload at least 2 photos.';
        return;
      }

      const formData = new FormData();
      formData.append('location', this.house.location);
      formData.append('price', this.house.price);
      formData.append('datePosted', this.house.datePosted);
      formData.append('type', this.house.type);
      formData.append('purpose', this.house.purpose);
      this.photos.forEach((photo) => {
        formData.append('photos', photo);
      });

      try {
        await axios.post('https://rentkenya.onrender.com/api/houses', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        this.message = 'House added successfully!';
        this.error = '';
        this.house = { location: '', price: '', datePosted: '', type: '', purpose: '' };
        this.photos = [];
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to add house';
        this.message = '';
      }
    }
  }
};
</script>

<style scoped>
div {
  font-family: 'Inter', sans-serif;
}
</style>
