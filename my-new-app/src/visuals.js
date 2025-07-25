//visuals rendering
import Hydra from 'hydra-synth'
import p5 from 'p5'

const hydra = new Hydra({ height: window.innerHeight, width: window.innerWidth })


// Init webcam ONCE
s0.initCam()

let targetRepeat = 1
let smoothRepeat = 1

setInterval(() => {
    targetRepeat = Math.floor(Math.random() * 4) + 1
}, 500)

setInterval(() => {
    smoothRepeat += (targetRepeat - smoothRepeat) * 0.003
}, 16)

function morphingRepeat() {
    return gradient(2)
        .colorama(1)
        .kaleid(3)
        .repeat(() => smoothRepeat, () => smoothRepeat, 0, 0)
}

export function run(skew, handCount) {
    if (handCount > 0 && handCount <= 1) {
        osc(5, 0.9, () => Math.sin(time * 0.3))
            .colorama(skew)
            .modulate(morphingRepeat(), 0.1)
            .modulateRotate(o0, () => Math.sin(time * 0.2))
            .out()
    } else if (handCount > 1 && handCount <= 4) {
        osc(5, 0.9, () => Math.sin(time * 0.3))
            .colorama(skew)
            .modulateRotate(o0, () => Math.sin(time * 0.2) * 3.5)
            .modulatePixelate(noise().pixelate(10), 16, 500)
            .layer(src(s0).contrast(1.6).luma(0.5, 0.2).scale(1, -1, 1, 0, 0))
            .modulateHue(o0, handCount)
            .out()
    } else if (handCount > 4 && handCount <= 7) {
        src(s0).thresh(0.4).luma(0.2).brightness(-0.5).out(o1)

        voronoi(10).modulateRepeat(o2, 10, 10, 1, 1)
            .color(1, 0, 0.2, 1)
            .modulate(src(o2).modulatePixelate(noise(10).pixelate(10), 10))
            .brightness(-0.4)
            .colorama(skew)
            .out(o2)

        src(o2).layer(src(o1))
            .modulatePixelate(
                noise(3, 0).pixelate(16, 16).scroll(0, 0, 0.1, 0.4),
                () => Math.sin(0.2 * time) * 1024 * 0.65 + 300, 16
            )
            .modulateHue(o2, () => Math.sin(0.4 * time) * 50)
            .out()
    }
}


export const p5Instance = new p5((p) => {
    let positions = [];

    p.setup = () => {
        const cnv = p.createCanvas(window.innerWidth, window.innerHeight);
        cnv.parent('p5-overlay');
        p.clear();
        p.noFill();
        p.stroke(255);
    };

    p.windowResized = () => {
        p.resizeCanvas(window.innerWidth, window.innerHeight);
    };

    // Call this from your tracking callback for each hand's position
    p.addHandPosition = (x, y) => {
        positions.push({ x, y });
        if (positions.length > 50) { // limit trail length
            positions.shift();
        }
    };

    p.draw = () => {
        p.clear(); // clears transparent background

        // Draw fading circles from oldest to newest
        positions.forEach((pos, i) => {
            const alpha = p.map(i, 0, positions.length - 1, 0, 255);
            const r = 255
            const g = 255
            const b = p.map(i, 0, positions.length - 1, 0, 255);
            p.fill(r, g, b, alpha);
            p.noStroke();
            p.ellipse(pos.x, pos.y, 25, 25);
        });
    };
    p.noNewPositions = () => {
        // Just shift the oldest to fade out existing positions
        if (positions.length > 0) {
            positions.shift();
        }
    }
});
