await page.evaluate(() => localStorage.setItem('theme', 'light'));
await page.reload({ waitUntil: 'networkidle' });
await page.screenshot({ path: 'public/screenshots/alif-light.png', fullPage: true });
