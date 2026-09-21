import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const sampleRate = 44100;
const duration = 16;
const sampleCount = sampleRate * duration;
const samples = new Float32Array(sampleCount);

const smoothstep = (value) => value * value * (3 - 2 * value);

function addPluck(start, frequency, amount) {
  const length = 2.15;
  const from = Math.floor(start * sampleRate);
  const to = Math.min(sampleCount, Math.ceil((start + length) * sampleRate));
  for (let i = from; i < to; i++) {
    const local = i / sampleRate - start;
    const attack = smoothstep(Math.min(local / 0.018, 1));
    const decay = Math.exp(-3.4 * Math.max(local - 0.018, 0));
    const bend = 1 + 0.005 * Math.exp(-local * 8);
    const phase = 2 * Math.PI * frequency * bend * local;
    const tone = Math.sin(phase) + 0.28 * Math.sin(phase * 2.01) + 0.1 * Math.sin(phase * 3.02);
    samples[i] += tone * attack * decay * amount;
  }
}

function addPorcelain(start, frequency) {
  const length = 0.55;
  const from = Math.floor(start * sampleRate);
  const to = Math.min(sampleCount, Math.ceil((start + length) * sampleRate));
  for (let i = from; i < to; i++) {
    const local = i / sampleRate - start;
    const attack = smoothstep(Math.min(local / 0.006, 1));
    const decay = Math.exp(-10 * local);
    const tone = Math.sin(2 * Math.PI * frequency * local)
      + 0.35 * Math.sin(2 * Math.PI * frequency * 1.51 * local);
    samples[i] += tone * attack * decay * 0.055;
  }
}

for (let i = 0; i < sampleCount; i++) {
  const time = i / sampleRate;
  const loopWindow = Math.sin(Math.PI * time / duration) ** 2;
  const drone = Math.sin(2 * Math.PI * 73.4375 * time) * 0.048
    + Math.sin(2 * Math.PI * 110 * time) * 0.022
    + Math.sin(2 * Math.PI * 146.875 * time) * 0.012;
  const room = Math.sin(2 * Math.PI * 47 * time) * 0.004
    + Math.sin(2 * Math.PI * 59 * time + 0.7) * 0.003;
  samples[i] += drone * loopWindow + room;
}

const notes = [
  [0, 293.66, 0.12], [1.75, 220, 0.075], [3.25, 349.23, 0.092],
  [5.5, 392, 0.082], [7.25, 293.66, 0.1], [9.5, 523.25, 0.07],
  [11.75, 440, 0.082], [14.25, 349.23, 0.09]
];
notes.forEach(([start, frequency, amount]) => addPluck(start, frequency, amount));
addPorcelain(6.55, 1320);
addPorcelain(15.1, 990);

let noiseSeed = 1937;
let filteredNoise = 0;
for (let i = 0; i < sampleCount; i++) {
  noiseSeed = (noiseSeed * 16807) % 2147483647;
  const white = noiseSeed / 2147483647 * 2 - 1;
  filteredNoise += (white - filteredNoise) * 0.018;
  const time = i / sampleRate;
  const edgeFade = Math.min(1, time / 0.8, (duration - time) / 0.8);
  samples[i] += filteredNoise * smoothstep(Math.max(0, edgeFade)) * 0.018;
}

let peak = 0;
for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
const gain = 0.72 / Math.max(peak, 0.001);

const dataSize = sampleCount * 2;
const wav = Buffer.alloc(44 + dataSize);
wav.write("RIFF", 0);
wav.writeUInt32LE(36 + dataSize, 4);
wav.write("WAVE", 8);
wav.write("fmt ", 12);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(sampleRate, 24);
wav.writeUInt32LE(sampleRate * 2, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write("data", 36);
wav.writeUInt32LE(dataSize, 40);

for (let i = 0; i < sampleCount; i++) {
  const sample = Math.max(-1, Math.min(1, Math.tanh(samples[i] * gain)));
  wav.writeInt16LE(Math.round(sample * 32767), 44 + i * 2);
}

const outputPath = resolve("public/audio/banquet-loop.wav");
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, wav);
console.log(`Wrote ${outputPath} (${duration}s, ${sampleRate} Hz, mono)`);
