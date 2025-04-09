<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  color?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'light' | 'dark';
}

const props = withDefaults(defineProps<Props>(), {
  color: '#0078D4',
  size: 'medium',
  variant: 'light'
});

// 根据尺寸计算SVG尺寸
const dimensions = computed(() => {
  switch (props.size) {
    case 'small':
      return { width: 90, height: 24 };
    case 'large':
      return { width: 150, height: 40 };
    case 'medium':
    default:
      return { width: 120, height: 32 };
  }
});

// 根据variant计算颜色
const logoColor = computed(() => {
  if (props.color) return props.color;
  return props.variant === 'light' ? '#0078D4' : '#FFFFFF';
});
</script>

<template>
  <div class="logo-component">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      :width="dimensions.width" 
      :height="dimensions.height" 
      viewBox="0 0 120 32" 
      fill="none" 
      class="logo-svg"
    >
      <path 
        d="M28.5 16C28.5 22.9036 22.9036 28.5 16 28.5C9.09644 28.5 3.5 22.9036 3.5 16C3.5 9.09644 9.09644 3.5 16 3.5C22.9036 3.5 28.5 9.09644 28.5 16Z" 
        :fill="logoColor"
      />
      <path 
        d="M35 6L44 16L35 26M51 6L60 16L51 26" 
        :stroke="logoColor" 
        stroke-width="2.5" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
      <path 
        d="M66 6H76C78.2091 6 80 7.79086 80 10V22C80 24.2091 78.2091 26 76 26H66" 
        :stroke="logoColor" 
        stroke-width="2.5" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
      <path 
        d="M96 6L87 26M87 6L96 26" 
        :stroke="logoColor" 
        stroke-width="2.5" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
      <path 
        d="M103 6V26M117 6V26" 
        :stroke="logoColor" 
        stroke-width="2.5" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
      <path 
        d="M103 16H117" 
        :stroke="logoColor" 
        stroke-width="2.5" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
    </svg>
  </div>
</template>

<style scoped>
.logo-component {
  display: inline-block;
}

.logo-svg {
  transition: transform 0.3s;
}

.logo-svg:hover {
  transform: scale(1.05);
}
</style> 