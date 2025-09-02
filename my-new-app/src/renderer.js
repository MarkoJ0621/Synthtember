import { run } from "./visuals.js";
import { trackHands } from './tracking.js';
import { p5Instance } from './visuals.js';

let x = 0;
let y = 0;
let counter = 0;
let posRefresh = 10;
let skew = 0;
let prevCount = 0;
let testCount = 0;
let stableHandCount = 0;
let newHandCount = 0;
let lastChangeTime = Date.now();

// Send Csound message through IPC
function sendToCsound(message) {
    if (window.csoundBridge) {
        window.csoundBridge.send(message);
    } else {
        console.warn("csoundBridge not available");
    }
}


// Hand tracking logic
const stopTracking = await trackHands(({ handCount, hands }) => {
    // --- stability filter ---
    if (handCount !== newHandCount) {
        newHandCount = handCount;
        lastChangeTime = Date.now();
    }
    if (Date.now() - lastChangeTime >= 500) {
        stableHandCount = newHandCount;
    }

    counter = (counter + 1) % posRefresh;
    if (counter === 0) {
        y = (stableHandCount > 0)
            ? hands.reduce((sum, h) => sum + (0.5 - h.x), 0)
            : 0;
        updateHandCount(stableHandCount);
    }

    if (stableHandCount === 0) {
        p5Instance.noNewPositions();
        disableNotes();
        console.log("Here");
    } else {
        handleHandPositions(hands, stableHandCount);
        run(y, stableHandCount + testCount);
    }
    drawTracers(hands)
});

// --- helpers ---

function handleHandPositions(hands, handCount) {
    for (const h of hands) {
        const xPos = window.innerWidth - h.x * window.innerWidth;
        const yPos = h.y * window.innerHeight;
        p5Instance.addHandPosition(xPos, yPos, hands.indexOf(h));
        const volume = h.y * 0.3
        const pitch = 11 - Math.round(h.x * 10);
        sendToCsound(`i "setNote" 0 0.01 ${hands.indexOf(h)} ${pitch}`);
        sendToCsound(`i "setNoteVol" 0 0.01 ${hands.indexOf(h)} ${0.3 - volume}`);
        console.log(h.z + " " + hands.indexOf(h))
    }
    for (let i = handCount; i < 4; i++) {
        sendToCsound(`i "setNoteVol" 0 0.01 ${i} ${0}`);
    }
}

function drawTracers(hands) {
    let indexedHands = hands
    // Sort by z (closest first)
    indexedHands.sort((a, b) => a.z - b.z);
    for (const h of indexedHands) {
        const xPos = window.innerWidth - h.x * window.innerWidth;
        const yPos = h.y * window.innerHeight;
        p5Instance.addHandPosition(xPos, yPos, hands.indexOf(h));
    }
}


function disableNotes() {
    for (let i = 0; i < 4; i++) {
        sendToCsound(`i "setNoteVol" 0 0.1 ${i} 0`)
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
