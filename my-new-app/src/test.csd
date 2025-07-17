<CsoundSynthesizer>
<CsOptions>
-odac
</CsOptions>
<CsInstruments>
;hello :3
sr = 44100
ksmps = 64
nchnls = 2
0dbfs = 1
seed 0
gi1 ftgen 1,0,2^10,9,  1,3,0,   3,1,0, 9,0.333,180
gifn	ftgen	0,0, 257, 9, .5,1,270,1.5,.33,90,2.5,.2,270,3.5,.143,90,4.5,.111,270
gknotes[] fillarray 69,71,73,74,76,78,80


//OPCODES TAKEN FROM STEVEN YI SHIMMER REVERB PROJECT
ga_sbus[] init 16, 2
/** Write two audio signals into stereo bus at given index */
opcode sbus_write, 0,iaa
  ibus, al, ar xin
  ga_sbus[ibus][0] = al
  ga_sbus[ibus][1] = ar
endop

/** Mix two audio signals into stereo bus at given index */
opcode sbus_mix, 0,iaa
  ibus, al, ar xin
  ga_sbus[ibus][0] = ga_sbus[ibus][0] + al
  ga_sbus[ibus][1] = ga_sbus[ibus][1] + ar
endop

/** Clear audio signals from bus channel */
opcode sbus_clear, 0, i
  ibus xin
  aclear init 0
  ga_sbus[ibus][0] = aclear
  ga_sbus[ibus][1] = aclear
endop

/** Read audio signals from bus channel */
opcode sbus_read, aa, i
  ibus xin
  aclear init 0
  al = ga_sbus[ibus][0] 
  ar = ga_sbus[ibus][1] 
  xout al, ar
endop

instr ShimmerReverb 
  al, ar sbus_read 1

  ; pre-delay
  al = vdelay3(al, 100, 100)
  ar = vdelay3(ar, 100, 100)
 
  afbl init 0
  afbr init 0
  ifblvl = 0.45


  al = al + (afbl * ifblvl)
  ar = ar + (afbr * ifblvl)

  ; important, or signal bias grows rapidly
  al = dcblock2(al)
  ar = dcblock2(ar)

  al = tanh(al)
  ar = tanh(ar)

  al, ar reverbsc al, ar, 0.95, 16000

  iratio = 2 
  ideltime = 500

  ifftsize  = 1028
  ioverlap  = ifftsize / 4 
  iwinsize  = ifftsize 
  iwinshape = 1; von-Hann window 

  fftin     pvsanal al, ifftsize, ioverlap, iwinsize, iwinshape 
  fftscale  pvscale fftin, iratio, 0, 1
  atransL   pvsynth fftscale

  fftin2    pvsanal ar, ifftsize, ioverlap, iwinsize, iwinshape 
  fftscale2 pvscale fftin2, iratio, 0, 1
  atransR   pvsynth fftscale2

  ;; delay the feedback to let it build up over time
  afbl = vdelay3(atransL, ideltime, ideltime)
  afbr = vdelay3(atransR, ideltime, ideltime)

  out(al, ar)
  
  sbus_clear(1)
endin
schedule("ShimmerReverb", 0, -1)


instr 99
	gibpm =  30
	ktrig metro (gibpm/60)
	printk(1,ktrig)
	ktexturedensity = 0.1
	kplaydensity = 0.4
	kkickplaydensity = 0.4
	kkeychangedensity = 0.5
	gkflag = 0
	if ktrig == 1 then 
		kkeychangechance random 0,1
		kplaychance random 0,1
		ktexturechance random 0,1
		if kplaychance < kplaydensity then
		event "i",2,0,12
		endif
		if ktexturechance < ktexturedensity then
			if gkflag == 0 then 
						gkflag = 1
			else 
				gkflag = 0 
			endif
			event "i",4,0,1000
			endif
		if kkeychangechance < kkeychangedensity then
		ikeychangeindex = round(random(-5,7))
		print(ikeychangeindex)
		icount = 0
counter:
			ktemp = gknotes[icount] + ikeychangeindex
			gknotes[icount] = gknotes[icount] + ikeychangeindex
			icount += 1
			print(icount)
			if icount < 6 then
				igoto counter
			endif
			prints("key has been changed!")
			printarray gknotes
		endif
				kkickchance random 0,1
				if kkickchance < kkickplaydensity then 
				event "i",3,0,5
				endif
	endif
endin

  instr 2 //pad
aSig1       poscil    .2, cpsmidinn(round(gknotes[random(0,6)])),1
aSig2      poscil    .2, cpsmidinn(round(gknotes[random(0,6)])),1
aSig3 			poscil .2,cpsmidinn(round(gknotes[random(0,6)])-12),1
kfreq  = cpsmidinn(round(gknotes[random(0,6)]))
kfiltq = 0.8
kfiltrate = 0.0002
kvibf  = 5
kvamp  = .01
aSig4 moog .15, kfreq, kfiltq, kfiltrate, kvibf, kvamp, 1, 1, 1
aEnv      adsr 3,1,.7,8
aFiltenv adsr 3,1,1,8
asum = aSig1 + aSig2 + aSig3 + aSig4
aSig moogladder asum,500*aFiltenv,0.3
          outs      aSig*aEnv, aSig*aEnv
            sbus_mix(1, aSig * 0.1, aSig * 0.1)
  endin
  instr 3 //kick
  aPenv adsr 0.05,0.3,0,0
  aEnv adsr 0,.3,1,.2
  aSig poscil 0.4,400*(aPenv*.1)
  aSigout lpf18 aSig,5000,0.3,2
  iFeedback =  0.7
  aDelay init 0
  aDelay delay aSigout+(aDelay*iFeedback), .5
  sbus_mix(1,aDelay*.05,aDelay*.05)
  outs aSigout+(aDelay*.4),aSigout+(aDelay*.4)
  endin
  
  instr 4 //texture
  kLfo lfo 1,1
  aSig gendy	1,4,3,200,1,200,1000,5*(kLfo + 0.3),0.5*kLfo*0.01 //changes with key change
  aCrunch crunch 0.5, 20, 20,0.5,0.1
  aSig=  aSig*0.4*aCrunch
  kSigds downsamp aSig
  aSigout butterhp a(kSigds),5000
  aSigdisk distort	a(kSigds),0,gifn
  kFeedback adsr 2,1,0.2,4
  aDelay init 0
  aDelay delay aSigout+(aDelay*kFeedback*1.3), .5
  if gkflag = 0 then
  	outs aSigout+(aDelay*.4),aSigout+(aDelay*.4)
  	else
  		aDelay = 0
  		outs aSigout*0,aSigout*0
  endif
  endin
</CsInstruments>
<CsScore>
i 99 0 1000
i 1 0 1000
</CsScore>
</CsoundSynthesizer>
























