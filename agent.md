# Design Explorer：AI 开发指南

这是一份给 AI coding agent 使用的项目级说明。修改代码前先阅读本文件，并以当前源码和 `package.json` 为准。除非用户明确要求，不要回退、删除或格式化无关的现有改动。

## 项目定位

- 项目名：`design-explorer`
- 技术栈：Vite + React 19，JavaScript/JSX，CSS
- 形态：纯前端、静态 UI 展示与交互实验；没有后端、数据库、路由或 API 请求
- 目标：集中展示组件、交互模式、原型和视觉基础的设计探索、动效及简单交互
- 分类：一级分类为 `All`、`Components`、`Patterns`、`Prototypes`、`Foundations`；研究视角为 `Interaction`、`Motion`、`Visual`
- 数据：示例内容、分类和标签直接写在 `src/data` 或各探索组件内，没有持久化

## 常用命令

```bash
npm install       # 按 package-lock.json 安装依赖
npm run dev       # 启动 Vite 开发服务器
npm run lint      # ESLint 检查
npm run build     # 生成生产构建
npm run preview   # 预览生产构建
```

项目没有测试脚本或测试框架。涉及视觉或交互的改动，除 lint/build 外要在浏览器中检查页面；至少确认对应分类、视角筛选、hover/点击状态、展开/关闭动效和窄屏布局没有回归。

## 运行与组件关系

```text
index.html
└── src/main.jsx                    # StrictMode 挂载 React
    └── src/App.jsx                 # 分类、研究视角和过滤结果
        ├── TabNav                  # 左侧一级分类导航
        ├── taxonomy                # 分类描述和研究视角配置
        └── CardGrid                # 根据过滤结果渲染卡片
            └── Card                # 预览、代码提示、慢速播放、widget 展开
                └── data.Component  # 具体按钮或 widget
```

- `App` 会合并 `buttons.js` 和 `widgets.js`，按每条数据的 `category` 与 `tags` 过滤内容。
- 一级分类与视角筛选统一维护在 `src/data/taxonomy.js`；不要在 `TabNav.jsx` 或 `App.jsx` 里重复硬编码分类列表。
- 新探索必须有一个 `category`，并可设置多个 `tags`。按探索最终产物的规模选择分类，按研究重点添加 `interaction`、`motion`、`visual` 等标签。
- 当前按钮属于 `components`，现有完整 widget 属于 `prototypes`；`patterns` 与 `foundations` 在有真实内容前保持空状态，不要创建 `more` 或 `other` 杂项分类。
- `CardGrid` 只负责遍历数据并以 `item.id` 作为 React key。
- `Card` 接收 `{ id, label, category, tags, Component, props, code, controls, layout }`：
  - `controls: true`（默认）显示慢速按钮和代码查看按钮，并把 `props` 作为 `data` 传给组件。
  - widget 数据统一设置 `controls: false`，组件会被放进 `.widget-preview`，右下角显示展开按钮。
  - `layout: 'wide'` 让 widget 卡片横跨两列；展开层使用 portal 挂到 `document.body`。
  - widget 展开/关闭依赖 `getBoundingClientRect`、`requestAnimationFrame` 和 FLIP 式 transform，不要随意改动卡片占位节点或 portal 结构。

## 目录说明

```text
src/
├── App.jsx                         # 分类、视角筛选和页面状态
├── main.jsx                        # React 入口
├── index.css                       # 全局 reset、布局、卡片、modal、widget 基础样式
├── data/
│   ├── buttons.js                  # 按钮示例注册表
│   ├── widgets.js                  # widget 注册表
│   └── taxonomy.js                 # 一级分类与研究视角
├── components/
│   ├── Card.jsx                    # 通用展示卡片和 widget 展开逻辑
│   ├── CardGrid.jsx                # 卡片网格
│   ├── CodeIcon.jsx                # 代码提示层
│   ├── TabNav.jsx                  # 左侧导航
│   ├── buttons/                    # 按钮示例及 CSS Modules
│   └── widgets/                    # 一个 widget 一个目录，通常包含 JSX + CSS
├── assets/daily-widget/            # Daily widget 通过 import 使用的头像和 SVG
└── utils/superellipse.js           # superellipse SVG path 工具
public/                             # 运行时以 /filename 访问的静态资源
```

当前 widget 包括：`Speed`、`Music`、`Recording`、`Delivery`、`Flight`、`Bucket`、`NextSong`（compact/large）、`Radio`（compact/large）、`Expense`、`Stock`、`Flame`、`FormulaOne`、`DailyEvent`、`DailyTodo`、`GreetingScreen`、`ReceiptComputer`。

根目录的 `dist/` 是构建输出并被 `.gitignore` 忽略，不是源码入口。根目录若存在设计对比截图，它们是参考资料，不应当被当作运行时资源或在无关任务中删除。

## 新增或修改组件

### 新增按钮示例

1. 在 `src/components/buttons/` 新增 JSX；样式优先使用同目录 CSS Module。
2. 在 `src/data/buttons.js` import 并加入数据数组。
3. 数据至少填写 `id`、`label`、`category: 'components'`、`tags` 和 `Component`；可选 `props`、`code` 会由 `Card` 消费，`code` 会显示在卡片的代码提示层。
4. 交互按钮使用 `type="button"`，有图标时提供可读的 `aria-label`。

### 新增 widget

1. 在 `src/components/widgets/<WidgetName>/` 新增 `<WidgetName>.jsx` 和 `<WidgetName>.css`。
2. JSX 根节点使用 `.widget`，组件自行 import 自己的 CSS。
3. 在 `src/data/widgets.js` import 组件并加入数组；数据至少填写 `id`、`label`、`tags` 和 `Component`，文件末尾会统一追加 `category: 'prototypes'` 与 `controls: false`。
4. 普通 widget 适配 240×240 设计画布；横向 widget 使用 `layout: 'wide'`，设计画布遵循现有 `514×240px` 约定，展示卡片横跨两列并保持 `2:1`。
5. 需要复用的结构或资源先复用现有实现：`NextSongWidget` 已复用 `NextSongWidgetLarge` 的 `compact` 模式；Daily widget 共用 `DailyWidgetShared.jsx` 和 `DailyWidgets.css`。

## Widget 默认尺寸与 Squircle 圆角规则

### 默认尺寸和最外层圆角

- 标准 widget 的设计画布为 `240×240px`，由 `--widget-design-size: var(--card-size)` 控制。
- 标准 widget 在卡片中的默认预览尺寸为 `120×120px`，对应 `--widget-scale: 0.5`。
- 宽版 widget 的默认设计画布约定为 `514×240px`，使用 `layout: 'wide'`；默认预览区域约为 `252×120px`。已有组件如果因设计稿使用 `504×240px` 或单独缩放值，保留其明确写出的例外。
- 圆角矩形 widget 最外层的默认实现圆角为 `64px`，统一使用 `--widget-outer-radius: 64px` 和 `corner-shape: squircle`。
- 设计稿明确给出其他最外层圆角时可以覆盖默认 64px，但覆盖值仍必须是设计稿圆角的 1.5 倍；例如设计稿外层圆角为 32px，CSS 中应写 48px。
- `.design-card` 是网站中的展示容器，不是 widget 设计画布；它当前是响应式尺寸、`aspect-ratio: 1`、`border-radius: 16px`，不要把展示容器的 16px 当成 widget 的默认圆角。

### Squircle 的使用方式

- Widget 中凡是设计稿给出了具体像素圆角的元素，都必须使用 squircle；这条规则适用于最外层容器，也适用于内部面板、按钮、输入框、显示屏、标签等所有圆角元素，不能只给最外层添加 squircle。
- 实现时必须同时声明 `border-radius` 和 `corner-shape: squircle`。只写 `border-radius` 不算完成。
- CSS 中实际使用的圆角值必须等于设计稿标注圆角的 `1.5` 倍：`实现圆角 = 设计稿圆角 × 1.5`。
- 换算后允许出现小数值，并应保留准确结果。例如设计稿为 `12px`、`17px`、`32px` 时，实现分别为 `18px`、`25.5px`、`48px`。
- 优先把重复圆角写成 widget 内部 CSS 变量；只有跨多个 widget 共用的默认值才放进 `src/index.css` 的 `:root`。
- 设计稿明确要求的正圆或完全胶囊形不属于“具体像素圆角”换算：正圆继续使用 `border-radius: 50%`，完全胶囊形继续使用 `border-radius: 999px`，并使用 `corner-shape: round`。不要对 `50%` 或 `999px` 再乘 1.5。

```css
/* 设计稿圆角 24px → 实现圆角 36px */
.widget-panel {
  border-radius: 36px;
  corner-shape: squircle;
}

/* 标准圆角矩形 widget 外层 */
.widget.example-widget {
  width: var(--widget-design-size);
  height: var(--widget-design-size);
  border-radius: var(--widget-outer-radius);
  corner-shape: squircle;
}
```

从设计稿实现或复核 widget 时，逐个检查所有带圆角的元素，先读取设计稿原始圆角，再完成 `× 1.5` 换算；不要直接照抄设计稿数值，也不要通过肉眼估计圆角。

## 样式与资源约定

- 全局尺寸和设计 token 在 `src/index.css` 的 `:root` 中维护，例如 `--card-size`、`--widget-scale`、圆角和字体变量；优先使用这些变量，不要在全局重复造同类常量。
- `.design-card` 是网格卡片；`.widget` 是居中、缩放后的设计画布。widget 的实际绘制通常以 240×240 为基准，再由 `--widget-scale` 缩放到预览尺寸。
- 每个 widget 的细节样式放在自己的 CSS 文件；只有跨组件的布局、卡片、modal、token 才放进 `src/index.css`。
- `public` 内资源用绝对路径引用，例如 `/next-song-album.png`；`src/assets` 内资源用 ES module import。不要混用两种路径方式。
- 项目依赖了 Google Fonts 和阿里 iconfont 的远程 CSS；不要为了单个视觉效果随意新增 UI/动画依赖。
- 严格遵守上面的 squircle `× 1.5` 换算规则，并保留字体变量、缩放和 `prefers-reduced-motion` 处理，除非任务本身就是调整设计系统。

## 交互实现注意事项

- 这是展示型 demo，状态通常是组件本地 `useState`；不要为了示例数据引入全局状态管理或后端。
- 含 timer、`requestAnimationFrame`、canvas 或事件订阅的组件必须在 effect cleanup 中清理资源。
- 动效改动要检查 `prefers-reduced-motion: reduce` 分支；不要只让正常速度看起来正确。
- `Card` 的 widget 展开会改变 `position`、`transform`、遮罩层和占位卡片；不要把 widget 直接移出 `Card` 来绕过现有机制。
- 视觉参数通常比抽象层更重要。优先做局部、可验证的 CSS/JSX 改动，避免无需求的重构。

## 完成前检查

1. 只修改完成任务所需的文件，保留用户已有的未提交改动。
2. 运行 `npm run lint` 和 `npm run build`。
3. 如果 lint 或 build 在未触碰的代码上失败，报告为基线问题；不要通过关闭规则或隐藏错误来“修复”它。
4. UI 改动在浏览器中检查实际尺寸、响应式布局、键盘可操作性、按钮 aria 文案和动效状态。
5. 最终说明改了什么、验证了什么，以及仍存在的基线问题。
