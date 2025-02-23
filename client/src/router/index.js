import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import AddHouse from '../views/AddHouse.vue';
import EditHouse from '../views/EditHouse.vue';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import HouseDetails from '../views/HouseDetails.vue';
import HouseListings from '@/components/HouseListings.vue';
import UserProfile from '@/components/UserProfile.vue';
import ForgotPassword from '@/views/ForgotPassword.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: {
      title: 'Home'
    }
  },
  {
    path: '/add-house',
    name: 'AddHouse',
    component: AddHouse,
    meta: {
      requiresAuth: true,
      title: 'Add New House'
    }
  },
  {
    path: '/edit-house/:id',
    name: 'EditHouse',
    component: EditHouse,
    props: true,
    meta: {
      requiresAuth: true,
      title: 'Edit House'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: {
      title: 'Login'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: {
      title: 'Register'
    }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: {
      title: 'Reset Password'
    }
  },
  {
    path: '/house/:id',
    name: 'HouseDetails',
    component: HouseDetails,
    props: true,
    meta: {
      title: 'House Details'
    }
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile,
    meta: {
      requiresAuth: true,
      title: 'My Profile'
    }
  },
  {
    path: '/my-listings',
    name: 'HouseListings',
    component: HouseListings,
    meta: {
      requiresAuth: true,
      title: 'My Listings'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '404 Not Found'
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  }
});

// Navigation guards
router.beforeEach((to, from, next) => {
  // Update document title
  document.title = `${to.meta.title} - RentKenya` || 'RentKenya';
  
  // Check if authentication is required
  const isAuthenticated = localStorage.getItem('token'); // Replace with your auth check
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ 
      name: 'Login',
      query: { redirect: to.fullPath }
    });
  } else {
    next();
  }
});

export default router;