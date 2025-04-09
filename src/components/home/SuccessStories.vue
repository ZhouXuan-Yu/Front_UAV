<script setup lang="ts">
import { ref } from 'vue';

interface Story {
  id: number;
  title: string;
  image: string;
  link: string;
  author: string;
  position: string;
  content: string;
}

const stories = ref<Story[]>([
  {
    id: 1,
    title: "警用无人机革命性应用",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    link: "#",
    author: "张警官",
    position: "公安部门技术主管",
    content: "Skydio无人机的自主飞行技术帮助我们显著提高了救援效率和安全性。"
  },
  {
    id: 2,
    title: "无人机测绘改变行业标准",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    link: "#",
    author: "李工程师",
    position: "测绘部门负责人",
    content: "使用Skydio后，我们的数据采集速度提升了200%，精度更是达到了前所未有的水平。"
  },
  {
    id: 3,
    title: "基础设施检查新纪元",
    image: "https://images.unsplash.com/photo-1544002177-31d6336bb3a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    link: "#",
    author: "王总监",
    position: "电力公司运维部",
    content: "通过Skydio无人机自动化检查，我们将高压线路检查时间缩短了60%，同时提高了安全性。"
  }
]);

const selectedStory = ref<Story | null>(null);

// 显示故事详情
const showStoryDetails = (story: Story) => {
  selectedStory.value = story;
};

// 关闭故事详情
const closeStoryDetails = () => {
  selectedStory.value = null;
};
</script>

<template>
  <section class="bg-gray-100 py-20 relative">
    <div class="container mx-auto px-4">
      <!-- 标题区域 -->
      <div class="text-center mb-16" data-aos="fade-up">
        <h2 class="text-4xl font-bold text-skydio-dark mb-6">客户成功案例</h2>
        <div class="w-20 h-1 bg-skydio-blue mx-auto mb-8"></div>
        <p class="max-w-2xl mx-auto text-lg text-gray-700">
          我们的自主飞行系统正在各行各业创造价值，从关键基础设施检查到公共安全和媒体制作，Skydio无人机正在改变行业标准。
        </p>
      </div>
      
      <!-- 故事卡片区域 - 上下排列 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div 
          v-for="story in stories" 
          :key="story.id"
          class="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2"
          data-aos="fade-up"
          :data-aos-delay="(story.id-1) * 100"
        >
          <div class="h-56 overflow-hidden">
            <img 
              :src="story.image" 
              :alt="story.title"
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          </div>
          
          <div class="p-6">
            <h3 class="text-xl font-bold mb-3 text-skydio-dark">{{ story.title }}</h3>
            <p class="text-gray-600 mb-5">{{ story.content }}</p>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <p class="font-medium">{{ story.author }}</p>
                  <p class="text-sm text-gray-500">{{ story.position }}</p>
                </div>
              </div>
              
              <button 
                class="px-3 py-1 text-sm bg-skydio-blue text-white rounded hover:bg-opacity-90 transition-colors"
                @click="showStoryDetails(story)"
              >
                查看详情
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 查看更多按钮 -->
      <div class="text-center mt-12">
        <router-link 
          to="#" 
          class="inline-block py-3 px-8 bg-skydio-blue text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors"
        >
          查看所有案例
        </router-link>
      </div>
    </div>
    
    <!-- 故事详情模态框 -->
    <div 
      v-if="selectedStory" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
      @click="closeStoryDetails"
    >
      <div 
        class="bg-white rounded-lg max-w-2xl w-full p-6 transform transition-all duration-300"
        @click.stop
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-2xl font-bold text-skydio-dark">{{ selectedStory.title }}</h3>
          <button 
            class="text-gray-500 hover:text-gray-700"
            @click="closeStoryDetails"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="mb-6 h-64 overflow-hidden rounded-lg">
          <img 
            :src="selectedStory.image" 
            :alt="selectedStory.title"
            class="w-full h-full object-cover"
          />
        </div>
        
        <div class="mb-6">
          <p class="text-lg text-gray-700 mb-4">{{ selectedStory.content }}</p>
          <p class="text-lg text-gray-700">
            此客户案例详细说明了Skydio无人机如何在特定行业应用中创造显著价值，并通过自主飞行技术解决传统挑战。
          </p>
        </div>
        
        <div class="flex items-center mb-6">
          <div class="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
          <div>
            <p class="font-medium text-lg">{{ selectedStory.author }}</p>
            <p class="text-gray-500">{{ selectedStory.position }}</p>
          </div>
        </div>
        
        <div class="flex justify-end">
          <button 
            class="px-6 py-2 bg-skydio-blue text-white rounded-md hover:bg-opacity-90 transition-colors"
            @click="closeStoryDetails"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.card-container {
  perspective: 1000px;
}

.story-card {
  width: 320px;
  max-width: 100%;
  top: 50%;
  transition: all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
  transform-origin: center center;
}

.left-card {
  z-index: 1;
}

.center-card {
  left: 50%;
  z-index: 3;
}

.right-card {
  z-index: 2;
}

/* 模态框过渡 */
.fixed {
  transition: opacity 0.3s ease;
}

.transform {
  transition: all 0.3s ease;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .story-card {
    width: 280px;
  }
}
</style>
