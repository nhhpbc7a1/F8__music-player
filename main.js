// 1. render songs -> OK
// 2. Scroll top -> OK
// 3. Play / pause / seek -> OK
// 4. CD rotate -> OK
// 5. Next / prev -> OK
// 6. Random -> OK
// 7. Next / repeat when end -> OK
// 8. Active song -> OK
// 9. Scroll active song into view  -> 50%
// 10. Play song when click -> OK

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER'; 

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const nextBtn = $('.btn.btn-next');
const prevBtn = $('.btn.btn-prev');
const randomBtn = $('.btn.btn-random');
const repeatBtn = $('.btn.btn-repeat');
const dashboard = $('.dashboard');
const playlist = $('.playlist');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    songs: [
        {
            name: 'name1',
            singer: 'singer1',
            path:'./assets/music/song1.mp3',
            image:'./assets/img/song1.png',
        },
        {
            name: 'name2',
            singer: 'singer2',
            path:'./assets/music/song2.mp3',
            image:'./assets/img/song2.png',
        },
        {
            name: 'name3',
            singer: 'singer3',
            path:'./assets/music/song3.mp3',
            image:'./assets/img/song3.png',
        },
        {
            name: 'name4',
            singer: 'singer4',
            path:'./assets/music/song4.mp3',
            image:'./assets/img/song4.png',
        },
        {
            name: 'name5',
            singer: 'singer5',
            path:'./assets/music/song5.mp3',
            image:'./assets/img/song5.png',
        },
        {
            name: 'name6',
            singer: 'singer6',
            path:'./assets/music/song6.mp3',
            image:'./assets/img/song6.png',
        },
        {
            name: 'name7',
            singer: 'singer7',
            path:'./assets/music/song7.mp3',
            image:'./assets/img/song7.png',
        },
        {
            name: 'name8',
            singer: 'singer8',
            path:'./assets/music/song8.mp3',
            image:'./assets/img/song8.png',
        },
        {
            name: 'name9',
            singer: 'singer9',
            path:'./assets/music/song9.mp3',
            image:'./assets/img/song9.png',
        },
        {
            name: 'name10',
            singer: 'singer10',
            path:'./assets/music/song10.mp3',
            image:'./assets/img/song10.png',
        }
    ],
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index=${index}>
            <div class="thumb" style="background-image: url(${song.image})">
            </div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
            </div>
            `;

        }) 
        playlist.innerHTML = htmls.join('');
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },

    handleEvents: function() {
        cdWidth = cd.offsetWidth;
        const _this = this;
        // Xử lý CD quay / dừng 
        const cdThumbAnimate = cdThumb.animate([
            {
                transform: 'rotate(360deg)',    
            }
        ], {
            duration: 10000,
            iterations: Infinity,
        })
        cdThumbAnimate.pause();

        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Xử lý khi click play
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause();
            } 
            else {
                audio.play();
            }
        }

        // Khi song được play 
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }
        // Khi song bị pause
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // Khi tiến độ bài hát bị thay đổi
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent; 
            }
        }

        // Xử lý khi tua bài hát
        progress.onchange = function(e) {
            const seekTime = e.target.value * audio.duration / 100;
            audio.currentTime = seekTime; 
        }

        // Khi next song
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play(); 
            _this.render();
            _this.scrollToActiveSong();
        }

        // Khi prev song
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        
        // Xử lý bật tắt random song
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }
        
        // Xử lý lặp lại một song
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        } 

        // Xử lý new song khi audio ended
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }

        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            if (  songNode|| e.target.closest('.option')) {
                
                // Xử lý click vào song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    audio.play();
                    _this.render();
                    console.log(_this.currentIndex);
                }

                // Xử lý click vào song option
                if (e.target.closest('.option')) {

                }

            }
        }
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            const thisB = $('.song.active');
            thisB.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            }); 
            // console.log(dashboard.offsetHeight, ' ', thisB.clientTop);
            // document.documentElement.scrollTop += dashboard.offsetHeight > thisB.offsetTop ? dashboard.offsetHeight - thisB.offsetTop : 0;
        }, 300)
    },
    loadCurrentSong: function() {

        heading.innerText = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;
    },
    loadConfig:function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        }
        while (newIndex === this.currentIndex);

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },


    start: function() {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        // Định nghĩa các thuộc tính cho Object
        this.defineProperties();

        // Lắng nghe / xử lí các sự kiện ('DOM events)
        this.handleEvents(); 

        // Tải thông tin bài hát đầu tiên khi vào UI tải ứng dụng
        this.loadCurrentSong();

        // render playlist
        this.render();

        // Hiển thị trạng thái ban đầu của button repeat và random
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    },
}

app.start();