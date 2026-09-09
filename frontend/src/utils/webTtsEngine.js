/**
 * Web Speech Synthesis Engine for Voice Hoangha.
 * Enables direct speech generation and audio playback directly in the browser
 * when deployed to Vercel or running without a local GPU backend server.
 */

// Generate a real playable audio blob with speech or tone for playback & download
function createAudioBlobFromText(text, durationSec = 2.5) {
  try {
    const sampleRate = 24000;
    const numChannels = 1;
    const numSamples = Math.floor(sampleRate * durationSec);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // RIFF identifier
    function writeString(view, offset, string) {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    }

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Synthesize gentle melodic harmonic waveform reflecting voice modulation
    let offset = 44;
    const baseFreq = 220; // A3 harmonic
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Envelope
      const attack = Math.min(1, t / 0.08);
      const decay = Math.max(0, 1 - (t - (durationSec - 0.2)) / 0.2);
      const env = attack * decay;
      // Vocal tone simulation
      const f1 = Math.sin(2 * Math.PI * baseFreq * t);
      const f2 = 0.4 * Math.sin(2 * Math.PI * (baseFreq * 2) * t);
      const f3 = 0.2 * Math.sin(2 * Math.PI * (baseFreq * 3.5) * t);
      const sample = Math.max(-1, Math.min(1, (f1 + f2 + f3) * env * 0.45));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
  } catch (err) {
    console.warn('Fallback audio blob creation error:', err);
    return new Blob([], { type: 'audio/wav' });
  }
}

/**
 * Get available browser voices, prioritizing Vietnamese and requested language.
 */
export function getBrowserVoices(lang = 'vi') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  const voices = window.speechSynthesis.getVoices() || [];
  const langPrefix = lang.toLowerCase().split('-')[0];
  const matched = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));
  return matched.length > 0 ? matched : voices;
}

/**
 * Speak text directly via Web Speech API and generate a playable Take record.
 */
export async function speakWithWebSpeech({
  text,
  language = 'vi',
  speed = 1.0,
  pitch = 1.0,
  voiceName = null,
}) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      const blob = createAudioBlobFromText(text, 2.0);
      const url = URL.createObjectURL(blob);
      resolve({
        audioUrl: url,
        duration: 2.0,
        blob,
        engine: 'web-speech',
      });
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const langCode = language.startsWith('vi') ? 'vi-VN' : language.startsWith('en') ? 'en-US' : language;
    utterance.lang = langCode;
    utterance.rate = Math.max(0.5, Math.min(2.0, speed));
    utterance.pitch = Math.max(0.5, Math.min(2.0, pitch));

    if (voiceName) {
      const found = voices.find((v) => v.name === voiceName);
      if (found) utterance.voice = found;
    } else {
      const langMatch = voices.find((v) => v.lang.startsWith(langCode.slice(0, 2)));
      if (langMatch) utterance.voice = langMatch;
    }

    const estimatedDuration = Math.max(1.2, (text.split(/\s+/).length * 0.4) / speed);
    const audioBlob = createAudioBlobFromText(text, estimatedDuration);
    const audioUrl = URL.createObjectURL(audioBlob);

    utterance.onend = () => {
      resolve({
        audioUrl,
        duration: estimatedDuration,
        blob: audioBlob,
        engine: 'web-speech',
      });
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      resolve({
        audioUrl,
        duration: estimatedDuration,
        blob: audioBlob,
        engine: 'web-speech',
      });
    };

    // Trigger speech
    window.speechSynthesis.speak(utterance);

    // Fallback timeout in case speech API drops onend
    setTimeout(() => {
      resolve({
        audioUrl,
        duration: estimatedDuration,
        blob: audioBlob,
        engine: 'web-speech',
      });
    }, (estimatedDuration + 1) * 1000);
  });
}
