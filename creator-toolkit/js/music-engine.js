class MusicEngine {

    constructor(){

        // Every mood the UI can send MUST have an entry here.
        // (The old version was missing vlog/cooking/motivation/tech/gaming,
        // so those all silently fell back to the cinematic chords —
        // that's why every mood sounded basically the same.)
        this.settings = {

            vlog:{
                bpm:112,
                chords:[
                    ["C4","E4","G4","B4"],
                    ["A3","C4","E4","G4"],
                    ["F3","A3","C4","E4"],
                    ["G3","B3","D4","F4"]
                ],
                arp:["E5","C5","G4","B4"]
            },

            cooking:{
                bpm:104,
                chords:[
                    ["F4","A4","C5","E5"],
                    ["C4","E4","G4","B4"],
                    ["D4","F4","A4","C5"],
                    ["G4","B4","D5","F5"]
                ],
                arp:["A5","G5","F5","D5"]
            },

            motivation:{
                bpm:126,
                chords:[
                    ["A3","C4","E4","G4"],
                    ["F3","A3","C4","E4"],
                    ["C4","E4","G4","B4"],
                    ["G3","B3","D4","F4"]
                ]
            },

            tech:{
                bpm:100,
                chords:[
                    ["D4","G4","A4","C5"],
                    ["C4","F4","G4","B4"],
                    ["A3","D4","E4","G4"],
                    ["G3","C4","D4","F4"]
                ],
                arp:["A5","G5","E5","D5"]
            },

            cinematic:{
                bpm:90,
                chords:[
                    ["A3","C4","E4","G4"],
                    ["F3","A3","C4","E4"],
                    ["C4","E4","G4","B4"],
                    ["G3","B3","D4","F4"]
                ],
                lead:["A4","C5","E5","G5"]
            },

            lofi:{
                bpm:76,
                chords:[
                    ["D4","F4","A4","C5"],
                    ["G3","B3","D4","F4"],
                    ["C4","E4","G4","B4"],
                    ["A3","C4","E4","G4"]
                ]
            },

            emotional:{
                bpm:68,
                chords:[
                    ["A3","C4","E4","G4"],
                    ["D4","F4","A4","C5"],
                    ["F3","A3","C4","E4"],
                    ["C4","E4","G4","B4"]
                ]
            },

            gaming:{
                bpm:140,
                chords:[
                    ["E4","G4","B4","D5"],
                    ["C4","E4","G4","B4"],
                    ["A3","C4","E4","G4"],
                    ["D4","F4","A4","C5"]
                ],
                arp:["B5","G5","E5","D5"],
                arpFast:true
            },

            // kept for backward compatibility if older buttons/links use these
            corporate:{
                bpm:110,
                chords:[
                    ["C4","E4","G4","B4"],
                    ["G3","B3","D4","F4"],
                    ["A3","C4","E4","G4"],
                    ["F3","A3","C4","E4"]
                ]
            },
            happy:{
                bpm:120,
                chords:[
                    ["C4","E4","G4","B4"],
                    ["F4","A4","C5","E5"],
                    ["G4","B4","D5","F5"],
                    ["C4","E4","G4","B4"]
                ],
                arp:["E5","G5","C6","G5"]
            },
            trailer:{
                bpm:100,
                chords:[
                    ["D3","A3","D4","F4"],
                    ["C3","G3","C4","E4"],
                    ["Bb2","F3","Bb3","D4"],
                    ["A2","E3","A3","C4"]
                ],
                lead:["D5","C5","Bb4","A4"]
            }

        };

    }



    async generate(options){

        const duration = options.duration || 30;
        const mood = options.mood || "cinematic";

        // Guaranteed to exist now — every mood the UI can send has its
        // own entry above, so this fallback should basically never fire.
        const style = this.settings[mood] || this.settings.cinematic;

        const bpm = style.bpm;

        const buffer = await Tone.Offline(() => {
            this.createTrack(style, duration, mood, bpm);
        }, duration);

        return buffer.get();

    }



    createTrack(style, duration, mood, bpm){

        const MIN_GAP = 0.01;

        const limiter = new Tone.Limiter(-1).toDestination();
        const master = new Tone.Gain(0.85).connect(limiter);

        // JCReverb is algorithmic (synchronous, instant) — unlike
        // Tone.Reverb (convolution-based), it doesn't need to
        // asynchronously generate an impulse response, which was
        // causing intermittent failures when nested inside our
        // outer Tone.Offline render.
        const reverb = new Tone.JCReverb({ roomSize:0.6, wet:0.3 }).connect(master);
        const delay = new Tone.FeedbackDelay({ delayTime:"8n", feedback:0.22, wet:0.18 }).connect(reverb);
        const compressor = new Tone.Compressor({ threshold:-18, ratio:4 }).connect(delay);
        compressor.connect(reverb);

        // ---------------- Pad (chords) ----------------
        let pad;
        if(mood === "cinematic" || mood === "emotional" || mood === "trailer"){
            pad = new Tone.PolySynth(Tone.Synth, {
                oscillator:{ type:"fatsawtooth", spread:40, count:3 },
                envelope:{ attack:1.2, decay:0.4, sustain:0.85, release:2.6 }
            }).connect(compressor);
        } else if(mood === "lofi"){
            pad = new Tone.PolySynth(Tone.Synth, {
                oscillator:{ type:"triangle" },
                envelope:{ attack:0.02, decay:0.4, sustain:0.35, release:1.2 }
            }).connect(compressor);
        } else if(mood === "gaming" || mood === "tech"){
            pad = new Tone.PolySynth(Tone.Synth, {
                oscillator:{ type:"square" },
                envelope:{ attack:0.05, decay:0.3, sustain:0.5, release:0.8 }
            }).connect(compressor);
        } else {
            pad = new Tone.PolySynth(Tone.Synth, {
                oscillator:{ type:"triangle" },
                envelope:{ attack:0.4, decay:0.3, sustain:0.7, release:1.4 }
            }).connect(compressor);
        }
        pad.volume.value = -12;

        // ---------------- Bass ----------------
        let bass;
        if(mood === "motivation" || mood === "cinematic" || mood === "trailer"){
            bass = new Tone.MonoSynth({
                oscillator:{ type:"sawtooth" },
                envelope:{ attack:0.05, decay:0.3, sustain:0.7, release:0.6 },
                filterEnvelope:{ attack:0.01, decay:0.2, sustain:0.5, release:0.6, baseFrequency:80, octaves:3 }
            }).connect(compressor);
        } else if(mood === "lofi" || mood === "emotional"){
            bass = new Tone.MonoSynth({
                oscillator:{ type:"triangle" },
                envelope:{ attack:0.1, decay:0.4, sustain:0.5, release:0.8 }
            }).connect(compressor);
        } else if(mood === "gaming" || mood === "tech"){
            bass = new Tone.MonoSynth({
                oscillator:{ type:"square" },
                envelope:{ attack:0.02, decay:0.2, sustain:0.6, release:0.4 }
            }).connect(compressor);
        } else {
            bass = new Tone.MonoSynth({
                oscillator:{ type:"sine" },
                envelope:{ attack:0.05, decay:0.25, sustain:0.5, release:0.5 }
            }).connect(compressor);
        }
        bass.volume.value = -13;

        // ---------------- Drums ----------------
        const kick = new Tone.MembraneSynth({
            pitchDecay: (mood==="cinematic"||mood==="motivation") ? 0.08 : (mood==="lofi" ? 0.05 : 0.03),
            octaves: (mood==="cinematic"||mood==="motivation") ? 5 : 3,
            envelope:{ attack:0.001, decay:(mood==="lofi"?0.5:0.35), sustain:0 }
        }).connect(compressor);
        kick.volume.value = mood==="emotional" ? -100 : -8; // near-silent for emotional (no drums)

        const hat = new Tone.MetalSynth({
            frequency:280, envelope:{attack:0.001, decay:0.1, sustain:0},
            harmonicity:5.1, modulationIndex:24, resonance:3200, octaves:1
        }).connect(compressor);
        hat.volume.value = -22;

        // ---------------- Arp / pluck layer (adds richness/movement) ----------------
        let arp = null;
        if(style.arp){
            arp = new Tone.PolySynth(Tone.Synth, {
                oscillator:{ type:"triangle" },
                envelope:{ attack:0.004, decay:0.14, sustain:0, release:0.08 }
            }).connect(delay);
            arp.volume.value = -14;
        }

        // ---------------- Lead (melody) ----------------
        const lead = new Tone.Synth({
            oscillator:{ type: (mood==="gaming"||mood==="tech") ? "square" : "triangle" },
            envelope:{ attack:0.05, decay:0.2, sustain:0.3, release:0.5 }
        }).connect(compressor);
        lead.volume.value = -13;

        // ---------------- Lo-Fi vinyl bed (one continuous, non-repeating event — safe) ----------------
        if(mood === "lofi"){
            const noiseFilter = new Tone.Filter(2200, "lowpass").connect(compressor);
            const vinyl = new Tone.Noise("pink").connect(noiseFilter);
            vinyl.volume.value = -34;
            vinyl.start(0);
            vinyl.stop(duration);
        }

        // ---------------- Safe scheduler ----------------
        // Guarantees every note on a given instrument fires at a
        // strictly increasing time. This is what prevents the
        // "Start time must be strictly greater than previous start
        // time" crash — including the ending-flourish notes, which
        // in the old code could land BEFORE the last bar's note.
        const lastTime = new Map();
        function safe(synth, notes, dur, time, velocity){
            if(time >= duration || !synth) return;
            const prev = lastTime.has(synth) ? lastTime.get(synth) : -1;
            let t = time;
            if(t <= prev) t = prev + MIN_GAP;
            if(t >= duration) return;
            lastTime.set(synth, t);
            synth.triggerAttackRelease(notes, dur, t, velocity);
        }
        function safePerc(synth, dur, time, velocity){
            if(time >= duration || !synth) return;
            const prev = lastTime.has(synth) ? lastTime.get(synth) : -1;
            let t = time;
            if(t <= prev) t = prev + MIN_GAP;
            if(t >= duration) return;
            lastTime.set(synth, t);
            synth.triggerAttackRelease(dur, t, velocity);
        }
        // MembraneSynth (kick) needs (note, duration, time, velocity) —
        // a different signature than MetalSynth's (duration, time, velocity).
        // Using the wrong one silently shifts every argument over by one,
        // which sends the WRONG value in as the scheduling time — that
        // was the real cause of the "strictly greater than previous
        // start time" crash.
        function safeKick(synth, note, dur, time, velocity){
            if(time >= duration || !synth) return;
            const prev = lastTime.has(synth) ? lastTime.get(synth) : -1;
            let t = time;
            if(t <= prev) t = prev + MIN_GAP;
            if(t >= duration) return;
            lastTime.set(synth, t);
            synth.triggerAttackRelease(note, dur, t, velocity);
        }

        const barTime = 60 / bpm * 4;
        const bars = Math.ceil(duration / barTime);

        // Leave enough room at the end for the closing flourish so it
        // never lands before the last bar's notes (the bug that could
        // crash the old version).
        const safeEnd = Math.max(duration - Math.max(barTime * 1.1, 2.5), barTime);

        for(let bar=0; bar<bars; bar++){
            const time = bar * barTime;
            if(time >= safeEnd) break;

            const chord = style.chords[bar % style.chords.length];
            const section = time < duration*0.25 ? "intro" : time < duration*0.6 ? "build" : "climax";
            const energy = section==="intro" ? 0.35 : section==="build" ? 0.6 : 0.85;

            safe(pad, chord, barTime*0.92, time, energy);
            safe(bass, chord[0].replace(/[0-9]/,"2"), barTime*0.45, time, energy*0.9);

            if(mood === "cinematic" || mood === "motivation"){
                safeKick(kick, "C2", "8n", time, energy);
                safeKick(kick, "C2", "8n", time + barTime/2, energy*0.8);
            } else if(mood === "gaming" || mood === "tech"){
                safeKick(kick, "C2", "16n", time, energy);
                if(section!=="intro") safePerc(hat, "32n", time + barTime/2, 0.4);
            } else if(mood === "lofi"){
                safeKick(kick, "C2", "4n", time, energy*0.8);
            } else if(mood === "emotional"){
                // no percussion — stays sparse and intimate
            } else {
                safeKick(kick, "C2", "8n", time, energy*0.85);
            }

            if(arp && section !== "intro"){
                const steps = style.arpFast ? [0,0.5,1,1.5,2,2.5,3,3.5] : [0,1,2,3];
                steps.forEach((s,i) => safe(arp, style.arp[i % style.arp.length], 0.16, time + s*(barTime/4), energy*0.75));
            }

            if(bar % 2 === 0){
                let melodyNote;
                if(mood === "cinematic"){
                    const notes = [chord[0], chord[1], chord[2], "A4"];
                    melodyNote = notes[bar % notes.length];
                } else if(mood === "lofi"){
                    const notes = [chord[1], chord[0], chord[2]];
                    melodyNote = notes[bar % notes.length];
                } else if(mood === "gaming" || mood === "tech"){
                    const notes = [chord[2], chord[1], chord[2], "E5"];
                    melodyNote = notes[bar % notes.length];
                } else if(mood === "cooking"){
                    const notes = [chord[2], chord[1], chord[0], "G4"];
                    melodyNote = notes[bar % notes.length];
                } else if(mood === "motivation"){
                    const notes = [chord[0], chord[2], "A4", "C5"];
                    melodyNote = notes[bar % notes.length];
                } else if(style.lead){
                    melodyNote = style.lead[bar % style.lead.length];
                } else {
                    melodyNote = chord[1];
                }
                safe(lead, melodyNote, "4n", time + barTime/2, energy*0.7);
            }
        }

        // ---------------- Ending flourish (now always AFTER the last note) ----------------
        const endingTime = Math.max(duration - 1.8, safeEnd + MIN_GAP);
        safe(pad, style.chords[0], Math.min(2, duration*0.3), endingTime, 0.8);
        if(mood === "trailer" || mood === "cinematic"){
            safeKick(kick, "C2", "4n", endingTime, 0.9);
        }

        // Fade out master at the very end (single scheduling — safe)
        const fadeStart = Math.max(duration - 1.5, 0.1);
        master.gain.setValueAtTime(0.85, fadeStart);
        master.gain.linearRampToValueAtTime(0, duration);

    }

}

// Export engine
window.musicEngine = new MusicEngine();
