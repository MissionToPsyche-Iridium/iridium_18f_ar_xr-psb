// TC-001
const puppeteer = require('puppeteer');
let url = 'https://127.0.0.1:5500/index.html'

describe('AR Web App', () => {
  let browser;
  let page;

  //Open browser and page first
  beforeAll(async () => {

    //Use default browser, Chrome
    //Specify if headless mode
    //Ignore HTTPS certificate and errors since useing self published certificate for AR
    browser = await puppeteer.launch({
      headless: false,
      args: ['--ignore-certificate-errors'],
      ignoreHTTPSErrors: true,  // This disables HTTPS certificate checking
    });

    //Open new page
    page = await browser.newPage();

    //Open the application url
    await page.goto(url);
  });

  afterAll(async () => {
    await browser.close();
  });

  test('Asteroid and spacecraft objects are rendered on screen', async () => {
    
    //Check is asteroid entity exists
    const asteroidExists = await page.$('#psyche');
    expect(asteroidExists).not.toBeNull();

    //Ensure the model has been loaded using the `model-loaded` event
    const modelLoaded = await page.evaluate(() => {
        return new Promise((resolve) => {
          const asteroid = document.querySelector('#psyche');
          if (!asteroid) resolve(false);
  
          //Listen for the 'model-loaded' event
          asteroid.addEventListener('model-loaded', () => resolve(true));
        });
      });

    //Check if asteroid is visible
    const isAsteroidVisible = await page.evaluate(() => {
        const asteroid = document.querySelector('#psyche');
        if(!asteroid) return false;

        const isVisible = asteroid.getAttribute('visible') !== 'false';
        return isVisible;
    });
    expect(isAsteroidVisible).toBe(true);  // Ensure it's visible

  }, 10000);
});