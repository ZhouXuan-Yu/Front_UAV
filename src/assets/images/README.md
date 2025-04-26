# 图片资源说明

本目录用于存放网站所需的图片资源文件。

## 图片分类

- SVG占位图: 小型矢量图，用于开发阶段占位
- JPG/JPEG图片: 照片类内容
- PNG图片: 需要透明背景的图像

## 主要文件

- `drone-bg.jpg`: 无人机背景图
- `email-service-image.svg`: 邮件发送智能服务系统占位图
- `data-dashboard-image.svg`: 无人机监控数据大屏系统占位图
- `smart-navigation-image.svg`: 智程导航多策略路径规划系统占位图
- `person-recognition-image.svg`: 人物特征智能识别系统占位图

## 使用方式

在Vue组件中引用图片资源的两种主要方式：

1. 通过import导入 (适用于webpack/vite处理):
```js
import imageFile from '@/assets/images/image.png';
```

2. 直接使用相对路径:
```html
<img src="@/assets/images/image.png" alt="描述文本" />
```

3. 在CSS中引用:
```css
.element {
  background-image: url('@/assets/images/image.png');
}
```

## 图片优化建议

1. 使用适当的格式：照片使用JPG，需要透明背景使用PNG，图标和简单图形使用SVG
2. 压缩图片以减少文件大小
3. 考虑使用响应式图片 (`srcset` 属性)
4. 为图片添加合适的 `alt` 描述文本以提高可访问性
5. 懒加载非首屏图片

## 资源链接规范

1. 本地开发环境: 使用相对路径 `@/assets/images/`
2. 生产环境: 可使用CDN链接 `https://ext.same-assets.com/...` 