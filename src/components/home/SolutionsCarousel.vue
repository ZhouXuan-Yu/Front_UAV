<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { gsap } from 'gsap';

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
    title: '无人机先遣系统',
    subtitle: '我们保护您，无人机系统更保护您',
    description: '2分钟内快速部署到现场。为任何服务请求提供即时态势感知。更好地协调响应。提高截获率。Skydio为您提供全方位保障。',
    image: 'https://ext.same-assets.com/913537297/3416323236.png',
    link: '/path-planning'
  },
  {
    id: 'utilities',
    title: '公共设施',
    subtitle: '确保电力持续供应',
    description: '减少停机时间，在出现问题时加快服务恢复速度。Skydio帮助您提前预防停电和故障，全部通过您现有的工作人员完成。',
    image: 'https://ext.same-assets.com/913537297/1121177740.png',
    link: '/person-recognition'
  },
  {
    id: 'security',
    title: '国家安全',
    subtitle: '洞察、思考、超越对手',
    description: '通过可靠的小型无人机系统更快、更智能、更安全地收集数据。凭借实时态势感知，您可以按照作战节奏进行调整，确保团队远离危险。',
    image: 'https://ext.same-assets.com/913537297/145035404.jpeg',
    link: '/vehicle-monitoring'
  },
  {
    id: 'inspection',
    title: '资产检查',
    subtitle: '精准检查',
    description: '对关键基础设施进行自动化检查，精确度和细节无与伦比。在问题出现前识别隐患。',
    image: 'https://ext.same-assets.com/913537297/145035404.jpeg',
    link: '/license-plate-recognition'
  },
  {
    id: 'public-safety',
    title: '公共安全',
    subtitle: '更快、更安全地响应',
    description: '通过为执法部门设计的自主无人机解决方案，改善响应时间和人员安全。',
    image: 'https://ext.same-assets.com/913537297/3416323236.png',
    link: '/disaster-detection'
  },
  {
    id: 'mapping',
    title: '测量与绘图',
    subtitle: '精确测绘',
    description: '通过捕捉每一个细节的自主无人机技术，创建任何区域的详细、准确的3D地图。',
    image: 'https://ext.same-assets.com/913537297/1121177740.png',
    link: '/data-dashboard'
  },
  {
    id: 'site-security',
    title: '场地安全',
    subtitle: '自动保护周边安全',
    description: '通过自主无人机巡逻自动化周边安全，实时检测并响应威胁。',
    image: 'https://ext.same-assets.com/913537297/145035404.jpeg',
    link: '/knowledge-graph'
  }
]);

const currentIndex = ref(0);
const isTransitioning = ref(false);
const carouselRef = ref<HTMLElement | null>(null);
const lastScrollY = ref(0);
const scrollThreshold = 50; // 触发幻灯片切换所需的滚动像素数
const wheelTimeout = ref<number | null>(null);
const wheelCount = ref(0);
const reachedEnd = ref(false);

// 发射事件通知父组件滚动到下一部分
const emit = defineEmits(['scrollToNext']);

const changeSlide = (direction: 'next' | 'prev'): void => {
  if (isTransitioning.value) return;
  
  // 如果已经到最后一张且往下滚动，则滚动到下一个部分
  if (direction === 'next' && currentIndex.value === solutions.value.length - 1) {
    scrollToNextSection();
    return;
  }
  
  // 如果已经是第一张且往上滚动，则不做任何操作
  if (direction === 'prev' && currentIndex.value === 0) {
    return;
  }
  
  isTransitioning.value = true;
  const newIndex = direction === 'next' 
    ? currentIndex.value + 1
    : currentIndex.value - 1;
  
  // Y轴过渡动画，实现垂直滚动效果
  const yOffset = direction === 'next' ? 100 : -100;
  
  gsap.to('.slide-content', {
    opacity: 0,
    y: -yOffset,
    duration: 0.5,
    onComplete: () => {
      currentIndex.value = newIndex;
      // 检查是否到达最后一张
      reachedEnd.value = newIndex === solutions.value.length - 1;
      
      gsap.fromTo('.slide-content', 
        { opacity: 0, y: yOffset },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5,
          onComplete: () => {
            isTransitioning.value = false;
          }
        }
      );
    }
  });
  
  // 淡出当前背景图片
  gsap.to(`.solution-bg-${currentIndex.value}`, {
    opacity: 0,
    duration: 0.8,
  });
  
  // 淡入新的背景图片
  gsap.to(`.solution-bg-${newIndex}`, {
    opacity: 1,
    duration: 0.8
  });
};

const nextSlide = (): void => changeSlide('next');
const prevSlide = (): void => changeSlide('prev');

// 滚动到指定幻灯片
const goToSlide = (index: number): void => {
  if (isTransitioning.value || index === currentIndex.value) return;
  
  isTransitioning.value = true;
  const direction = index > currentIndex.value ? 'next' : 'prev';
  const yOffset = direction === 'next' ? 100 : -100;
  
  gsap.to('.slide-content', {
    opacity: 0,
    y: -yOffset,
    duration: 0.5,
    onComplete: () => {
      currentIndex.value = index;
      // 检查是否到达最后一张
      reachedEnd.value = index === solutions.value.length - 1;
      
      gsap.fromTo('.slide-content', 
        { opacity: 0, y: yOffset },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5,
          onComplete: () => {
            isTransitioning.value = false;
          }
        }
      );
    }
  });
  
  // 淡出所有背景，只保留目标背景
  solutions.value.forEach((_, idx) => {
    const opacity = idx === index ? 1 : 0;
    gsap.to(`.solution-bg-${idx}`, {
      opacity,
      duration: 0.8
    });
  });
};

// 滚动到下一个部分
const scrollToNextSection = (): void => {
  emit('scrollToNext');
  
  // 从视觉上表示正在离开轮播区域
  gsap.to('.slide-content', {
    opacity: 0,
    y: -100,
    duration: 0.5
  });
};

// 处理鼠标滚轮事件
const handleWheel = (e: WheelEvent): void => {
  e.preventDefault();
  
  // 防抖滚轮事件
  if (wheelTimeout.value) {
    clearTimeout(wheelTimeout.value);
    wheelCount.value += 1;
  } else {
    wheelCount.value = 1;
  }
  
  wheelTimeout.value = window.setTimeout(() => {
    if (wheelCount.value > 2) { // 确保是有意的滚动
      if (e.deltaY > 0) {
        // 向下滚动
        if (reachedEnd.value) {
          scrollToNextSection();
        } else {
          nextSlide();
        }
      } else {
        // 向上滚动
        prevSlide();
      }
    }
    wheelCount.value = 0;
    wheelTimeout.value = null;
  }, 50);
};

// 处理触摸开始事件
const handleTouchStart = (e: TouchEvent): void => {
  lastScrollY.value = e.touches[0].clientY;
};

// 处理触摸移动事件
const handleTouchMove = (e: TouchEvent): void => {
  e.preventDefault(); // 防止默认滚动
  const currentY = e.touches[0].clientY;
  const diffY = currentY - lastScrollY.value;
  
  if (Math.abs(diffY) > scrollThreshold) {
    if (diffY < 0) {
      // 向上滑动 (往下翻页)
      if (reachedEnd.value) {
        scrollToNextSection();
      } else {
        nextSlide();
      }
    } else {
      // 向下滑动 (往上翻页)
      prevSlide();
    }
    lastScrollY.value = currentY;
  }
};

onMounted(() => {
  const carousel = carouselRef.value;
  if (carousel) {
    carousel.addEventListener('wheel', handleWheel, { passive: false });
  }
  
  // 键盘导航
  const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      if (reachedEnd.value) {
        scrollToNextSection();
      } else {
        nextSlide();
      }
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      prevSlide();
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  
  // 清理函数
  onUnmounted(() => {
    if (carousel) {
      carousel.removeEventListener('wheel', handleWheel);
    }
    window.removeEventListener('keydown', handleKeyDown);
    if (wheelTimeout.value) {
      clearTimeout(wheelTimeout.value);
    }
  });
});
</script>

<template>
  <section 
    ref="carouselRef"
    class="relative h-screen overflow-hidden"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
  >
    <!-- 背景图片 -->
    <div class="absolute inset-0 w-full h-full">
      <div 
        v-for="(solution, index) in solutions" 
        :key="`bg-${solution.id}`"
        :class="`solution-bg-${index} absolute inset-0 w-full h-full transition-opacity duration-1000`"
        :style="{ opacity: index === currentIndex ? 1 : 0, zIndex: index === currentIndex ? 10 : 0 }"
      >
        <img 
          :src="solution.image" 
          :alt="solution.title" 
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>
    </div>
    
    <!-- 内容 -->
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
            了解更多
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- 导航控件 - 垂直滚动指示器 -->
    <div class="absolute bottom-10 right-10 z-20">
      <div class="flex flex-col space-y-2">
        <button
          v-for="(solution, index) in solutions"
          :key="`indicator-${solution.id}`"
          @click="goToSlide(index)"
          class="w-3 h-3 rounded-full transition-all duration-300 focus:outline-none"
          :class="index === currentIndex ? 'bg-white scale-125' : 'bg-white bg-opacity-50 hover:bg-opacity-75'"
          :aria-label="`前往幻灯片 ${index + 1}`"
        ></button>
      </div>
    </div>
    
    <!-- 滚动指示器 -->
    <div class="absolute left-1/2 transform -translate-x-1/2 bottom-10 z-20 flex flex-col items-center">
      <span class="text-white text-sm mb-2">滚动探索更多</span>
      <div class="w-6 h-10 border-2 border-white rounded-full flex justify-center p-1">
        <div 
          class="w-1 h-2 bg-white rounded-full animate-bounce-slow" 
          style="animation-duration: 1.5s;"
        ></div>
      </div>
    </div>
    
    <!-- 下一页指示器 -->
    <div 
      v-if="reachedEnd" 
      class="absolute left-1/2 transform -translate-x-1/2 bottom-4 z-20 text-white text-center"
    >
      <p class="text-sm mb-1">继续滚动查看下一部分</p>
      <svg class="w-6 h-6 mx-auto animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
      </svg>
    </div>
  </section>
</template>

<style scoped>
.slide-content {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(100%);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 1.5s infinite;
}
</style> 