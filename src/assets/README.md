# 资源目录说明

本目录 (`src/assets`) 用于存放项目的静态资源文件，包括图片、视频和CSS样式表等。

## 目录结构

```
src/assets/
│
├── images/             # 图片资源
│   ├── *.svg           # SVG矢量图
│   ├── *.jpg/jpeg      # 照片类图片
│   ├── *.png           # 需要透明背景的图像
│   └── README.md       # 图片资源使用说明
│
├── videos/             # 视频资源
│   ├── *.mp4           # 视频文件
│   └── README.md       # 视频资源使用说明
│
├── main.css            # 全局样式表
└── README.md           # 本文件，资源目录说明
```

## 资源引用规范

### 在Vue组件中引用资源

1. 使用`@`别名（推荐）:
```js
import '@/assets/main.css';
import videoFile from '@/assets/videos/file.mp4';
```

```html
<img src="@/assets/images/image.png" alt="描述文本" />
```

2. 使用相对路径:
```js
import '../../assets/main.css';
import videoFile from '../../assets/videos/file.mp4';
```

### 在CSS中引用资源

```css
.element {
  background-image: url('@/assets/images/image.png');
}
```

## 资源管理原则

1. **本地与CDN资源**:
   - 开发环境: 使用本地资源 (`@/assets/...`)
   - 生产环境: 可使用CDN资源 (`https://ext.same-assets.com/...`)

2. **资源优化**:
   - 图片压缩：使用适当工具压缩图片以减少文件大小
   - 适当格式：根据需求选择合适的图片格式（JPG/PNG/SVG）
   - 视频处理：大型视频考虑使用视频托管服务

3. **命名规范**:
   - 使用有意义的英文名称
   - 使用连字符(-)分隔单词
   - 避免使用中文、特殊字符和空格

4. **文件组织**:
   - 根据资源类型分别存放在对应子目录
   - 相关资源使用统一的命名前缀

## 更多信息

- 图片资源详细说明请参考: [images/README.md](./images/README.md)
- 视频资源详细说明请参考: [videos/README.md](./videos/README.md) 