<script setup lang="ts">
import { ref } from 'vue';

interface Solution {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  link: string;
}

const solutions = ref<Solution[]>([
  {
    id: 'dfr',
    title: 'Drone as First Responder',
    subtitle: 'You protect us, DFR protects you',
    description: 'Eyes on the scene in under two minutes. Instant situational awareness on any call for service. Better coordinated responses. Increased apprehension rates. All from Skydio.',
    image: 'https://ext.same-assets.com/913537297/3416323236.png',
    link: '/path-planning'
  },
  {
    id: 'utilities',
    title: 'Utilities',
    subtitle: 'Keep the lights on',
    description: 'Reduce your downtime and accelerate the return to service when things do go wrong. Skydio helps you stay ahead of outages and failures, all with your existing workforce.',
    image: 'https://ext.same-assets.com/913537297/1121177740.png',
    link: '/person-recognition'
  },
  {
    id: 'security',
    title: 'National Security',
    subtitle: 'Out-see, out-think, and out-do the adversary',
    description: 'Gather data faster, smarter, and safer with survivable sUAS. With real-time situational awareness, you can adapt at the speed of combat to keep teams out of harms way.',
    image: 'https://ext.same-assets.com/913537297/145035404.jpeg',
    link: '/vehicle-monitoring'
  }
]);
</script>

<template>
  <section class="py-20">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-16" data-aos="fade-up">
        Skydio in action
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="solution in solutions"
          :key="solution.id"
          class="bg-white rounded-lg overflow-hidden shadow-lg"
          data-aos="fade-up"
          :data-aos-delay="solutions.indexOf(solution) * 100"
        >
          <div class="h-64 overflow-hidden">
            <img
              :src="solution.image"
              :alt="solution.title"
              class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
            >
          </div>

          <div class="p-6">
            <h3 class="text-sm text-skydio-blue uppercase tracking-wide font-medium mb-2">
              {{ solution.title }}
            </h3>

            <h4 class="text-2xl font-bold mb-4">
              {{ solution.subtitle }}
            </h4>

            <p class="text-gray-600 mb-6">
              {{ solution.description }}
            </p>

            <router-link
              :to="solution.link"
              class="flex items-center text-skydio-blue font-medium hover:underline"
            >
              Learn more
              <svg
                class="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                ></path>
              </svg>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
