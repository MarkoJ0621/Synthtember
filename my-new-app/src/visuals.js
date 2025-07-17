import Hydra from 'hydra-synth'
import p5 from 'p5'

const hydra = new Hydra({ detectAudio: true, height: window.innerHeight, width: window.innerWidth })


export function run(counter, r, g, b) {
    s0.initCam()
    osc(5, 0.9, () => Math.sin(time * 0.3))
        .colorama(g)
        .modulateRotate(o0, () => Math.sin(time * 0.2) * 3.5)
        .modulatePixelate(noise().pixelate(10), 16, 500).layer(src(s0).contrast(1.6).luma(0.5, 0.2))
        .modulateHue(o0, r)
        .out()

}