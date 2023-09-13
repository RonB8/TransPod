const textarea = document.getElementById('text');
const speakButton = document.getElementById('speak');
const translateButton = document.getElementById('translate');
const pauseButton = document.getElementById('pause');
const stopButton = document.getElementById('stop');
const voicesSelect = document.getElementById('voices');
const rateInput = document.getElementById('rate');
const synth = window.speechSynthesis;


var voices = [];
var flag = 0;
var start = 0;
var ind = 0;
var indCurrSentence = 0;
let voSe = voicesSelect.value;

alert('Hello! \n1) Insert text of your choice \n2) Choose from the list the language of the text \n3) Click play/Speak to start the speech \n4) To translate the last sentence, pause playing and immediately continue, or click "Translate"');

function populateVoices() {
    //
    voices = speechSynthesis.getVoices();
    voices.forEach((voice, i) => {
        let option = document.createElement('option');
        option.value = i;
        option.textContent = `${voice.name} (${voice.lang})`;
        //צרף את האופציה הנוכחית לרשימת הבחירה - 'VoicesSelect'
        voicesSelect.appendChild(option);
});
}
//כאשר רשימת הקולות של המערכת זמינה לנו, מתבצעת קריה לפונקציה populateVoices
speechSynthesis.addEventListener('voiceschanged', populateVoices);


speakButton.addEventListener('click', () => {
    flag = 1;
    startSynthesisFrom(indCurrSentence);
});

function startSynthesisFrom(pos) {
        let text = textarea.value;
        var num_sentences=0;
        text += text[text.length-1] != '.'? '.': '';
        text += ' end.';
        for(var i=0; i<text.length; i++)
            if(['.', ','].includes(text[i]))
                num_sentences++;
        let sentences_list = new Array(num_sentences);
        var j=0, start_sen=0;
        for(var i=0; i<text.length; i++){
            if(['.', ','].includes(text[i])){
                sentences_list[j] = text.substring(start_sen,i);
                j++;
                start_sen = i+1;
            }
        }
        let utterance = new Array(num_sentences);

        for (let i = 0; i < num_sentences; i++) {
            utterance[i] = new SpeechSynthesisUtterance(sentences_list[i]);
        }
        function createBoundaryEventListener(index) {
            return (event) => {
                sentencesTimes[index] = parseInt(audioPlayer.currentTime);
            };
        }
        let sentencesTimes = new Array(num_sentences);
        for (var k = 0; k < num_sentences; k++) {
            if (k <= num_sentences)
                utterance[k].addEventListener("boundary", createBoundaryEventListener(k));
        }
        

                // הפונקציה שמבצעת את הפעולה שברצונך לבצע כל 3 שניות
        function checkAndStop() {
            if (sentencesTimes[sentencesTimes.length - 1] != undefined && finished == 0) {
                //alert('finish!!!');
                stopButton.click();
                finished = 1;
            }
        }

        var finished = 0;
        
        setInterval(checkAndStop, 200);




        translateButton.addEventListener('click', () => {
            flag=1;
            var currTime = audioPlayer.currentTime;
            indCurrSentence = sentenceInSec(currTime);
            console.log('ind: '+ indCurrSentence);
            stop;
            speechSynthesis.cancel();
            SynthesisInHebrew(utterance[indCurrSentence]);
        });
        pauseButton.addEventListener('click', () => {
            speechSynthesis.cancel();
        });
        stopButton.addEventListener('click', () => {
            speechSynthesis.cancel();
            sentencesTimes.forEach(Element =>{
                Element = undefined;
            })
            indCurrSentence=0;
            return;
        });
        
        audioPlayer.addEventListener('pause', function() {
            //var currTime = parseInt(document.getElementById("seconds").innerHTML);
            var currTime = audioPlayer.currentTime;
            indCurrSentence = sentenceInSec(currTime);
            flag = 0;
            pauseButton.click();
        });
        
        speechFrom(pos);    

        //מחזירה את האינדקס של המשפט שנאמר בשנייה ה second
    function sentenceInSec(second){
        //כדי להחשיב את זה כמשפט אני רוצה שהוא יאמר לפחות 2.5 שניות
        var too_short = 2.5;
        for(var i=0; i<num_sentences; i++)
            if(sentencesTimes[i+1] == undefined || second - sentencesTimes[i] < too_short)
                break;
        return i;
        }
    start=0;

function SynthesisInHebrew(utterance){
    let origin_lan_text = utterance.text;
    speechSenHe(origin_lan_text);
}

function speechFrom(pos){
    for(ind = pos; ind<num_sentences; ind++){
        startTimer();
        utterance[ind].voiceURI = voicesSelect.value;
        utterance[ind].lang = voicesSelect.value;
        utterance[ind].rate = rateInput.value;
        speechSynthesis.speak(utterance[ind]);
        addEventListener("end", (event) => {});
        onend = (event) => {
        };
    }
}

function speechSenHe(text) {
    let result;
    let translateFrom = voicesSelect.value,
    translateTo = 'he-IL';
    //תרגום משפת המקור לעברית
    let apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}`;
    
    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            result = data.responseData.translatedText;
            data.matches.forEach(data => {
                if (data.id === 0) {
                    result = data.translation;
                }
            });
            let utterance = new SpeechSynthesisUtterance(result);
            utterance.voiceURI = 'he-IL';
            utterance.lang = 'he-IL';
            utterance.rate = rateInput.value;
            speechSynthesis.speak(utterance);
            //אם המשפט הבא כבר התחיל, נמנע חזרה על המשפט הקודם ונתקדם הלאה
            if(sentencesTimes[indCurrSentence+1] != undefined)
                indCurrSentence++;
            speechFrom(indCurrSentence);
            // מצא את האלמנט ב-HTML על ידי ה-ID שלו ושנה את ה-innerHTML שלו
            document.getElementById("result").innerHTML = result;
        })
        .catch(error => console.error('שגיאה בתהליך התרגום:', error));
 }

 

}

let pauseTime = 0, playTime = 0;

audioPlayer.addEventListener('play', function() {
    playTime = Date.now();
    if((playTime - pauseTime) < 2000)
        translateButton.click();
    else if(flag == 0)
        startSynthesisFrom(indCurrSentence);
});

audioPlayer.addEventListener('pause', function() {
    pauseTime = Date.now();
  });
  
