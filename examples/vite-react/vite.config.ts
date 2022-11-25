import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy';
import { InjectOptions, vitePluginHtmlTpl } from 'vite-plugin-html-tpl'
// import template, { InjectOptions } from '../../src/'
console.log(vitePluginHtmlTpl)
const inject: InjectOptions = {
  tags: [
    {
      injectTo: 'head',
      tag: 'script',
      attrs: {
        src: 'https://x.autoimg.cn/bi/mda/ahas_head.min.js'
      }
    },
  ],
  customTags: [
    {
      selector: 'script[id="vite-legacy-entry"]',
      position: 'beforebegin',
      tag: 'script',
      attrs: {
        // nomodule: true,
        // defer: 'defer',
        src: 'https://g.autoimg.cn/@app/static/react@17.0.2,react-dom@17.0.2,react-router-dom@6.3.0,immer@9.0.15,axios@0.27.2,js-cookie@3.0.1.min.js',
      }
    },
    {
      selector: 'script[id="vite-legacy-entry"]',
      position: 'beforebegin',
      tag: 'script',
      attrs: {
        // nomodule: true,
        // defer: 'defer',
        src: 'https://fs.autohome.com.cn/ug_spa/common/js/system.min.js',
      }
    },
    // {
    //   selector: 'body',
    //   position: 'beforeend',
    //   tag: 'script',
    //   attrs: {
    //     defer: 'defer',
    //     src: 'https://z.autoimg.cn/tracking_point/projects/637443246f8a480018e69f12/v5.js',
    //   }
    // }
  ],
  commentsTemplate: [
    {
      commentName: 'app',
      tag: 'script',
      attrs: {
        // defer: "defer",
        // nomodule: true,
        src: 'https://x.autoimg.cn/bi/mda/ahas_head.min.js',
      }
    }
  ]
}
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy({ targets: ['> 0.01%', 'not dead', 'not op_mini all'] }),
    vitePluginHtmlTpl({
      pages: [{
        entry: './src/main.tsx',
        template: './list.html',
        filename: 'list.html',
        inject
      }, {
        entry: './src/main.tsx',
        template: './other.html',
        filename: 'other.html',
        inject
      }],
      entry: './src/main.tsx',
      template: './index.html',
      externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        history: 'HistoryLibrary',
        'react-router': 'ReactRouter',
        'react-router-dom': 'ReactRouterDOM',
      },
      autoPolyfill: {
        targets: ['> 0.01%', 'not dead', 'not op_mini all']
      },
      polyfills: {
        // selector: 'body',
        // position: 'beforeend',
        // tag: 'script',
        attrs: {
          src: 'https://g.autoimg.cn/@app/static/next-polyfill-nomodule@12.3.1.min.js',
        }
      },
      inject,
    })
  ],

})
