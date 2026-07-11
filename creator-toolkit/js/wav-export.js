function audioBufferToWav(buffer){

    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;

    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;

    const dataSize = length * blockAlign;

    const arrayBuffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(arrayBuffer);


    function writeString(offset, string){

        for(let i = 0; i < string.length; i++){

            view.setUint8(
                offset + i,
                string.charCodeAt(i)
            );

        }

    }



    // WAV Header

    writeString(0,"RIFF");

    view.setUint32(
        4,
        36 + dataSize,
        true
    );


    writeString(8,"WAVE");


    writeString(12,"fmt ");


    view.setUint32(
        16,
        16,
        true
    );


    view.setUint16(
        20,
        1,
        true
    );


    view.setUint16(
        22,
        numChannels,
        true
    );


    view.setUint32(
        24,
        sampleRate,
        true
    );


    view.setUint32(
        28,
        sampleRate * blockAlign,
        true
    );


    view.setUint16(
        32,
        blockAlign,
        true
    );


    view.setUint16(
        34,
        16,
        true
    );


    writeString(36,"data");


    view.setUint32(
        40,
        dataSize,
        true
    );



    const channels=[];


    for(let i=0;i<numChannels;i++){

        channels.push(
            buffer.getChannelData(i)
        );

    }



    let offset=44;



    for(let i=0;i<length;i++){

        for(let ch=0;ch<numChannels;ch++){

            let sample =
            Math.max(
                -1,
                Math.min(
                    1,
                    channels[ch][i]
                )
            );


            sample =
            sample < 0
            ? sample * 0x8000
            : sample * 0x7FFF;



            view.setInt16(
                offset,
                sample,
                true
            );


            offset += 2;

        }

    }



    return new Blob(
        [arrayBuffer],
        {
            type:"audio/wav"
        }
    );

}
