const select = e => document.querySelector(e);
const selectAll = e => document.querySelectorAll(e);

const input = select('#textInput');
const output = select('#textOutput');
const inputFull = select('#textFull');

const _timer = select('#timer');
const _wpm = select('#wpm');
const _cpm = select('#cpm');
const _errors = select('#errors');
const _accuracy = select('#accuracy');
const _totalWords = select('#totalWords');
const _writtenWords = select('#writtenWords');

const modal = select('#ModalCenter');
const modalBody = select('.modal-body');
const modalClose = selectAll('.modal-close');
const modalReload = select('#modalReload');

const btnPaly = select('#btnPlay');
const btnRefresh = select('#btnRefresh');

const soundOn = select('.icon-sound-on');
const soundOff = select('.icon-sound-off');
const keyClick = select('#keyClick');
const keyBeep = select('#keyBeep');

let sound = true;
soundOn.addEventListener('click', e => {
    e.currentTarget.classList.add('d-none');
    soundOff.classList.remove('d-none');
    sound = false;
})

soundOff.addEventListener('click', e => {
    e.currentTarget.classList.add('d-none');
    soundOn.classList.remove('d-none');
    sound = true;
})


const allQuotes = [];

fetch('js/quotes.json')
    .then(response => response.json())
    .then(data => allQuotes.push(...data))
    .catch(error => console.error('Error:', error));


const random = array => array[Math.floor(Math.random() * array.length)];


class speedTyping {

    constructor() {
        this.index = 0;
        this.words = 0;
        this.errorIndex = 0;
        this.correctIndex = 0;
        this.accuracyIndex = 0;
        this.cpm = 0;
        this.wpm = 0;
        this.interval = null;
        this.duration = 60
        this.typing = false;
        this.quote = [];
        this.author = [];
    }

    timer() {

        if (typeof (this.interval) === 'number')
            return;


        const now = Date.now();

        const done = now + this.duration * 1000;

        _timer.innerHTML = `${this.duration}<span class="small">s</span>`;

        this.interval = setInterval(() => {

            const secondsLeft = Math.round((done - Date.now()) / 1000);

            _timer.innerHTML = `${secondsLeft}<span class="small">s</span>`;

            if (secondsLeft === 0) {
                this.stop();
                this.finish();
            }
        }, 1000);
    }


    start() {


        const filterdQuotes = allQuotes.filter(item => item.level !== 'Easy');

        const getQuote = filterdQuotes.map(item => item.quote);
        const getAuthor = filterdQuotes.map(item => item.author);


        this.author = random(getAuthor);

        this.quote = random(getQuote);

        const quoteWords = this.quote.split(' ').filter(i => i).length;

        _totalWords.textContent = quoteWords;


        this.timer();

        btnPlay.classList.add('active');

        input.setAttribute('tabindex', '0');
        input.removeAttribute('disabled');

        input.focus();
        input.classList.add('active');


        if (!this.typing) {
            this.typing = true;


            input.textContent = this.quote;


            input.addEventListener('keypress', event => {

                event.preventDefault();

                event = event || window.event;

                const charCode = event.which || event.keyCode;

                const charTyped = String.fromCharCode(charCode);

                if (charTyped === this.quote.charAt(this.index)) {

                    if (charTyped === " " && charCode === 32) {
                        this.words++;

                        _writtenWords.textContent = this.words;
                    }

                    this.index++;


                    const currentQuote = this.quote.substring(this.index, this.index + this.quote.length);


                    input.textContent = currentQuote;
                    output.innerHTML += charTyped;

                    this.correctIndex++;

                    if (this.index === this.quote.length) {
                        this.stop();
                        this.finish();
                        return;
                    }

                    if (sound) {
                        keyClick.currentTime = 0;
                        keyClick.play();
                    }
                } else {

                    output.innerHTML += `<span class="text-danger">${charTyped}</span>`;

                    this.errorIndex++;

                    _errors.textContent = this.errorIndex;

                    this.correctIndex--;

                    if (sound) {
                        keyBeep.currentTime = 0;
                        keyBeep.play();
                    }
                }

                this.cpm = this.correctIndex > 5 ? Math.floor(this.correctIndex / this.duration * 60) : 0;

                _cpm.textContent = this.cpm;

                this.wpm = Math.round(this.cpm / 5);
                _wpm.textContent = this.wpm;

                this.accuracyIndex = this.correctIndex > 5 ? Math.round((this.correctIndex * 100) / this.index) : 0;

                if (this.accuracyIndex > 0 && Number.isInteger(this.accuracyIndex))
                    _accuracy.innerHTML = `${this.accuracyIndex}<span class="small">%</span>`;

            });
        }
    }

    stop() {

        clearInterval(this.interval);
        this.interval = null;

        this.typing = false;

        _timer.textContent = '0';

        btnPaly.remove();

        input.remove();

        btnRefresh.classList.add('active');

        inputFull.classList.remove('d-none');

        inputFull.innerHTML = `&#8220;${this.quote}&#8221; <span class="d-block small text-muted text-right pr-3">&ndash; ${this.author}</span></div> `;

        return;
    }


    finish() {

        modal.style.display = 'block';
        const wpm = this.wpm;
        let result = '';
        const message = `Your typing speed is <strong>${wpm}</strong> WPM which equals <strong>${this.cpm}</strong> CPM. You've made a <strong>${this.errorIndex}</strong> mistakes with <strong>${this.accuracyIndex}%</strong> total accuracy.`;

        if (wpm > 5 && wpm < 20) {
            result = `
                <div class="modal-icon my-3"><img src="img/sleeping.svg" class="media-object"></div>
                <div class="media-body p-2">
                    <h4 class="media-heading">So Slow!</h4>
                    <p class="lead pt-2">${message} You should do more practice!</p>
                </div>`
        } else if (wpm > 20 && wpm < 40) {
            result = `
                <div class="modal-icon my-3"><img src="img/thinking.svg" class="media-object"></div>
                <div class="media-body p-2">
                    <h4 class="media-heading">About Average!</h4>
                    <p class="lead pt-2">${message} You can do better!</p>
                </div>`
        } else if (wpm > 40 && wpm < 60) {
            result = `
                <div class="modal-icon my-3"><img src="img/surprised.svg" class="media-object"></div>
                <div class="media-body p-2">
                    <h4 class="media-heading">Great Job!</h4>
                    <p class="lead pt-2">${message} You're doing great!</p>
                </div>`
        } else if (wpm > 60) {
            result = `
                <div class="modal-icon my-3"><img src="img/shocked.svg" class="media-object"></div>
                <div class="media-body p-2">
                    <h4 class="media-heading">Insane!</h4>
                    <p class="lead pt-2">${message} You're are Awesome!</p>
                </div>`
        } else {
            result = `
                <div class="modal-icon my-3"><img src="img/smart.svg" class="media-object"></div>
                <div class="media-body p-2">
                    <h4 class="media-heading">Hmmm!</h4>
                    <p class="lead pt-2">Please stop playing around and start typing!</p>
                </div>`
        }


        modalBody.innerHTML = result;

        modalClose.forEach(btn => btn.addEventListener('click', () => modal.style.display = 'none'));

        window.addEventListener('click', e => e.target === modal ? modal.style.display = 'none' : '');

        modalReload.addEventListener('click', () => location.reload());

        localStorage.setItem('WPM', wpm);
    }
}

const typingTest = new speedTyping();


btnPaly.addEventListener('click', () => typingTest.start());

btnRefresh.addEventListener('click', () => location.reload());

const savedWPM = localStorage.getItem('WPM') || 0;
select('#result').innerHTML = `<li>${savedWPM}</li>`;