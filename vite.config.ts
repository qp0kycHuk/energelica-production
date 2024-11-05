import { defineConfig, normalizePath } from 'vite'
import path from 'path'
import fs from 'fs'
import injectHTML from 'vite-plugin-html-inject'
import { ViteEjsPlugin } from 'vite-plugin-ejs'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig({
  root: path.resolve(__dirname, 'src'),
  publicDir: path.resolve(__dirname, 'public'),
  base: '',
  plugins: [
    injectHTML({
      tagName: 'include',
    }),
    ViteEjsPlugin(),
    viteStaticCopy({
      targets: [...generateDialogEntry('src/html-dialogs')],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,

    rollupOptions: {
      input: {
        ...generateHtmlEntry('src'),
      },

      output: {
        dir: path.resolve(__dirname, 'dist'),
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] || (assetInfo.name as string)
          let extType = name.split('.').at(1) as string

          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'img'
          }

          if (/woff2?|eot|ttf|otf/i.test(extType)) {
            extType = 'fonts'
          }

          return `${extType}/[name][extname]`
        },
        chunkFileNames: 'js/index.js',
        entryFileNames: 'js/index.js',
      },
    },
  },
})

function generateDialogEntry(dir) {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, dir))

  return templateFiles
    .map((item) => {
      const parts = item.split('.')
      const extension = parts[1]

      if (extension === 'html') {
        return {
          src: normalizePath(path.resolve(__dirname, dir + '/' + item)),
          dest: normalizePath(path.resolve(__dirname, 'dist')),
        }
      }

      return false
    })
    .filter(Boolean) as { src: string; dest: string }[]
}

function generateHtmlEntry(dir) {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, dir))

  return templateFiles.reduce((acc, item) => {
    const parts = item.split('.')
    const name = parts[0]
    const extension = parts[1]

    if (extension === 'html') {
      acc[name] = path.resolve(__dirname, dir + '/' + item)
    }

    return acc
  }, {})
}