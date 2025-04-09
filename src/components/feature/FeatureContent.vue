<script setup lang="ts">
defineProps<{
  features: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
}>();
</script>

<template>
  <section class="py-20">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="bg-white p-8 rounded-lg shadow-lg"
          data-aos="fade-up"
          :data-aos-delay="index * 100"
        >
          <div v-if="feature.icon" class="mb-6 text-skydio-blue">
            <img
              :src="feature.icon"
              alt="Feature icon"
              class="w-12 h-12"
            >
          </div>

          <h3 class="text-xl font-bold mb-4">{{ feature.title }}</h3>
          <p class="text-gray-600">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
