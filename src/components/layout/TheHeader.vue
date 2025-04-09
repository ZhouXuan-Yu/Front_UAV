<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

defineProps<{
  scrolled: boolean
}>();

const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="{ 'bg-white shadow-md': scrolled || mobileMenuOpen, 'bg-transparent': !scrolled && !mobileMenuOpen }"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <!-- Logo -->
        <RouterLink to="/" class="flex-shrink-0" @click="closeMobileMenu">
          <img src="https://ext.same-assets.com/794583279/3783633550.svg" alt="Skydio" class="h-8">
        </RouterLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex space-x-8">
          <RouterLink to="/" class="text-skydio-dark font-medium hover:text-skydio-blue transition-colors">Home</RouterLink>
          <RouterLink to="/path-planning" class="text-skydio-dark font-medium hover:text-skydio-blue transition-colors">Path Planning</RouterLink>
          <RouterLink to="/person-recognition" class="text-skydio-dark font-medium hover:text-skydio-blue transition-colors">Person Recognition</RouterLink>
          <RouterLink to="/vehicle-monitoring" class="text-skydio-dark font-medium hover:text-skydio-blue transition-colors">Vehicle Monitoring</RouterLink>
          <RouterLink to="/disaster-detection" class="text-skydio-dark font-medium hover:text-skydio-blue transition-colors">Disaster Detection</RouterLink>
          <RouterLink to="/license-plate-recognition" class="text-skydio-dark font-medium hover:text-skydio-blue transition-colors">License Plate Recognition</RouterLink>
          <RouterLink to="/data-dashboard" class="text-skydio-dark font-medium hover:text-skydio-blue transition-colors">Data Dashboard</RouterLink>
          <RouterLink to="/knowledge-graph" class="text-skydio-dark font-medium hover:text-skydio-blue transition-colors">Knowledge Graph</RouterLink>
          <RouterLink to="/contact" class="text-skydio-dark font-medium hover:text-skydio-blue transition-colors">Contact</RouterLink>
        </nav>

        <!-- Mobile menu button -->
        <button
          class="md:hidden rounded-md p-2 inline-flex items-center justify-center text-skydio-dark hover:text-skydio-blue focus:outline-none"
          @click="toggleMobileMenu"
        >
          <span class="sr-only">{{ mobileMenuOpen ? 'Close menu' : 'Open menu' }}</span>
          <!-- Hamburger icon -->
          <svg
            v-if="!mobileMenuOpen"
            class="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <!-- X icon -->
          <svg
            v-else
            class="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-if="mobileMenuOpen" class="md:hidden">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <RouterLink
          to="/"
          class="block px-3 py-2 rounded-md text-base font-medium text-skydio-dark hover:bg-gray-100"
          @click="closeMobileMenu"
        >
          Home
        </RouterLink>
        <RouterLink
          to="/path-planning"
          class="block px-3 py-2 rounded-md text-base font-medium text-skydio-dark hover:bg-gray-100"
          @click="closeMobileMenu"
        >
          Path Planning
        </RouterLink>
        <RouterLink
          to="/person-recognition"
          class="block px-3 py-2 rounded-md text-base font-medium text-skydio-dark hover:bg-gray-100"
          @click="closeMobileMenu"
        >
          Person Recognition
        </RouterLink>
        <RouterLink
          to="/vehicle-monitoring"
          class="block px-3 py-2 rounded-md text-base font-medium text-skydio-dark hover:bg-gray-100"
          @click="closeMobileMenu"
        >
          Vehicle Monitoring
        </RouterLink>
        <RouterLink
          to="/disaster-detection"
          class="block px-3 py-2 rounded-md text-base font-medium text-skydio-dark hover:bg-gray-100"
          @click="closeMobileMenu"
        >
          Disaster Detection
        </RouterLink>
        <RouterLink
          to="/license-plate-recognition"
          class="block px-3 py-2 rounded-md text-base font-medium text-skydio-dark hover:bg-gray-100"
          @click="closeMobileMenu"
        >
          License Plate Recognition
        </RouterLink>
        <RouterLink
          to="/data-dashboard"
          class="block px-3 py-2 rounded-md text-base font-medium text-skydio-dark hover:bg-gray-100"
          @click="closeMobileMenu"
        >
          Data Dashboard
        </RouterLink>
        <RouterLink
          to="/knowledge-graph"
          class="block px-3 py-2 rounded-md text-base font-medium text-skydio-dark hover:bg-gray-100"
          @click="closeMobileMenu"
        >
          Knowledge Graph
        </RouterLink>
        <RouterLink
          to="/contact"
          class="block px-3 py-2 rounded-md text-base font-medium text-skydio-dark hover:bg-gray-100"
          @click="closeMobileMenu"
        >
          Contact
        </RouterLink>
      </div>
    </div>
  </header>
</template>
