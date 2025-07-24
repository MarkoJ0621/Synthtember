import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

let handLandmarker = null;

async function setupHandLandmarker() {
    const vision = await FilesetResolver.forVisionTasks('/wasm');
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: '/models/hand_landmarker.task',
            delegate: 'GPU',
        },
        runningMode: 'IMAGE',  // we'll feed individual frames
        numHands: 2,
        minHandDetectionConfidence: 0.2,
    });
}

self.onmessage = async (event) => {
    if (!handLandmarker) {
        await setupHandLandmarker();
    }

    const { videoFrame } = event.data;

    try {
        const results = handLandmarker.detect(videoFrame);

        const hands = results.landmarks.map(landmarks => {
            const wrist = landmarks[0];
            return { x: wrist.x, y: wrist.y };
        });
        console.log("hello!");
        self.postMessage({
            handCount: hands.length,
            hands
        });

    } catch (err) {
        console.log("bad hello");
        console.error('Tracking error in worker:', err);
        self.postMessage({ handCount: 0, hands: [] });
    }
};
