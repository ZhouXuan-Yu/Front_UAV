<script setup lang="ts">
import { ref } from 'vue';
import BaseFunctionPage from './BaseFunctionPage.vue';

const pageData = {
  title: '智慧知库',
  subtitle: '融合LLM与知识图谱，联网检索赋能智能问答',
  description: '提供知识图谱驱动的智能问答系统，将结构化和非结构化知识统一管理，支持复杂语义查询和推理。用户可通过自然语言与系统交互，支持联网搜索，获取领域专业知识和智能决策支持。',
  image: 'https://cdn.sanity.io/images/mgxz50fq/~production-v3/e3baeb17f1556c50a0ea5ca5a75d5e998426ff73-2559x1706.png',
  features: [
    {
      title: '知识图谱构建',
      description: '利用Neo4j等图数据库技术构建领域知识网络，支持复杂关系表达和多维度知识关联。',
      icon: 'https://ext.same-assets.com/794583279/2838098675.svg'
    },
    {
      title: '语义理解与查询',
      description: '应用自然语言处理技术解析用户问题，将其转化为结构化查询，实现对知识库的精准检索。',
      icon: 'https://ext.same-assets.com/794583279/2018733539.svg'
    },
    {
      title: '动态知识更新',
      description: '支持知识的持续积累与更新，保持知识库的时效性和准确性，适应不断变化的信息需求。',
      icon: 'https://ext.same-assets.com/794583279/2067545548.svg'
    }
  ],
  actionRoute: '/domain/knowledge-graph/app',
  actionText: '开始使用智慧知库'
};
</script>

<template>
  <BaseFunctionPage
    :title="pageData.title"
    :subtitle="pageData.subtitle"
    :description="pageData.description"
    :image="pageData.image"
    :features="pageData.features"
    :actionRoute="pageData.actionRoute"
    :actionText="pageData.actionText"
  />
</template> 