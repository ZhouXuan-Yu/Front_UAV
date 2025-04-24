## 样式调整记录

### 透明度相关
- **背景颜色透明度调整**
  - `.header` 样式中：
    - `background-color: rgba(255, 255, 255, 0.35);` - 透明度参数从 `0.5` 调整为 `0.35`，大幅提高透明度。
  - `.header.scrolled` 样式中：
    - `background-color: rgba(255, 255, 255, 0.55);` - 滚动时的透明度从 `0.7` 调整为 `0.55`。

### 尺寸相关
- **高度调整**
  - `.header` 样式中：
    - `padding: 25px 0;` - 高度参数从 `20px` 增加到 `25px`，使导航栏更高。
  - `.header.scrolled` 样式中：
    - `padding: 20px 0;` - 滚动时的高度从 `16px` 增加到 `20px`。
- **宽度调整**
  - `.header` 样式中：
    - `max-width: 1600px;` - 宽度参数从 `1440px` 增加到 `1600px`，让整体更大。
  - `.container` 样式中：
    - `max-width: 1500px;` - 内容宽度参数从 `1400px` 增加到 `1500px`，增加内容区域宽度。

### 内边距和圆角
- **内边距调整**
  - `.container` 样式中：
    - `padding: 0 30px;` - 内容边距参数从 `24px` 增加到 `30px`，增加内容区域内边距。
  - `.nav-link, .nav-link-plain` 样式中：
    - `padding: 12px 18px;` - 按钮大小参数从 `10px 15px` 增加到 `12px 18px`，使按钮更大。
  - `.contact-button` 样式中：
    - `padding: 12px 30px;` - 联系按钮大小参数从 `10px 25px` 增加到 `12px 30px`，让联系按钮更大。
- **圆角调整**
  - `.header` 样式中：
    - `border-radius: 16px;` - 圆角参数从 `12px` 增加到 `16px`，增加圆角效果。
  - `.contact-button` 样式中：
    - `border-radius: 8px;` - 联系按钮圆角参数从 `6px` 增加到 `8px`，与整体风格保持一致。

### 字体和其他元素
- **字体尺寸调整**
  - `.nav-link, .nav-link-plain, .contact-button` 样式中：
    - `font-size: 17px;` - 字体参数从 `16px` 增加到 `17px`，增大字体尺寸。
- **Logo大小调整**
  - `.logo` 样式中：
    - `transform: scale(1.2);` - Logo大小参数从 `1.1` 增加到 `1.2`，更大的缩放比例。
- **其他效果调整**
  - `.header` 样式中：
    - `backdrop-filter: blur(12px);` - 模糊参数从 `10px` 增加到 `12px`，增强模糊效果，确保背景更透明时的可读性。
    - `box-shadow: 0 6px 25px rgba(0, 0, 0, 0.06);` - 调整阴影大小和透明度，增强悬浮感。