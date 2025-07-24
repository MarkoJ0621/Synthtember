//visuals rendering
import Hydra from 'hydra-synth'
import p5 from 'p5'

const hydra = new Hydra({ detectAudio: true, height: window.innerHeight, width: window.innerWidth })


export function run(skew, handCount) {
    s0.initCam()
    if (handCount > 0 && handCount <= 1) {
        osc(5, 0.9, () => Math.sin(time * 0.3))
            .colorama(skew)
            .modulate(morphingRepeat(), 0.1)
            .modulateRotate(o0, () => Math.sin(time * 0.2))
            .out()
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
    } else if (handCount > 1 && handCount <= 4) {


        osc(5, 0.9, () => Math.sin(time * 0.3))
            .colorama(skew)
            .modulateRotate(o0, () => Math.sin(time * 0.2) * 3.5)
            .modulatePixelate(noise().pixelate(10), 16, 500).layer(src(s0).contrast(1.6).luma(0.5, 0.2))
            .modulateHue(o0, handCount)
            .out()
    } else if (handCount > 4 && handCount <= 7) {
        src(s0).thresh(0.4).luma(0.2).brightness(-0.5).out(o1)

        voronoi(10).modulateRepeat(o2, 10, 10, 1, 1).color(1, 0, 0.2, 1).modulate(src(o2).modulatePixelate(noise(10).pixelate(10), 10)).brightness(-0.4).colorama(skew).out(o2)

        src(o2).layer(src(o1))
            .modulatePixelate(
                noise(3, 0).pixelate(16, 16).
                    scroll(0, 0, 0.1, 0.4), () => Math.sin(0.2 * time) * 1024 * 0.65 + 300, 16)
            .modulateHue(o2, () => Math.sin(0.4 * time) * 50)
            .out()

    }
}

export const p5Instance = new p5((p) => {
    p.setup = () => {
        const cnv = p.createCanvas(window.innerWidth, window.innerHeight)
        cnv.parent('p5-overlay')
        p.clear()
        p.noFill()
        p.stroke(255)
    }

    p.draw = () => {
        p.clear()
        p.ellipse(p.mouseX, p.mouseY, 100, 100)
    }

    p.windowResized = () => {
        p.resizeCanvas(window.innerWidth, window.innerHeight)
    }

    p.drawCircleAt = (x, y, r = 100) => {
        p.clear()
        p.ellipse(x, y, r, r)
    }
})
