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

  test('Asteroid object and orbits are rendered on screen', async () => {
    
    //Check is asteroid entity exists
    const asteroidExists = await page.$('#psyche');
    expect(asteroidExists).not.toBeNull();

    const orbitDExists = await page.$('#orbitD');
    expect(asteroidExists).not.toBeNull();

    const orbitCExists = await page.$('#orbitC');
    expect(asteroidExists).not.toBeNull();

    const orbitBExists = await page.$('#orbitB');
    expect(asteroidExists).not.toBeNull();

    const orbitAExists = await page.$('#orbitA');
    expect(asteroidExists).not.toBeNull();

    //Ensure the model has been loaded using the `model-loaded` event
    const asteroidLoaded = await page.evaluate(() => {
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

    //Check if orbit D is visible
    const isOrbitDVisible = await page.evaluate(() => {
      const orbitD = document.querySelector('#orbitD');
      if(!orbitD) return false;

      const isVisible = orbitD.getAttribute('visible') !== 'false';
      return isVisible;
    });
    expect(isOrbitDVisible).toBe(true);  // Ensure it's visible

    //Check if orbit D is visible
    const isOrbitCVisible = await page.evaluate(() => {
      const orbitC = document.querySelector('#orbitC');
      if(!orbitC) return false;

      const isVisible = orbitC.getAttribute('visible') !== 'false';
      return isVisible;
    });
    expect(isOrbitCVisible).toBe(true);  // Ensure it's visible

    //Check if orbit D is visible
    const isOrbitBVisible = await page.evaluate(() => {
      const orbitB = document.querySelector('#orbitB');
      if(!orbitB) return false;

      const isVisible = orbitB.getAttribute('visible') !== 'false';
      return isVisible;
    });
    expect(isOrbitBVisible).toBe(true);  // Ensure it's visible

    //Check if orbit D is visible
    const isOrbitAVisible = await page.evaluate(() => {
      const orbitA = document.querySelector('#orbitA');
      if(!orbitA) return false;

      const isVisible = orbitA.getAttribute('visible') !== 'false';
      return isVisible;
    });
    expect(isOrbitAVisible).toBe(true);  // Ensure it's visible

  }, 10000);
});