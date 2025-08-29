<CsoundSynthesizer>
<CsOptions>
-odac1
</CsOptions>
<CsInstruments>
;hello :3
sr = 44100
ksmps = 64
nchnls = 1
0dbfs = 1








; ORDER OF HAND CHANGES
;0) Pad + delay melody root
;1) Pad + delay melody root + melody bells
;2) Pad + delay melody root + melody bells + reverb
;3) full delay added
;4) bass trigger added
;5) Other pad added
;6) Sparkle on main pad start
;7) Other lead introduced
;8) Introduce odds of other pad variance
;9) pad and otherpad role swap!!
;10) spectral processing on pad added
;11) extra harmony to da melody bell
;12) pad variance odds decreased
;13) same for other pad ^^
;14) another reverb for depth with all pads and melody
;15) lead distorted
;16) flanger on main reverb
;17) iother lead distorted
;18) pvsfreeze thing on pad
;19) wack harmony on melody
;20) BIG sparkle
;21) crunch texture addition
seed 0
gifn    ftgen   0,0, 257, 9, .5,1,270
gaRSend init 0
gaRSend2 init 0
gkNotes[] fillarray 0, 7, -7, 4, -5, 5, 12, 19
gkInteract[] fillarray 0,2,4,5,7,11,12,14,16
gkHands[] init 30
gkHandsLeads[] init 4
gkHandsLeadsVol[] fillarray 0, 0, 0, 0
gkIndex init 0
instr triggers
   kThreshold init 10
   kThreshold2 init 10
   kBassFlag init 0
   kBassOdds init 9
   kSpectralOdds init 3
   kCounter init 1
   gkmetro metro 0.1
   gkmetro4 metro 2
   gkmetro3 metro 0.3
   gkmetro2 metro 1
   gkmetro5 metro 3
   kMetro4Counter init 0
   if gkmetro == 1 then
       kCounter = 1
       kLinePlay random 0, 10
       gkFreq random 55, 65
       if gkHands[9] == 1 then
           kNotePad random 0,6
           event "i", "otherPad", 0, 10, gkFreq,1
           event "i", "otherPad", 0, 6, (gkFreq + gkNotes[floor(kNotePad)]) + 7,1
           if kLinePlay > kSpectralOdds then
               event "i", "pad", 0, 10, gkFreq, 0,1
           endif
       else
           event "i", "pad", 0, 10, gkFreq, 0,0
       endif
       kSparklePlay random 0,10
       if kSparklePlay > 0 then
           event "i", "sparkle", 0, 5, gkFreq
       endif
       if kLinePlay > kBassOdds then
           event "i", "descendingLine",0,10,0
           if kBassFlag == 1 then
               kBassFlag = 0
               kBassOdds = 9
           else
               kBassFlag = 1
               kBassOdds = 5
           endif
       endif
   endif


       if gkmetro2 == 1 then
           kNotePlay random 0, 10
           event "i", "melody", 0, 2, gkFreq, kCounter,0
           kCounter = kCounter * 2/3
       endif
      
       if gkmetro2 == 1 then
           kNotePlay random 0, 10
               if kNotePlay > 6 then
                   event "i", "melodyNotes", 0, 5, floor(random(1,6))
               endif


       if gkmetro3 == 1 then
           kNotePad random 0,6
           kHarmonyTest random 0, 10
           event"i", "otherPad", 0, 6, gkFreq + gkNotes[floor(kNotePad)],0
           event"i", "otherLead", 2, 4, gkFreq + gkNotes[floor(kNotePad)]
           if gkHands[7] == 1 then
               kThreshold = 6
           else
               kThreshold = 10
           endif
           if gkHands[12] == 1 then
               kThreshold = 2
           endif
           if kThreshold < kHarmonyTest then
               if gkHands[9] == 1 then
                   if gkHands[11] == 1 then
                       event "i", "pad", 0, 10, gkFreq,1,0
                       event "i", "otherPad", 0, 6, (gkFreq + gkNotes[floor(kNotePad)]) + 7
                   else
                       event "i", "pad", 0, 10, gkFreq,1,0
                   endif
               else
                   event "i", "otherPad", 0, 6, (gkFreq + gkNotes[floor(kNotePad)]) + 7
               endif
           endif
           if gkHands[8] == 1 then
               kThreshold2 = 8
           else
               kThreshold2 = 10
           endif
           if gkHands[12] == 1 then
               kThreshold2 = 2
           endif
           if kThreshold2 < kHarmonyTest then
               event "i", "pad", 0, 6, (gkFreq + gkNotes[floor(kNotePad)]) + 7,1
           endif
       endif
       if gkmetro4 == 1 && kBassFlag == 1 then
           kMetro4Counter += 1
           krandom4 random 0,5
           if kMetro4Counter > 7 && krandom4 > 2.5 then
               turnoff2 4, 0, 0
               event "i", "bassySound", 0,6,gkFreq - 24 + gkNotes[floor(krandom4)],random(0,100),1
               kMetro4Counter = 0
           endif
       endif
   endif
   if gkmetro5 == 1 then
       if gkHands[20] == 1 then
           kHarmonyTest random 0, 10
           printk2 kHarmonyTest
           if kHarmonyTest > 8 then
               event "i", "texture", 0, 1.5
           endif
       endif
   endif
endin






instr melodyNotes
   kmetro3 metro 2
   kCounter init 0
   if kmetro3 == 1 && kCounter != p4 then
       kNote random 0, 7
       if gkHands[0] == 1 then
           event "i", "melody", 0, 3, gkFreq + gkNotes[kNote],0.7,1
           if gkHands[18] == 1 then
               event "i", "melody", 0, 3, gkFreq + gkNotes[kNote]-7,0.7,1
               event "i", "melody", 0, 3, gkFreq + gkNotes[kNote]-14,0.7,1
           endif
       endif
       if kNote % 2 == 0 then
           event "i", "sparkle", 0, 4, gkFreq + gkNotes[kNote],0.7
       endif
       kCounter = kCounter + 1
   endif
endin


instr interactiveLead
   kEnv line 0.3,4,0.0001
   aHand1 oscil gkHandsLeadsVol[0], cpsmidinn(gkFreq + gkHandsLeads[0])
   aHand2 oscil gkHandsLeadsVol[1], cpsmidinn(gkFreq + gkHandsLeads[1])
   aHand3 oscil gkHandsLeadsVol[2], cpsmidinn(gkFreq + gkHandsLeads[2])
   aHand4 oscil gkHandsLeadsVol[3], cpsmidinn(gkFreq + gkHandsLeads[3])
   aSum = aHand1 + aHand2 + aHand3 + aHand4
   out aSum
endin


instr pad
   gkFreq = p4
   kADSRType = p5
   kSpectralFlag = p6
   if kADSRType == 1 then
       kEnv1 adsr 1,2,0.3,3
       kEnv2 adsr 3,0.1,1,2.9
   else
       kEnv1 adsr 4,2,0.3,4
       kEnv2 adsr 6,0.1,1,3.9
   endif
   kLFO lfo 1, 0.2
   aSig oscil 0.08, cpsmidinn(gkFreq - 12)
   aSigB oscil 0.07, cpsmidinn(gkFreq - 17)
   aSig1 oscil 0.2, cpsmidinn(gkFreq)
   aSig2 oscil 0.1, cpsmidinn(gkFreq - 7)
   aSig3 oscil 0.15, cpsmidinn(gkFreq - 5)
   aSig4 oscil 0.1, cpsmidinn(gkFreq + 7) + (kLFO * 0.5)
   aSig5 oscil 0.1, cpsmidinn(gkFreq + 12)
   aSig6 oscil 0.1, cpsmidinn(gkFreq + 19) + (kLFO * 0.5)
   aSum = ((aSig1 + aSig2 + aSig3 + aSig) * kEnv1 ) + ((aSig4 + aSig5 + aSig6 + aSigB) * kEnv2)
   aFilt butterlp aSum, 800 + ((1000 * kLFO) + 400)
   if kSpectralFlag == 1 then
       kbin  oscil 0.1,betarand(4,0,0) - 5, 1
       fSig pvsanal aFilt, 1024, 256, 2048, 0
       printk2 gkFreq
       fThing pvsarp fSig, kbin, 0.5, 5
       aOut pvsynth fThing
       out aOut
       gaRSend = aOut * 0.08
       if gkHands[17] == 1 then
           ktrig oscil     3, 2, 1                   ; trigger
           fThing pvsfreeze fSig, abs(ktrig), abs(ktrig)
           aFreeze pvsynth fThing
           out aFreeze
       endif
   else
       out aFilt
       gaRSend = aFilt * 0.1 * gkHands[1]
       gaRSend2 = gaRSend2 +( aFilt * 0.2)
   endif
endin






instr bassySound
   kFreq cpsmidinn p4
   aFMSig poscil p5, kFreq*2
   aSig1 poscil 0.2, kFreq + aFMSig
   aSig2 noise 0.005,0
   if p6 == 1 then
       kEnv adsr 0.5,0.5,0.8,6
   else
       kEnv line 1, 1, 0.01
   endif
   aSum = aSig1 + aSig2
   out aSum * kEnv * gkHands[3]
endin


instr descendingLine
   kCounter init 0
   while kCounter < 6 do
   kTest = (floor(gkFreq + 1) - (kCounter * -7)) - 36
   if (kCounter % 2) == 1 then
       event "i", "bassySound", (6 - kCounter + 1)* 0.5, 1, floor(kTest),kCounter * 50,0
   else
       event "i", "bassySound", (6 - kCounter + 1)* 0.5, 1, floor(kTest),kCounter * 50,0
   endif
   kCounter += 1
   od
endin






instr melody
   kFdback =        0.7
   kDelayFlag = p6
   kEnv adsr 0.1,1.3,0,0.1
   kamp = 0.3
   kfreq = cpsmidinn(p4)
   kmul line 0, p3, 1
   aSig gbuzz 0.3, kfreq, 4, 6, kmul, 1
   aSig2 gbuzz 0.15, kfreq * 1.5, 4 ,6, kmul, 1
   aSig3 gbuzz 0.2, kfreq / 2, 4 ,6, kmul, 1
   if gkHands[11] == 1 then
       aSum = (aSig + aSig2 + aSig3) * 0.8
   else
       aSum = aSig
   endif
   out  0.7  *  (aSum/2) * kEnv * p5
   if kDelayFlag == 1 then
       gaDSig += (kEnv * aSig * 0.15)
   endif
   gaRsend2 = gaRSend2 + (aSum * 0.3)
endin






instr otherLead
   kFreq cpsmidinn p4+12+7+12
   aSig1  poscil    .2,kFreq ,1
   aSig2 poscil .2, kFreq + 5, 1
   aEnv      adsr 2,1,.7,3
   aSum = aSig1 + aSig2
   aOut, aDummy reverbsc aSum, aSum, 0.95, 20000,sr, 0
   if gkHands[14] == 1 then
       kLFO lfo 0.1, 1
       aFilt reson aOut, 1000 * (kLFO*1000),300
       kEnv line 1, 4, 0.0001
       out aFilt * 0.02 * kEnv
   else
       out aOut * 0.2 * aEnv * gkHands[6]
   endif
endin






instr sparkle
   kFreq cpsmidinn p4
   kEnv adsr 0.01, 3 ,0,1
   aSig vco2 0.2, kFreq * 3, 12
   aSig2 vco2 0.1, kFreq * 1.5, 12
   aSig3 vco2 0.1, kFreq * 2.9, 12
   aSig4 vco2 0.1, kFreq/4, 12
   if gkHands[19] == 1 then
       aSum butterlp (aSig + aSig2 + aSig3 + aSig4) * 0.6, kFreq * 2
   else
       aSum butterlp aSig + aSig2, kFreq*2
   endif
   gaRSend  += aSum * 1 * kEnv * gkHands[5]
   gaDSig   += aSum * 0.2 * kEnv * gkHands[5]
   if gkHands[16] == 1 then
       kLFO lfo 0.1,1
       aOut distort aSum, kLFO, gifn
       out aOut*0.7 * kEnv
   else
       out 0.7 * aSum *kEnv * gkHands[5]
   endif
endin






instr otherPad
   kFreq cpsmidinn p4+12
   kADSRFlag = p5
   if kADSRFlag == 1 then
       aEnv adsr 2,5,0.3,8
   else
       aEnv adsr 2,1,.7,3
   endif
   aSig1       poscil    .2,kFreq ,1
   aSig2      poscil    .2,kFreq*2 ,1
   aSig3           poscil .2,kFreq/2,1
   kfiltq = 0.8
   kfiltrate = 0.0002
   kvibf  = 5
   kvamp  = .01
   aSig4 moog .15, kFreq, kfiltq, kfiltrate, kvibf, kvamp, 1, 1, 1
   aFiltenv adsr 2,1,1,3
   asum = aSig1 + aSig2 + aSig3 + aSig4
   aSig moogladder asum,500*aFiltenv,0.3
   out  0.7 *   aSig*aEnv * gkHands[4]
   gaRSend2 = gaRSend2 + (aSig * 02)
endin




instr texture
   aSig noise 0.1,0
   kEnv adsr 0.01, 1.5, 0, 0.1
   aFilt butterlp aSig, 1000 * noise(0.1,0) + 1000 + (kEnv * 500)
   aTrig noise 1, 0
   kEnv2 adsr 0.9,0.1,1,0.5
   if k(aTrig) > 0.4 then
       aBrah exciter aFilt, 100,20000,10,10
       out aBrah * kEnv * 6
   endif
endin
 
instr delay
   aDelayed delayr 1       ; read from delay line
   delayw gaDSig           ; write current signal
   aOut = aDelayed * 0.8   ; apply feedback attenuation
   gaDSig = gaDSig * 0     ; clear input so it doesn't accumulate
   out aOut * gkHands[2]
endin






instr reverb
   aSig, aDummy reverbsc gaRSend, gaRSend, 0.9, 2000
   fFDSig pvsanal aSig, 1024, 256, 2056, 0
   fPitched pvshift fFDSig, cpsmidinn(gkFreq),0
   aOut pvsynth fPitched
   if gkHands[15] == 1 then
       adel linseg 0, p3*.5, 0.02, p3*.5, 0    ;max delay time =20ms
       aflg flanger aSig, adel, .99
       asig clip aflg, 1, 1
       out asig * 0.2
   endif
   out (aOut + aSig)  * gkHands[1]
   gaRSend = 0
endin


instr setHand
   gkHands[p4] = p5
endin


instr reverb2
   aSig, aDummy reverbsc gaRSend2, gaRSend2, 0.95, 2000
   out aSig * gkHands[13] * 0.2
   gaRSend2 = 0
endin


instr setNote
   gkHandsLeads[p4] = p5
endin

instr setNoteVol 
    gkHandsLeadsVol[p4] = p5
endin
schedule "reverb", 0, 999999999999
schedule "reverb2", 0,999999999999
schedule "delay", 0, 999999999999
schedule "interactiveLead", 0, 999999999999


</CsInstruments>
<CsScore>
f 1 0 16384 11 1
i 1 0 z
</CsScore>
</CsoundSynthesizer>






