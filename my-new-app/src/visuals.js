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
function feedbackNoise() {
    return shape(4)
        .layer(shape(1).repeatX(10).thresh(0.4))
        .color(1, 1, 1, 1)
        .scrollY(0.1, 1)
        .repeat(30, 30, 0, 0)
        .mask(noise(4))
        .modulate(src(o0))
        .luma(0.2)
}
function morphingRepeat() {
    return gradient(2)
        .colorama(1)
        .kaleid(3)
        .repeat(() => smoothRepeat, () => smoothRepeat, 0, 0)
}

function layerThing() {
    return noise()
        .modulate(noise())
        .thresh(0.4)
        .pixelate(400)
        .modulateRotate(noise(), () => 130 + Math.sin(time) * 100);
}

export function run(skew, handCount) {
    if (handCount > 0 && handCount <= 1) {
        feedbackNoise().out();
    } else if (handCount > 1 && handCount <= 4) {
        console.log(skew);
        shape(4)
            .layer(shape(1).repeatX(10).thresh(0.4))
            .color(skew, skew, skew * .5, 1)
            .scrollY(0.1, 1)
            .repeat(30, 30, 0, 0)
            .mask(noise(4))
            .modulate(src(o0).invert())
            .out(o0)
    } else if (handCount > 4 && handCount <= 7) { //TODO: build some cool fades between the things to introduce the more noise
        if (handCount > 4 && handCount <= 7) {

            function layerThing() {
                return noise()
                    .modulate(noise())
                    .thresh(0.4)
                    .pixelate(400)
                    .modulateRotate(noise(), () => 130 + Math.sin(time) * 100);
            }

            function otherWebCam() {
                return src(s0)
                    .scale(1, -1, 1, 0, 0)
                    .luma(0.4, 0)
                    .thresh(0.7);
            }

            const shapeLayer = shape(4)
                .layer(
                    shape(1)
                        .repeatX(10)
                        .thresh(0.4)
                )
                .color(skew, skew, skew * 0.5, 1)
                .scrollY(0.1, 1)
                .repeat(30, 30, 0, 0)
                .mask(noise(4))
                .modulate(src(o0).invert());

            layerThing()
                .layer(shapeLayer)
                .out(o0);
        }

    } //TODO ADD NOISE FEEDBACK WEBCAM FEED TO INTRODUCE THAT STUFF
    else if (handCount > 7 && handCount < 11) {

        function otherWebCam() {
            return src(s0)
                .scale(1, -1, 1, 0, 0)
                .luma(0.4, 0)
                .thresh(0.7);
        }

        const shapeLayer = shape(4)
            .layer(
                shape(1)
                    .repeatX(10)
                    .thresh(0.4)
            )
            .color(skew, skew, skew * 0.5, 1)
            .scrollY(0.1, 1)
            .repeat(30, 30, 0, 0)
            .mask(noise(1))
            .modulateRotate(src(o0).invert());

        layerThing()
            .layer(shapeLayer).modulate(src(s0).scale(1, -1, 1, 1))
            .out(o0);
    }
    else if (handCount > 11 || handCount < 15) {

        function noiseTest() {
            return noise(1)
        }
        const shapeLayer = shape(4)
            .layer(
                shape(1)
                    .repeatX(10)
                    .thresh(0.4)
            )
            .scrollY(0.1, 1)
            .repeat(30, 30, 0, 0)
            .mask(noiseTest())
            .modulateRotate(src(o0).invert());


        const shapeLayer2 = shape(4)
            .layer(
                shape(1)
                    .repeatX(10)
                    .thresh(0.4)
            )
            .scrollY(0.1, 1)
            .repeat(30, 30, 0, 0)
            .mask(noiseTest()).invert()
            .modulateRotate(src(o0).invert());

        layerThing()
            .layer(shapeLayer).modulate(src(s0).scale(1, -1, 1, 1)).layer(src(s0).thresh(0.4).invert().luma(0.4).contrast(0.8)).out()
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
