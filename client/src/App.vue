<template>
  <div>
    <NavbarPage />
    <router-view />
  </div>
</template>

<script>
import NavbarPage from './components/NavbarPage.vue';

export default {
  components: { NavbarPage },
};
</script>