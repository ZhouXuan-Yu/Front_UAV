<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, shallowRef } from 'vue';

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
    id: 'multi-modal',
    title: '多模态融合感知',
    subtitle: '我们守护你，智能监测更守护你',
    description: '融合可见光与热成像数据，在复杂环境下实现小目标快速检测与识别。为低空经济活动提供全天候监测，确保安全与效率。',
    image: '@/assets/images/data-dashboard-image.svg',
    link: '/data-dashboard'
  },
  {
    id: 'deep-learning',
    title: '深度学习赋能',
    subtitle: '你看见所有，智眸千析看见细节',
    description: '利用多模型特征融合及深度学习算法，精准识别图像中的关键目标，为安防监控提供智能分析，实现高效精确的特征提取。',
    image: '@/assets/images/person-recognition-image.svg',
    link: '/person-recognition'
  },
  {
    id: 'smart-decision',
    title: '低空智能决策',
    subtitle: '你思考决策，智慧知库思考更快',
    description: '借助知识图谱与语义理解技术，整合低空经济专业知识，实现智能问答与高效决策支持，让每个行动都有智能辅助。',
    image: '@/assets/images/smart-navigation-image.svg',
    link: '/knowledge-graph'
  },
  {
    id: 'smart-navigation',
    title: '多策略路径规划',
    subtitle: '你选择路径，智程导航选择最优解',
    description: '结合多种算法策略，实现无人机在复杂环境下的智能路径规划，提高低空飞行安全性与效率，让每次飞行都精准可靠。',
    image: '@/assets/images/smart-navigation-image.svg',
    link: '/path-planning'
  },
  {
    id: 'disaster-warning',
    title: '智能灾害预警',
    subtitle: '你保护世界，灾害预警保护你',
    description: '基于无人机航拍图像和深度学习模型，快速精准地检测火灾、洪水等自然灾害，为低空经济活动构筑坚实的安全防线。',
    image: 'https://ext.same-assets.com/913537297/145035404.jpeg',
    link: '/disaster-detection'
  }
]);

const currentIndex = ref(0);
const isTransitioning = ref(false);
const isScrollingDown = ref(false);
const isLastSlide = computed(() => currentIndex.value === solutions.value.length - 1);
const isHovering = ref(false);
const carouselExpanded = ref(false);
const mousePosition = ref({ x: 0, y: 0 });
const isCarouselVisible = ref(false);
const shouldAutoExpand = ref(false);
const placeholderActive = ref(false);

// 定义事件发射
const emit = defineEmits(['scrollToNext']);

// 滚动锁定和解锁防抖
const lockScroll = () => {
  // 不锁定屏幕，仅更新状态
  isScrollingLocked.value = true;
  // 不再设置 overflow 和 height
};

const unlockScroll = () => {
  // 不再需要解锁，仅更新状态
  isScrollingLocked.value = false;
};

// 添加锁定标志
const isScrollingLocked = ref(false);

// 添加类型声明
const carouselRef = shallowRef<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

// 监测组件容器相对于视口的位置
const setupIntersectionObserver = () => {
  if (typeof window.IntersectionObserver === 'undefined') {
    // 降级处理，如果不支持IntersectionObserver
    isCarouselVisible.value = true;
    shouldAutoExpand.value = true;
    return;
  }
  
  observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    
    // 确保组件可见性稳定
    if (entry.isIntersecting) {
      // 元素进入视口
      isCarouselVisible.value = true;
      
      // 元素在视口中展开的条件：当可见区域超过40%时
      if (entry.intersectionRatio > 0.4) {
        // 使用setTimeout避免频繁状态变化
        if (!shouldAutoExpand.value) {
          setTimeout(() => {
            shouldAutoExpand.value = true;
          }, 100);
        }
      }
    } else {
      // 当元素完全离开视口时才设置为不可见
      if (entry.intersectionRatio === 0) {
        // 延迟设置不可见，以避免闪烁
        setTimeout(() => {
          if (!isHovering.value) {
            isCarouselVisible.value = false;
            shouldAutoExpand.value = false;
          }
        }, 300);
      }
    }
  }, {
    // 设置多个阈值以获得更平滑的过渡
    threshold: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
    // 设置rootMargin使得元素在即将进入视口前就开始准备
    rootMargin: '10% 0px 10% 0px'
  });
};

// 修改watch函数，不再锁定滚动
watch(shouldAutoExpand, (newValue) => {
  if (newValue) {
    // 当轮播图自动扩展时，避免重置状态
    if (!carouselExpanded.value) {
      // 使用RAF确保动画流畅
      requestAnimationFrame(() => {
        // 标记需要扩展
        carouselExpanded.value = true;
        placeholderActive.value = true;
        
        // 获取元素并确保从中心开始扩展
        const carousel = document.querySelector('.fullscreen-carousel');
        if (carousel && carousel instanceof HTMLElement) {
          // 应用CSS自定义属性进行平滑扩展
          carousel.style.setProperty('--initial-width', `${carousel.offsetWidth}px`);
          carousel.style.setProperty('--initial-height', `${carousel.offsetHeight}px`);
        }
      });
    }
  } else {
    // 当轮播图需要收起时，只有鼠标不在上面时才收起
    if (!isHovering.value) {
      // 延迟收起，避免抖动
      setTimeout(() => {
        if (!shouldAutoExpand.value && !isHovering.value) {
          carouselExpanded.value = false;
          
          // 确保占位符移除平滑
          setTimeout(() => {
            if (!carouselExpanded.value) {
              placeholderActive.value = false;
            }
          }, 2500); // 与过渡时间一致
        }
      }, 300);
    }
  }
});

// 处理鼠标移入移出事件
const handleMouseEnter = () => {
  isHovering.value = true;
  // 只有在不处于自动扩展状态时，才通过鼠标hover触发扩展
  if (!shouldAutoExpand.value) {
    setTimeout(() => {
      if (isHovering.value) {
        carouselExpanded.value = true;
      }
    }, 300);
  }
};

const handleMouseLeave = () => {
  isHovering.value = false;
  // 只有在不处于自动扩展状态时，才通过鼠标离开触发收缩
  if (!shouldAutoExpand.value) {
    carouselExpanded.value = false;
  }
};

// 追踪鼠标位置
const handleMouseMove = (e: MouseEvent) => {
  mousePosition.value = {
    x: e.clientX,
    y: e.clientY
  };
};

// 处理键盘事件
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    nextSolution();
  } else if (e.key === 'ArrowUp') {
    prevSolution();
  }
};

// 处理滚轮事件
let lastScrollTime = 0;
const scrollThreshold = 2000; // 增加滚动阈值，防止过快触发

const handleWheel = (e: Event) => {
  const wheelEvent = e as WheelEvent;
  
  // 如果鼠标不在轮播上，不处理滚轮事件
  if (!isHovering.value) return;
  
  // 防止短时间内多次滚动，增加间隔防止频繁切换
  if (Date.now() - lastScrollTime < scrollThreshold) return;
  
  // 防止轻微滚动触发切换
  if (Math.abs(wheelEvent.deltaY) < 50) return;
  
  // 阻止默认滚动行为和事件冒泡
  wheelEvent.preventDefault();
  wheelEvent.stopPropagation();
  
  lastScrollTime = Date.now();
  
  // 使用deltaY判断滚动方向
  if (wheelEvent.deltaY > 0) {
    nextSolution();
  } else {
    prevSolution();
  }
};

// 实现滚动到按钮文本
const scrollHintText = ref('继续向下滚动');
const navUpLabel = ref('上一个解决方案');
const navDownLabel = ref('下一个解决方案');
const moreButtonText = ref('了解更多');

// 切换到下一个解决方案
const nextSolution = () => {
  if (isTransitioning.value) return;
  if (currentIndex.value < solutions.value.length - 1) {
    isTransitioning.value = true;
    isScrollingDown.value = true;
    
    // 使用requestAnimationFrame确保平滑过渡
    requestAnimationFrame(() => {
      setTimeout(() => {
        currentIndex.value++;
        
        // 确保状态变更完成后才结束过渡
        requestAnimationFrame(() => {
          setTimeout(() => {
            isTransitioning.value = false;
          }, 100);
        });
      }, 50);
    });
  } else {
    // 如果已经是最后一个解决方案，发射滚动到下一部分的事件
    // 先收起扩展的轮播图
    shouldAutoExpand.value = false;
    carouselExpanded.value = false;
    
    // 使用更长的延迟确保动画完成后再滚动
    setTimeout(() => {
      emit('scrollToNext');
      unlockScroll();
    }, 1000);
  }
};

// 切换到上一个解决方案
const prevSolution = () => {
  if (isTransitioning.value || currentIndex.value === 0) return;
  isTransitioning.value = true;
  isScrollingDown.value = false;
  
  // 使用requestAnimationFrame确保平滑过渡
  requestAnimationFrame(() => {
    setTimeout(() => {
      currentIndex.value--;
      
      // 确保状态变更完成后才结束过渡
      requestAnimationFrame(() => {
        setTimeout(() => {
          isTransitioning.value = false;
        }, 100);
      });
    }, 50);
  });
};

// 跳转到特定解决方案
const goToSolution = (index: number) => {
  if (isTransitioning.value || index === currentIndex.value) return;
  isTransitioning.value = true;
  isScrollingDown.value = index > currentIndex.value;
  
  // 使用requestAnimationFrame确保平滑过渡
  requestAnimationFrame(() => {
    setTimeout(() => {
      currentIndex.value = index;
      
      // 确保状态变更完成后才结束过渡
      requestAnimationFrame(() => {
        setTimeout(() => {
          isTransitioning.value = false;
        }, 100);
      });
    }, 50);
  });
};

// 处理手动展开/收缩
const toggleExpansion = () => {
  const carousel = document.querySelector('.fullscreen-carousel') as HTMLElement | null;
  if (!carousel) return;
  
  if (!carouselExpanded.value) {
    // 展开前记录当前位置和尺寸
    const rect = carousel.getBoundingClientRect();
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const offsetX = centerX - (rect.left + rect.width / 2);
    const offsetY = centerY - (rect.top + rect.height / 2);
    
    // 首先移动到中心
    carousel.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    carousel.classList.add('centering');
    
    // 然后展开
    setTimeout(() => {
      carouselExpanded.value = true;
      carousel.classList.remove('centering');
      carousel.style.transform = '';
      placeholderActive.value = true;
    }, 50);
  } else {
    // 收缩
    carouselExpanded.value = false;
    
    // 在过渡完成后移除占位符
    setTimeout(() => {
      if (!carouselExpanded.value) {
        placeholderActive.value = false;
      }
    }, 3000); // 与过渡时间一致
  }
};

// 添加一个对轮播组件的引用
const carousel = ref<HTMLElement | null>(null);

// 修复'carousel'未使用的变量警告
const initCarousel = () => {
  // 获取轮播元素引用
  carousel.value = document.querySelector('.fullscreen-carousel');
  if (carousel.value) {
    // 使用变量以消除警告
    console.debug('Carousel initialized');
  }
  return true;
};

// 组件挂载时初始化
onMounted(() => {
  // 初始化轮播
  initCarousel();
  
  window.addEventListener('keydown', handleKeyDown);
  
  // 设置IntersectionObserver
  setupIntersectionObserver();
  
  // 观察轮播容器元素
  carouselRef.value = document.querySelector('.carousel-wrapper');
  if (carouselRef.value && observer) {
    observer.observe(carouselRef.value);
  } else {
    // 降级为始终可见
    isCarouselVisible.value = true;
    shouldAutoExpand.value = true;
  }
  
  // 只对carousel元素内的滚轮事件做处理
  const carousel = document.querySelector('.fullscreen-carousel');
  
  // 使用事件委托处理滚轮事件，但仅当指针在组件内时
  const handleWheelEvent = (e: Event) => {
    // 检查事件是否发生在轮播组件内
    const target = e.target as HTMLElement;
    const carouselElement = document.querySelector('.fullscreen-carousel');
    
    if (carouselElement && carouselElement.contains(target)) {
      handleWheel(e);
    }
  };
  
  // 修改为 passive: false，允许阻止默认滚动行为
  document.addEventListener('wheel', handleWheelEvent, { passive: false });
  
  // 处理触摸事件
  let touchStartY = 0;
  let touchStartX = 0;
  const touchThreshold = 50; // 触摸滑动阈值
  
  const handleTouchStart = (e: TouchEvent) => {
    // 检查事件是否发生在轮播组件内
    const target = e.target as HTMLElement;
    const carouselElement = document.querySelector('.fullscreen-carousel');
    
    if (carouselElement && carouselElement.contains(target)) {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].pageX;
      
      // 在轮播区域内开始触摸时，阻止默认行为，防止页面滚动
      if (!isLastSlide.value || currentIndex.value > 0) {
        e.preventDefault();
      }
    }
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    if (isTransitioning.value) return;
    
    // 检查事件是否发生在轮播组件内
    const target = e.target as HTMLElement;
    const carouselElement = document.querySelector('.fullscreen-carousel');
    
    if (carouselElement && carouselElement.contains(target)) {
      const touchEndY = e.touches[0].clientY;
      const touchEndX = e.touches[0].pageX;
      
      // 计算水平和垂直方向的移动距离
      const diffY = touchStartY - touchEndY;
      const diffX = touchStartX - touchEndX;
      
      // 如果垂直滑动幅度大于水平滑动，且超过了阈值
      if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > touchThreshold) {
        // 在最后一张幻灯片时，只处理向上滑动
        if (isLastSlide.value && diffY < 0) {
          return; // 向下滑动时不处理，允许继续滚动页面
        }
        
        // 阻止默认的页面滚动
        e.preventDefault();
        
        if (diffY > 0) {
          // 向上滑动（显示下一个）
          nextSolution();
        } else {
          // 向下滑动（显示上一个）
          prevSolution();
        }
        
        // 更新触摸起始位置，避免连续触发
        touchStartY = touchEndY;
        touchStartX = touchEndX;
      }
    }
  };
  
  document.addEventListener('touchstart', handleTouchStart);
  document.addEventListener('touchmove', handleTouchMove);
  
  // 监听扩展状态变化
  watch(carouselExpanded, (newValue) => {
    const carousel = document.querySelector('.fullscreen-carousel') as HTMLElement | null;
    if (!carousel) return;
    
    if (newValue) {
      // 扩展前先确保位置准确
      requestAnimationFrame(() => {
        carousel.style.transformOrigin = 'center center';
      });
    }
  });
  
  // 卸载时清理
  onUnmounted(() => {
    // 移除IntersectionObserver
    if (observer && carouselRef.value) {
      observer.unobserve(carouselRef.value);
      observer.disconnect();
    }
    
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('wheel', handleWheelEvent);
  });
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  
  // 清理IntersectionObserver
  if (observer && carouselRef.value) {
    observer.unobserve(carouselRef.value);
    observer.disconnect();
  }
  
  // 确保在组件卸载时解除任何滚动锁定
  if (isScrollingLocked.value || carouselExpanded.value) {
    unlockScroll();
    isScrollingLocked.value = false;
    carouselExpanded.value = false;
  }
});
</script>

<template>
  <div class="solutions-carousel-container">
    <div class="carousel-wrapper" :class="{ 'visible': isCarouselVisible }" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave" @mousemove="handleMouseMove">
      <div class="fullscreen-carousel" :class="{ 'expanded': carouselExpanded || shouldAutoExpand }">
        <!-- 解决方案幻灯片 -->
        <div class="slides-container">
          <div 
            v-for="(solution, index) in solutions" 
            :key="solution.id"
            class="solution-slide"
            :class="{
              'active': index === currentIndex,
              'prev': index < currentIndex,
              'next': index > currentIndex,
              'transition-up': !isScrollingDown,
              'transition-down': isScrollingDown
            }"
            :style="{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${solution.image})`,
            }"
          >
            <div class="slide-content" :class="{ 'active': index === currentIndex }">
              <div class="text-left mb-4">
                <span class="slide-overline">{{ solution.id.toUpperCase() }}</span>
                <h2 class="slide-title">{{ solution.title }}</h2>
                <h3 class="slide-headline">{{ solution.subtitle }}</h3>
              </div>
              
              <div class="slide-description">
                <p>{{ solution.description }}</p>
              </div>
              
              <div class="slide-action">
                <router-link
                  :to="solution.link"
                  class="slide-button"
                >
                  {{ moreButtonText }}
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </router-link>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 导航箭头 -->
        <button 
          v-if="currentIndex > 0"
          @click="prevSolution" 
          class="nav-arrow nav-arrow-up" 
          :aria-label="navUpLabel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>
        
        <button 
          v-if="currentIndex < solutions.length - 1"
          @click="nextSolution" 
          class="nav-arrow nav-arrow-down" 
          :aria-label="navDownLabel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- 滚动提示 - 仅在最后一张显示"继续向下滚动" -->
        <div 
          v-if="currentIndex === solutions.length - 1"
          class="scroll-hint animate-bounce"
          @click="nextSolution"
        >
          <span>{{ scrollHintText }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
        
        <!-- 扩展/收缩按钮 -->
        <button
          class="expand-toggle"
          @click="toggleExpansion"
          :aria-label="carouselExpanded ? '收起' : '展开'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" v-if="!carouselExpanded">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" v-else>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- 占位元素，当轮播图扩展固定时防止内容跳动 -->
      <div v-if="placeholderActive" class="placeholder" />
    </div>
  </div>
</template>

<style scoped>
.solutions-carousel-container {
  position: relative;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: visible;
}

.carousel-wrapper {
  position: relative;
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  opacity: 0;
  transform: scale(0.98);
  transition: opacity 1s ease, transform 1s ease;
  will-change: transform, opacity;
  margin: 0;
  padding: 0;
}

.carousel-wrapper.visible {
  opacity: 1;
  transform: scale(1);
}

.fullscreen-carousel {
  position: relative;
  height: 70vh;
  width: 85vw;
  max-width: 1600px;
  overflow: hidden;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  transition: all 3s cubic-bezier(0.165, 0.84, 0.44, 1); /* 使用更慢更平滑的过渡 */
  margin: 0 auto;
  will-change: transform, width, height;
  backface-visibility: hidden;
  transform-origin: center center;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* 添加CSS变量用于跟踪初始状态 */
  --initial-width: 85vw;
  --initial-height: 70vh;
}

.fullscreen-carousel.expanded {
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  border-radius: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  margin: 0;
  padding: 0;
  box-shadow: none;
  transform: scale(1);
  transition: all 3s cubic-bezier(0.165, 0.84, 0.44, 1); /* 使用更慢更平滑的过渡 */
}

/* 确保展开过程是从当前位置中心向四周扩展 */
.fullscreen-carousel:not(.expanded) {
  transform: translate(0, 0);
}

/* 占位元素样式优化，确保与轮播图高度一致 */
.placeholder {
  height: 100vh;
  width: 100%;
  opacity: 0;
  pointer-events: none;
  visibility: hidden; /* 防止占用空间但保持尺寸 */
  position: relative;
  z-index: -1; /* 确保在其他元素下方 */
}

/* 当轮播图扩展时占位符才显示 */
.fullscreen-carousel.expanded + .placeholder {
  visibility: visible;
}

.slides-container {
  position: relative;
  height: 100%;
  width: 100%;
  transform: translateZ(0);
}

.solution-slide {
  background-color: #000;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center; /* 改为垂直居中 */
  justify-content: flex-start;
  opacity: 0;
  z-index: 1;
  transition: opacity 1.8s cubic-bezier(0.2, 0, 0, 1), transform 1.8s cubic-bezier(0.2, 0, 0, 1);
  transform: translateY(100%) translateZ(0);
  border-radius: inherit;
  will-change: transform, opacity;
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
}

.solution-slide.prev {
  transform: translateY(-100%) translateZ(0);
  z-index: 1;
}

.solution-slide.next {
  transform: translateY(100%) translateZ(0);
  z-index: 1;
}

.solution-slide.active {
  opacity: 1;
  transform: translateY(0) translateZ(0);
  z-index: 2;
}

.slide-content {
  max-width: 800px;
  padding: 0 4rem 0 10rem; /* 增加左侧padding到10rem，使内容更靠右 */
  color: white;
  text-align: left;
  opacity: 0;
  transform: translateY(30px) translateZ(0);
  transition: opacity 1.2s ease 0.6s, transform 1.2s ease 0.6s;
  will-change: transform, opacity;
  backface-visibility: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center; /* 垂直居中 */
}

.slide-content.active {
  opacity: 1;
  transform: translateY(0) translateZ(0);
}

.slide-overline {
  display: block;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  margin-top: 1rem; /* 增加顶部间距 */
}

.slide-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  line-height: 1.2;
  max-width: 700px;
  color: #3b82f6; /* Skydio blue */
  text-transform: uppercase;
  letter-spacing: 1px;
}

.slide-headline {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  margin-top: 0.5rem;
  margin-bottom: 2rem;
  color: white;
  max-width: 800px;
}

.slide-subtitle {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #3b82f6; /* Skydio blue */
}

.slide-description {
  background-color: rgba(0, 0, 0, 0.2); /* 更透明的背景 */
  padding: 1.75rem;
  border-radius: 12px;
  margin-bottom: 2.5rem;
  font-size: 1.25rem;
  line-height: 1.6;
  max-width: 600px;
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.slide-action {
  margin-top: 1rem;
  position: relative;
  display: flex;
  align-items: center;
}

.slide-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 2.2rem;
  background-color: rgba(255, 255, 255, 0.15); /* 半透明灰色背景 */
  color: white;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
  text-decoration: none;
  backdrop-filter: blur(4px); /* 模糊效果 */
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.5px;
  font-size: 0.95rem;
}

.slide-button:hover {
  background-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.slide-button svg {
  width: 18px;
  height: 18px;
  margin-left: 8px;
  transition: transform 0.3s ease;
}

.slide-button:hover svg {
  transform: translateX(3px);
}

/* 导航箭头 */
.nav-arrow {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
}

.nav-arrow:hover {
  background-color: rgba(255, 255, 255, 0.4);
}

.nav-arrow-up {
  top: 2rem;
}

.nav-arrow-down {
  bottom: 2rem;
}

/* 滚动提示 */
.scroll-hint {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.875rem;
  opacity: 0.8;
  z-index: 10;
  cursor: pointer;
  transition: all 0.3s ease;
}

.scroll-hint:hover {
  opacity: 1;
  transform: translateX(-50%) translateY(-5px);
}

/* 动画 */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0) translateX(-50%);
  }
  50% {
    transform: translateY(-10px) translateX(-50%);
  }
}

.animate-bounce {
  animation: bounce 2s infinite;
}

/* 扩展/收缩按钮 */
.expand-toggle {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
}

.expand-toggle:hover {
  background-color: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .slide-headline {
    font-size: 2.5rem;
  }
  
  .slide-title {
    font-size: 1.25rem;
  }
  
  .fullscreen-carousel {
    width: 90vw;
    height: 65vh;
  }
  
  .placeholder {
    height: 80vh; /* 在移动设备上减少占位符高度 */
  }

  .slide-content {
    padding: 4rem 1.5rem 1.5rem 2rem;
  }
}

@media (max-width: 480px) {
  .fullscreen-carousel {
    width: 95vw;
    height: 60vh;
  }
  
  .slide-description {
    padding: 1rem;
    font-size: 1rem;
  }

  .slide-headline {
    font-size: 2rem;
  }

  .slide-title {
    font-size: 1rem;
  }

  .slide-content {
    padding: 3rem 1rem 1rem 1.5rem;
  }
}

.carousel-controls {
  position: absolute;
  right: 5%;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 1;
  pointer-events: auto; /* 确保鼠标事件可以通过 */
}

/* 删除导航指示器样式 */
.navigation-indicators {
  display: none;
}

/* 扩展动画 */
@keyframes expandFromCenter {
  0% {
    width: 85vw;
    height: 70vh;
    border-radius: 24px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  100% {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    top: 0;
    left: 0;
    transform: translate(0, 0);
  }
}

/* 应用中心扩展动画 */
.fullscreen-carousel.expanded {
  animation: none;
}
</style> 