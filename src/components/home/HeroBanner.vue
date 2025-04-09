<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const currentTime = ref('00:00:00');
const currentDate = ref('00.00.0000');
const flightCount = ref(2096302);
const displayCount = ref(0);

// Update time and date every second
const updateTime = () => {
  const now = new Date();

  // Format time: HH:MM:SS
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  currentTime.value = `${hours}:${minutes}:${seconds}`;

  // Format date: MM.DD.YYYY
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  currentDate.value = `${month}.${day}.${year}`;
};

// Animate flight count
const animateCount = () => {
  const duration = 2000; // Duration in ms
  const steps = 50; // Number of steps
  const increment = Math.ceil(flightCount.value / steps);
  const interval = duration / steps;

  let current = 0;
  const timer = setInterval(() => {
    current += increment;
    if (current >= flightCount.value) {
      displayCount.value = flightCount.value;
      clearInterval(timer);
    } else {
      displayCount.value = current;
    }
  }, interval);
};

let timeInterval: number | null = null;

onMounted(() => {
  updateTime();
  timeInterval = window.setInterval(updateTime, 1000);

  // Animate count when component is mounted
  animateCount();
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>

<template>
  <section class="relative h-screen overflow-hidden">
    <!-- Video Background -->
    <div class="absolute inset-0 z-0">
      <video
        class="object-cover w-full h-full"
        autoplay
        loop
        muted
        playsinline
      >
        <source src="@/assets/videos/file.mp4" type="video/mp4" />
      </video>
      <!-- Overlay -->
      <div class="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
      <div class="max-w-3xl text-white mt-24">
        <h1
          class="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          Know more.<br>
          Risk less.
        </h1>

        <div
          class="mb-8 text-white/80 text-sm"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          Time: {{ currentTime }} Date: {{ currentDate }}
        </div>

        <div
          class="text-5xl md:text-6xl lg:text-7xl font-bold mb-2"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          {{ displayCount.toLocaleString() }}
        </div>

        <div
          class="text-white/80 mb-8"
          data-aos="fade-up"
          data-aos-delay="500"
        >
          Customer flights and counting
        </div>

        <div
          data-aos="fade-up"
          data-aos-delay="600"
        >
          <router-link to="#" class="btn btn-primary">
            Get started
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>
