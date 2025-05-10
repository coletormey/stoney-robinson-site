"use strict";
// #region Handling form, form submission, and EmailJS.
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("booking-inquiry-form");
    const sideMenu = document.getElementById("sideMenu");
    if (!form) {
        console.error("Form with ID 'booking-inquiry-form' not found.");
        return;
    }
    form.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevents reload
        emailjs.sendForm("booking_inquiry", "booking_inquiry", form)
            .then(() => {
            console.log("Email sent successfully!");
            form.reset(); // Clear form fields
            closeMenu(); // Close the aside
            // Create and append new success message outside the aside
            const successMessage = document.createElement("div");
            successMessage.textContent = "Thank you! We'll email you back ASAP!";
            successMessage.className = "form-success-message";
            // Append the success message to the body, or to a specific container
            document.body.appendChild(successMessage);
            // Automatically hide the success message after 5 seconds (optional)
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
        })
            .catch((error) => {
            console.error("Email sending failed:", error);
        });
    });
});
function toggleMenu() {
    const sideMenu = document.getElementById("sideMenu");
    if (sideMenu) {
        sideMenu.classList.toggle("open");
    }
}
function closeMenu() {
    const sideMenu = document.getElementById("sideMenu");
    if (sideMenu) {
        sideMenu.classList.remove("open");
    }
}
window.onload = () => {
    const menuToggle = document.getElementById("menuToggle");
    const exitMenuButton = document.querySelector("aside #exit-aside");
    const sideMenu = document.getElementById("sideMenu");
    if (menuToggle) {
        menuToggle.addEventListener("click", (e) => {
            e.preventDefault();
            toggleMenu();
        });
    }
    if (exitMenuButton) {
        exitMenuButton.addEventListener("click", () => {
            closeMenu();
        });
    }
    // Close on Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeMenu();
        }
    });
    // Close on click outside of the aside
    document.addEventListener("click", function (e) {
        const sideMenu = document.getElementById("sideMenu");
        const menuToggle = document.getElementById("menuToggle");
        if (sideMenu && sideMenu.classList.contains("open")) {
            const target = e.target;
            if (!sideMenu.contains(target) && target !== menuToggle) {
                closeMenu();
            }
        }
    });
};
// #endregion
// #region Handling audio player
const music = new Audio();
const songs = [
    {
        path: 'assets/Stoney Robinson - Hold On.mp3',
        displayName: "Hold On",
        cover: 'assets/favicon.svg',
        artist: 'Stoney Robinson',
    }
];
let musicIndex = 0;
let isPlaying = false;
let isDragging = false;
// DOM elements
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const title = document.getElementById('song-title');
const artist = document.getElementById('song-artist');
const image = document.getElementById('mp3-cover-art');
const progress = document.getElementById('progress');
const playerProgress = document.getElementById('mp3-player-progress');
const durationEl = document.getElementById('duration');
const currentTimeEl = document.getElementById('current-time');
const progressIndicator = document.getElementById('progress-indicator');
function togglePlay() {
    isPlaying ? pauseMusic() : playMusic();
}
function playMusic() {
    isPlaying = true;
    playBtn.classList.replace('fa-play', 'fa-pause');
    playBtn.setAttribute('title', 'Pause');
    music.play();
}
function pauseMusic() {
    isPlaying = false;
    playBtn.classList.replace('fa-pause', 'fa-play');
    playBtn.setAttribute('title', 'Play');
    music.pause();
}
function loadMusic(song) {
    music.src = song.path;
    title.textContent = song.displayName;
    artist.textContent = song.artist;
    image.src = song.cover;
    music.load(); // Force metadata load
}
// Load initial song on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    loadMusic(songs[musicIndex]);
    music.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(music.duration);
        currentTimeEl.textContent = '00:00';
        progress.style.width = '0%';
        progressIndicator.style.left = '0%';
        playBtn.classList.remove('fa-pause');
        playBtn.classList.add('fa-play');
        playBtn.setAttribute('title', 'Play');
    });
});
function changeMusic(direction) {
    musicIndex = (musicIndex + direction + songs.length) % songs.length;
    loadMusic(songs[musicIndex]);
    isPlaying = false;
    playBtn.classList.replace('fa-pause', 'fa-play');
    playBtn.setAttribute('title', 'Play');
}
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
function updateProgressBar() {
    if (!music.duration)
        return;
    const progressPercent = (music.currentTime / music.duration) * 100;
    progress.style.width = `${progressPercent}%`;
    progressIndicator.style.left = `${progressPercent}%`;
    currentTimeEl.textContent = formatTime(music.currentTime);
    durationEl.textContent = formatTime(music.duration);
}
function setProgressBar(e) {
    if (e.target !== playerProgress)
        return; // prevent clicks on children like time labels
    const rect = playerProgress.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const duration = music.duration;
    if (duration) {
        music.currentTime = (clickX / width) * duration;
    }
}
// Drag support for desktop and mobile
function startDrag(e) {
    isDragging = true;
    updateProgressDuringInteraction(e);
}
function stopDrag() {
    isDragging = false;
}
function updateProgressDuringInteraction(e) {
    if (!isDragging)
        return;
    const clientX = (e instanceof TouchEvent) ? e.touches[0].clientX : e.clientX;
    const rect = playerProgress.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const width = rect.width;
    const duration = music.duration;
    if (duration) {
        const newTime = (clickX / width) * duration;
        music.currentTime = newTime;
        updateProgressBar();
    }
}
// Mouse events
progressIndicator.addEventListener('mousedown', (e) => {
    startDrag(e);
    document.addEventListener('mousemove', updateProgressDuringInteraction);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', updateProgressDuringInteraction);
    });
});
// Touch events
progressIndicator.addEventListener('touchstart', (e) => {
    startDrag(e);
    document.addEventListener('touchmove', updateProgressDuringInteraction);
    document.addEventListener('touchend', stopDrag);
    document.addEventListener('touchend', () => {
        document.removeEventListener('touchmove', updateProgressDuringInteraction);
    });
});
// Event listeners
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', () => changeMusic(-1));
nextBtn.addEventListener('click', () => changeMusic(1));
music.addEventListener('ended', () => changeMusic(1));
music.addEventListener('timeupdate', updateProgressBar);
playerProgress.addEventListener('click', setProgressBar);
// #endregion
