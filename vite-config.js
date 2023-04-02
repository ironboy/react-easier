import fs from 'fs/promises';

// Add treating js files as jsx files to vite.config.js
// thus improving the debug log since it is piggybacking
// on src-maps, and would otherwise be missing these in js files

const extras = {
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        {
          name: "load-js-files-as-jsx",
          setup(build) {
            build.onLoad({ filter: /src\/.*\.js$/ }, async (args) => {
              return ({ loader: "jsx", contents: await fs.readFile(args.path, "utf-8"), })
            });
          }
        }
      ]
    }
  }
};

export function reactEasierViteConfig(x) {
  // Don't destroy existing settings that overlap
  // (we can live with a bit inferior line numbers in debug
  //  rather than destroying someones config...)
  x.esbuild = x.esbuild || extras.esbuild;
  x.optimizeDeps = x.optimizeDeps || {};
  x.optimizeDeps.esbuildOptions =
    x.optimizeDeps.esbuildOptions ||
    extras.optimizeDeps.esbuildOptions;
  return x;
}