<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick, onBeforeUnmount, watchEffect } from 'vue';
import { useWindowSize } from '@vueuse/core';
import { useRouter } from 'vue-router';

interface ActionCard {
  id: string;
  title: string;
  description: string;
  image: string;
  source: string;
  logo?: string;
  hasVideo: boolean;
  socialIcon: string;
  route?: string;
  date: string;
}

const router = useRouter();
const actionCards = ref<ActionCard[]>([
  {
    id: 'police1',
    title: 'Big wins propel big growth in Florida agency\'s drone program',
    description: 'Pasco County\'s use has grown dramatically as personnel find new missions and benefits',
    image: 'https://ext.same-assets.com/913537297/3416323236.png', 
    source: 'Police1',
    logo: 'https://static.vecteezy.com/system/resources/previews/010/994/451/original/police-badge-icon-sign-symbol-design-free-png.png',
    hasVideo: false,
    socialIcon: 'comment',
    route: '/police1',
    date: '2023-05-15'
  },
  {
    id: 'wkyc',
    title: 'Drone video shows man stuck in chimney while allegedly trying to get inside Minority Behavioral Health Group in Akron',
    description: 'The Akron Fire Department was called to the scene where it took several hours to remove him from the chimney.',
    image: 'https://ext.same-assets.com/913537297/1121177740.png',
    source: 'wkyc',
    logo: 'https://pbs.twimg.com/profile_images/1204542354578219008/2Zdwg2QR_400x400.jpg',
    hasVideo: true,
    socialIcon: 'comment',
    route: '/wkyc',
    date: '2023-05-15'
  },
  {
    id: 'fortcarson',
    title: 'Eyes in the Sky, Firepower on Point 🚁 🔥',
    description: 'Soldiers from the 2nd Battalion, 77th Field Artillery Regiment put on a show of precision firepower during Exercise Steel Avalanche.',
    image: 'https://ext.same-assets.com/913537297/145035404.jpeg',
    source: '4th Infantry Division, Fort Carson',
    logo: '🪖',
    hasVideo: false,
    socialIcon: 'linkedin',
    route: '/fortcarson',
    date: '2023-05-15'
  },
  {
    id: 'joesullivan',
    title: 'It\'s another Well Done Wednesday, and we want to commend our officers for their excellent work.',
    description: 'Watch this video as officers utilize drones and our K9 unit to track and apprehend suspects fleeing after a traffic stop.',
    image: 'https://ext.same-assets.com/913537297/3416323236.png',
    source: 'Joe Sullivan',
    logo: '👮',
    hasVideo: true,
    socialIcon: 'linkedin',
    route: '/joesullivan',
    date: '2023-05-15'
  },
  {
    id: 'wpbf',
    title: 'Port St. Lucie police once again use drones to help improve traffic flow outside Clover Park',
    description: 'Port St. Lucie police once again use drones to help improve traffic flow outside Clover Park',
    image: 'https://ext.same-assets.com/913537297/1121177740.png',
    source: 'WPBF 25 News',
    logo: 'https://pbs.twimg.com/profile_images/1239926494677553153/AdpvZdXT_400x400.png',
    hasVideo: true,
    socialIcon: 'youtube',
    route: '/wpbf',
    date: '2023-05-15'
  },
  {
    id: 'ryancoon',
    title: 'After Hurricane #Helene made landfall, I saw an opportunity to flex the Skydio X10\'s night flying capabilities in full force.',
    description: 'After Hurricane #Helene made landfall, I saw an opportunity to flex the Skydio X10\'s night flying capabilities.',
    image: 'https://ext.same-assets.com/913537297/145035404.jpeg',
    source: 'Ryan Coon',
    logo: 'https://cdn-icons-png.flaticon.com/512/3135/3135768.png',
    hasVideo: false,
    socialIcon: 'linkedin',
    route: '/ryancoon',
    date: '2023-05-15'
  },
  {
    id: 'nypd',
    title: 'Your NYPD is leveraging drone technology to assist in the apprehension of subway surfers.',
    description: 'This innovative technology has given your officers a vital edge and every apprehension is possibly another life saved.',
    image: 'https://ext.same-assets.com/913537297/3416323236.png',
    source: 'Kaz Daughtry',
    logo: '👮',
    hasVideo: false,
    socialIcon: 'linkedin',
    route: '/nypd',
    date: '2023-05-15'
  },
  {
    id: 'card8',
    title: '汉密尔顿警察局无人机项目的运作方式',
    description: '了解汉密尔顿警方如何构建并运行他们的无人机项目，以及Skydio如何帮助他们提高效率。',
    image: 'https://images.unsplash.com/photo-1597085916520-5d3c7a1d30e7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
    source: '汉密尔顿警察局',
    logo: 'https://static.vecteezy.com/system/resources/previews/010/994/451/original/police-badge-icon-sign-symbol-design-free-png.png',
    hasVideo: true,
    socialIcon: 'linkedin',
    route: '/hamilton',
    date: '2023-05-15'
  },
]);

const currentIndex = ref(0);
const isAnimating = ref(false);
const visibleItems = computed(() => {
  const { width: windowWidth } = useWindowSize();
  if (windowWidth.value < 640) return 1;      // 移动设备
  if (windowWidth.value < 1024) return 2;     // 平板
  if (windowWidth.value < 1280) return 3;     // 小型桌面
  return 4;                                   // 大型桌面
});

const totalCards = computed(() => actionCards.value.length);
const totalPages = computed(() => Math.ceil(totalCards.value / visibleItems.value));
const activePage = computed(() => Math.floor(currentIndex.value / visibleItems.value));

const cardPositions = ref<number[]>([]);

const initializeCardPositions = () => {
  const positions: number[] = [];
  for (let i = 0; i < totalCards.value; i++) {
    // 计算每张卡片的初始位置
    if (i < visibleItems.value) {
      positions.push(i * 100); // 可见卡片均匀分布
    } else {
      positions.push(100 * visibleItems.value); // 不可见卡片放在右侧
    }
  }
  cardPositions.value = positions;
};

watchEffect(() => {
  if (visibleItems.value > 0) {
    initializeCardPositions();
    // 确保currentIndex不超出有效范围
    if (currentIndex.value >= totalCards.value) {
      currentIndex.value = 0;
    }
  }
});

const handleNext = () => {
  if (isAnimating.value) return;
  isAnimating.value = true;
  
  const nextIndex = (currentIndex.value + visibleItems.value) % totalCards.value;
  currentIndex.value = nextIndex;
  
  // 更新所有卡片的位置
  updateCardPositions();
  
  setTimeout(() => {
    isAnimating.value = false;
  }, 500); // 动画持续时间
};

const handlePrev = () => {
  if (isAnimating.value) return;
  isAnimating.value = true;
  
  const prevIndex = (currentIndex.value - visibleItems.value + totalCards.value) % totalCards.value;
  currentIndex.value = prevIndex;
  
  // 更新所有卡片的位置
  updateCardPositions();
  
  setTimeout(() => {
    isAnimating.value = false;
  }, 500); // 动画持续时间
};

const updateCardPositions = () => {
  const newPositions = [...cardPositions.value];
  for (let i = 0; i < totalCards.value; i++) {
    const relativeIndex = (i - currentIndex.value + totalCards.value) % totalCards.value;
    if (relativeIndex < visibleItems.value) {
      newPositions[i] = relativeIndex * 100; // 可见卡片均匀分布
    } else {
      newPositions[i] = 100 * visibleItems.value; // 不可见卡片放在右侧
    }
  }
  cardPositions.value = newPositions;
};

const goToPage = (pageIndex: number) => {
  if (isAnimating.value) return;
  isAnimating.value = true;
  
  currentIndex.value = pageIndex * visibleItems.value;
  
  // 更新所有卡片的位置
  updateCardPositions();
  
  setTimeout(() => {
    isAnimating.value = false;
  }, 500); // 动画持续时间
};

const handleCardClick = (card: ActionCard) => {
  if (card.route) {
    router.push(card.route);
  }
};

onMounted(() => {
  initializeCardPositions();
  
  // 设置自动轮播（可选）
  const interval = setInterval(() => {
    handleNext();
  }, 5000); // 每5秒轮播一次
  
  onBeforeUnmount(() => {
    clearInterval(interval);
  });
});

onUnmounted(() => {
  // 清理所有可能的计时器
  if (isAnimating.value) {
    isAnimating.value = false;
  }
  
  window.removeEventListener('resize', () => {
    // 这里可以根据需要重新计算卡片位置
  });
});
</script>

<template>
  <section class="action-cards-section py-16 px-4 relative overflow-hidden">
    <div class="container mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-12">资源与应用案例</h2>
      
      <div class="carousel-container relative">
        <!-- 轮播控制按钮 -->
        <button 
          @click="handlePrev" 
          class="carousel-arrow prev absolute left-0 top-1/2 transform -translate-y-1/2 z-10"
          :disabled="isAnimating"
        >
          <span class="sr-only">上一页</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <!-- 卡片容器 -->
        <div class="cards-wrapper overflow-hidden">
          <div class="cards-track relative h-[400px]">
            <div 
              v-for="(card, index) in actionCards" 
              :key="index"
              class="card absolute top-0 w-full md:w-1/2 lg:w-1/3 xl:w-1/4 transition-all duration-500 cursor-pointer"
              :class="{ 'opacity-0': cardPositions[index] >= 100 * visibleItems }"
              :style="{ 
                transform: `translateX(${cardPositions[index]}%)`,
                zIndex: totalCards - index
              }"
              @click="handleCardClick(card)"
            >
              <div class="card-inner mx-2 bg-white rounded-lg shadow-lg overflow-hidden h-full">
                <div class="card-image h-48 relative overflow-hidden">
                  <img :src="card.image" :alt="card.title" class="w-full h-full object-cover">
                  <div class="card-badge absolute top-3 right-3 bg-sky-600 text-white px-2 py-1 rounded text-xs">
                    {{ card.source }}
                  </div>
                </div>
                <div class="card-content p-4">
                  <h3 class="card-title text-lg font-bold mb-2">{{ card.title }}</h3>
                  <p class="card-description text-gray-700 text-sm mb-4">{{ card.description }}</p>
                  <div class="card-footer flex items-center justify-between">
                    <span class="text-sky-600 text-sm">了解更多</span>
                    <span class="text-gray-500 text-xs">{{ card.date }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 下一页按钮 -->
        <button 
          @click="handleNext" 
          class="carousel-arrow next absolute right-0 top-1/2 transform -translate-y-1/2 z-10"
          :disabled="isAnimating"
        >
          <span class="sr-only">下一页</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        <!-- 页面指示器 -->
        <div class="pagination flex justify-center mt-8">
          <button 
            v-for="i in totalPages" 
            :key="i"
            @click="goToPage(i - 1)"
            class="pagination-dot mx-1 w-3 h-3 rounded-full"
            :class="activePage === (i - 1) ? 'bg-sky-600' : 'bg-gray-300'"
          ></button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 轮播控制按钮样式 */
.carousel-arrow {
  @apply bg-white bg-opacity-80 p-2 rounded-full shadow-md text-gray-800 hover:bg-opacity-100 transition-all duration-300;
}

.carousel-arrow:disabled {
  @apply opacity-50 cursor-not-allowed;
}

/* 卡片动画和样式 */
.card {
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.card:hover .card-inner {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.card-inner {
  transition: all 0.3s ease;
}

/* 确保轮播区域有足够的高度 */
.cards-wrapper {
  min-height: 450px;
}

@media (max-width: 768px) {
  .cards-wrapper {
    min-height: 400px;
  }
}
</style> 