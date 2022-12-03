const playButton = document.getElementById('play');
var playState = false;
var startTime;
var endTime;

document.addEventListener("DOMContentLoaded", function (event) {

    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    playButton.addEventListener("click", function () {
    	if (playState == false) {
            code = document.getElementById('code').value;
            tempo = document.getElementById('tempo').value / 50;
            
            var chords = parseCode(code);
            
            sequence = [];
            startTime = 0;
			for (var i = 0; i < chords.length; i++) {
                let length = (chords[i].length);
                let chordNotes= (chords[i].notes);
                for (var j = 0; j < chordNotes.length; j++) {
                    genSequence(length, chordNotes[j], tempo)
                }
			}
            console.log(sequence);

            document.getElementById('play').style.backgroundColor = "black";
            document.getElementById('play').style.color = "white"; 
            playState = true;
        }
        else if (playState == true) {            
            document.getElementById('play').style.backgroundColor = "white";
            document.getElementById('play').style.color = "black"; 
            playState = false;
        } 
    })
})

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
	let chords = code.split(" ");
    
    chords = chords.map(chord => {
    	let scale = chord.split(":");
        let root = scale[0].split("@")
        let length = root[0];
        scale = scale[1];
        root = root[1];
        let nth = scaletoNum[scale];
        let chordMelody = new Array(nth).fill(0);
        
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
        	let pitch = notetoPitch[root];
            for (var i = 0; i < nth; i++) {
            	chordMelody[i] = majorScale[i] + pitch;
            }
        }
    	return {
            "length": length,
            "notes": chordMelody, 
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