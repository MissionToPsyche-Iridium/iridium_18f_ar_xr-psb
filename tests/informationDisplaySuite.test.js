// TS-006
let url = 'https://127.0.0.1:5501/index.html'
const { closeOrbitOverlayIfVisible } = require('./utils/overlayUtils');

describe('Orbit A scene interaction', () => {
    beforeAll(async () => {
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 60000,
        });

        await closeOrbitOverlayIfVisible(page);
    });
        
    afterAll(async () => {
    });

    describe("Orbit A information display", () => {
        const orbits = ['A', 'B', 'C', 'D'];
        test.each(orbits)('Information specific to selected orbit is displayed', async (orbit) => {
            //Get Orbit hitbox and click it
            await page.evaluate((orbitName) => {
                const hitbox = document.querySelector(`#orbit${orbitName}-wrapper .hitbox`);
                if (hitbox) {
                    hitbox.emit('click');
                }
            }, orbit);

            //Get description box object
            const descriptionBoxVisible = await page.$('.orbit-description');
            
            expect(descriptionBoxVisible).not.toBeNull();

            //Ensure description Box is visible
            const isVisible = await page.evaluate(description => {
                if (!description) return false;
                const style = window.getComputedStyle(description);
                return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
            }, descriptionBoxVisible);
            expect(isVisible).toBe(true);

            //Get button element
            const seeMoreButton = await page.$('#see-more-btn');

            //Ensure the button exists and is visible
            expect(seeMoreButton).not.toBeNull();

            const isButtonVisible = await page.evaluate(button => {
                if (!button) return false;
                const style = window.getComputedStyle(button);
                return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
            }, seeMoreButton);
            expect(isButtonVisible).toBe(true);

            //Wait for the text box to expand 
            await page.evaluate(() => new Promise(resolve => 
            setTimeout(resolve, 100)
            ));

            //Click the button
            await seeMoreButton.click();

            //Wait for the text box to expand 
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 100)
            ));

            //Verify if the text box has expanded 
            const isExpanded = await page.evaluate(() => {
                const el = document.querySelector('.orbit-description');
                return el?.classList.contains('expanded');
            });
            expect(isExpanded).toBe(true);
        }, 10000);
    });
});