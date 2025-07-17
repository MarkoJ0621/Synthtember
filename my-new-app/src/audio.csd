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
;6)
seed 0
gkNotes[] fillarray 0, 7, -7, 4, -5, 5, 12, 19
gkHands[] init 30
instr triggers
	kBassFlag init 0
	kBassOdds init 9
    kCounter init 1
	gkmetro metro 0.1
	gkmetro4 metro 2
	gkmetro3 metro 0.3
	gkmetro2 metro 1
	kMetro4Counter init 0
	if gkmetro == 1 then
		kCounter = 1
		kLinePlay random 0, 10
		gkFreq random 55, 65
		event "i", "pad", 0, 10, gkFreq
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
			event "i", "melody", 0, 10, gkFreq, kCounter,0
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
			printk2 kHarmonyTest
			event"i", "otherPad", 0, 6, gkFreq + gkNotes[floor(kNotePad)]
			event"i", "otherLead", 2, 4, gkFreq + gkNotes[floor(kNotePad)]
			; if gkHands[8] == 1 then
			; event "i", "otherPad", 0, 6, (gkFreq + gkNotes[floor(kNotePad)]) + 7
			; endif
			; if gkHands[7] == 1 then
			; 	event "i", "pad", 0, 6, (gkFreq + gkNotes[floor(kNotePad)]) + 7,1
			; endif
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
endin



instr melodyNotes
	kmetro3 metro 2
	kCounter init 0
	if kmetro3 == 1 && kCounter != p4 then
		kNote random 0, 7
		if gkHands[0] == 1 then
		event "i", "melody", 0, 4, gkFreq + gkNotes[kNote],0.7,1
		endif
		if kNote % 2 == 0 then
			event "i", "sparkle", 0, 4, gkFreq + gkNotes[kNote],0.7
		endif
		kCounter = kCounter + 1
	endif
endin



instr pad
	gkFreq = p4
	kADSRType = p5
	if kADSRType == 1 then
		kEnv1 adsr 1,2,0.3,3
		kEnv2 adsr 3,0.1,1,2.9
	else
		kEnv1 adsr 4,2,0.3,4
		kEnv2 adsr 6,0.1,1,3.9
	endif
	kLFO lfo 1, 0.2
	aSig1 oscil 0.2, cpsmidinn(gkFreq)
	aSig2 oscil 0.1, cpsmidinn(gkFreq - 7)
	aSig3 oscil 0.15, cpsmidinn(gkFreq - 5)
	aSig4 oscil 0.2, cpsmidinn(gkFreq + 7) + (kLFO * 0.5)
	aSig5 oscil 0.2, cpsmidinn(gkFreq + 12)
	aSig6 oscil 0.2, cpsmidinn(gkFreq + 19) + (kLFO * 0.5)
	aSum = ((aSig1 + aSig2 + aSig3) * kEnv1 ) + ((aSig4 + aSig5 + aSig6) * kEnv2)
	aFilt butterlp aSum, 800 + ((1000 * kLFO) + 400)
	out aFilt
	gaRSend = aFilt * 0.1
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
	printk2 kTest
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
	kEnv adsr 0.1,1,0,0.1
	kamp = 0.3
	kfreq = cpsmidinn(p4)
	kmul line 0, p3, 1
	aSig gbuzz 0.3, kfreq, 4, 6, kmul, 1
	out  0.7  *     (aSig/2) * kEnv * p5
	gasendR += gaRSend
	if kDelayFlag == 1 then
       	gaDSig += (kEnv * aSig * 0.15)
	endif
endin



instr otherLead
	kFreq cpsmidinn p4+12+7+12
	aSig1  poscil    .2,kFreq ,1
	aSig2 poscil .2, kFreq + 5, 1
	aEnv      adsr 2,1,.7,3
	aSum = aSig1 + aSig2
	aOut, aDummy reverbsc aSum, aSum, 0.95, 20000,sr, 0
	outs aOut * 0.2 * aEnv + gkHands[6]
endin



instr sparkle
	kFreq cpsmidinn p4 
	kEnv adsr 0.01, 3 ,0,1
	aSig vco2 0.2, kFreq * 3, 12
	aSig2 vco2 0.1, kFreq * 1.5, 12
	aSum butterlp aSig + aSig2, kFreq*2
	out 0.7 * aSum *kEnv
	gaRSend  += aSum * 1 * kEnv
	gaDSig   += aSum * 0.2 * kEnv
endin



  instr otherPad
  kFreq cpsmidinn p4+12
aSig1       poscil    .2,kFreq ,1
aSig2      poscil    .2,kFreq*2 ,1
aSig3 			poscil .2,kFreq/2,1
kfiltq = 0.8
kfiltrate = 0.0002
kvibf  = 5
kvamp  = .01
aSig4 moog .15, kFreq, kfiltq, kfiltrate, kvibf, kvamp, 1, 1, 1
aEnv      adsr 2,1,.7,3
aFiltenv adsr 2,1,1,3
asum = aSig1 + aSig2 + aSig3 + aSig4
aSig moogladder asum,500*aFiltenv,0.3
          out  0.7 *   aSig*aEnv, aSig*aEnv * gkHands[4]
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
	out (aOut + aSig)  * gkHands[1]
	gaRSend = 0
endin

instr setHand
	gkHands[p4] = p5
endin


schedule "reverb", 0, 999999999999
schedule "delay", 0, 999999999999
</CsInstruments>
<CsScore>
f 1 0 16384 11 1
i 1 0 z
</CsScore>
</CsoundSynthesizer>




