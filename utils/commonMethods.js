const { expect } = require('@playwright/test');
const { format } = require("date-fns");
const { v4: uuidv4 } = require('uuid');

/**
 * Common utility methods for Playwright automation
 * These methods provide higher-level abstractions over basic Playwright operations
 */

// Wait until an element is visible
async function waitForElementToBeVisible(page, selector, timeout = 30000) {
    await page.waitForSelector(selector, { state: 'visible', timeout });
}

// Wait until an element is clickable
async function waitForElementToBeClickable(page, selector, timeout = 30000) {
    await page.waitForSelector(selector, { state: 'attached', timeout });
    await page.waitForSelector(selector, { state: 'visible', timeout });
}

// Method to enter text into an input field
async function enterText(page, selector, text) {
    await waitForElementToBeVisible(page, selector);
    await page.fill(selector, text);
    console.log(`Entered text "${text}" into ${selector}`);
}

// Method to select an option from a dropdown
async function selectDropdown(page, selector, value) {
    await waitForElementToBeVisible(page, selector);
    await page.selectOption(selector, { value });
    console.log(`Selected "${value}" from dropdown ${selector}`);
}

// Method to click an element (button, link, etc.)
async function clickElement(page, selector) {
    await waitForElementToBeClickable(page, selector);
    await page.click(selector);
    console.log(`Clicked element: ${selector}`);
}

// Method to click an element (button, link, etc.) if it exists
async function clickElementIfExist(page, selector) {
    const elementHandle = await page.$(selector); // Check if element exists
    if (elementHandle) {
        await waitForElementToBeClickable(page, selector); // Ensure it's clickable
        await page.click(selector);
        console.log(` Clicked on element: ${selector}`);
    } else {
        console.warn(`WARNING: Element "${selector}" not found, skipping click.`);
    }
}

// Method to switch to a frame when it exists and is ready within timeout
async function switchToFrame(page, frameSelector, timeout = 30000) {
    try {
        console.log(` Waiting for frame element: ${frameSelector}`);

        // Wait for frame element to be attached to DOM
        const frameHandle = await page.waitForSelector(frameSelector, {
            timeout,
            state: 'attached',
        });

        if (!frameHandle) {
            throw new Error(` Frame element not found: ${frameSelector}`);
        }

        // Wait for the contentFrame to be available
        const start = Date.now();
        let frame = null;

        while ((Date.now() - start) < timeout) {
            frame = await frameHandle.contentFrame();
            if (frame) {
                console.log(` Successfully switched to frame: ${frameSelector}`);
                return frame;
            }
            await page.waitForTimeout(200); // wait before retrying
        }

        throw new Error(` Frame found but contentFrame() remained null after ${timeout}ms: ${frameSelector}`);
    } catch (err) {
        console.error(`ERROR: Failed to switch to frame "${frameSelector}": ${err.message}`);
        throw err;
    }
}

// Method to switch to nested frames (multiple levels deep)
async function switchToNestedFrames(page, frameSelectors = [], timeout = 30000) {
    if (!frameSelectors || frameSelectors.length === 0) {
        throw new Error(' Frame selectors array cannot be empty');
    }

    let currentContext = page;
    console.log(` Switching through ${frameSelectors.length} nested frames...`);

    for (let i = 0; i < frameSelectors.length; i++) {
        const selector = frameSelectors[i];
        let frameElement;

        try {
            // Build appropriate selector based on input format
            const fullSelector = selector.match(/^(\[|\.|#)/)
                ? `iframe${selector}`  // Already has attribute/id/class selector
                : `iframe[name="${selector}"], iframe[id="${selector}"], iframe#${selector}`;

            console.log(`DEBUG: [${i + 1}/${frameSelectors.length}] Looking for frame: ${fullSelector}`);
            
            frameElement = await currentContext.waitForSelector(fullSelector, { 
                timeout,
                state: 'attached'
            });

            if (!frameElement) {
                throw new Error(`Frame element not found for selector: ${fullSelector}`);
            }

            // Wait for contentFrame to be available
            let frame = null;
            const start = Date.now();

            while (!frame && (Date.now() - start < timeout)) {
                frame = await frameElement.contentFrame();
                if (!frame) {
                    await currentContext.waitForTimeout(200);
                }
            }

            if (!frame) {
                throw new Error(`contentFrame() remained null for: ${selector}`);
            }

            console.log(` [${i + 1}/${frameSelectors.length}] Successfully switched to frame: ${selector}`);
            currentContext = frame;

        } catch (err) {
            console.error(`ERROR: Error switching to frame "${selector}" (step ${i + 1}): ${err.message}`);
            throw err;
        }
    }

    console.log(` Successfully navigated through all ${frameSelectors.length} nested frames`);
    return currentContext;
}

// Method to switch back to main frame
async function switchToMainFrame(page) {
    try {
        const mainFrame = page.mainFrame();
        if (!mainFrame) {
            throw new Error(' Main frame could not be found');
        }
        console.log(' Successfully switched back to main frame');
        return mainFrame;
    } catch (err) {
        console.error(`ERROR: Failed to switch to main frame: ${err.message}`);
        throw err;
    }
}

// New method: Check if currently in a frame
async function isInFrame(page) {
    try {
        const currentFrame = page.frame();
        const mainFrame = page.mainFrame();
        return currentFrame !== mainFrame;
    } catch (err) {
        console.error(`ERROR: Error checking frame status: ${err.message}`);
        return false;
    }
}

// New method: Get current frame info
async function getCurrentFrameInfo(page) {
    try {
        const currentFrame = page.frame();
        const mainFrame = page.mainFrame();
        
        return {
            isInFrame: currentFrame !== mainFrame,
            frameName: currentFrame.name() || 'unnamed',
            frameUrl: currentFrame.url() || 'no-url'
        };
    } catch (err) {
        console.error(`ERROR: Error getting frame info: ${err.message}`);
        return null;
    }
}

//  Save current system time (HH:mm:ss)
function saveCurrentSystemTime(context) {
    const now = new Date();
    context.savedTime = format(now, 'HH:mm');
    console.log(` Saved time: ${context.savedTime}`);
}

//  Validate saved time is contained in element's text
async function validateSavedTimeInElementText(page, selector, savedTime) {
    const actualText = await page.textContent(selector);
    console.log(`DEBUG: Checking if "${actualText}" contains "${savedTime}"`);

    if (!actualText.includes(savedTime)) {
        throw new Error(` Expected "${actualText}" to contain saved time "${savedTime}"`);
    }

    console.log(` Saved time "${savedTime}" was found in "${actualText}"`);
}

const generateUsername = () => {
    return `user_${uuidv4().split('-')[0]}`.replace('_','');
};

function generateDNI() {
    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const number = Math.floor(10000000 + Math.random() * 90000000); // 8-digit number
    const letter = letters[number % 23];
    return `${number}${letter}`;
}

module.exports = {
    enterText,
    selectDropdown,
    clickElement,
    clickElementIfExist,
    waitForElementToBeClickable,
    waitForElementToBeVisible,
    switchToFrame,
    switchToNestedFrames,
    switchToMainFrame,
    isInFrame,
    getCurrentFrameInfo,
    saveCurrentSystemTime,
    validateSavedTimeInElementText,
    generateUsername,
    generateDNI
};
