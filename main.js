var audioCtx;
var osc;
var gainNode;
var startTime;
var endTime;

let notetoPitch = {
    "C": 60,
    "C#": 61,
    "D": 62,
    "D#": 63,
    "E": 64,
    "F": 65,
    "F#": 66,
    "G": 67,
    "G#": 68,
    "A": 69,
    "A#": 70,
    "B": 71,
};

let scaletoNum = {
    "3rd": 2,
    "5th": 3,
    "7th": 4,
    "9th": 5,
    "11th": 6,
    "13th": 7,
};

let majorScale = [0, 4, 7, 11, 14, 17, 21];
let minorScale = [0, 3, 7, 10, 14, 17, 21];

function parseCode(code) {
    let chords = code.split(" "); //e.g., 2@C:9th[4]

    chords = chords.map(chord => {
        let noteCode = chord.split(":"); //[2@C, 9th[4]]

        let scaleNloops = noteCode[1].split("["); //[9th, 4]]
        let loops = scaleNloops[1].split("]"); //[4, ]]
        loops = loops[0]; //4
        let scale = scaleNloops[0]; //9th
        let nth = scaletoNum[scale]; //mapped into 5

        let root = noteCode[0].split("@"); //[2, C]
        let length = root[0]; //2
        root = root[1]; //C

        let chordMelody = new Array(nth).fill(0); //[0, 0, 0, 0, 0]
        if (root.at(-1) == "m") { 
            //if a minor chord
            root = root.slice(0,-1);
            let pitch = notetoPitch[root];

            for (var i = 0; i < nth; i++) {
               chordMelody[i] = minorScale[i] + pitch; 
            }
        }  
        else { 
            //if a major chord
            let pitch = notetoPitch[root]; //mapped into 60

            for (var i = 0; i < nth; i++) {
                chordMelody[i] = majorScale[i] + pitch;
            }// [60, 64, 67, 71, 74]
        }

        return {
            "length": length*1,
            "notes": chordMelody,
            "loops": loops*1
        };
    });

    return chords;
}

function genSequence(length, note, tempo) {
    sequence.push({
        note: note,
        startTime: startTime,
        endTime: startTime + length/tempo
    });

    startTime += length/tempo;  
    return sequence
}

const playButton = document.getElementById('play');
playButton.addEventListener("click", function () {
    code = document.getElementById('code').value;
    tempo = document.getElementById('tempo').value / 10;

    var chords = parseCode(code);
    
    sequence = [];
    startTime = 0;
    for (var i = 0; i < chords.length; i++) {
        let length = chords[i].length;
        let chordNotes= chords[i].notes;
        chordNotes = new Array(chords[i].loops).fill(chordNotes).flat();
        for (var j = 0; j < chordNotes.length; j++) {
            genSequence(length, chordNotes[j], tempo)
        }
    }

    audioCtx = new (window.AudioContext || window.webkitAudioContext);
    osc = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();
    osc.connect(gainNode).connect(audioCtx.destination);
    osc.start();
    gainNode.gain.value = 0;

    playNotes(sequence);
})

function midiToFreq(m) {
    return Math.pow(2, (m - 69) / 12) * 440;
}

function playNotes(noteList) {
    noteList.forEach(note => {
        playNote(note);
    }); 
}

function playNote(note) {
    offset = 1;
    gainNode.gain.setTargetAtTime(0.7, note.startTime + offset, 0.01)
    osc.frequency.setTargetAtTime(midiToFreq(note.note),
    note.startTime + offset, 0.001)
    gainNode.gain.setTargetAtTime(0, note.endTime + offset - 0.05, 0.01)
}

function copyExample() {
    var copyText = document.getElementById("example");
    navigator.clipboard.writeText(copyText.value);
    document.getElementById('copy').style.color = "white";
    document.getElementById('copy').style.backgroundColor = "black";
    document.getElementById('copy').innerHTML = "Copied";
}

