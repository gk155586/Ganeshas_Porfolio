const { chromium } = require('C:\\Users\\SK Studio\\AppData\\Local\\ms-playwright-go\\1.57.0\\package');
const path = require('path');
const readline = require('readline');

(async () => {
  const userDataDir = path.join(__dirname, 'user_data');
  console.log(`Launching Chrome with persistent user data at: ${userDataDir}`);
  console.log('Please check the opened browser. Log in to LinkedIn/GitHub/Google Drive if needed.');

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();
  
  // Open LinkedIn profile
  console.log('Opening LinkedIn profile...');
  await page.goto('https://linkedin.com/in/ganesh-kalapad-4100a4259');

  console.log('\n======================================================');
  console.log('1. Look at the Google Chrome window that just opened.');
  console.log('2. Log in to LinkedIn, GitHub, or Google Drive if required.');
  console.log('3. Once you see your profile/content correctly,');
  console.log('   press ENTER in this terminal to save and exit.');
  console.log('======================================================\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  await new Promise(resolve => {
    rl.question('Press Enter to finish setup...', () => {
      rl.close();
      resolve();
    });
  });

  await context.close();
  console.log('Setup finished! Session details successfully saved.');
})();
