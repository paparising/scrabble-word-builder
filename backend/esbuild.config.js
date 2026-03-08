const esbuild = require('esbuild');

const isWatch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  sourcemap: true,
  tsconfig: 'tsconfig.json',
  external: ['express', 'cors', 'dotenv', 'zod'],
};

async function run() {
  if (isWatch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log('Watching with esbuild...');
    return;
  }

  await esbuild.build(buildOptions);
  console.log('Build complete');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
