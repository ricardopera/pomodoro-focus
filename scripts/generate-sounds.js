// Generate simple beep sounds for timer notifications
// This creates WAV files with pure tones

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOUNDS_DIR = path.join(__dirname, '../public/sounds');

// Ensure sounds directory exists
if (!fs.existsSync(SOUNDS_DIR)) {
  fs.mkdirSync(SOUNDS_DIR, { recursive: true });
}

// Generate a simple WAV file with a pure tone
function generateBeep(filename, frequency, durationMs, volume = 0.3) {
  const sampleRate = 44100;
  const numSamples = Math.floor((sampleRate * durationMs) / 1000);
  const bytesPerSample = 2;
  const numChannels = 1;
  
  // WAV header (44 bytes)
  const header = Buffer.alloc(44);
  
  // "RIFF" chunk descriptor
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + numSamples * bytesPerSample, 4);
  header.write('WAVE', 8);
  
  // "fmt " sub-chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  header.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28); // ByteRate
  header.writeUInt16LE(numChannels * bytesPerSample, 32); // BlockAlign
  header.writeUInt16LE(bytesPerSample * 8, 34); // BitsPerSample
  
  // "data" sub-chunk
  header.write('data', 36);
  header.writeUInt32LE(numSamples * bytesPerSample, 40);
  
  // Generate samples
  const samples = Buffer.alloc(numSamples * bytesPerSample);
  
  for (let i = 0; i < numSamples; i++) {
    // Apply envelope (fade in/out) to avoid clicks
    let envelope = 1.0;
    const fadeLength = sampleRate * 0.01; // 10ms fade
    
    if (i < fadeLength) {
      envelope = i / fadeLength;
    } else if (i > numSamples - fadeLength) {
      envelope = (numSamples - i) / fadeLength;
    }
    
    // Generate sine wave
    const t = i / sampleRate;
    const value = Math.sin(2 * Math.PI * frequency * t) * volume * envelope;
    
    // Convert to 16-bit PCM
    const sample = Math.floor(value * 32767);
    samples.writeInt16LE(sample, i * bytesPerSample);
  }
  
  // Combine header and samples
  const wav = Buffer.concat([header, samples]);
  
  // Write to file
  const filepath = path.join(SOUNDS_DIR, filename);
  fs.writeFileSync(filepath, wav);
  console.log(`✅ Generated ${filename} (${frequency}Hz, ${durationMs}ms)`);
}

// Generate completion sound (pleasant two-tone chime)
function generateCompletionSound() {
  const filename = 'complete.wav';
  const sampleRate = 44100;
  const tone1Duration = 150; // ms
  const tone2Duration = 200; // ms
  const gapDuration = 50; // ms
  const totalDuration = tone1Duration + gapDuration + tone2Duration;
  const numSamples = Math.floor((sampleRate * totalDuration) / 1000);
  const bytesPerSample = 2;
  
  // WAV header
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + numSamples * bytesPerSample, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * bytesPerSample, 28);
  header.writeUInt16LE(bytesPerSample, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(numSamples * bytesPerSample, 40);
  
  const samples = Buffer.alloc(numSamples * bytesPerSample);
  
  const tone1Samples = Math.floor((sampleRate * tone1Duration) / 1000);
  const gapSamples = Math.floor((sampleRate * gapDuration) / 1000);
  const tone2Samples = Math.floor((sampleRate * tone2Duration) / 1000);
  
  const freq1 = 800; // C5
  const freq2 = 1000; // E5
  const volume = 0.3;
  
  for (let i = 0; i < numSamples; i++) {
    let value = 0;
    const t = i / sampleRate;
    
    // Tone 1
    if (i < tone1Samples) {
      const fadeLength = sampleRate * 0.01;
      let envelope = 1.0;
      if (i < fadeLength) envelope = i / fadeLength;
      if (i > tone1Samples - fadeLength) envelope = (tone1Samples - i) / fadeLength;
      value = Math.sin(2 * Math.PI * freq1 * t) * volume * envelope;
    }
    // Gap (silence)
    else if (i < tone1Samples + gapSamples) {
      value = 0;
    }
    // Tone 2
    else if (i < tone1Samples + gapSamples + tone2Samples) {
      const t2 = (i - tone1Samples - gapSamples) / sampleRate;
      const fadeLength = sampleRate * 0.01;
      const pos = i - tone1Samples - gapSamples;
      let envelope = 1.0;
      if (pos < fadeLength) envelope = pos / fadeLength;
      if (pos > tone2Samples - fadeLength) envelope = (tone2Samples - pos) / fadeLength;
      value = Math.sin(2 * Math.PI * freq2 * t2) * volume * envelope;
    }
    
    const sample = Math.floor(value * 32767);
    samples.writeInt16LE(sample, i * bytesPerSample);
  }
  
  const wav = Buffer.concat([header, samples]);
  fs.writeFileSync(path.join(SOUNDS_DIR, filename), wav);
  console.log(`✅ Generated ${filename} (two-tone chime)`);
}

console.log('🎵 Generating sound files...\n');

// Generate sounds
generateBeep('tick.wav', 440, 50, 0.1); // Subtle tick (quiet A4)
generateCompletionSound(); // Timer complete sound

console.log('\n🎉 All sounds generated successfully!');
