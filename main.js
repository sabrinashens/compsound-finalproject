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

let majorScale = [0, 4, 7, 11, 14, 17, 21];
let minorScale = [0, 3, 7, 10, 14, 17, 21];

function parseCode(code) {
    chords = code.split(" "); 
    chords = chords.map(chord => {
        if (chord.at(-1) == "]") { //e.g., Cm9[2]
            let noteCode = chord.split("["); //[Cm9, 2]]
            loop = noteCode[1].slice(0, -1); //2  
            factor = noteCode[0].at(-1); //9
            root = noteCode[0].slice(0, -1); //Cm
        }
        else {  //e.g., Cm9 only plays once
        	loop = 1; //1
            factor = chord.at(-1); //9
            root = chord.slice(0, -1); //Cm
        }
        factor = (factor*1 + 1) / 2 //conversion formula from factor to number, 5
        var chordMelody = new Array(factor).fill(0); //create an array of factor

        //if a minor chord
        if (root.at(-1) == "m") {  
            let pitch = notetoPitch[root.slice(0,-1)];
            for (var i = 0; i < factor; i++) {
               chordMelody[i] = minorScale[i] + pitch; 
            } 
        }  
        //if a major chord
        else {  
            let pitch = notetoPitch[root];
            for (var i = 0; i < factor; i++) {
                chordMelody[i] = majorScale[i] + pitch;
            }
        }

        return {
            "notes": chordMelody,
            "loop": loop*1
        };
    });
    return chords;
}

function genSequence(note, tempo) {
    var length = Math.random() + 1;
    sequence.push({
        note: note,
        startTime: startTime,
        endTime: startTime + 2/tempo
    });
    startTime += 2/tempo;  
    return sequence;
}

const playButton = document.getElementById('play');
playButton.addEventListener("click", function () {
    code = document.getElementById('code').value;
    tempo = document.getElementById('tempo').value / 10;
    var chords = parseCode(code);
    sequence = [];
    startTime = 0;
    for (var i = 0; i < chords.length; i++) {
        let chordNotes= chords[i].notes;
        chordNotes = new Array(chords[i].loop).fill(chordNotes).flat();
        for (var j = 0; j < chordNotes.length; j++) {
            genSequence(chordNotes[j], tempo)
        }
    }
    playNotes(sequence);
})

function midiToFreq(m) {
    return Math.pow(2, (m - 69) / 12) * 440;
}

function playNotes(noteList) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext);
    osc = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();
    osc.connect(gainNode).connect(audioCtx.destination);
    osc.start();
    gainNode.gain.value = 0;
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