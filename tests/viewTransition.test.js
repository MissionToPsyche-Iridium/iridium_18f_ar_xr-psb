// TC-005
//using puppeteer
const puppeteer = require('puppeteer');
let url = 'https://127.0.0.1:5500/index.html'

describe('Orbit view transition', () => {
  let browser;
  let page;

  // Set up Puppeteer
  beforeAll(async () => {

    //Use default browser, Chrome
    //Specify if headless mode
    //Ignore HTTPS certificate and errors since useing self published certificate for AR
    browser = await puppeteer.launch({
        headless: false,
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
    { id: 'orbitA', expectedPosition: { x: -0.5, y: 0, z: -1.7 } },
    //{ id: 'orbitB', expectedPosition: { x: 1, y: 1.5, z: -3.5 } },
    //{ id: 'orbitC', expectedPosition: { x: -1, y: 0.8, z: -2.5 } },
    { id: 'orbitD', expectedPosition: { x: -0.5, y: 0, z: -1.7 } },
    ];

    // iterate through orbits to test them
    orbits.forEach(({ id, expectedPosition }) => {
        test(`Clicking on ${id} updates the view to center on the orbit`, async () => {
            

            //Orbit D
            await page.mouse.move(300,300);
            await page.mouse.down();
            await page.mouse.move(400,500);
            await page.mouse.up();

            await page.mouse.down();
            await page.mouse.up();

            // Wait for the camera to transition
            //await page.waitForTimeout(1000); // Adjust if your animation is longer
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check camera position
            const cameraPosition = await page.evaluate(() => {
                const camera = document.getElementById('camera');
                if (!camera) {
                    console.log("Camera not found"); // debug
                    return null; // Handle case where camera is not found
                }
                const positionAttr = camera.getAttribute('position');
                console.log("attribute is: "); // debug
                if (typeof positionAttr === 'string') {
                    return positionAttr;
                } else if (positionAttr && typeof positionAttr === 'object') {
                    // Convert A-Frame position object to a string
                    return `${positionAttr.x}:${positionAttr.y}:${positionAttr.z}`;
                }
                return null; // Handle case where position is undefined or unrecognized
            });

            

            // Parse the position attribute into an object (i.e. format for wasier js obj comparison)
            const parsedPosition = cameraPosition.split(':').map(parseFloat).reduce((acc, value, index) => {
                const keys = ['x', 'y', 'z'];
                acc[keys[index]] = parseFloat(value.toFixed(1));
                return acc;
            }, {});

            console.log("returned position:", cameraPosition); // debug
            console.log("epected position:", expectedPosition); // debug

            const roundedExpectedPosition = {
                x: parseFloat(expectedPosition.x.toFixed(3)),
                y: parseFloat(expectedPosition.y.toFixed(3)),
                z: parseFloat(expectedPosition.z.toFixed(3)),
            };

            // Validate position
            expect(parsedPosition).toEqual(roundedExpectedPosition);
        }, 5000);
    });  
});
