// @ts-check
const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const outDir = path.join(__dirname, 'dist');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const sharedOptions = {
  entryPoints: [path.join(__dirname, 'src/index.ts')],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ['es2017', 'chrome67', 'firefox60', 'safari11'],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
};

async function build() {
  // ESM build
  await esbuild.build({
    ...sharedOptions,
    format: 'esm',
    outfile: path.join(outDir, 'index.js'),
  });

  // CJS build
  await esbuild.build({
    ...sharedOptions,
    format: 'cjs',
    outfile: path.join(outDir, 'index.cjs'),
  });

  // IIFE build (browser — window.FeatureKit)
  await esbuild.build({
    ...sharedOptions,
    format: 'iife',
    globalName: 'FeatureKit',
    outfile: path.join(outDir, 'sdk.iife.js'),
  });

  console.log('✅ @featurekit/sdk built successfully');

  // Log bundle sizes
  const files = ['index.js', 'index.cjs', 'sdk.iife.js'];
  for (const f of files) {
    const stats = fs.statSync(path.join(outDir, f));
    console.log(`   ${f}: ${(stats.size / 1024).toFixed(1)}KB`);
  }
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
