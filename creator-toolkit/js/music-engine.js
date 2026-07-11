class MusicEngine {

    constructor(){

        this.settings = {

            cinematic:{
                bpm:90,
                chords:[
                    ["A3","C4","E4"],
                    ["F3","A3","C4"],
                    ["C4","E4","G4"],
                    ["G3","B3","D4"]
                ]
            },


            corporate:{
                bpm:110,
                chords:[
                    ["C4","E4","G4"],
                    ["G3","B3","D4"],
                    ["A3","C4","E4"],
                    ["F3","A3","C4"]
                ]
            },


            lofi:{
                bpm:75,
                chords:[
                    ["D3","F3","A3"],
                    ["G3","B3","D4"],
                    ["C3","E3","G3"],
                    ["A2","C3","E3"]
                ]
            },


            emotional:{
                bpm:70,
                chords:[
                    ["A3","C4","E4"],
                    ["F3","A3","C4"],
                    ["D3","F3","A3"],
                    ["E3","G3","B3"]
                ]
            },


            happy:{
                bpm:120,
                chords:[
                    ["C4","E4","G4"],
                    ["F4","A4","C5"],
                    ["G4","B4","D5"],
                    ["C4","E4","G4"]
                ]
            },


            trailer:{
                bpm:100,
                chords:[
                    ["D3","A3","D4"],
                    ["C3","G3","C4"],
                    ["Bb2","F3","Bb3"],
                    ["A2","E3","A3"]
                ]
            }

        };

    }



    async generate(options){

        const duration = options.duration || 30;

        const mood =
        options.mood || "cinematic";


        const style =
        this.settings[mood]
        ||
        this.settings.cinematic;



        const bpm = style.bpm;

        Tone.Transport.bpm.value=bpm;



        const buffer =
        await Tone.Offline(
            () => {

                this.createTrack(
                    style,
                    duration,
                    mood,
                    bpm
                );


            },
            duration
        );



        return buffer.get();

    }





    createTrack(style,duration,mood,bpm){


        const master =
        new Tone.Gain(0.8)
        .toDestination();



        const reverb =
        new Tone.Reverb({

            decay:3,
            wet:0.35

        }).connect(master);



        const compressor =
        new Tone.Compressor({

            threshold:-18,
            ratio:4

        }).connect(reverb);



let pad;



if(mood === "cinematic" || mood === "emotional"){


    // Orchestra style strings

    pad =
    new Tone.PolySynth(
        Tone.Synth,
        {

            oscillator:{
                type:"fatsawtooth",
                spread:40
            },


            envelope:{

                attack:1.5,
                decay:.4,
                sustain:.9,
                release:3

            }

        }

    ).connect(compressor);



}



else if(mood === "lofi"){


    // Warm lofi texture

    pad =
    new Tone.PolySynth(
        Tone.Synth,
        {

            oscillator:{
                type:"triangle"
            },


            envelope:{

                attack:0.8,
                decay:.5,
                sustain:.7,
                release:2

            }

        }

    ).connect(compressor);



}



else if(mood === "gaming" || mood === "tech"){


    // Digital synth

    pad =
    new Tone.PolySynth(
        Tone.Synth,
        {

            oscillator:{
                type:"square"
            },


            envelope:{

                attack:.05,
                decay:.3,
                sustain:.5,
                release:1

            }

        }

    ).connect(compressor);



}



else{


    // Vlog / Cooking / Motivation

    pad =
    new Tone.PolySynth(
        Tone.Synth,
        {

            oscillator:{
                type:"triangle"
            },


            envelope:{

                attack:.4,
                decay:.3,
                sustain:.7,
                release:1.5

            }

        }

    ).connect(compressor);



}




        let bass;


if(mood === "motivation" || mood === "cinematic"){

    // Deep cinematic bass

    bass =
    new Tone.MonoSynth({

        oscillator:{
            type:"sawtooth"
        },

        envelope:{
            attack:.05,
            decay:.3,
            sustain:.7,
            release:1
        },

        filterEnvelope:{
            attack:.01,
            decay:.2,
            sustain:.5,
            release:.8,
            baseFrequency:80,
            octaves:3
        }

    }).connect(compressor);


}



else if(mood === "lofi" || mood === "emotional"){


    // Soft warm bass

    bass =
    new Tone.MonoSynth({

        oscillator:{
            type:"triangle"
        },

        envelope:{
            attack:.1,
            decay:.4,
            sustain:.5,
            release:1
        }

    }).connect(compressor);



}



else if(mood === "gaming" || mood === "tech"){


    // Electronic bass

    bass =
    new Tone.MonoSynth({

        oscillator:{
            type:"square"
        },

        envelope:{
            attack:.02,
            decay:.2,
            sustain:.6,
            release:.5
        }

    }).connect(compressor);



}



else{


    // Vlog / Cooking

    bass =
    new Tone.MonoSynth({

        oscillator:{
            type:"sine"
        },

        envelope:{
            attack:.05,
            decay:.25,
            sustain:.5,
            release:.6
        }

    }).connect(compressor);



}



        let drums;


if(mood === "cinematic" || mood === "motivation"){


    // Big cinematic hits

    drums =
    new Tone.MembraneSynth({

        pitchDecay:0.08,

        octaves:5,

        envelope:{

            attack:0.001,
            decay:0.8,
            sustain:0

        }

    }).connect(compressor);



}



else if(mood === "gaming" || mood === "tech"){


    // Electronic punch

    drums =
    new Tone.MembraneSynth({

        pitchDecay:0.02,

        octaves:3,

        envelope:{

            attack:0.001,
            decay:0.25,
            sustain:0

        }

    }).connect(compressor);



}



else if(mood === "lofi"){


    // Soft relaxed beat

    drums =
    new Tone.MembraneSynth({

        pitchDecay:0.04,

        octaves:2,

        envelope:{

            attack:0.01,
            decay:0.5,
            sustain:0

        }

    }).connect(compressor);



}



else{


    // Vlog / Cooking / Emotional

    drums =
    new Tone.MembraneSynth({

        pitchDecay:0.05,

        octaves:3,

        envelope:{

            attack:0.002,
            decay:0.45,
            sustain:0

        }

    }).connect(compressor);



}



        const lead =
        new Tone.Synth({

           oscillator:{
    type:
    mood==="gaming" || mood==="tech"
    ?
    "square"
    :
    "triangle"
},

            envelope:{

                attack:.05,
                decay:.2,
                sustain:.3,
                release:.5

            }

        }).connect(compressor);




        pad.volume.value=-12;
        bass.volume.value=-14;
        drums.volume.value=-10;
        lead.volume.value=-14;



        const barTime =
        60 / bpm * 4;



        const bars =
        Math.ceil(
            duration / barTime
        );



        for(
            let bar=0;
            bar<bars;
            bar++
        ){

            const time =
            bar * barTime;



            if(time >= duration)
            break;



            const chord =
            style.chords[
                bar % style.chords.length
            ];



            pad.triggerAttackRelease(
                chord,
                barTime,
                time
            );



            bass.triggerAttackRelease(
                chord[0].replace(/[0-9]/,"2"),
                "2n",
                time
            );



            if(
    mood === "cinematic" ||
    mood === "motivation"
){

    drums.triggerAttackRelease(
        "C2",
        "8n",
        time
    );


    drums.triggerAttackRelease(
        "C2",
        "8n",
        time + barTime/2
    );

}



else if(
    mood === "gaming" ||
    mood === "tech"
){

    drums.triggerAttackRelease(
        "C2",
        "16n",
        time
    );


}



else if(
    mood === "lofi"
){

    drums.triggerAttackRelease(
        "C2",
        "4n",
        time
    );


}



else{


    drums.triggerAttackRelease(
        "C2",
        "8n",
        time
    );


}


            if(bar % 2 === 0){


    let melodyNote;



    if(mood === "cinematic"){


        const notes = [
            chord[0],
            chord[1],
            chord[2],
            "A4"
        ];

        melodyNote =
        notes[bar % notes.length];



    }


    else if(mood === "lofi"){


        const notes = [
            chord[1],
            chord[0],
            chord[2]
        ];

        melodyNote =
        notes[bar % notes.length];



    }


    else if(mood === "gaming" || mood === "tech"){


        const notes = [
            chord[2],
            chord[1],
            chord[2],
            "E5"
        ];

        melodyNote =
        notes[bar % notes.length];



    }


    else if(mood === "cooking"){


        const notes = [
            chord[2],
            chord[1],
            chord[0],
            "G4"
        ];

        melodyNote =
        notes[bar % notes.length];



    }


    else if(mood === "motivation"){


        const notes = [
            chord[0],
            chord[2],
            "A4",
            "C5"
        ];

        melodyNote =
        notes[bar % notes.length];



    }


    else{


        melodyNote = chord[1];


    }



    lead.triggerAttackRelease(

        melodyNote,

        "4n",

        time + barTime/2

    );


}

        }


           // Add final cinematic ending

        const endingTime = Math.max(
            duration - 3,
            1
        );


        pad.triggerAttackRelease(
            style.chords[0],
            "2m",
            endingTime
        );


        if(mood === "trailer"){

            drums.triggerAttackRelease(
                "C2",
                "1m",
                endingTime
            );

        }



        // Fade out master

        master.gain.setValueAtTime(
            0.8,
            Math.max(duration - 2, 0)
        );


        master.gain.linearRampToValueAtTime(
            0,
            duration
        );



    }


}



// Export engine

window.musicEngine =
new MusicEngine();

