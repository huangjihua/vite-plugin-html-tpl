import type { ResolvedConfig } from 'vite';
// import * as path from 'pathe'
import path from 'path'
import { HTMLElement, parse } from 'node-html-parser'
import { PageOption, UserOptions, CommentOptions } from './typing'

const commentObject: Record<string, any> = {}
export const DEFAULT_TEMPLATE = 'index.html'
export const ignoreDirs = ['.', '', '/']
export function isMpa(viteConfig: ResolvedConfig) {
  const input = viteConfig?.build?.rollupOptions?.input ?? undefined
  return typeof input !== 'string' && Object.keys(input || {}).length > 1
}
export function createInput(
  { pages = [], template = DEFAULT_TEMPLATE }: UserOptions,
  viteConfig: ResolvedConfig,
) {
  const input: Record<string, string> = {}
  const { root = './' } = viteConfig
  if (isMpa(viteConfig) || pages?.length) {
    const templates = pages.map((page) => page.template)
    templates.forEach((temp) => {
      let dirName = path.dirname(temp)
      const file = path.basename(temp)
      dirName = dirName.replace(/\s+/g, '').replace(/\//g, '-')

      const key =
        dirName === '.' || dirName === 'public' || !dirName
          ? file.replace(/\.html/, '')
          : dirName
      input[key] = path.resolve(root, temp)
    })

    return input
  } else {
    const dir = path.dirname(template)
    if (ignoreDirs.includes(dir)) {
      return undefined
    } else {
      const file = path.basename(template)
      const key = file.replace(/\.html/, '')
      return {
        [key]: path.resolve(root, template),
      }
    }
  }
}

/**
 * 获取模板中所有注释
 *
 * @param {*}  root
 */
function mapComent(root) {
  root.childNodes.map((item: HTMLElement) => {
    if (item.nodeType === 1 && item.childNodes.length) {
      mapComent(item)
    } else {
      if (item.nodeType === 8) {
        const commentText = item['rawText'].replace(/(^\s*)|(\s*$)/g, "");
        if (!commentObject[commentText]) commentObject[commentText] = item.toString()
      }
    }
  })
}

/**
 * 注释语法替换成标签元素
 *
 * @param {CommentOptions[]} comments
 */
export function replaceComment(html: string, comments: CommentOptions[]) {
  if (comments.length) {
    const root = parse(html, { comment: true })
    mapComent(root)
    comments.map(item => {
      if (commentObject[item.commentName]) {
        if (item.tag)
          html = html.replace(commentObject[item.commentName], (ElementStr(item)))
      }
    })
  }
  return html
}
/**
 * 生成元素
 *
 * @param {CommentOptions} item
 * @returns
 */
function ElementStr(item: CommentOptions) {
  const setAttribute = (attr: Record<string, string | boolean>) => {
    let str = ''
    for (let key in attr) {
      str += ` ${key}${typeof attr[key] === 'boolean' ? '' : `="${attr[key]}"`}`
    }
    return str;
  }
  if (item.tag === 'link') {
    return `<${item.tag}${item.attrs && setAttribute(item.attrs)}>`
  } else {
    return `<${item.tag}${item.attrs && setAttribute(item.attrs)}></${item.tag}>`
  }
}


/**
 * 清除 type=module 脚本
 *
 * @param {*} html
 * @returns
 */
export function removeScript(html) {
  const root = parse(html)
  const scriptNodes = root.querySelectorAll('script[type=module]')
  const entry = root.querySelector('script[id=vite-legacy-entry]')
  if (entry) entry.removeAttribute('nomodule')
  const removedNode: string[] = []
  scriptNodes.forEach((item) => {
    removedNode.push(item.toString())
    item.parentNode.removeChild(item);
  })
  return root.toString()
}

/**
 * 根据 自定义selector 获取目标元素，在目标元素（'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend'）位置插入新元素
 *
 * @param {*} html
 * @param {*} customTags
 * @returns
 */
export function insertScript(html, customTags) {
  const root = parse(html)
  if (customTags.length) {
    customTags.forEach(item => {
      const targetRoot = root.querySelector(item.selector) as HTMLElement | null
      if (targetRoot) {
        targetRoot.insertAdjacentHTML(item.position, ElementStr(item))
      }
    });
  }
  return root.toString();
}
/**
 * 创建重连接
 *
 * @param {string} reg
 * @param {*} page
 * @param {string} baseUrl
 * @param {string[]} proxyUrlKeys
 * @returns
 */
export function createRewire(
  reg: string,
  page: any,
  baseUrl: string,
  proxyUrlKeys: string[],
) {
  return {
    from: new RegExp(`^/${reg}*`),
    to({ parsedUrl }: any) {
      const pathname: string = parsedUrl.pathname

      const excludeBaseUrl = pathname.replace(baseUrl, '/')

      const template = path.resolve(baseUrl, page.template)
      if (excludeBaseUrl === '/') {
        return template
      }
      const isApiUrl = proxyUrlKeys.some((item) =>
        pathname.startsWith(path.resolve(baseUrl, item)),
      )
      return isApiUrl ? excludeBaseUrl : template
    },
  }
}
/**
 * 获取页面(包含多页面)
 *
 * @param {UserOptions} 
 * @param {string} name
 * @param {ResolvedConfig} viteConfig
 * @returns
 */
export function getPage(
  { pages = [], template = DEFAULT_TEMPLATE, ...otherOptions }: UserOptions,
  name: string,
  viteConfig: ResolvedConfig,
) {
  let page: PageOption
  if (isMpa(viteConfig) || pages?.length) {
    const defaultPageOption: PageOption = {
      filename: DEFAULT_TEMPLATE,
      template: `./${DEFAULT_TEMPLATE}`,
    }
    const _page = pages.filter((page) => path.resolve('/' + page.template) === path.resolve('/' + name))?.[0]
    page = _page ?? defaultPageOption ?? undefined
  } else {
    page = {
      filename: DEFAULT_TEMPLATE,
      template: template,
      ...otherOptions
    }
  }
  return page
}
