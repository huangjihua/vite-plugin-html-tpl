import type { Plugin, ResolvedConfig } from 'vite';
// import { loadEnv } from 'vite';
// import * as path from 'pathe';
import path from 'path'
import { parse } from 'node-html-parser'
import createExternal from 'vite-plugin-external';
import history from 'connect-history-api-fallback';
// import legacy from '@vitejs/plugin-legacy';
import type { UserOptions, InjectOptions, HtmlTagDesOptions } from './typing'
import { DEFAULT_TEMPLATE, isMpa, createInput, replaceComment, removeScript, insertScript, createRewire, getPage } from './utils'

export type { InjectOptions, HtmlTagDesOptions }
export default function vitePluginHtmlTpl(userOptions: UserOptions = {}): Plugin[] {
  const {
    externals, // 确保外部化处理那些你不想打包进库的依赖
    pages = [], // 多页面
    inject,
    polyfills = null,
  } = userOptions
  let viteConfig: ResolvedConfig
  let plugins: Plugin[] = []
  if (externals) plugins.push(createExternal({ externals: externals }))
  // if (autoPolyfill) {
  //   plugins.push(...legacy(autoPolyfill))
  // }
  const vitePluginHtmlTpl: Plugin = {
    name: 'vite-plugin-html-tpl',
    enforce: 'post',
    apply: 'build',
    // 可以在 vite 被解析之前修改 vite 的相关配置。钩子接收原始用户配置 config 和一个描述配置环境的变量env
    config(config) {
      const input = createInput(userOptions, config as unknown as ResolvedConfig)
      if (input) {
        return {
          build: {
            rollupOptions: {
              input,
            },
          },
        }
      }
    },
    // 在解析 vite 配置后调用。使用这个钩子读取和存储最终解析的配置。当插件需要根据运行的命令做一些不同的事情时，它很有用。
    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig
      // loadEnv(viteConfig.mode, viteConfig.root, '')
    },
    // 主要用来配置开发服务器，为 dev-server (connect 应用程序) 添加自定义的中间件
    configureServer(server) {
      let _pages: { filename: string; template: string }[] = []
      const rewrites: { from: RegExp; to: any }[] = []
      if (!isMpa(viteConfig)) {
        const template = userOptions.template || DEFAULT_TEMPLATE
        const filename = DEFAULT_TEMPLATE
        _pages.push({
          filename,
          template,
        })
      } else {
        _pages = pages.map((page) => {
          return {
            filename: page.filename || DEFAULT_TEMPLATE,
            template: page.template || DEFAULT_TEMPLATE,
          }
        })
      }
      const proxy = viteConfig.server?.proxy ?? {}
      const baseUrl = viteConfig.base ?? '/'
      const keys = Object.keys(proxy)
      let indexPage: any = null
      for (const page of _pages) {
        if (page.filename !== 'index.html') {
          rewrites.push(createRewire(page.template, page, baseUrl, keys))
        } else {
          indexPage = page
        }
      }

      // ensure order
      if (indexPage) {
        rewrites.push(createRewire('', indexPage, baseUrl, keys))
      }

      server.middlewares.use(
        history({
          disableDotRule: undefined,
          htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
          rewrites: rewrites,
        }),
      )
    },
    // 转换 index.html 的专用钩子。钩子接收当前的 HTML 字符串和转换上下文
    transformIndexHtml(html, ctx) {
      // console.log(viteConfig)
      const url = ctx.filename
      const base = viteConfig.base
      const excludeBaseUrl = url.replace(base, '/')
      const htmlName = path.resolve(process.cwd(), excludeBaseUrl)
      const page = getPage(userOptions, htmlName, viteConfig)
      const { tags = [], customTags = [], commentsTemplate = [] } = page?.inject || inject || {}
      // 替换注释
      html = replaceComment(html, commentsTemplate)
      // polyfills自定义 CDN
      if (polyfills) {
        const root = parse(html)
        // console.log(html)
        const vlp = root.querySelector('script[id="vite-legacy-polyfill"]')
        if (vlp && polyfills.attrs) {
          for (let key in polyfills.attrs) {
            const attrValue = polyfills.attrs[key]
            vlp.setAttribute(key, typeof attrValue === 'boolean' ? '' : attrValue)
          }
          html = root.toString();
        } else if (polyfills['selector'] && polyfills['tag'] && polyfills['position']) {
          html = insertScript(html, [polyfills])
        }
      }
      html = insertScript(html, customTags)
      html = removeScript(html)
      return {
        html,
        tags
      }
    },
    async closeBundle() { }
  };
  plugins.push(vitePluginHtmlTpl)
  return plugins;
}