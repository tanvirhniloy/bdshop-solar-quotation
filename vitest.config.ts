// import { defineConfig } from 'vitest/config';

// export default defineConfig({
//   test: { environment: 'node' },
// });

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  test: {
    environment: 'node',
  },
});