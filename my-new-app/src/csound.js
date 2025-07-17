import { Csound } from '@csound/browser';

let csound;

export async function startCsound() {
    if (csound) return;

    csound = await Csound();
    await csound.compileCsdText(yourCsdString);
    await csound.start();
}
