/**
 * 文件名: FeatureView.vue
 * 描述: 功能特性展示视图组件
 * 在项目中的作用: 
 * - 根据路由动态展示不同功能特性的详情
 * - 提供可复用的特性页面模板
 * - 展示产品各个功能模块的详细信息
 * - 管理特性数据和视图展示逻辑
 */

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import FeatureHero from '@/components/feature/FeatureHero.vue';
import FeatureContent from '@/components/feature/FeatureContent.vue';
import CtaSection from '@/components/home/CtaSection.vue';

const route = useRoute();

// Feature data based on route
const featureData = computed(() => {
  const routeName = route.name as string;

  const featureInfo: Record<string, {
    title: string;
    subtitle: string;
    description: string;
    image: string;
    features: Array<{ title: string; description: string; icon?: string; }>;
  }> = {
    'person-recognition': {
      title: 'Person Recognition',
      subtitle: 'Advanced AI for identifying and tracking people',
      description: 'Our Person Recognition technology enables drones to detect, identify, and track individuals in various environments. Perfect for search and rescue, security, and crowd monitoring applications.',
      image: 'https://ext.same-assets.com/913537297/1124492884.jpeg',
      features: [
        {
          title: 'Real-time Detection',
          description: 'Identify people in real-time from various angles and distances with industry-leading accuracy.',
          icon: 'https://ext.same-assets.com/794583279/2838098675.svg'
        },
        {
          title: 'Thermal Imaging',
          description: 'Combine visual and thermal imaging for detection in low-light conditions or through obstacles.',
          icon: 'https://ext.same-assets.com/794583279/2018733539.svg'
        },
        {
          title: 'Crowd Analysis',
          description: 'Monitor crowd density, movement patterns, and detect unusual behavior in large gatherings.',
          icon: 'https://ext.same-assets.com/794583279/2067545548.svg'
        }
      ]
    },
    'vehicle-monitoring': {
      title: 'Vehicle Monitoring',
      subtitle: 'Comprehensive traffic and vehicle tracking solutions',
      description: 'Monitor traffic flow, track vehicles, and analyze transportation patterns with our advanced drone-based vehicle monitoring system.',
      image: 'https://ext.same-assets.com/913537297/3416323236.png',
      features: [
        {
          title: 'Traffic Analysis',
          description: 'Monitor traffic flow, congestion points, and road usage patterns with real-time aerial data.',
          icon: 'https://ext.same-assets.com/794583279/2838098675.svg'
        },
        {
          title: 'Vehicle Tracking',
          description: 'Track specific vehicles across large areas with AI-powered identification and following capabilities.',
          icon: 'https://ext.same-assets.com/794583279/2018733539.svg'
        },
        {
          title: 'Accident Response',
          description: 'Provide first responders with immediate aerial views of traffic incidents and assist in coordinating response efforts.',
          icon: 'https://ext.same-assets.com/794583279/2067545548.svg'
        }
      ]
    },
    'disaster-detection': {
      title: 'Disaster Detection',
      subtitle: 'Early warning and response for natural disasters',
      description: 'Deploy our drones to detect, monitor, and respond to natural disasters like floods, fires, and earthquakes with rapid situational awareness.',
      image: 'https://ext.same-assets.com/913537297/145035404.jpeg',
      features: [
        {
          title: 'Wildfire Detection',
          description: 'Early detection of wildfires through thermal imaging and smoke recognition, even in remote areas.',
          icon: 'https://ext.same-assets.com/794583279/2838098675.svg'
        },
        {
          title: 'Flood Monitoring',
          description: 'Track water levels, flood progression, and identify areas at risk with real-time mapping.',
          icon: 'https://ext.same-assets.com/794583279/2018733539.svg'
        },
        {
          title: 'Earthquake Assessment',
          description: 'Rapidly assess structural damage and safety hazards following seismic events to guide response teams.',
          icon: 'https://ext.same-assets.com/794583279/2067545548.svg'
        }
      ]
    },
    'license-plate-recognition': {
      title: 'License Plate Recognition',
      subtitle: 'Aerial vehicle identification system',
      description: 'Our advanced License Plate Recognition technology allows drones to identify and log vehicle license plates from the air with exceptional accuracy.',
      image: 'https://ext.same-assets.com/913537297/1121177740.png',
      features: [
        {
          title: 'High-Resolution Imaging',
          description: 'Capture clear license plate images from various heights and angles using specialized cameras.',
          icon: 'https://ext.same-assets.com/794583279/2838098675.svg'
        },
        {
          title: 'AI-Powered Recognition',
          description: 'Process and identify license plates in real-time using advanced machine learning algorithms.',
          icon: 'https://ext.same-assets.com/794583279/2018733539.svg'
        },
        {
          title: 'Database Integration',
          description: 'Connect with existing databases to check vehicles against watch lists or verify registrations.',
          icon: 'https://ext.same-assets.com/794583279/2067545548.svg'
        }
      ]
    },
    'data-dashboard': {
      title: 'Data Dashboard',
      subtitle: 'Comprehensive analytics and visualization platform',
      description: 'Our intuitive Data Dashboard transforms complex drone data into actionable insights through powerful analytics and visualizations.',
      image: 'https://cdn.sanity.io/images/mgxz50fq/~production-v3/de53bd47ac33d82c6b654a6ef9898be75f33d3a3-1194x1200.png',
      features: [
        {
          title: 'Real-time Monitoring',
          description: 'View live data streams from multiple drones in a single, unified interface with instant updates.',
          icon: 'https://ext.same-assets.com/794583279/2838098675.svg'
        },
        {
          title: 'Advanced Analytics',
          description: 'Apply machine learning algorithms to detect patterns, anomalies, and trends in your collected data.',
          icon: 'https://ext.same-assets.com/794583279/2018733539.svg'
        },
        {
          title: 'Custom Reporting',
          description: 'Generate detailed reports and visualizations tailored to your specific operational needs.',
          icon: 'https://ext.same-assets.com/794583279/2067545548.svg'
        }
      ]
    },
    'knowledge-graph': {
      title: 'Knowledge Graph',
      subtitle: 'AI-powered data relationship mapping',
      description: 'Our Knowledge Graph technology connects disparate pieces of information gathered by drones to reveal hidden relationships and insights.',
      image: 'https://cdn.sanity.io/images/mgxz50fq/~production-v3/e3baeb17f1556c50a0ea5ca5a75d5e998426ff73-2559x1706.png',
      features: [
        {
          title: 'Relationship Mapping',
          description: 'Automatically identify and visualize connections between objects, locations, and events in your data.',
          icon: 'https://ext.same-assets.com/794583279/2838098675.svg'
        },
        {
          title: 'Contextual Intelligence',
          description: 'Enrich drone observations with external data sources for deeper understanding and insights.',
          icon: 'https://ext.same-assets.com/794583279/2018733539.svg'
        },
        {
          title: 'Predictive Analytics',
          description: 'Use historical relationships to predict future developments and inform strategic decision-making.',
          icon: 'https://ext.same-assets.com/794583279/2067545548.svg'
        }
      ]
    }
  };

  // Return the data for the current route, or a default if not found
  return featureInfo[routeName] || {
    title: 'Feature',
    subtitle: 'Advanced drone technology',
    description: 'This feature provides cutting-edge capabilities for your drone operations.',
    image: 'https://ext.same-assets.com/913537297/1124492884.jpeg',
    features: []
  };
});
</script>

<template>
  <div>
    <FeatureHero
      :title="featureData.title"
      :subtitle="featureData.subtitle"
      :description="featureData.description"
      :image="featureData.image"
    />

    <FeatureContent :features="featureData.features" />

    <CtaSection />
  </div>
</template>
