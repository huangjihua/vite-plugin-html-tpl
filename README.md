# vite-plugin-html-tpl

[![npm][npm-img]][npm-url] [![node][node-img]][node-url]

## 功能
- 注释`template`语法
- 多页应用支持
- 支持自定义`entry`
- 支持 externals（确保外部化处理那些你不想打包进库的依赖）与`webpack` 配置相同
- 支持 polyfills并支持外部 polyfills 设置

## 安装  

**node version:** >=^14.18.0 || >=16.0.0

**vite version:** >=3.0.0

```bash
npm i vite-plugin-html-tpl -D
```
或

```bash
yarn add vite-plugin-html-tpl -D
```

或

```bash
pnpm install vite-plugin-html-tpl -D
```

## 使用

- **注释模板语法**
 
 在 `index.html` 中增加 需要替换的注释标签，例如
```html
<head>
  <meta charset="UTF-8" />
  <link rel="icon" href="/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title></title>
  <!-- react-cdn -->
</head>
```
 在 `vite.config.ts` 中配置,该方式可以按需引入需要的功能即可
```ts
import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginHtmlTpl from 'vite-plugin-html-tpl'

export default defineConfig({
  plugins: [
    react(),
    vitePluginHtmlTpl({
      entry: 'src/main.ts',
      template: 'public/index.html', // 指定文件夹才需要配置，默认无需配置
      // 注入模板配置
      inject: {
       commentsTemplate: [
          {
            commentName: 'react-cdn',
            tag: 'script',
            attrs: {
              defer: "defer",
              nomodule: true,
              src: 'https://unpkg.com/react@18/umd/react.production.min.j',
            }
          }
        ]
      },
    }),
  ],
})
```
- **vite自带注入标签功能**
```ts
import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginHtmlTpl from 'vite-plugin-html-tpl'

export default defineConfig({
  plugins: [
    react(),
    vitePluginHtmlTpl({
      entry: 'src/main.ts',
      template: 'public/index.html',
      inject: {
        tags: [
          {
            injectTo: 'body-prepend',
            tag: 'script',
            attrs: {
              defer: "defer",
              // nomodule: true, 不支持nomodule属性配置
             src: 'https://unpkg.com/react@18/umd/react.production.min.j',
            },
          },
        ],
      },
    }),
  ],
})
```
- **自定义注入标签配置**
```ts
import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import  vitePluginHtmlTpl  from 'vite-plugin-html-tpl'

export default defineConfig({
  plugins: [
    react(),
    vitePluginHtmlTpl({
      entry: 'src/main.ts',
      template: 'public/index.html',
      inject: {
        customTags: [
          {
            selector: 'script[id="vite-legacy-entry"]',
            position: 'beforebegin',
            tag: 'script',
            attrs: {
              // nomodule: true,
              // defer: 'defer',
              src: 'https://unpkg.com/react@18/umd/react.production.min.j',
            }
          }
        ]
      },
    }),
  ],
})
```
- **多页应用配置**

```ts
import { defineConfig } from 'vite'
import vitePluginHtmlTpl from 'vite-plugin-html-tpl'

export default defineConfig({
  plugins: [
    vitePluginHtmlTpl({
      pages: [
        {
          entry: 'src/main.ts',
          filename: 'index.html',
          template: 'public/index.html',
          injectOptions: {
            tags: [
              {
                injectTo: 'body-prepend',
                tag: 'script',
                attrs: {
                  src: 'https://unpkg.com/react@18/umd/react.production.min.j',
                }
              },
            ],
          },
        },
        {
          entry: 'src/other-main.ts',
          filename: 'other.html',
          template: 'public/other.html',
          injectOptions: {
            tags: [
              {
                injectTo: 'body-prepend',
                tag: 'script',
                attrs: {
                  src: 'https://unpkg.com/react@18/umd/react.production.min.j',
                }
              },
            ],
          },
        },
      ],
    }),
  ],
})
```

## 参数说明

`vitePluginHtmlTpl(options: UserOptions)`

### UserOptions

| 参数     | 类型                     | 默认值        | 说明             |
| -------- | ------------------------ | ------------- | ---------------- |
| entry    | `string`                 | `src/main.ts` | 入口文件         |
| template | `string`                 | `index.html`  | 模板的相对路径   |
| inject   | `InjectOptions`          | -             | 注入 HTML 的数据 |
| pages    | `PageOption[]`           | -             | 多页配置         |
| externals| `Record<string, string>` | -             | 确保外部化处理那些你不想打包进库的依赖  |
| autoPolyfill| `polyfillOptions`     | -             |  具体配置同 [@vitejs/plugin-legacy](https://www.npmjs.com/package/@vitejs/plugin-legacy) |
| polyfills    | `ReplaceTagOptions | HtmlTagDesOptions` | - | 外部 CDN polyfills配置 |

### InjectOptions

| 参数       | 类型                  | 默认值 | 说明                                                       |
| ---------- | --------------------- | ------ | ---------------------------------------------------------- |
| tags       | `HtmlTagDescriptor[]`   | -      | 需要注入的标签列表，vite自带功能   |
| customTags   | `HtmlTagDesOptions[]` | -      |  需要注入的自定义标签列表，与 tags 区别在于可以针对指定的元素位置来插入   |
| commentsTemplate       | `CommentOptions[]`   | - | 需要注入的标签列表。可通过注释占位，通过注入的标签数据匹配替换|

#### env 注入

默认会向 index.html 注入 `.env` 文件的内容，类似 vite 的 `loadEnv`函数

### HtmlTagDesOptions
| 参数          | 类型            | 默认值        | 说明             |
| ------------- | --------------- | ------------- | ---------------- |
| selector      | `string`        | -             |包含一个或多个要匹配的选择器的 DOM 字符串DOMString。该字符串必须是有效的 CSS 选择器字符串；|
| position      | `'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend'`        | -             | html 文件名      |
| filename      | `string`        | -             | html 文件名      |
| filename      | `string`        | -             | html 文件名      |
### PageOption

| 参数          | 类型            | 默认值        | 说明             |
| ------------- | --------------- | ------------- | ---------------- |
| filename      | `string`        | -             | html 文件名      |
| template      | `string`        | `index.html`  | 模板的相对路径   |
| entry         | `string`        | `src/main.ts` | 入口文件         |
| injectOptions | `InjectOptions` | -             | 注入 HTML 的数据 |
| polyfills     | `ReplaceTagOptions | InjectTagOptions`| - 可选  | 注入HTM数据 |

### ReplaceTagOptions
| 参数          | 类型            | 默认值        | 说明             |
| ------------- | --------------- | ------------- | ---------------- |
| attrs      | `Record<string, string | boolean>` | - | 标签属性  |
 
 
### 运行示例

```bash
pnpm install
yarn build
# spa react demo 
yarn example:react
# spa vue3 demo 
yarn example:vue3
# spa vue2 demo 
yarn example:vue2
```
## License

MIT
[npm-img]: https://img.shields.io/npm/v/vite-plugin-html-tpl.svg
[npm-url]: https://npmjs.com/package/vite-plugin-html-tpl
[node-img]: https://img.shields.io/node/v/vite-plugin-html-tpl.svg
[node-url]: https://nodejs.org/en/about/releases/
