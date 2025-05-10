// #region Handling form, form submission, and EmailJS.

// Ensure EmailJS types are available (optional if you're using TypeScript)
declare const emailjs: any;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("booking-inquiry-form") as HTMLFormElement;
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

        form.reset();         // Clear form fields
        closeMenu();          // Close the aside

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
      .catch((error: any) => {
        console.error("Email sending failed:", error);
      });
  });
});

function toggleMenu(): void {
  const sideMenu = document.getElementById("sideMenu");
  if (sideMenu) {
    sideMenu.classList.toggle("open");
  }
}

function closeMenu(): void {
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
  document.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      closeMenu();
    }
  });

  // Close on click outside of the aside
  document.addEventListener("click", function (e) {
    const sideMenu = document.getElementById("sideMenu");
    const menuToggle = document.getElementById("menuToggle");

    if (sideMenu && sideMenu.classList.contains("open")) {
      const target = e.target as HTMLElement;
      if (!sideMenu.contains(target) && target !== menuToggle) {
        closeMenu();
      }
    }
  });

};

// #endregion

// #region Handling audio player
const music = new Audio();

interface Song {
  path: string;
  displayName: string;
  cover: string;
  artist: string;
}

const songs: Song[] = [
  {
    path: 'assets/Stoney Robinson - Hold On.mp3',
    displayName: "Hold On",
    cover: 'assets/favicon.svg',
    artist: 'Stoney Robinson',
  }
];

let musicIndex = 0;
let isPlaying = false;

// DOM elements
const playBtn = document.getElementById('play') as HTMLButtonElement;
const prevBtn = document.getElementById('prev') as HTMLButtonElement;
const nextBtn = document.getElementById('next') as HTMLButtonElement;
const title = document.getElementById('song-title') as HTMLElement;
const artist = document.getElementById('song-artist') as HTMLElement;
const image = document.getElementById('mp3-cover-art') as HTMLImageElement;
const progress = document.getElementById('progress') as HTMLDivElement;
const playerProgress = document.getElementById('mp3-player-progress') as HTMLDivElement;
const durationEl = document.getElementById('duration') as HTMLElement;
const currentTimeEl = document.getElementById('current-time') as HTMLElement;
const progressIndicator = document.getElementById('progress-indicator') as HTMLDivElement;

function togglePlay(): void {
  isPlaying ? pauseMusic() : playMusic();
}

function playMusic(): void {
  isPlaying = true;
  playBtn.classList.replace('fa-play', 'fa-pause');
  playBtn.setAttribute('title', 'Pause');
  music.play();
}

function pauseMusic(): void {
  isPlaying = false;
  playBtn.classList.replace('fa-pause', 'fa-play');
  playBtn.setAttribute('title', 'Play');
  music.pause();
}

function loadMusic(song: Song): void {
  music.src = song.path;
  title.textContent = song.displayName;
  artist.textContent = song.artist;
  image.src = song.cover;
  music.load(); // Force metadata load
}

// Load initial song on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  loadMusic(songs[musicIndex]);

  // Wait until metadata is loaded to show accurate duration
  music.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(music.duration);
    currentTimeEl.textContent = '00:00';
    progress.style.width = '0%';
    progressIndicator.style.left = '0%'; // Ensure the indicator starts at the beginning

    // Set play button to correct initial state
    playBtn.classList.remove('fa-pause');
    playBtn.classList.add('fa-play');
    playBtn.setAttribute('title', 'Play');
  });
});

function changeMusic(direction: number): void {
  musicIndex = (musicIndex + direction + songs.length) % songs.length;
  loadMusic(songs[musicIndex]); // Load the next song without playing it
  // Do not play immediately, await play press
  isPlaying = false;
  playBtn.classList.replace('fa-pause', 'fa-play');
  playBtn.setAttribute('title', 'Play');
}

function formatTime(time: number): string {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateProgressBar(): void {
  if (!music.duration) return;
  const progressPercent = (music.currentTime / music.duration) * 100;
  progress.style.width = `${progressPercent}%`;
  progressIndicator.style.left = `${progressPercent}%`; // Move the progress-indicator along with the progress
  currentTimeEl.textContent = formatTime(music.currentTime);
  durationEl.textContent = formatTime(music.duration);
}

function setProgressBar(e: MouseEvent): void {
  const target = e.currentTarget as HTMLDivElement;
  const rect = target.getBoundingClientRect(); // Get the bounding box of the progress bar
  const clickX = e.clientX - rect.left; // Get the position where the click happened
  const width = rect.width;

  const duration = music.duration;
  if (duration) {
    const newTime = (clickX / width) * duration; // Calculate the new time based on the click position
    music.currentTime = newTime; // Set the currentTime of the music to the new position
  }
}

// Event listeners
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', () => changeMusic(-1));
nextBtn.addEventListener('click', () => changeMusic(1));
music.addEventListener('ended', () => changeMusic(1)); // Automatically change song when one ends
music.addEventListener('timeupdate', updateProgressBar);
playerProgress.addEventListener('click', setProgressBar);

// #endregion