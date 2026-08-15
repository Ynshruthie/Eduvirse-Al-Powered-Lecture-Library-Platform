const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  try {
    await page.goto('http://localhost:3000/teacher/live-classes');
    await page.waitForTimeout(3000);
  } catch (err) {
    console.error('Nav failed:', err);
  }
  await browser.close();
})();
