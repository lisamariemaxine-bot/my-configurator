import { defineConfig, devices } from '@playwright/test'

// Browsertests tegen de dev-server. We gebruiken de geïnstalleerde Google Chrome (channel: 'chrome'),
// zodat er geen extra browserdownload nodig is. Headless Chrome gebruikt de echte GPU (± 50 fps);
// met SwiftShader (software-WebGL) haal je amper 2 fps en lopen klikken in time-outs.
const chrome = { channel: 'chrome' }

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:5199', trace: 'retain-on-failure' },
  webServer: {
    command: 'npx vite --port 5199 --strictPort',
    url: 'http://localhost:5199',
    reuseExistingServer: true,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], ...chrome, viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], ...chrome } },
  ],
})
