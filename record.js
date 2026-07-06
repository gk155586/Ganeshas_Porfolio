const { chromium } = require('C:\\Users\\SK Studio\\AppData\\Local\\ms-playwright-go\\1.57.0\\package');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('Launching browser...');
  const userDataDir = path.join(__dirname, 'user_data');
  console.log(`Using persistent session at: ${userDataDir}`);

  // Launch Chrome using the user_data session where the user logged in
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: __dirname,
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();

  // Block heavy analytics/advertising requests to load pages faster
  await page.route('**/*', route => {
    const url = route.request().url();
    if (
      url.includes('google-analytics') ||
      url.includes('doubleclick') ||
      url.includes('analytics') ||
      url.includes('beacon') ||
      url.includes('telemetry')
    ) {
      route.abort();
    } else {
      route.continue();
    }
  });

  // Track video timestamps for FFMPEG cutting
  const startTime = Date.now();
  const cuts = [];

  // Use local file path to load the portfolio instantly
  const localUrl = 'file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/');
  console.log(`Navigating to local portfolio: ${localUrl}`);
  await page.goto(localUrl, { waitUntil: 'load' });

  // Helper: Setup custom cursor, remove target="_blank", and hide loader
  const setupPage = async () => {
    console.log('Setting up page cursor, disabling loader, and patching links...');
    await page.evaluate(() => {
      // 1. Permanently hide the loading screen so it never flashes on back-navigation
      const style = document.createElement('style');
      style.innerHTML = `
        #loader { display: none !important; }
        #custom-cursor {
          position: fixed;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgba(99, 102, 241, 0.9);
          border: 2px solid #ffffff;
          pointer-events: none;
          z-index: 999999;
          transition: transform 0.1s ease, background-color 0.1s ease, box-shadow 0.1s ease;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.7);
          transform: translate(-50%, -50%);
          left: -100px;
          top: -100px;
        }
      `;
      document.head.appendChild(style);

      // 2. Remove target="_blank" from links so they load in the same tab
      document.querySelectorAll('a[target="_blank"]').forEach(a => {
        a.removeAttribute('target');
      });

      // 3. Inject custom cursor element if not present
      if (!document.getElementById('custom-cursor')) {
        const cursor = document.createElement('div');
        cursor.id = 'custom-cursor';
        document.body.appendChild(cursor);
      }

      window.clickCursor = () => {
        const cursor = document.getElementById('custom-cursor');
        if (!cursor) return;
        cursor.style.transform = 'translate(-50%, -50%) scale(0.7)';
        cursor.style.backgroundColor = 'rgba(6, 182, 212, 0.95)'; // Cyan click
        cursor.style.boxShadow = '0 0 15px rgba(6, 182, 212, 0.8)';
        setTimeout(() => {
          cursor.style.transform = 'translate(-50%, -50%)';
          cursor.style.backgroundColor = 'rgba(99, 102, 241, 0.9)';
          cursor.style.boxShadow = '0 0 10px rgba(99, 102, 241, 0.7)';
        }, 150);
      };
    });
  };

  // Run initial page setup
  await setupPage();
  await page.waitForTimeout(1000);

  // Helper: Smooth mouse cursor movement
  const moveCursorTo = async (tx, ty, durationMs = 600) => {
    await page.evaluate(async ([x, y, d]) => {
      const cursor = document.getElementById('custom-cursor');
      if (!cursor) return;
      const startX = parseFloat(cursor.style.left) || 0;
      const startY = parseFloat(cursor.style.top) || 0;
      const startTime = performance.now();
      
      return new Promise(resolve => {
        function step(time) {
          const elapsed = time - startTime;
          const progress = Math.min(elapsed / d, 1);
          const ease = progress < 0.5 
            ? 4 * progress * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          
          const curX = startX + (x - startX) * ease;
          const curY = startY + (y - startY) * ease;
          
          cursor.style.left = `${curX}px`;
          cursor.style.top = `${curY}px`;
          
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            resolve();
          }
        }
        requestAnimationFrame(step);
      });
    }, [tx, ty, durationMs]);

    await page.mouse.move(tx, ty, { steps: 4 });
  };

  // Helper: Smooth scrolling
  const smoothScrollTo = async (targetScrollTop, durationMs = 1200) => {
    await page.evaluate(async ([target, dur]) => {
      const start = window.scrollY;
      const difference = target - start;
      const startTime = performance.now();
      
      return new Promise(resolve => {
        function step(time) {
          const elapsed = time - startTime;
          const progress = Math.min(elapsed / dur, 1);
          const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          
          window.scrollTo(0, start + difference * ease);
          
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            resolve();
          }
        }
        requestAnimationFrame(step);
      });
    }, [targetScrollTop, durationMs]);
    await page.waitForTimeout(400);
  };

  // Helper: Smooth scrolling to element
  const scrollToElement = async (selector, durationMs = 1200) => {
    const el = await page.$(selector);
    if (!el) {
      console.log(`Element not found for scrolling: ${selector}`);
      return;
    }
    const offsetTop = await page.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return window.scrollY + rect.top;
    }, el);
    await smoothScrollTo(Math.max(0, offsetTop - 60), durationMs);
  };

  // Helper: Hover and click element (handles external loading timeline)
  const hoverAndClick = async (selector, waitTimeAfterClick = 1200, isExternal = false) => {
    await setupPage();
    const el = await page.$(selector);
    if (!el) {
      console.log(`Element not found: ${selector}`);
      return false;
    }
    const box = await el.boundingBox();
    if (!box) {
      console.log(`Bounding box not found for: ${selector}`);
      return false;
    }
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    
    await moveCursorTo(x, y, 600);
    await page.waitForTimeout(100);
    
    const clickTime = (Date.now() - startTime) / 1000;
    await page.evaluate(() => window.clickCursor());
    await page.waitForTimeout(80);
    await el.click();

    if (isExternal) {
      console.log('Waiting for external page load...');
      try {
        await page.waitForLoadState('load', { timeout: 15000 });
      } catch (e) {
        console.log('External load state timeout, proceeding...');
      }
      // Wait for content rendering to avoid spinners
      await page.waitForTimeout(4000); 
      const loadedTime = (Date.now() - startTime) / 1000;
      
      // Cut from 0.15s after click (shows click flash) to fully loaded page
      cuts.push({ start: clickTime + 0.15, end: loadedTime });
      await page.waitForTimeout(waitTimeAfterClick);
    } else {
      await page.waitForTimeout(waitTimeAfterClick);
    }
    return true;
  };

  // Helper: Navigate back and cut out the back loading phase
  const navigateBack = async () => {
    console.log('Navigating back...');
    const backClickTime = (Date.now() - startTime) / 1000;
    await page.goBack();
    try {
      await page.waitForLoadState('load', { timeout: 10000 });
    } catch (e) {}
    await page.waitForTimeout(1000); // Page stable
    const backLoadedTime = (Date.now() - startTime) / 1000;
    
    // Cut out the transition page reload
    cuts.push({ start: backClickTime, end: backLoadedTime });
    await setupPage();
  };

  // Helper: Hover only
  const hoverOnly = async (selector, durationMs = 600) => {
    const el = await page.$(selector);
    if (!el) return;
    const box = await el.boundingBox();
    if (!box) return;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await moveCursorTo(x, y, durationMs);
    await page.waitForTimeout(300);
  };

  // ==========================================
  // WALKTHROUGH SEQUENCE
  // ==========================================

  // --- HERO HOVERS ---
  console.log('Step: Hero Bento card hovers');
  await hoverOnly('.bento-code', 800);
  await hoverOnly('.bento-stat', 600);
  await hoverOnly('.bento-loc', 600);
  await hoverOnly('.bento-hire', 600);
  await page.waitForTimeout(600);

  // --- SMOOTH SCROLL DOWN ---
  console.log('Step: Scrolling to About section');
  await scrollToElement('#about', 1200);
  await hoverOnly('.about-text p', 800);
  await page.waitForTimeout(600);

  console.log('Step: Scrolling to Stack');
  await scrollToElement('#skills', 1200);
  await hoverOnly('.skills-grid', 800);
  await page.waitForTimeout(600);

  console.log('Step: Scrolling to Work');
  await scrollToElement('#experience', 1200);
  await hoverOnly('.edu-timeline', 800);
  await page.waitForTimeout(600);

  console.log('Step: Scrolling to Projects');
  await scrollToElement('#projects', 1200);
  await hoverOnly('.proj-card', 800);
  await page.waitForTimeout(600);

  // --- PROJECT LINKS INTERACTION ---
  console.log('Step: Click Google Drive Project 1 Assets');
  await hoverAndClick('.proj-card:nth-of-type(1) .proj-drive-btn', 5000, true); 
  await navigateBack();

  console.log('Step: Click Google Drive Project 2 PDF Report');
  await scrollToElement('#projects', 800);
  await hoverAndClick('.proj-card:nth-of-type(2) .proj-drive-btn', 5000, true); 
  await navigateBack();

  console.log('Step: Scrolling to Certs');
  await scrollToElement('#certs', 1200);
  await page.waitForTimeout(600);

  // --- CERT FILTERS & LIGHTBOX ---
  console.log('Step: Cert Filters');
  await hoverAndClick('button[data-filter="cloud"]', 1000);
  await hoverAndClick('button[data-filter="web"]', 1000);
  await hoverAndClick('button[data-filter="all"]', 1000);

  console.log('Step: Open Certificate Lightbox');
  await scrollToElement('.cert-card--real', 800);
  await hoverAndClick('.cert-card--real:first-child', 1500);

  console.log('Step: Lightbox Navigation');
  await hoverAndClick('#lbNext', 1200);
  await hoverAndClick('#lbNext', 1200);
  await hoverAndClick('#lbClose', 1000);

  // --- RESEARCH PAPERS ---
  console.log('Step: Scrolling to Research');
  await scrollToElement('.sec-label:has-text("// 06 research")', 1200);
  await page.waitForTimeout(600);

  console.log('Step: Click Research Paper 1');
  await hoverAndClick('.pub-card:nth-of-type(1) .pub-btn', 5000, true); 
  await navigateBack();

  console.log('Step: Click Research Paper 2');
  await scrollToElement('.sec-label:has-text("// 06 research")', 800);
  await hoverAndClick('.pub-card:nth-of-type(2) .pub-btn', 5000, true); 
  await navigateBack();

  // --- CONTACT & SOCIALS ---
  console.log('Step: Scroll to Contact');
  await scrollToElement('#contact', 1200);
  await page.waitForTimeout(600);

  console.log('Step: Click LinkedIn Link');
  await hoverAndClick('a[aria-label="LinkedIn"]', 5000, true); 
  await navigateBack();

  console.log('Step: Scroll back to Contact');
  await scrollToElement('#contact', 800);
  console.log('Step: Click GitHub Link');
  await hoverAndClick('a[aria-label="GitHub"]', 5000, true); 
  await navigateBack();

  // --- OUTRO ---
  console.log('Step: Scroll back to top (Outro)');
  await smoothScrollTo(0, 1800);
  await page.waitForTimeout(1800);

  // Get recording video details before closing
  const video = page.video();

  // Close browser context
  console.log('Closing browser...');
  await context.close();

  if (video) {
    const rawVideoPath = await video.path();
    console.log(`Raw video path: ${rawVideoPath}`);

    // Compile Keep segments
    const segments = [];
    let lastTime = 0;
    
    // Sort cuts chronologically
    cuts.sort((a, b) => a.start - b.start);
    
    cuts.forEach(cut => {
      if (cut.start > lastTime) {
        segments.push({ start: lastTime, end: cut.start });
      }
      lastTime = cut.end;
    });
    
    // Add the final outro segment
    const totalDuration = (Date.now() - startTime) / 1000;
    if (totalDuration > lastTime) {
      segments.push({ start: lastTime, end: totalDuration });
    }

    console.log('Segments to keep (seconds):', segments);

    // Build FFMPEG filtercomplex trim command
    let filterComplex = '';
    let concatInputs = '';
    
    segments.forEach((seg, idx) => {
      filterComplex += `[0:v]trim=start=${seg.start.toFixed(2)}:end=${seg.end.toFixed(2)},setpts=PTS-STARTPTS[v${idx}];`;
      concatInputs += `[v${idx}]`;
    });
    
    filterComplex += `${concatInputs}concat=n=${segments.length}:v=1:a=0[outv]`;
    
    const ffmpegPath = 'C:\\Users\\SK Studio\\AppData\\Local\\ms-playwright\\ffmpeg-1011\\ffmpeg-win64.exe';
    const finalVideoPath = path.join(__dirname, 'portfolio_demo.mp4');
    
    console.log('Running FFMPEG to edit out loading and buffering sequences...');
    const { execSync } = require('child_process');
    
    try {
      const cmd = `"${ffmpegPath}" -y -i "${rawVideoPath}" -filter_complex "${filterComplex}" -map "[outv]" "${finalVideoPath}"`;
      execSync(cmd, { stdio: 'inherit' });
      console.log(`Video processed. Buffering/loading screens removed! Saved to: ${finalVideoPath}`);
    } catch (err) {
      console.error('FFMPEG failed, fallback to raw copy:', err);
      fs.copyFileSync(rawVideoPath, finalVideoPath);
    }
  } else {
    console.log('Error: Video was not captured.');
  }
})();
