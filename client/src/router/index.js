import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import AddHouse from '../views/AddHouse.vue';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import HouseDetails from '../views/HouseDetails.vue';
import HouseListings from '@/components/HouseListings.vue';
import UserProfile from '@/components/UserProfile.vue';
import ForgotPassword from '@/views/ForgotPassword.vue';

const routes = [
  { path: '/', component: HomePage },
  { path: '/add-house', component: AddHouse },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
  {path: '/forgot-password', component: ForgotPassword},
  { path: '/house/:id', component: HouseDetails, props: true },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile,
    meta: { requiresAuth: true }
  },
  {
    path: '/my-listings',
    name: 'HouseListings',
    component: HouseListings,
    meta: { requiresAuth: true }
  }
];

export default createRouter({
  history: createWebHistory(),
  routes,
});