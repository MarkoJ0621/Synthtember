import './index.css';
import { run } from "./visuals.js";
import { trackHands } from './tracking.js';
import { p5Instance } from './visuals.js';
let x = 0;
let y = 0;
let hand1flag = true;
let hand2flag = true;
let counter = 0;
let posRefresh = 40;
let skew = 0;
let prevCount = 0;
let testCount = 0;

//used for audio reactive visuals, not being used atm
// async function startAudioMonitor() {
//     // Step 1: List audio input devices
//     const devices = await navigator.mediaDevices.enumerateDevices();
//     const audioInputs = devices.filter(device => device.kind === 'audioinput');

//     console.log("Available audio input devices:");
//     audioInputs.forEach((device, index) => {
//         console.log(`${index}: ${device.label} (ID: ${device.deviceId})`);
//     });

//     // Step 2: Request input from default mic (or modify to use specific deviceId)
//     const stream = await navigator.mediaDevices.getUserMedia({
//         audio: true, // Use deviceId: { exact: '...' } to force BlackHole
//         video: false
//     });

//     const audioContext = new AudioContext();
//     const source = audioContext.createMediaStreamSource(stream);

//     // Step 3: Create an analyser to monitor levels
//     const analyser = audioContext.createAnalyser();
//     analyser.fftSize = 256;
//     const bufferLength = analyser.frequencyBinCount;
//     const dataArray = new Uint8Array(bufferLength);

//     source.connect(analyser);

//     // Step 4: Poll and log volume
//     function logVolume() {
//         analyser.getByteTimeDomainData(dataArray);
//         let sum = 0;
//         for (let i = 0; i < bufferLength; i++) {
//             const val = (dataArray[i] - 128) / 128;
//             sum += val * val;
//         }
//         const rms = Math.sqrt(sum / bufferLength);
//         const volume = Math.round(rms * 100); // Scale to 0–100

//         console.log(`Input volume: ${volume}`);

//         requestAnimationFrame(logVolume);
//     }
// }

// startAudioMonitor().catch(err => console.error("Error initializing input:", err));


//  Send Csound message through IPC
function sendToCsound(message) {
    if (window.csoundBridge) {
        // console.log("message sent");
        window.csoundBridge.send(message);
    } else {
        console.warn("csoundBridge not available");
    }
}

//  Hand tracking logic
const stopTracking = await trackHands(({ handCount, hands }) => {
    counter += 1;
    //calculating skew of hands in the room
    if (counter === posRefresh) {
        counter = 0;
        if (handCount !== 0) {
            skew = 0;
            for (let i = 0; i < hands.length; i++) {
                skew += hands[i].x > 0.5 ? 1 : -1;
            }
            y = skew * 0.2;
        } else {
            y = 0;
        }
        updateHandCount(handCount);
    }



    if (length(hands) > 0) {
        for (let i = 0; i < length(hands); i++) {
            p5Instance.drawCircleAt(hands[i].x / window.innerWidth, hands[i].y / window.innerHeight);
        }
        console.log(hands);
    }

    //re-rendering hyda instance
    run(y, handCount + testCount);
});

//checking if handcount has changed and adjusts csound array accordingly
function updateHandCount(currentCount) {
    // Only update if count changed
    if (currentCount !== prevCount) {
        console.log("hand count changed");
        for (let i = 0; i < 30; i++) {
            const onOff = i < currentCount ? 1 : 0;
            sendToCsound(`i "setHand" 0 0.01 ${i} ${onOff}`);
        }
        prevCount = currentCount;
    }
}

//function for manually changing handcount for testing
function increaseHandCount() {
    sendToCsound(`i "setHand" 0 0.01 ${testCount} ${1}`)
    testCount += 1;
}

function decreaseHandCount() {
    sendToCsound(`i "setHand"0  0.01 ${testCount} ${0}`)
    testCount -= 1;

}

function setTestCount(number) {
    for (let i = testCount; i <= number; i++) {
        sendToCsound(`i "setHand" 0 0.01 ${i} ${1}`);
    }
    testCount = number;
}
//make them visible to electron dev controls
window.increaseHandCount = increaseHandCount;
window.decreaseHandCount = decreaseHandCount;
window.setTestCount = setTestCount;