import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

let handLandmarker = null;

/**
 * Initialize hand tracking
 * @param {function} callback - Called every frame with { handCount, hands }
 * @returns {function} cleanup function to stop tracking
 */
export async function trackHands(callback) {
    console.log("[HandTracking] Starting setup...");

    // Create a hidden video element
    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    video.style.position = "absolute";
    video.style.top = "-9999px";
    video.style.display = "none";
    document.body.appendChild(video);

    try {
        // Use the exposed preload API to get Node paths
        const appPath = window.electronAPI.getAppPath();
        const path = window.electronAPI.path;

        // Paths to unpacked WASM and model files
        const wasmPath = path.join(appPath, "wasm");
        const modelPath = path.join(appPath, "models", "hand_landmarker.task");

        // Load MediaPipe vision files
        const vision = await FilesetResolver.forVisionTasks(wasmPath);

        // Initialize the hand landmarker
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: modelPath,
                delegate: "GPU",
            },
            runningMode: "VIDEO",
            numHands: 2,
            minHandDetectionConfidence: 0.2,
            minHandPresenceConfidence: 0.2,
            minTrackingConfidence: 0.2,
        });

        // Start the camera
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1920, height: 1080 },
        });
        video.srcObject = stream;
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                resolve();
            };
        });

        // Smoothing state
        let lastVideoTime = -1;
        const smoothingFactor = 0.15;
        const smoothingState = {};

        // Main per-frame processing
        const processFrame = () => {
            try {
                if (video.currentTime !== lastVideoTime) {
                    lastVideoTime = video.currentTime;

                    const results = handLandmarker.detectForVideo(video, performance.now());

                    const hands = results.landmarks.map((landmarks, index) => {
                        const wrist = landmarks[9];
                        const handedness = results.handedness[index]?.[0]?.categoryName || "Unknown";

                        // Initialize smoothing
                        if (!smoothingState[index]) {
                            smoothingState[index] = { smoothedX: wrist.x, smoothedY: wrist.y };
                        }

                        // Apply smoothing
                        smoothingState[index].smoothedX += (wrist.x - smoothingState[index].smoothedX) * smoothingFactor;
                        smoothingState[index].smoothedY += (wrist.y - smoothingState[index].smoothedY) * smoothingFactor;

                        return {
                            handedness,
                            x: smoothingState[index].smoothedX,
                            y: smoothingState[index].smoothedY,
                        };
                    });

                    // Call user callback
                    callback({ handCount: hands.length, hands });
                }
            } catch (err) {
                console.error("[HandTracking] Frame processing error:", err);
            }

            requestAnimationFrame(processFrame);
        };

        processFrame();

        // Return cleanup function
        return () => {
            console.log("[HandTracking] Stopping tracking...");
            handLandmarker?.close();
            stream.getTracks().forEach((track) => track.stop());
            document.body.removeChild(video);
        };
    } catch (err) {
        console.error("[HandTracking] Setup error:", err);
        document.body.removeChild(video);
        throw err;
    }
}
