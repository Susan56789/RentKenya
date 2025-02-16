import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import AddHouse from '../views/AddHouse.vue';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import HouseDetails from '../views/HouseDetails.vue';

const routes = [
  { path: '/', component: HomePage },
  { path: '/add-house', component: AddHouse },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
  { path: '/house/:id', component: HouseDetails, props: true },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});