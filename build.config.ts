import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['./src/server-options.ts', './src/helpers.ts'],
  externals: ['unstorage', 'defu', 'h3', 'pathe', 'unplugin', 'ufo'],
})
