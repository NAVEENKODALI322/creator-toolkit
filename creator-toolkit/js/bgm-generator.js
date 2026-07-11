const generateBtn = document.getElementById("generateBtn");
const previewBtn = document.getElementById("previewBtn");

const audioPlayer = document.getElementById("audioPlayer");
const downloadBtn = document.getElementById("downloadBtn");

const statusText = document.getElementById("status");

const moodButtons = document.querySelectorAll(".option");
const durationButtons = document.querySelectorAll(".duration");

const visualizer = document.getElementById("visualizer");


let selectedMood = "cinematic";
let selectedDuration = 30;

let audioURL = null;



// Mood selection

moodButtons.forEach(button=>{

    button.addEventListener(
        "click",
        ()=>{

            moodButtons.forEach(
                b=>b.classList.remove("active")
            );


            button.classList.add("active");


            selectedMood =
            button.dataset.mood;

        }
    );

});




// Duration selection

durationButtons.forEach(button=>{


    button.addEventListener(
        "click",
        ()=>{


            durationButtons.forEach(
                b=>b.classList.remove("active")
            );


            button.classList.add("active");


            selectedDuration =
            Number(
                button.dataset.duration
            );


        }
    );


});




// Visualizer

function startVisualizer(){

    visualizer.classList.add(
        "active"
    );

}


function stopVisualizer(){

    visualizer.classList.remove(
        "active"
    );

}




// Generate Button

generateBtn.addEventListener(
"click",
async ()=>{


    generateBtn.disabled=true;
    previewBtn.disabled=true;


    statusText.textContent =
    "Generating your original BGM...";


    startVisualizer();



    try{


        await Tone.start();



        const buffer =
        await window.musicEngine.generate({

            mood:selectedMood,

            duration:selectedDuration

        });



        const wav =
        audioBufferToWav(buffer);



        if(audioURL){

            URL.revokeObjectURL(
                audioURL
            );

        }



        audioURL =
        URL.createObjectURL(
            wav
        );



        audioPlayer.src =
        audioURL;


        audioPlayer.style.display =
        "block";



        downloadBtn.href =
        audioURL;


        downloadBtn.download =
        "creator-toolkit-bgm-" +
        selectedMood +
        "-" +
        selectedDuration +
        "s.wav";



        downloadBtn.style.display =
        "inline-block";



        previewBtn.disabled=false;



        statusText.textContent =
        "Done! Your original BGM is ready.";



    }
    catch(error){


        console.error(error);


        statusText.textContent =
        "Error: " + error.message;


    }
    finally{


        generateBtn.disabled=false;

        stopVisualizer();


    }


});





// Preview button

previewBtn.addEventListener(
"click",
()=>{


    if(audioPlayer.src){

        audioPlayer.play();

    }


});
