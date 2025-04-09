<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { gsap } from 'gsap';

interface Solution {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  link: string;
}

const solutions = ref([
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
    description: "Gather data faster, smarter, and safer with survivable sUAS. With real-time situational awareness, you can adapt at the speed of combat to keep teams out of harm's way.",
    image: 'https://ext.same-assets.com/913537297/145035404.jpeg',
    link: '/vehicle-monitoring'
  },
  {
    id: 'inspection',
    title: 'Asset Inspection',
    subtitle: 'Inspect with precision',
    description: 'Automated inspections of critical infrastructure with unmatched precision and detail. Identify issues before they become problems.',
    image: 'https://ext.same-assets.com/913537297/145035404.jpeg',
    link: '/license-plate-recognition'
  },
  {
    id: 'public-safety',
    title: 'Public Safety',
    subtitle: 'Respond faster, safer',
    description: 'Improve response times and officer safety with autonomous drone solutions designed for law enforcement.',
    image: 'https://ext.same-assets.com/913537297/3416323236.png',
    link: '/disaster-detection'
  },
  {
    id: 'mapping',
    title: 'Surveying & Mapping',
    subtitle: 'Map with precision',
    description: 'Create detailed, accurate 3D maps of any area with autonomous drone technology that captures every detail.',
    image: 'https://ext.same-assets.com/913537297/1121177740.png',
    link: '/data-dashboard'
  },
  {
    id: 'site-security',
    title: 'Site Security',
    subtitle: 'Secure perimeters automatically',
    description: 'Automate perimeter security with autonomous drone patrols that detect and respond to threats in real-time.',
    image: 'https://ext.same-assets.com/913537297/145035404.jpeg',
    link: '/knowledge-graph'
  }
]);

const currentIndex = ref(0);
const isTransitioning = ref(false);
const touchStartX = ref(0);
const touchEndX = ref(0);

const state = reactive({
  timeline: gsap.timeline({ paused: true })
});

const nextSlide = () => {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  
  const nextIndex = (currentIndex.value + 1) % solutions.value.length;
  
  gsap.to('.slide-content', {
    opacity: 0,
    x: -50,
    duration: 0.5,
    onComplete: () => {
      currentIndex.value = nextIndex;
      gsap.fromTo('.slide-content', 
        { opacity: 0, x: 50 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.5,
          onComplete: () => {
            isTransitioning.value = false;
          }
        }
      );
    }
  });
  
  // Fade background image
  gsap.to('.bg-image-current', {
    opacity: 0,
    duration: 1,
  });
  
  gsap.fromTo('.bg-image-next', 
    { opacity: 0 },
    { opacity: 1, duration: 1 }
  );
};

const prevSlide = () => {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  
  const prevIndex = (currentIndex.value - 1 + solutions.value.length) % solutions.value.length;
  
  gsap.to('.slide-content', {
    opacity: 0,
    x: 50,
    duration: 0.5,
    onComplete: () => {
      currentIndex.value = prevIndex;
      gsap.fromTo('.slide-content', 
        { opacity: 0, x: -50 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.5,
          onComplete: () => {
            isTransitioning.value = false;
          }
        }
      );
    }
  });
  
  // Fade background image
  gsap.to('.bg-image-current', {
    opacity: 0,
    duration: 1,
  });
  
  gsap.fromTo('.bg-image-next', 
    { opacity: 0 },
    { opacity: 1, duration: 1 }
  );
};

const goToSlide = (index: number) => {
  if (isTransitioning.value || index === currentIndex.value) return;
  isTransitioning.value = true;
  
  const direction = index > currentIndex.value ? -50 : 50;
  
  gsap.to('.slide-content', {
    opacity: 0,
    x: direction,
    duration: 0.5,
    onComplete: () => {
      currentIndex.value = index;
      gsap.fromTo('.slide-content', 
        { opacity: 0, x: -direction },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.5,
          onComplete: () => {
            isTransitioning.value = false;
          }
        }
      );
    }
  });
  
  // Fade background image
  gsap.to('.bg-image-current', {
    opacity: 0,
    duration: 1,
  });
  
  gsap.fromTo('.bg-image-next', 
    { opacity: 0 },
    { opacity: 1, duration: 1 }
  );
};

const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX;
};

const handleTouchEnd = (e: TouchEvent) => {
  touchEndX.value = e.changedTouches[0].clientX;
  handleSwipe();
};

const handleSwipe = () => {
  const SWIPE_THRESHOLD = 50;
  if (touchStartX.value - touchEndX.value > SWIPE_THRESHOLD) {
    nextSlide();
  } else if (touchEndX.value - touchStartX.value > SWIPE_THRESHOLD) {
    prevSlide();
  }
};

const startAutoPlay = () => {
  return setInterval(() => {
    if (!isTransitioning.value) {
      nextSlide();
    }
  }, 7000); // Change slide every 7 seconds
};

let autoPlayInterval: number | null = null;

onMounted(() => {
  autoPlayInterval = startAutoPlay();
  
  // Clear interval when component is unmounted
  return () => {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
    }
  };
});
</script>

<template>
  <section 
    class="relative h-screen overflow-hidden"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <!-- Background Images -->
    <div class="absolute inset-0 w-full h-full">
      <div 
        v-for="(solution, index) in solutions" 
        :key="`bg-${solution.id}`"
        class="absolute inset-0 w-full h-full transition-opacity duration-1000"
        :class="{ 
          'opacity-100 z-10': index === currentIndex,
          'opacity-0 z-0': index !== currentIndex
        }"
      >
        <img 
          :src="solution.image" 
          :alt="solution.title" 
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>
    </div>
    
    <!-- Content -->
    <div class="relative z-20 flex flex-col justify-center h-full px-4 md:px-8 lg:px-16">
      <div class="container mx-auto">
        <div class="max-w-2xl slide-content">
          <h3 class="text-white text-xl md:text-2xl uppercase mb-4">
            {{ solutions[currentIndex].title }}
          </h3>
          
          <h2 class="text-white text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {{ solutions[currentIndex].subtitle }}
          </h2>
          
          <p class="text-white text-lg md:text-xl mb-8">
            {{ solutions[currentIndex].description }}
          </p>
          
          <router-link 
            :to="solutions[currentIndex].link"
            class="inline-flex items-center px-6 py-3 bg-skydio-blue text-white rounded hover:bg-opacity-90 transition-colors"
          >
            Learn more
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- Navigation Controls -->
    <div class="absolute bottom-10 left-0 right-0 z-20">
      <div class="container mx-auto px-4 flex justify-center">
        <!-- Indicators -->
        <div class="flex space-x-2">
          <button
            v-for="(solution, index) in solutions"
            :key="`indicator-${solution.id}`"
            @click="goToSlide(index)"
            class="w-3 h-3 rounded-full transition-all duration-300 focus:outline-none"
            :class="index === currentIndex ? 'bg-white scale-125' : 'bg-white bg-opacity-50 hover:bg-opacity-75'"
            :aria-label="`Go to slide ${index + 1}`"
          ></button>
        </div>
      </div>
    </div>
    
    <!-- Arrow Navigation -->
    <button 
      @click="prevSlide"
      class="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 text-white p-2 rounded-full bg-black bg-opacity-30 hover:bg-opacity-50 transition-all focus:outline-none"
      aria-label="Previous slide"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
      </svg>
    </button>
    
    <button 
      @click="nextSlide"
      class="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 text-white p-2 rounded-full bg-black bg-opacity-30 hover:bg-opacity-50 transition-all focus:outline-none"
      aria-label="Next slide"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
      </svg>
    </button>
  </section>
</template>

<style scoped>
.slide-content {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
</style> 