<script setup lang="ts">
import HeroBanner from '../components/home/HeroBanner.vue';
import MissionStatement from '../components/home/MissionStatement.vue';
import VideoProductShowcase from '../components/home/VideoProductShowcase.vue';
import ProductHighlights from '../components/home/ProductHighlights.vue';
import SolutionsCarousel from '../components/home/SolutionsCarousel.vue';
import SuccessStories from '../components/home/SuccessStories.vue';
import CtaSection from '../components/home/CtaSection.vue';
</script>

<template>
  <main>
    <HeroBanner />
    <MissionStatement />
    <VideoProductShowcase id="video-showcase" />
    <SolutionsCarousel @scrollToNext="scrollToProductHighlights" />
    <ProductHighlights id="product-highlights" />
    <SuccessStories />
    <CtaSection 
      title="准备好体验无与伦比的飞行了吗？"
      description="提升您的航拍体验，获取最先进的自主飞行技术"
      :button-options="[
        { text: '购买Skydio', url: '/products', primary: true },
        { text: '联系销售', url: '/contact', primary: false }
      ]"
    />
  </main>
</template>

<script lang="ts">
export default {
  methods: {
    scrollToVideoShowcase() {
      const element = document.getElementById('video-showcase');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    },
    scrollToProductHighlights() {
      const element = document.getElementById('product-highlights');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
}
</script>
