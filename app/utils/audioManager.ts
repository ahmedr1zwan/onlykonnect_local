// Global audio manager to track and control all playing audio

const playingAudio = new Set<HTMLAudioElement>();

export function registerAudio(audio: HTMLAudioElement) {
  playingAudio.add(audio);
  
  // Auto-remove when audio ends
  const handleEnded = () => {
    playingAudio.delete(audio);
    audio.removeEventListener('ended', handleEnded);
  };
  audio.addEventListener('ended', handleEnded);
}

export function unregisterAudio(audio: HTMLAudioElement) {
  playingAudio.delete(audio);
}

export function stopAllAudio() {
  playingAudio.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0; // Reset to beginning
  });
  playingAudio.clear();
}

export function isMuted(): boolean {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("onlyconnect_mute_state");
    return stored === "true";
  }
  return false;
}

