// TC-005
//using puppeteer
const puppeteer = require('puppeteer');
let url = 'http://127.0.0.1:3000/index.html';

describe('Orbit view transition', () => {
  let browser;
  let page;

  // Set up Puppeteer
  beforeAll(async () => {

    //Use default browser, Chrome
    //Specify if headless mode
    //Ignore HTTPS certificate and errors since useing self published certificate for AR
    browser = await puppeteer.launch({
        headless: true,
        args: ['--ignore-certificate-errors', 
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'],
        ignoreHTTPSErrors: true,  // This disables HTTPS certificate checking
    });

    page = await browser.newPage();
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    //await page.waitForSelector('#camera', { visible: true, timeout: 90000 }); // might not be necessary?
}, 90000);

  // Close the browser after tests
  afterAll(async () => {
    await browser.close();
  }, 20000);

  // will need updates if orbit locations change
  const orbits = [
    { id: 'orbitA', expectedPosition: { x: 0, y: 1, z: -3 } },
    { id: 'orbitB', expectedPosition: { x: 1, y: 1.5, z: -3.5 } },
    { id: 'orbitC', expectedPosition: { x: -1, y: 0.8, z: -2.5 } },
    { id: 'orbitD', expectedPosition: { x: 0.5, y: 1.2, z: -3 } },
    ];

    // iterate through orbits to test them
    orbits.forEach(({ id, expectedPosition }) => {
        test(`Clicking on ${id} updates the view to center on the orbit`, async () => {
            // Click the orbit ring
            await page.waitForSelector(`#${id}`, {visible: true});
            await page.click(`#${id}`);

            // Wait for the camera to transition
            await page.waitForTimeout(1000); // Adjust if your animation is longer

            // Check camera position
            const cameraPosition = await page.evaluate(() => {
                const camera = document.getElementById('camera');
                return camera.getAttribute('position');
            });

            // Parse the position attribute into an object (i.e. format for wasier js obj comparison)
            const parsedPosition = JSON.parse(
                `{${cameraPosition.replace(/(\w+):/g, '"$1":')}}`
            );

            // Validate position
            expect(parsedPosition).toEqual(expectedPosition);
        }, 40000);
    });  
});
