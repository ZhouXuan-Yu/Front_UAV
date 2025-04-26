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
    id: 'multimodal',
    title: '多模态融合感知，驱动低空经济智能监测升级',
    description: '融合可见光与热成像数据，结合深度学习模型实现复杂环境下小目标检测与识别，为低空经济活动提供全天候智能监测，提升安全性与效率，完美契合国家低空经济智能化发展政策。',
    image: '/src/assets/images/image.png',
    source: '空融智链',
    logo: '🛸',
    hasVideo: false,
    socialIcon: 'comment',
    route: '/features/multimodal',
    date: '2023-05-15'
  },
  {
    id: 'deeplearning',
    title: '深度学习赋能的精准识别，拓展低空经济应用场景',
    description: '利用多模型特征融合及深度学习算法，精准识别图像中的关键目标，为安防监控、人员管理等场景提供高效智能解决方案，拓展低空经济应用范围，符合国家对无人机技术智能化发展方向。',
    image: '/src/assets/images/image.png',
    source: '智眸千析',
    logo: '🧠',
    hasVideo: false,
    socialIcon: 'comment',
    route: '/features/deeplearning',
    date: '2023-05-15'
  },
  {
    id: 'decision',
    title: '低空智能决策支持，助力低空经济智慧运营',
    description: '借助知识图谱与语义理解技术，整合低空经济专业知识，实现智能问答与决策支持，为无人机任务规划与低空经济运营管理提供精准建议，推动低空经济向智能化方向发展。',
    image: '/src/assets/images/image.png',
    source: '智慧知库',
    logo: '📊',
    hasVideo: false,
    socialIcon: 'linkedin',
    route: '/features/decision',
    date: '2023-05-15'
  },
  {
    id: 'collaboration',
    title: '低空智能体协同作业，构建低空经济产业生态',
    description: '实现无人机与其他智能体在低空环境中的协同作业，形成低空智能体生态系统，优化配送路线，提升整体物流效率，为低空经济产业发展注入新动力。',
    image: '/src/assets/images/image.png',
    source: '智航监控',
    logo: '🚁',
    hasVideo: true,
    socialIcon: 'linkedin',
    route: '/features/collaboration',
    date: '2023-05-15'
  },
  {
    id: 'disaster',
    title: '智能灾害预警，守护低空经济安全防线',
    description: '基于无人机航拍图像和深度学习模型，快速精准定位火灾、洪水等自然灾害区域，提升灾害响应速度，减少低空经济活动中的风险，保障人民生命财产安全，符合国家加强低空经济应急管理要求。',
    image: '/src/assets/images/image.png',
    source: '灾害预警系统',
    logo: '🔥',
    hasVideo: true,
    socialIcon: 'youtube',
    route: '/features/disaster',
    date: '2023-05-15'
  },
  {
    id: 'lowlight',
    title: '暗光增强与夜间行为识别',
    description: '通过深度学习分类算法，精准识别夜间场景中的人类行为，结合自适应增强算法和噪声抑制技术，提高夜间监控质量，当检测到危险行为时自动触发报警系统，提升夜间安全监管能力。',
    image: '/src/assets/images/image.png',
    source: '暗光增强系统',
    logo: '🌙',
    hasVideo: false,
    socialIcon: 'linkedin',
    route: '/features/lowlight',
    date: '2023-05-15'
  },
  {
    id: 'thermal',
    title: '热感探测与超远距离识别',
    description: '集成可见光和热成像双模态数据，专注于小目标检测与识别，通过多模态特征融合和跨模态匹配算法，实现恶劣环境和夜间条件下的高精度目标识别，有效解决传统方法对微小目标检测不足的问题。',
    image: '/src/assets/images/image.png',
    source: '热感探测系统',
    logo: '🔍',
    hasVideo: false,
    socialIcon: 'linkedin',
    route: '/features/thermal',
    date: '2023-05-15'
  },
  {
    id: 'license',
    title: '车牌监控与智能报警系统',
    description: '基于深度学习的车辆与车牌检测识别系统，采用级联检测架构和角点定位技术，实现车型识别、车牌定位和字符识别全流程，支持多种车牌类型识别，适应不同角度、光照条件下的车牌捕获与解析。',
    image: '/src/assets/images/image.png',
    source: '车牌监控系统',
    logo: '🚗',
    hasVideo: true,
    socialIcon: 'comment',
    route: '/features/license',
    date: '2023-05-15'
  },
]);

// 将currentPage改为currentIndex，表示当前第一个可见卡片的索引
const currentIndex = ref<number>(0);
const cardsPerPage = 3; // 一次显示3个卡片
const totalCards = computed(() => actionCards.value.length);
const totalSlides = computed(() => actionCards.value.length);

// 添加方向控制
const direction = ref<'forward' | 'backward'>('forward');

// 获取当前页面应该显示的卡片
const currentPageCards = computed(() => {
  const start = currentIndex.value;
  const end = start + cardsPerPage;
  return actionCards.value.slice(start, end);
});

// 修改为每次只移动一个卡片，并且在到达边界时改变方向
const nextSlide = () => {
  if (direction.value === 'forward') {
    // 向前滚动
    if (currentIndex.value < totalCards.value - 1) {
      currentIndex.value++;
      // 如果到达最后一个卡片，改变方向
      if (currentIndex.value === totalCards.value - 1) {
        direction.value = 'backward';
      }
    }
  } else {
    // 向后滚动
    if (currentIndex.value > 0) {
      currentIndex.value--;
      // 如果到达第一个卡片，改变方向
      if (currentIndex.value === 0) {
        direction.value = 'forward';
      }
    }
  }
};

// 修改为每次只移动一个卡片，并且在到达边界时改变方向
const prevSlide = () => {
  if (direction.value === 'forward') {
    // 当前是向前方向，改为向后
    if (currentIndex.value > 0) {
      currentIndex.value--;
    } else {
      // 到达第一个，改变方向
      direction.value = 'backward';
      currentIndex.value = 1; // 移到第二个，因为方向变了，下次会再次移回第一个
    }
  } else {
    // 当前是向后方向，改为向前
    if (currentIndex.value < totalCards.value - 1) {
      currentIndex.value++;
    } else {
      // 到达最后一个，改变方向
      direction.value = 'forward';
      currentIndex.value = totalCards.value - 2; // 移到倒数第二个
    }
  }
};

// 导航到卡片对应的路由
const navigateToCard = (card: ActionCard) => {
  if (card.route) {
    router.push(card.route);
  }
};

// 自动轮播
let autoplayInterval: number | null = null;

const startAutoplay = () => {
  if (autoplayInterval) clearInterval(autoplayInterval);
  autoplayInterval = window.setInterval(() => {
    nextSlide();
  }, 6000); // 6秒切换一次
};

const stopAutoplay = () => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval);
    autoplayInterval = null;
  }
};

onMounted(() => {
  startAutoplay();
});

onBeforeUnmount(() => {
  stopAutoplay();
});
</script>

<template>
  <section class="action-cards-section py-24 px-12 relative overflow-hidden">
      <div class="container mx-auto max-w-15xl px-12">
      <h2 class="text-4xl md:text-5xl font-bold text-center mb-16">资源与应用案例</h2>
      
      <div class="carousel-container relative">
        <!-- 左右箭头导航 -->
        <button 
          @click="prevSlide" 
          class="carousel-arrow prev z-20"
        >
          <span class="sr-only">上一个</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <!-- 卡片组 -->
        <div class="cards-container relative overflow-hidden min-h-[650px]">
          <div 
            class="cards-wrapper flex transition-all duration-700 ease-in-out" 
            :style="{transform: `translateX(-${(currentIndex * 100 / cardsPerPage)}%)`}"
          >
            <div 
              v-for="(card, index) in actionCards" 
              :key="card.id"
              class="card-slide w-full md:w-1/3 px-4 flex-shrink-0"
            >
              <div 
                class="card-inner h-full bg-white rounded-xl shadow-xl overflow-hidden transform transition-all duration-500 hover:translate-y-[-10px] hover:shadow-2xl cursor-pointer"
                @click="navigateToCard(card)"
              >
                <div class="card-image h-72 relative overflow-hidden">
                  <img :src="card.image" :alt="card.title" class="w-full h-full object-cover transition-transform duration-700 hover:scale-110">
                  <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                  <div class="card-badge absolute top-4 right-4 bg-sky-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                    {{ card.source }}
                  </div>
                </div>
                
                <div class="card-content p-8">
                  <h3 class="card-title text-2xl font-bold mb-4 text-gray-800 line-clamp-2">{{ card.title }}</h3>
                  <p class="card-description text-gray-600 text-base mb-4 line-clamp-4">{{ card.description }}</p>
                  
                  <div class="card-footer flex items-center justify-end">
                    <span class="text-gray-400 text-sm">{{ card.date }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右箭头 -->
        <button 
          @click="nextSlide" 
          class="carousel-arrow next z-20"
        >
          <span class="sr-only">下一个</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.action-cards-section {
  background-color: rgb(255, 255, 255);
  background-image: none;
}

.carousel-container {
  position: relative;
  overflow: hidden;
  margin: 0 auto;
  padding: 0 60px; /* 为箭头留出空间 */
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: white;
  color: #334155;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
}

.carousel-arrow:hover {
  background-color: #f0f9ff;
  color: #0284c7;
  transform: translateY(-50%) scale(1.1);
}

.prev {
  left: 0px;
}

.next {
  right: 0px;
}

.card-inner {
  border: 1px solid rgba(226, 232, 240, 0.8);
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.card-inner:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.line-clamp-4 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}

@media (max-width: 768px) {
  .prev {
    left: 10px;
  }
  
  .next {
    right: 10px;
  }
}
</style> 