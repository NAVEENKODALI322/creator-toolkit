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
                    mood
                );


            },
            duration
        );



        return buffer.get();

    }





    createTrack(style,duration,mood){


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




        const pad =
        new Tone.PolySynth(
            Tone.Synth,
            {

                oscillator:{
                    type:"fatsawtooth"
                },


                envelope:{

                    attack:1,
                    decay:.3,
                    sustain:.8,
                    release:2

                }

            }

        ).connect(compressor);




        const bass =
        new Tone.MonoSynth({

            oscillator:{
                type:"sine"
            },


            envelope:{

                attack:.05,
                decay:.2,
                sustain:.5,
                release:.5

            }

        }).connect(compressor);



        const drums =
        new Tone.MembraneSynth({

            pitchDecay:.03,

            envelope:{

                attack:.001,
                decay:.4,
                sustain:0

            }

        }).connect(compressor);



        const lead =
        new Tone.Synth({

            oscillator:{
                type:"triangle"
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
                mood==="trailer"
                ||
                mood==="cinematic"
            ){

                drums.triggerAttackRelease(
                    "C2",
                    "8n",
                    time
                );


            }



            if(bar % 2 === 0){

                lead.triggerAttackRelease(

                    chord[1],
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


}
