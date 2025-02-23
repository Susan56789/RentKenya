import axios from 'axios';

export default axios.create({
  baseURL: 'https://rentkenya.onrender.com/api', // Backend URL
});