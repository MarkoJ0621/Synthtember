import { run } from "./visuals.js";
import { trackHands } from './tracking.js';
import { p5Instance } from './visuals.js';
import debounce from 'debounce';

let x = 0;
let y = 0;
let counter = 0;
let posRefresh = 10;
let skew = 0;
let prevCount = 0;
let testCount = 0;
let prevHandCount = 0;


// Send Csound message through IPC
function sendToCsound(message) {
    if (window.csoundBridge) {
        window.csoundBridge.send(message);
    } else {
        console.warn("csoundBridge not available");
    }
}

const debouncedUpdateNotes = debounce(updateNotes, 400);
const debouncedHandleHandCountChange = debounce(handleHandCountChange, 400);
const debouncedUpdateHandCount = debounce(updateHandCount, 400);
const debouncedRun = debounce((y, handCount) => {
    run(y, handCount + testCount);
}, 400, { immediate: true });

// Hand tracking logic
const stopTracking = await trackHands(({ handCount, hands }) => {
    console.log("hey....");
    counter = (counter + 1) % posRefresh;

    if (counter === 0) {
        y = (handCount > 0)
            ? hands.reduce((sum, h) => sum + (0.5 - h.x), 0)
            : 0;
        debouncedUpdateHandCount(handCount);
    }

    if (handCount === 0) {
        p5Instance.noNewPositions();
    }

    handleHandPositions(hands);
    updateNotes(handCount, hands);
    handleHandCountChange(handCount);
    debouncedRun(y, handCount + testCount);
});

// --- helpers ---

function handleHandPositions(hands) {
    for (const h of hands) {
        const xPos = window.innerWidth - h.x * window.innerWidth;
        const yPos = h.y * window.innerHeight;
        p5Instance.addHandPosition(xPos, yPos);

        const pitch = 11 - Math.round(h.y * 10);
        sendToCsound(`i "setNote" 0 0.01 ${hands.indexOf(h)} ${pitch}`);
    }
}

function updateNotes(handCount, hands) {
    // Turn off extra notes above current hand count
    for (let i = 3; i >= handCount; i--) {
        sendToCsound(`i "setNoteVol" 0 0.7 ${i} 0`);
    }
}

function handleHandCountChange(handCount) {
    if (handCount === prevHandCount) return;

    prevHandCount = handCount;

    for (let i = 0; i < handCount; i++) {
        sendToCsound(`i "setNoteVol" 0 0.7 ${i} 0.3`);
    }

    for (let i = 3; i >= handCount; i--) {
        sendToCsound(`i "setNoteVol" 0 0.7 ${i} 0`);
    }
}



// Update hand count in Csound
function updateHandCount(currentCount) {
    if (currentCount !== prevCount) {
        console.log("hand count changed");
        for (let i = 0; i < 30; i++) {
            const onOff = i < currentCount ? 1 : 0;
            sendToCsound(`i "setHand" 0 0.01 ${i} ${onOff}`);
        }
        prevCount = currentCount;
    }
}






// Manually change hand count for testing
function increaseHandCount() {
    sendToCsound(`i "setHand" 0 0.01 ${testCount} 1`);
    testCount += 1;
}


function decreaseHandCount() {
    sendToCsound(`i "setHand" 0 0.01 ${testCount} 0`);
    testCount -= 1;
}


function setTestCount(number) {
    for (let i = testCount; i <= number; i++) {
        sendToCsound(`i "setHand" 0 0.01 ${i} 1`);
    }
    testCount = number;
}


function setSkew(number) {
    skew = number;
}


// Expose functions for Electron dev tools
window.increaseHandCount = increaseHandCount;
window.decreaseHandCount = decreaseHandCount;
window.setHandCount = setTestCount;
window.setSkew = setSkew;
