let originalHTML = "";
let syntaxStyleIndex = 0;
const maxSyntaxStyles = 3;

const toggleStates = {
  default: false,
  blue: false,
  green: false,
  pink: false,
  orange: false
};

const phraseGroups = {
  blue: ["Have you"],
  green: ["missing out", "new things", "epic", "fun", "check", "hilarious", "checking things out", "cool", "delicious"],
  pink: ["action movie", "beach party", "cat", "video", "cat videos", "viral video", "playing piano", "viral", "sushi", "the new café that opened up", "art exhibit", "salsa dancing", "ice cream", "homemade pizza", "at the museum", "pizza-making"],
  orange: ["sometime", "in a while", "in ages", "next weekend", "a few times before"],
  default: ["But speaking of", "speaking of", "Speaking of", "Anyway"]
};

function highlightText(groupFilter = null) {
  const conversation = document.querySelector(".text-content");
  if (!conversation) return;

  let currentHTML = conversation.innerHTML;

  const allPhrases = Object.entries(phraseGroups).flatMap(([group, phrases]) =>
    phrases.map(phrase => ({ phrase, group }))
  );

  const filteredPhrases = groupFilter
    ? allPhrases.filter(({ group }) => group === groupFilter)
    : allPhrases;

  filteredPhrases.forEach(({ phrase, group }) => {
    const regex = new RegExp(`\\b(${phrase})\\b`, "gi");
    currentHTML = currentHTML.replace(regex, match => `<span class="highlighted-${group}">${match}</span>`);
  });

  conversation.innerHTML = currentHTML;
}

function resetText() {
  const conversation = document.querySelector(".text-content");
  if (conversation) conversation.innerHTML = originalHTML;

  Object.keys(toggleStates).forEach(key => toggleStates[key] = false);
  document.body.classList.remove('syntax-mode', 'syntax-style-1', 'syntax-style-2', 'syntax-style-3');
}

function toggleSyntaxStyle() {
  syntaxStyleIndex = (syntaxStyleIndex + 1) % maxSyntaxStyles;
  document.body.classList.remove('syntax-style-1', 'syntax-style-2', 'syntax-style-3');
  document.body.classList.add(`syntax-style-${syntaxStyleIndex + 1}`, 'syntax-mode');
  highlightText();
}

function updateCategoryText(selector, label, toggleKey, textClass = "") {
    toggleStates[toggleKey] = !toggleStates[toggleKey];
    const toggle = toggleStates[toggleKey];
  
    document.querySelectorAll(selector).forEach(el => {
      if (toggle) {
        // Only replace content if it's not already replaced
        if (!el.dataset.originalText) {
          el.dataset.originalText = el.innerHTML;
          el.innerHTML = label;
        }
        if (textClass) el.classList.add(textClass);
      } else {
        if (el.dataset.originalText) {
          el.innerHTML = el.dataset.originalText;
          delete el.dataset.originalText;
        }
        if (textClass) el.classList.remove(textClass);
      }
  
      el.classList.toggle("toggled", toggle);
    });
  
    document.body.classList.remove('syntax-mode');
  }
  

function changePinkToConnector() { highlightText('pink'); updateCategoryText('.highlighted-pink', 'object', 'pink', 'pink-text'); }
function changeGreenToConnector() { highlightText('green'); updateCategoryText('.highlighted-green', 'adjective', 'green', 'green-text'); }
function changeBlueToConnector() { highlightText('blue'); updateCategoryText('.highlighted-blue', 'question', 'blue', 'blue-text'); }
function changeOrangeToConnector() { highlightText('orange'); updateCategoryText('.highlighted-orange', 'time', 'orange', 'orange-text'); }
function changeHighlightedText() { highlightText('default'); updateCategoryText('.highlighted-default', 'connector', 'default', 'default-text'); }

function toggleBackgroundColor() {
  document.body.classList.toggle('black-background');
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function initializeAudioControls() {
  const audio = document.getElementById('audio-player');
  const playButton = document.getElementById('play-toggle');
  const progressBar = document.getElementById('progress-bar');
  const currentTimeDisplay = document.getElementById('current-time');
  const durationDisplay = document.getElementById('duration');

  if (!audio || !playButton || !progressBar || !currentTimeDisplay || !durationDisplay) return;

  playButton.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      playButton.textContent = '❚❚';
    } else {
      audio.pause();
      playButton.textContent = '►';
    }
  });

  audio.addEventListener('timeupdate', () => {
    progressBar.value = audio.currentTime;
    currentTimeDisplay.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener('loadedmetadata', () => {
    progressBar.max = audio.duration;
    durationDisplay.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('ended', () => {
    playButton.textContent = '►';
  });

  progressBar.addEventListener('input', () => {
    audio.currentTime = progressBar.value;
  });
}

function playTape(src) {
  const audio = document.getElementById('audio-player');
  const progressBar = document.getElementById('progress-bar');
  const currentTimeDisplay = document.getElementById('current-time');
  const durationDisplay = document.getElementById('duration');
  const playButton = document.getElementById('play-toggle');
  const soundBar = document.getElementById('sound-bar');

  if (!audio || !soundBar || !playButton) return;

  soundBar.style.display = 'flex';

  if (audio.src.includes(src)) {
    audio.play();
    playButton.textContent = '❚❚';
    return;
  }

  audio.pause();
  audio.src = src;
  audio.load();

  progressBar.value = 0;
  currentTimeDisplay.textContent = '0:00';
  durationDisplay.textContent = '0:00';

  audio.addEventListener('loadedmetadata', () => {
    progressBar.max = Math.floor(audio.duration);
    durationDisplay.textContent = formatTime(audio.duration);
    audio.play();
    playButton.textContent = '❚❚';
  }, { once: true });

  audio.onended = () => {
    playButton.textContent = '►';
  };
}
function showAllHighlights() {
    highlightText(); // Step 1: Apply highlighting spans
  
    // Force all toggle states to ON
    Object.keys(toggleStates).forEach(key => toggleStates[key] = true);
  
    // Step 2–5: Replace text + apply class as if double-clicked
    const map = [
      { selector: '.highlighted-blue', label: 'question', key: 'blue', className: 'blue-text' },
      { selector: '.highlighted-green', label: 'adjective', key: 'green', className: 'green-text' },
      { selector: '.highlighted-pink', label: 'object', key: 'pink', className: 'pink-text' },
      { selector: '.highlighted-orange', label: 'time', key: 'orange', className: 'orange-text' },
      { selector: '.highlighted-default', label: 'connector', key: 'default', className: 'default-text' }
    ];
  
    map.forEach(({ selector, label, key, className }) => {
      document.querySelectorAll(selector).forEach(el => {
        if (!el.dataset.originalText) {
          el.dataset.originalText = el.innerHTML;
          el.innerHTML = label;
        }
        el.classList.add("toggled");
        el.classList.add(className);
      });
    });
  
    document.body.classList.remove('syntax-mode');
  }
  
  

  
function syncTextWithAudioPersistent() {
  const audio = document.getElementById('audio-player');

  audio.addEventListener('timeupdate', () => {
    if (audio.paused || audio.ended) return;

    const lines = document.querySelectorAll('.text-content p');
    const currentTime = audio.currentTime;

    lines.forEach(line => {
      const start = parseFloat(line.dataset.start);
      const end = parseFloat(line.dataset.end);

      if (currentTime >= start && currentTime <= end) {
        if (!line.classList.contains('highlighted-line')) {
          line.classList.add('highlighted-line');
          line.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        line.classList.remove('highlighted-line');
      }
    });
  });

  audio.addEventListener('pause', () => {
    document.querySelectorAll('.highlighted-line').forEach(el => el.classList.remove('highlighted-line'));
  });

  audio.addEventListener('ended', () => {
    document.querySelectorAll('.highlighted-line').forEach(el => el.classList.remove('highlighted-line'));
  });
}

// --- Initialize ---
window.addEventListener('DOMContentLoaded', () => {
  const conversation = document.querySelector(".text-content");
  if (conversation) originalHTML = conversation.innerHTML;

  initializeAudioControls();
  syncTextWithAudioPersistent();

  document.querySelectorAll(".buttons button").forEach(btn => {
    const label = btn.textContent.trim().toLowerCase();

    btn.addEventListener("click", () => {
      switch (label) {
        case 'syntax': toggleSyntaxStyle(); break;
        case 'text': resetText(); break;
        case 'connector': changeHighlightedText(); break;
        case 'object': changePinkToConnector(); break;
        case 'adjective': changeGreenToConnector(); break;
        case 'question': changeBlueToConnector(); break;
        case 'time': changeOrangeToConnector(); break;
        case 'tape 1': playTape('4- AIGenerate2-Hey_Sam__good_to_see.wav'); break;
        case 'tape 2': playTape('svs_object_conector.wav');  showAllHighlights();
        break; 
        case 'tape 3': playTape('audio/tape3.mp3'); break;
      }
    });

    if (["object", "question", "time", "adjective"].includes(label)) {
      btn.addEventListener('dblclick', toggleBackgroundColor);
    }
  });

  const tape2Transcript = [
    { start: 0.0, end: 2.81, speaker: "alex", content: "Alex: Hey Sam, good to see you!" },
    { start: 2.81, end: 5.74, speaker: "alex", content: "So, question heard about object downtown?" },
    { start: 5.74, end: 11.405, speaker: "sam", content: "Sam: Hey Alex, yeah, I heard about it. I’ve been meaning to adjective it out." },
    { start: 11.40, end: 19.11, speaker: "alex", content: "Great, we should go time. connector, connector adjective, did you see that object object of the object object?" },
    { start: 19.11, end: 24.52, speaker: "sam", content: "Uh, no, I haven’t. I’m not really into watching object videos." },
    { start: 24.52, end: 32.33, speaker: "alex", content: "Oh, you’re adjective! It’s adjective. connector adjective, question tried the new object place that just opened?" },
    { start: 32.33, end: 36.61, speaker: "sam", content: "object? No, I haven’t had object time." },
    { start: 36.61, end: 43.34, speaker: "alex", content: "You should definitely try it. connector trying adjective, question ever considered taking up object?" },
    { start: 43.34, end: 48.13, speaker: "sam", content: "object? Uh, no, I haven’t really thought about it." },
    { start: 48.13, end: 56.46, speaker: "alex", content: "It’s so much adjective, you should give it a try time. connector, connector adjective, question heard about the upcoming object time?" },
    { start: 56.46, end: 61.845, speaker: "sam", content: "object? No, I didn’t hear about it. Who’s hosting it?" },
    { start: 61.846, end: 70.417, speaker: "alex", content: "Oh, just some friends of mine. It’s going to be adjective. connector adjective, question seen the new object that just came out?" },
    { start: 70.418, end: 74.803, speaker: "sam", content: "object? No, I haven’t been to the movies time." },
    { start: 74.803, end: 81.14, speaker: "alex", content: "You should definitely adjective it out. connector adjective, question seen the new object object?" },
    { start: 81.141, end: 85.591, speaker: "sam", content: "object? No, I haven’t been to the museum time." },
    { start: 85.591, end: 93.141, speaker: "alex", content: "You should go, it’s really adjective. connector adjective, question tried the new object flavor at the shop down the street?" },
    { start: 93.141, end: 97.136, speaker: "sam", content: "object? Uh, no, I haven’t." },
    { start: 97.136, end: 103.622, speaker: "alex", content: "You should go, it’s really adjective. connector adjective, question tried the new object flavor at the shop down the street?" },
    { start: 103.622, end: 107.517, speaker: "sam", content: "Object? Yeah, I’ve made it time." },
    { start: 107.517, end: 113.892, speaker: "alex", content: "Nice! We should have a object night time. connector, I should probably get going." },
    { start: 113.892, end: 119.609, speaker: "sam", content: "Yeah, me too. It was... an interesting conversation, Alex." },
    { start: 119.609, end: 123.569, speaker: "alex", content: "Definitely. Catch you later, Sam!" }
  ];
  function renderTranscriptFromData(transcript) {
  const container = document.querySelector(".text-content");
  if (!container) return;

  container.innerHTML = ""; // Clear old text

  transcript.forEach(entry => {
    const p = document.createElement("p");
    p.classList.add(entry.speaker);
    p.dataset.start = entry.start;
    p.dataset.end = entry.end;
    p.innerHTML = `<strong>${entry.speaker.charAt(0).toUpperCase() + entry.speaker.slice(1)}:</strong> ${entry.content.replace(/^.*?:\s*/, "")}`;
    container.appendChild(p);
  });
}
});
