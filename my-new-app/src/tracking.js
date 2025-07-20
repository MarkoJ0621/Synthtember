//hand tracking logic

import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

let handLandmarker = null;

export async function trackHands(callback) {
    console.log('Starting hand tracking setup...');

    const video = document.createElement('video');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    video.muted = true;
    video.style.display = 'none';
    video.style.position = 'absolute';
    video.style.top = '-9999px';
    document.body.appendChild(video);

    try {
        const vision = await FilesetResolver.forVisionTasks("/wasm");

        handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: "/models/hand_landmarker.task",
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 2, // allow up to 2 hands
            minHandDetectionConfidence: 0.2,
            minHandPresenceConfidence: 0.2,
            minTrackingConfidence: 0.2
        });

        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1920, height: 1080 }
        });

        video.srcObject = stream;
        await new Promise(resolve => {
            video.onloadedmetadata = () => {
                video.play();
                resolve();
            };
        });

        let lastVideoTime = -1;
        const smoothingFactor = 0.15;

        // Per-hand smoothing state
        let smoothingState = {};

        const processFrame = () => {
            try {
                if (video.currentTime !== lastVideoTime) {
                    lastVideoTime = video.currentTime;

                    const results = handLandmarker.detectForVideo(video, performance.now());

                    const hands = results.landmarks.map((landmarks, index) => {
                        const wrist = landmarks[0];
                        const handedness = results.handedness[index]?.[0]?.categoryName || 'Unknown';

                        // Initialize smoothing state if first time
                        if (!smoothingState[index]) {
                            smoothingState[index] = {
                                smoothedX: wrist.x,
                                smoothedY: wrist.y
                            };
                        }

                        // Apply smoothing
                        smoothingState[index].smoothedX += (wrist.x - smoothingState[index].smoothedX) * smoothingFactor;
                        smoothingState[index].smoothedY += (wrist.y - smoothingState[index].smoothedY) * smoothingFactor;

                        return {
                            handedness,
                            x: smoothingState[index].smoothedX,
                            y: smoothingState[index].smoothedY
                        };
                    });

                    // Call user callback with number of hands and smoothed positions
                    callback({
                        handCount: hands.length,
                        hands
                    });
                }
            } catch (err) {
                console.error('Error in frame processing:', err);
            }

            requestAnimationFrame(processFrame);
        };

        processFrame();

        return () => {
            console.log('Stopping hand tracking...');
            handLandmarker.close();
            stream.getTracks().forEach(track => track.stop());
            document.body.removeChild(video);
        };

    } catch (error) {
        console.error('Error setting up hand tracking:', error);
        document.body.removeChild(video);
        throw error;
    }
}
