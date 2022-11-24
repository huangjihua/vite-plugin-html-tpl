import { defineConfig } from 'vite';
import { createVuePlugin } from 'vite-plugin-vue2';
import template from 'vite-plugin-html-tpl';

export default defineConfig({
  plugins: [createVuePlugin(), template()],
});
