import * as esbuild from 'esbuild';
import { raw } from "esbuild-raw-plugin";
import * as fs from 'fs';

const header = fs.readFileSync('./minotaur-enhance-patch.meta.js', 'utf8');

const watchEnabled = process.argv.includes('--watch');
const minimifyEnabled = process.argv.includes('--min');

const buildOptions = {
  entryPoints: ['./src/main.js'],
  bundle: true,
  outfile: './dist/minotaur-enhance-patch.user.js',
  banner: { js: header },
  format: 'iife',
  minify: minimifyEnabled,
  target: ['chrome110'],
  plugins: [raw()],
};

if (watchEnabled) {
  const ctx = await esbuild.context(buildOptions);
  ctx.watch().then(() => {
    console.log('👀 Watching for changes...');
  }).catch(() => process.exit(1));
} else {
  esbuild.build(buildOptions).then(() => {
    console.log('✅ Build complete.');
  }).catch(() => process.exit(1));
}
