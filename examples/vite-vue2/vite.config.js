import { defineConfig } from 'vite';
import { createVuePlugin } from 'vite-plugin-vue2';
import {vitepluginhtmltpl,injectoptions} from 'vite-plugin-html-tpl';

export default defineConfig({
  plugins: [createVuePlugin(), template()],
});
