<script setup lang="ts">
import { ref } from 'vue';

interface Story {
  id: string;
  title: string;
  image: string;
  link: string;
}

const stories = ref<Story[]>([
  {
    id: 'miami',
    title: 'Miami Beach PD debuts DFR program to bolster public safety ahead of spring break',
    image: 'https://ext.same-assets.com/913537297/1124492884.jpeg',
    link: '#'
  },
  {
    id: 'aep',
    title: 'AEP deploys autonomous drones to optimize outage response',
    image: 'https://ext.same-assets.com/913537297/2962017561.jpeg',
    link: '#'
  },
  {
    id: 'pasco',
    title: 'Pasco County Sheriff\'s Office drone pilot locates missing child',
    image: 'https://ext.same-assets.com/913537297/2419577417.png',
    link: '#'
  }
]);
</script>

<template>
  <section class="py-20">
    <div class="container mx-auto px-4">
      <h2
        class="text-3xl md:text-4xl font-bold text-center mb-16"
        data-aos="fade-up"
      >
        Success stories from the field
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="story in stories"
          :key="story.id"
          class="bg-white rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:shadow-xl hover:-translate-y-1"
          data-aos="fade-up"
          :data-aos-delay="stories.indexOf(story) * 100"
        >
          <router-link :to="story.link" class="block">
            <div class="h-48 overflow-hidden">
              <img
                :src="story.image"
                :alt="story.title"
                class="w-full h-full object-cover"
              >
            </div>

            <div class="p-6">
              <h3 class="text-lg font-medium text-skydio-dark hover:text-skydio-blue transition-colors">
                {{ story.title }}
              </h3>
            </div>
          </router-link>
        </div>
      </div>

      <div class="text-center mt-12">
        <router-link
          to="#"
          class="inline-flex items-center text-skydio-blue font-medium hover:underline"
          data-aos="fade-up"
        >
          See more customer stories
          <svg
            class="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </router-link>
      </div>
    </div>
  </section>
</template>
