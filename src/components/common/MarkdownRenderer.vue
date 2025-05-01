/**
 * 文件名: MarkdownRenderer.vue
 * 描述: 简化版Markdown内容渲染组件
 * 功能: 将Markdown格式的文本基本渲染为可读格式
 */

<template>
  <div class="markdown-content">
    <div v-for="(block, index) in parsedContent" :key="index">
      <component 
        :is="block.tag" 
        :class="block.className"
        v-html="formatText(block.content)"
      ></component>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MarkdownRenderer',
  props: {
    content: {
      type: String,
      default: ''
    }
  },
  
  computed: {
    parsedContent() {
      if (!this.content) return [];
      
      const blocks = [];
      const lines = this.content.split('\n');
      let currentList = null;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // 跳过空行
        if (trimmed === '') {
          currentList = null;
          continue;
        }
        
        // 处理标题 (# 到 ######)
        if (/^#{1,6}\s/.test(trimmed)) {
          const level = trimmed.match(/^(#{1,6})\s/)?.[1].length || 1;
          const content = trimmed.replace(/^#{1,6}\s/, '');
          blocks.push({
            tag: `h${level}`,
            className: `md-h${level}`,
            content
          });
          continue;
        }
        
        // 处理无序列表 (- 或 *)
        if (/^[-*]\s/.test(trimmed)) {
          const content = trimmed.substring(2);
          
          if (!currentList) {
            currentList = {
              tag: 'ul',
              className: 'md-ul',
              content: `<li class="md-li">${content}</li>`
            };
            blocks.push(currentList);
          } else {
            currentList.content += `<li class="md-li">${content}</li>`;
          }
          continue;
        }
        
        // 处理引用块 (>)
        if (trimmed.startsWith('> ')) {
          const content = trimmed.substring(2);
          blocks.push({
            tag: 'blockquote',
            className: 'md-blockquote',
            content
          });
          continue;
        }
        
        // 默认为段落
        blocks.push({
          tag: 'p',
          className: 'md-p',
          content: trimmed
        });
      }
      
      return blocks;
    }
  },
  
  methods: {
    formatText(text) {
      // 处理粗体 **text** 或 __text__
      let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/__(.*?)__/g, '<strong>$1</strong>');
      
      // 处理斜体 *text* 或 _text_
      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>')
                       .replace(/_(.*?)_/g, '<em>$1</em>');
      
      // 处理链接 [text](url)
      formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
      
      // 处理行内代码 `code`
      formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
      
      return formatted;
    }
  }
}
</script>

<style scoped>
.markdown-content {
  line-height: 1.6;
  word-wrap: break-word;
  color: #606266;
}

.md-h1, .md-h2, .md-h3, .md-h4, .md-h5, .md-h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.md-h1 {
  font-size: 1.7em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}

.md-h2 {
  font-size: 1.5em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}

.md-h3 {
  font-size: 1.25em;
}

.md-h4 {
  font-size: 1em;
}

.md-p {
  margin-top: 0;
  margin-bottom: 16px;
}

.md-blockquote {
  margin: 0 0 16px;
  padding: 0 16px;
  color: #6a737d;
  border-left: 4px solid #dfe2e5;
}

.md-ul {
  padding-left: 2em;
  margin-top: 0;
  margin-bottom: 16px;
}

.md-li {
  margin-top: 0.25em;
}

.markdown-content :deep(a) {
  color: #1976d2;
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(code) {
  font-family: monospace;
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
}

.markdown-content :deep(strong) {
  font-weight: bold;
}

.markdown-content :deep(em) {
  font-style: italic;
}
</style> 