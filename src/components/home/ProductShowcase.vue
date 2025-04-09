<script setup lang="ts">
import { ref } from 'vue';

interface Product {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  link: string;
}

const products = ref<Product[]>([
  {
    id: 'x10',
    title: 'Skydio X10:',
    subtitle: 'You\'ve never seen like this before',
    description: 'A world-class drone program starts with Skydio X10. Loaded with the best sensors in its class, guided by the most advanced AI in the sky, and built to gather the data you need, wherever and whenever you need it.',
    image: 'https://images.stockcake.com/public/2/9/1/291b2bb6-7239-4fbc-924c-e844fbae2c23_large/drone-aerial-surveillance-stockcake.jpg',
    link: '#'
  },
  {
    id: 'dock',
    title: 'Dock for X10:',
    subtitle: 'Bring the power of autonomy to any site',
    description: 'Position X10 drones precisely where you need them, launch remotely piloted or autonomous missions at the push of a button, and start collecting data without needing anyone on site.',
    image: 'https://www.americansecurityforce.com/wp-content/uploads/2024/10/drone_security_system_features.webp',
    link: '#'
  }
]);
</script>

<template>
  <section class="py-20 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div
          v-for="product in products"
          :key="product.id"
          class="flex flex-col"
          data-aos="fade-up"
          :data-aos-delay="products.indexOf(product) * 100"
        >
          <div class="bg-white rounded-lg overflow-hidden shadow-lg mb-8">
            <img
              :src="product.image"
              :alt="product.title"
              class="w-full h-64 object-cover"
            >
          </div>

          <div>
            <h3 class="text-xl font-bold text-skydio-dark">
              {{ product.title }}
            </h3>

            <h4 class="text-2xl font-medium mb-4 text-gray-700">
              {{ product.subtitle }}
            </h4>

            <p class="text-gray-600 mb-6">
              {{ product.description }}
            </p>

            <router-link
              :to="product.link"
              class="inline-block text-skydio-blue font-medium hover:underline"
            >
              See {{ product.id === 'x10' ? 'X10' : 'Dock for X10' }} in action
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
