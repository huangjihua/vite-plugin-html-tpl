// import type { Options as MinifyOptions } from 'html-minifier-terser'
import type { HtmlTagDescriptor } from 'vite'

export type Entry = string | Record<string, string>

export interface InjectOptions {
  tags?: HtmlTagDescriptor[],
  customTags?: HtmlTagDesOptions[]
  /** 利用注释来动态替换内容 */
  commentsTemplate?: CommentOptions[]
}
export interface HtmlTagDesOptions {
  /** 
   * 包含一个或多个要匹配的选择器的 DOM 字符串DOMString。该字符串必须是有效的 CSS 选择器字符  */
  selector: string,
  /** 插入位置 参考 https://developer.mozilla.org/zh-CN/docs/Web/API/Element/insertAdjacentElement */
  position: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend',
  tag: string /* 标签名 */
  attrs?: Record<string, string | boolean>
}
export interface CommentOptions {
  commentName: string
  tag: string
  attrs?: Record<string, string | boolean>
}

export interface PageOption {
  filename: string
  template: string
  entry?: string
  inject?: InjectOptions,
  polyfills?: ReplaceTagOptions | HtmlTagDesOptions
}
// 存在 pollfills 替换属性类型
export type ReplaceTagOptions = {
  attrs: Record<string, string | boolean>
}

// 
export type polyfillOptions = {
  /**
   * default: 'defaults'
   */
  targets?: string | string[] | {
    [key: string]: string;
  };
  /**
   * default: false
   */
  ignoreBrowserslistConfig?: boolean;
  /**
   * default: true
   */
  polyfills?: boolean | string[];
  additionalLegacyPolyfills?: string[];
  /**
   * default: false
   */
  modernPolyfills?: boolean | string[];
  /**
   * default: true
   */
  renderLegacyChunks?: boolean;
  /**
   * default: false
   */
  externalSystemJS?: boolean;
}

export interface UserOptions {
  /**
   * page entry
   */
  entry?: string
  /**
   * template path
   */
  template?: string

  /**
   * @description inject options
   */
  inject?: InjectOptions,
  /**
   * @description 多页配置
   */
  pages?: PageOption[],
  externals?: Record<string, string>// 确保外部化处理那些你不想打包进库的依赖
  /** autoPolyfill 配置 */
  autoPolyfill?: polyfillOptions
  /**
   * 是否采用Polyfill CDN,需要单独引入Polyfill CDN
   *
   * @type {boolean}
   * @memberof UserOptions
   */
  polyfills?: ReplaceTagOptions | HtmlTagDesOptions,

}