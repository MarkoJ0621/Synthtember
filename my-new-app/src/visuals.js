//visuals rendering
import Hydra from 'hydra-synth'
import p5 from 'p5'

const hydra = new Hydra({ detectAudio: true, height: window.innerHeight, width: window.innerWidth })


export function run(skew, handCount) {
    s0.initCam()
    if (handCount > 0 && handCount <= 1) {
        osc(5, 0.9, () => Math.sin(time * 0.3))
            .colorama(skew)
            .modulateRotate(o0, () => Math.sin(time * 0.2) * 3.5)
            .modulatePixelate(noise().pixelate(10), 16, 500).layer(src(s0).contrast(1.6).luma(0.5, 0.2))
            .modulateHue(o0, handCount)
            .out()
    } else if (handCount > 1 && handCount <= 5) {
        src(s0).thresh(0.4).luma(0.2).brightness(-0.5).out(o1)

        voronoi(10).modulateRepeat(o2, 10, 10, 1, 1).color(1, 0, 0.2, 1).modulate(src(o2).modulatePixelate(noise(10).pixelate(10), 10)).brightness(-0.4).out(o2)

        src(o2).layer(src(o1))
            .modulatePixelate(
                noise(3, 0).pixelate(16, 16).
                    scroll(0, 0, 0.1, 0.4), () => Math.sin(0.2 * time) * 1024 * 0.65 + 300, 16)
            .modulateHue(o2, () => Math.sin(0.4 * time) * 100)
            .out()
    }
}