/**
 * 文件名: MarkdownRenderer.vue
 * 描述: Markdown内容渲染组件
 * 功能: 将Markdown格式的文本渲染为HTML格式显示
 */

<template>
  <div class="markdown-content" v-html="renderedContent"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// 定义组件属性
const props = defineProps({
  // Markdown内容
  content: {
    type: String,
    default: '',
  },
  // 是否启用链接，默认为true
  enableLinks: {
    type: Boolean,
    default: true,
  },
  // 是否允许HTML，默认为false
  allowHtml: {
    type: Boolean,
    default: false,
  },
});

// 渲染后的内容
const renderedContent = ref('');

// 解析和渲染Markdown内容
const renderMarkdown = () => {
  if (!props.content) {
    renderedContent.value = '';
    return;
  }

  try {
    // 配置marked选项
    marked.setOptions({
      gfm: true, // 启用GitHub风格Markdown
      breaks: true, // 将换行符渲染为<br>
      headerIds: true, // 为标题添加id
      smartLists: true, // 使用更智能的列表行为
    });

    // 渲染Markdown为HTML
    let html = marked(props.content);

    // 如果不允许链接，禁用所有a标签
    if (!props.enableLinks) {
      html = html.replace(/<a /g, '<span ').replace(/<\/a>/g, '</span>');
    }

    // 使用DOMPurify清理HTML以防止XSS攻击
    renderedContent.value = props.allowHtml 
      ? DOMPurify.sanitize(html)
      : DOMPurify.sanitize(html, { ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
          'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'abbr', 'code', 'hr', 'br', 
          'div', 'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'span',
          'img'
        ]});
  } catch (error) {
    console.error('Markdown渲染失败:', error);
    // 如果渲染失败，直接显示原始内容
    renderedContent.value = `<p>${props.content}</p>`;
  }
};

// 监听内容变化
watch(() => props.content, () => {
  renderMarkdown();
}, { immediate: true });

// 组件挂载时渲染内容
onMounted(() => {
  renderMarkdown();
});
</script>

<style scoped>
.markdown-content {
  line-height: 1.6;
  word-wrap: break-word;
  color: #606266;
}

/* Markdown内容样式 */
:deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

:deep(h1) {
  font-size: 1.7em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}

:deep(h2) {
  font-size: 1.5em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}

:deep(h3) {
  font-size: 1.25em;
}

:deep(h4) {
  font-size: 1em;
}

:deep(h5) {
  font-size: 0.875em;
}

:deep(h6) {
  font-size: 0.85em;
  color: #6a737d;
}

:deep(a) {
  color: #1976d2;
  text-decoration: none;
}

:deep(a:hover) {
  text-decoration: underline;
}

:deep(p) {
  margin-top: 0;
  margin-bottom: 16px;
}

:deep(blockquote) {
  margin: 0 0 16px;
  padding: 0 16px;
  color: #6a737d;
  border-left: 4px solid #dfe2e5;
}

:deep(ul), :deep(ol) {
  padding-left: 2em;
  margin-top: 0;
  margin-bottom: 16px;
}

:deep(li) {
  margin-top: 0.25em;
}

:deep(code) {
  font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
}

:deep(pre) {
  font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 3px;
  margin-bottom: 16px;
}

:deep(pre code) {
  background-color: transparent;
  padding: 0;
}

:deep(hr) {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background-color: #e1e4e8;
  border: 0;
}

:deep(table) {
  border-spacing: 0;
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 16px;
}

:deep(table tr) {
  background-color: #fff;
  border-top: 1px solid #c6cbd1;
}

:deep(table tr:nth-child(2n)) {
  background-color: #f6f8fa;
}

:deep(table th), :deep(table td) {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
}

:deep(table th) {
  font-weight: 600;
}

:deep(img) {
  max-width: 100%;
  box-sizing: content-box;
}
</style> 