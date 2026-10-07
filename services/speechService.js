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

async function transcribe(audioBase64, language) {
  const key = config.openaiKey();
  if (!key) throw new UpstreamError('OPENAI_API_KEY is not configured', 503);
  const audio = toWav(Buffer.from(audioBase64, 'base64'));
  const form = new FormData();
  form.append('file', new Blob([audio], { type: 'audio/wav' }), 'audio.wav');
  form.append('model', config.sttModel());
  if (language && language !== 'auto') form.append('language', language);
  const data = await request(
    'https://api.openai.com/v1/audio/transcriptions',
    { method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: form },
    45000
  );
  return (data.text || '').trim();
}

module.exports = { transcribe, toWav };
