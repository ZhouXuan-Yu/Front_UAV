<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface Props {
  title?: string;
  description?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Skydio in action',
  description: ''
});

interface SuccessStory {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  source: string;
  hasVideo: boolean;
  link: string;
  logo?: string;
}

const successStories = ref<SuccessStory[]>([
  {
    id: 'police1',
    title: 'Big wins propel big growth in Florida agency\'s drone program',
    subtitle: 'Police1',
    description: 'Pasco County\'s use has grown dramatically as personnel find new missions and benefits',
    image: 'https://ext.same-assets.com/913537297/3416323236.png', 
    source: 'Police1',
    hasVideo: false,
    link: '/success-stories/police1',
    logo: 'https://static.vecteezy.com/system/resources/previews/010/994/451/original/police-badge-icon-sign-symbol-design-free-png.png'
  },
  {
    id: 'wkyc',
    title: 'Drone video shows man stuck in chimney while allegedly trying to get inside Minority Behavioral Health Group in Akron',
    subtitle: 'wkyc',
    description: 'The Akron Fire Department was called to the scene where it took several hours to remove him from the chimney.',
    image: 'https://ext.same-assets.com/913537297/1121177740.png',
    source: 'wkyc',
    hasVideo: true,
    link: '/success-stories/wkyc',
    logo: 'https://pbs.twimg.com/profile_images/1204542354578219008/2Zdwg2QR_400x400.jpg'
  },
  {
    id: 'fortcarson',
    title: 'Eyes in the Sky, Firepower on Point 🚁 🔥',
    subtitle: '4th Infantry Division, Fort Carson',
    description: 'Soldiers from the 2nd Battalion, 77th Field Artillery Regiment put on a show of precision firepower during Exercise Steel Avalanche, and this time, they had a little help from above.',
    image: 'https://ext.same-assets.com/913537297/145035404.jpeg',
    source: '4th Infantry Division, Fort Carson',
    hasVideo: false,
    link: '/success-stories/fort-carson',
    logo: '🪖'
  },
  {
    id: 'joesullivan',
    title: 'It\'s another Well Done Wednesday, and we want to commend our officers for their excellent work.',
    subtitle: 'Joe Sullivan',
    description: 'Watch this video as officers utilize drones and our K9 unit to track and apprehend suspects fleeing after a traffic stop. You\'ll see how precise coordination leads to swift results.',
    image: 'https://ext.same-assets.com/913537297/3416323236.png',
    source: 'Joe Sullivan',
    hasVideo: true,
    link: '/success-stories/joe-sullivan',
    logo: 'https://static.vecteezy.com/system/resources/previews/010/994/451/original/police-badge-icon-sign-symbol-design-free-png.png'
  },
  {
    id: 'wpbf',
    title: 'Port St. Lucie police once again use drones to help improve traffic flow outside Clover Park',
    subtitle: 'WPBF 25 News',
    description: 'Port St. Lucie police once again use drones to help improve traffic flow outside Clover Park',
    image: 'https://ext.same-assets.com/913537297/1121177740.png',
    source: 'WPBF 25 News',
    hasVideo: true,
    link: '/success-stories/wpbf',
    logo: 'https://pbs.twimg.com/profile_images/1239926494677553153/AdpvZdXT_400x400.png'
  },
  {
    id: 'ryancoon',
    title: 'After Hurricane #Helene made landfall, I saw an opportunity to flex the Skydio X10\'s night flying capabilities in full force.',
    subtitle: 'Ryan Coon',
    description: 'After Hurricane #Helene made landfall, I saw an opportunity to flex the Skydio X10\'s night flying capabilities in full force, assessing damage to powerlines throughout Ohio, West Virginia, and Virginia at NIGHT.',
    image: 'https://ext.same-assets.com/913537297/145035404.jpeg',
    source: 'Ryan Coon',
    hasVideo: false,
    link: '/success-stories/ryan-coon',
    logo: 'https://cdn-icons-png.flaticon.com/512/3135/3135768.png'
  },
  {
    id: 'nypd',
    title: 'Your NYPD is leveraging drone technology to assist in the apprehension of subway surfers.',
    subtitle: 'Kaz Daughtry',
    description: 'This innovative technology has given your officers a vital edge and every apprehension is possibly another life saved.',
    image: 'https://ext.same-assets.com/913537297/3416323236.png',
    source: 'Kaz Daughtry',
    hasVideo: false,
    link: '/success-stories/nypd',
    logo: '👮'
  },
  {
    id: 'hamilton',
    title: '👏 @Hamilton County, Ohio Sheriff\'s Office is taking crime fighting to new heights!',
    subtitle: 'Skydio',
    description: 'First in the state of Ohio to use Drone as First Responder (DFR) technology, Hamilton County\'s Lt. Steve Sabers just unveiled their new Real-Time Operations Center.',
    image: 'https://ext.same-assets.com/913537297/1121177740.png',
    source: 'Skydio',
    hasVideo: true,
    link: '/success-stories/hamilton',
    logo: 'https://skydio.com/wp-content/uploads/2023/09/skydio-logo-icon.svg'
  }
]);

const currentIndex = ref(0);
const isTransitioning = ref(false);
const visibleItems = ref(4);

const displayedStories = computed(() => {
  const startIndex = currentIndex.value;
  const endIndex = Math.min(startIndex + visibleItems.value, successStories.value.length);
  return successStories.value.slice(startIndex, endIndex);
});

const hasNext = computed(() => {
  return currentIndex.value + visibleItems.value < successStories.value.length;
});

const hasPrev = computed(() => {
  return currentIndex.value > 0;
});

const goToNext = () => {
  if (hasNext.value && !isTransitioning.value) {
    isTransitioning.value = true;
    currentIndex.value++;
    setTimeout(() => {
      isTransitioning.value = false;
    }, 500);
  }
};

const goToPrev = () => {
  if (hasPrev.value && !isTransitioning.value) {
    isTransitioning.value = true;
    currentIndex.value--;
    setTimeout(() => {
      isTransitioning.value = false;
    }, 500);
  }
};

const adjustVisibleItems = () => {
  const width = window.innerWidth;
  if (width < 640) {
    visibleItems.value = 1;
  } else if (width < 1024) {
    visibleItems.value = 2;
  } else if (width < 1280) {
    visibleItems.value = 3;
  } else {
    visibleItems.value = 4;
  }
};

onMounted(() => {
  adjustVisibleItems();
  window.addEventListener('resize', adjustVisibleItems);
});
</script>

<template>
  <section class="success-stories-section">
    <div class="container">
      <div class="section-header">
        <div class="title-container">
          <h2 class="section-title">{{ props.title }}</h2>
          <p v-if="props.description" class="section-description">{{ props.description }}</p>
        </div>
        <div class="navigation-buttons">
          <button 
            class="nav-button prev" 
            :disabled="!hasPrev" 
            @click="goToPrev"
            aria-label="Previous stories"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button 
            class="nav-button next" 
            :disabled="!hasNext" 
            @click="goToNext"
            aria-label="Next stories"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <div class="stories-carousel">
        <div class="stories-wrapper" :style="{ transform: `translateX(-${currentIndex * (100 / visibleItems)}%)` }">
          <div 
            v-for="story in successStories" 
            :key="story.id" 
            class="story-card"
            :style="{ width: `calc(${100 / visibleItems}% - 1.5rem)` }"
          >
            <div class="card-header">
              <div class="source-info">
                <img v-if="story.logo" :src="story.logo" :alt="story.source" class="source-logo" />
                <span class="source-name">{{ story.source }}</span>
              </div>
              <div class="social-links">
                <a href="#" class="social-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="social-icon">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>

            <div class="card-image">
              <img :src="story.image" :alt="story.title" class="story-image" />
              <div v-if="story.hasVideo" class="video-overlay">
                <button class="play-button" aria-label="Play video">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.3)"></circle>
                    <path d="M10 8l6 4-6 4V8z"></path>
                  </svg>
                </button>
              </div>
              <div v-else class="action-badge">
                <span class="badge-text">了解更多</span>
              </div>
            </div>

            <div class="card-content">
              <h3 class="story-title">{{ story.title }}</h3>
              <p class="story-description">{{ story.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.success-stories-section {
  padding: 5rem 0;
  background-color: #f8fafc;
}

.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.title-container {
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.section-description {
  font-size: 1.125rem;
  color: #64748b;
  margin-top: 0.5rem;
}

.navigation-buttons {
  display: flex;
  gap: 0.75rem;
}

.nav-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background-color: white;
  color: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-button:hover {
  background-color: #f1f5f9;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.stories-carousel {
  position: relative;
  overflow: hidden;
  width: 100%;
}

.stories-wrapper {
  display: flex;
  transition: transform 0.5s ease;
  gap: 1.5rem;
}

.story-card {
  flex-shrink: 0;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  height: 100%;
}

.story-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.source-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.source-logo {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.source-name {
  font-weight: 500;
  font-size: 0.875rem;
  color: #4b5563;
}

.social-links {
  display: flex;
  gap: 0.5rem;
}

.social-link {
  color: #6b7280;
  transition: color 0.2s ease;
}

.social-link:hover {
  color: #3b82f6;
}

.social-icon {
  width: 20px;
  height: 20px;
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.story-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.story-card:hover .story-image {
  transform: scale(1.05);
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4));
}

.play-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.play-button:hover {
  transform: scale(1.1);
}

.action-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background-color: #3b82f6;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
}

.card-content {
  padding: 1.25rem;
}

.story-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin-top: 0;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 1.4;
}

.story-description {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  line-height: 1.5;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .section-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 640px) {
  .section-title {
    font-size: 1.5rem;
  }
  
  .card-image {
    height: 180px;
  }
  
  .story-title {
    font-size: 1rem;
  }
}
</style>
