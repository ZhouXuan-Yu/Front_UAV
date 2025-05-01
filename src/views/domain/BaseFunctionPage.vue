<script setup lang="ts">
import { ref } from 'vue';
import FeatureHero from '@/components/feature/FeatureHero.vue';
import FeatureContent from '@/components/feature/FeatureContent.vue';
import CtaSection from '@/components/home/CtaSection.vue';
import type { RouteLocationRaw } from 'vue-router';

// 定义组件属性
const props = defineProps<{
  title: string;
  subtitle: string;
  description: string;
  image: string;
  features: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  actionRoute?: RouteLocationRaw;
  actionText?: string;
}>();
</script>

<template>
  <div>
    <FeatureHero
      :title="title"
      :subtitle="subtitle"
      :description="description"
      :image="image"
      :actionRoute="actionRoute"
      :actionText="actionText"
    />

    <FeatureContent :features="features" />

    <CtaSection />
  </div>
</template> 