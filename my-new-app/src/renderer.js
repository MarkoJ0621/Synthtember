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
    counter += 1;


    if (counter === posRefresh) {
        counter = 0;
        if (handCount !== 0) {
            skew = 0;
            for (let i = 0; i < hands.length; i++) {
                skew += 0.5 - hands[i].x;
            }
            y = skew;
        } else {
            y = 0;
        }
        updateHandCount(handCount);
    }


    if (handCount === 0) {
        p5Instance.noNewPositions();
    }


    for (let i = 0; i < handCount; i++) {
        const xPos = window.innerWidth - hands[i].x * window.innerWidth;
        const yPos = hands[i].y * window.innerHeight;
        const yPosRaw = hands[i].y
        const xPosRaw = hands[i].x
        p5Instance.addHandPosition(xPos, yPos);
        sendToCsound(`i "setNote" 0 0.01 ${i} ${11 - Math.round(yPosRaw * 10)}`);
        console.log(`i "setNote" 0 0.01 ${i} ${11 - Math.round(yPosRaw * 10)}`);
    }
    run(y, handCount + testCount);
});


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
