const config = require('./config');
const { request, UpstreamError } = require('./http');

function wavHeader(dataLength, sampleRate = 16000, channels = 1, bits = 16) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE((sampleRate * channels * bits) / 8, 28);
  header.writeUInt16LE((channels * bits) / 8, 32);
  header.writeUInt16LE(bits, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataLength, 40);
  return header;
}

function toWav(buffer) {
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF') return buffer;
  return Buffer.concat([wavHeader(buffer.length), buffer]);
}

function sttTarget() {
  if (config.groqKey()) {
    return { url: 'https://api.groq.com/openai/v1/audio/transcriptions', key: config.groqKey(), model: config.groqSttModel() };
  }
  if (config.openaiKey()) {
    return { url: 'https://api.openai.com/v1/audio/transcriptions', key: config.openaiKey(), model: config.sttModel() };
  }
  throw new UpstreamError('GROQ_API_KEY or OPENAI_API_KEY is not configured', 503);
}

async function transcribe(audioBase64, language) {
  const stt = sttTarget();
  const audio = toWav(Buffer.from(audioBase64, 'base64'));
  const form = new FormData();
  form.append('file', new Blob([audio], { type: 'audio/wav' }), 'audio.wav');
  form.append('model', stt.model);
  if (language && language !== 'auto') form.append('language', language);
  const data = await request(stt.url, { method: 'POST', headers: { Authorization: `Bearer ${stt.key}` }, body: form }, 45000);
  return (data.text || '').trim();
}

module.exports = { transcribe, toWav };
