const { defineConfig } = require('cypress');
const { execSync } = require('child_process');
const path = require('path');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    defaultCommandTimeout: 12000,
    requestTimeout: 15000,
    env: {
      baseApi: 'http://localhost:3000/api',
    },
    setupNodeEvents(on, config) {
      on('task', {
        ensureE2EUsers() {
          try {
            execSync('node scripts/seed-e2e-users.js', {
              cwd: path.join(__dirname),
              stdio: 'inherit',
              env: {
                ...process.env,
                MONGODB_URI:
                  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tutor-lectura',
              },
            });
            return true;
          } catch {
            return false;
          }
        },
      });
      return config;
    },
  },
});
