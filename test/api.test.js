const { test, beforeEach, after } = require('node:test');
const assert = require('node:assert');
const app = require('../server');

let server;
let base;
const realFetch = globalThis.fetch;
let calls;

function mockUpstream(handler) {
  globalThis.fetch = async (url, init) => {
    if (String(url).startsWith(base)) return realFetch(url, init);
    calls.push({ url: String(url), init });
    return handler(String(url), init);
  };
}

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const gemini = (text) => json({ candidates: [{ content: { parts: [{ text }] } }] });

async function post(path, body) {
  const res = await realFetch(`${base}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { status: res.status, body: await res.json() };
}

beforeEach(async () => {
  calls = [];
  for (const k of ['GEMINI_API_KEY', 'GROQ_API_KEY', 'DEEPSEEK_API_KEY', 'OPENAI_API_KEY', 'NLLB_API_URL', 'HF_API_KEY']) delete process.env[k];
  if (!server) {
    server = app.listen(0);
    base = `http://127.0.0.1:${server.address().port}`;
  }
});

after(() => server && server.close());

test('health and languages', async () => {
  const health = await (await realFetch(`${base}/api/v1/health`)).json();
  assert.equal(health.status, 'ok');
  const langs = await (await realFetch(`${base}/api/v1/languages`)).json();
  assert.ok(langs.find((l) => l.code === 'tr'));
  assert.deepEqual(Object.keys(langs[0]).sort(), ['code', 'flag', 'name', 'native_name']);
});

test('text translation validates input', async () => {
  const r = await post('/api/v1/translate/text', { text: 'hi' });
  assert.equal(r.status, 400);
});

test('text translation without keys returns 503', async () => {
  const r = await post('/api/v1/translate/text', { text: 'hi', target_language: 'tr' });
  assert.equal(r.status, 503);
});

test('short text goes to gemini and uses configured model', async () => {
  process.env.GEMINI_API_KEY = 'k';
  mockUpstream(() => gemini('merhaba'));
  const r = await post('/api/v1/translate/text', { text: 'hello', target_language: 'tr' });
  assert.equal(r.status, 200);
  assert.equal(r.body.translated_text, 'merhaba');
  assert.equal(r.body.model_used, 'gemini_flash');
  assert.match(calls[0].url, /gemini-3\.5-flash:generateContent$/);
  assert.equal(calls[0].init.headers['x-goog-api-key'], 'k');
});

test('long text goes to deepseek', async () => {
  process.env.GEMINI_API_KEY = 'k';
  process.env.DEEPSEEK_API_KEY = 'd';
  mockUpstream(() => json({ choices: [{ message: { content: 'uzun' } }] }));
  const r = await post('/api/v1/translate/text', { text: 'a'.repeat(600), target_language: 'tr' });
  assert.equal(r.body.model_used, 'deepseek');
  assert.match(calls[0].url, /api\.deepseek\.com\/chat\/completions/);
});

test('failed provider falls back to the next one', async () => {
  process.env.GEMINI_API_KEY = 'k';
  process.env.DEEPSEEK_API_KEY = 'd';
  mockUpstream((url) => (url.includes('deepseek') ? json({ error: 'x' }, 500) : gemini('yedek')));
  const r = await post('/api/v1/translate/text', { text: 'a'.repeat(600), target_language: 'tr' });
  assert.equal(r.status, 200);
  assert.equal(r.body.model_used, 'gemini_flash');
  assert.equal(r.body.translated_text, 'yedek');
});

test('rare language uses nllb when configured', async () => {
  process.env.GEMINI_API_KEY = 'k';
  process.env.NLLB_API_URL = 'https://nllb.example/translate';
  mockUpstream(() => json([{ translation_text: 'jambo' }]));
  const r = await post('/api/v1/translate/text', { text: 'hello', source_language: 'en', target_language: 'sw' });
  assert.equal(r.body.model_used, 'meta_nllb');
  assert.deepEqual(JSON.parse(calls[0].init.body).parameters, { src_lang: 'eng_Latn', tgt_lang: 'swh_Latn' });
});

test('rare language uses gemini when nllb is not configured', async () => {
  process.env.GEMINI_API_KEY = 'k';
  mockUpstream(() => gemini('jambo'));
  const r = await post('/api/v1/translate/text', { text: 'hello', source_language: 'en', target_language: 'sw' });
  assert.equal(r.body.model_used, 'gemini_flash');
});

test('speech: raw pcm is wrapped as wav, transcribed, translated', async () => {
  process.env.GEMINI_API_KEY = 'k';
  process.env.OPENAI_API_KEY = 'o';
  mockUpstream((url) => (url.includes('openai') ? json({ text: 'hello world' }) : gemini('merhaba dünya')));
  const pcm = Buffer.alloc(3200).toString('base64');
  const r = await post('/api/v1/translate/speech', { audio_base64: pcm, source_language: 'en', target_language: 'tr' });
  assert.equal(r.status, 200);
  assert.equal(r.body.transcript, 'hello world');
  assert.equal(r.body.translated_text, 'merhaba dünya');
  assert.equal(r.body.model_used, 'whisper+gemini_flash');
  const file = calls[0].init.body.get('file');
  const head = Buffer.from(await file.arrayBuffer()).subarray(0, 4).toString('ascii');
  assert.equal(head, 'RIFF');
  assert.equal(calls[0].init.body.get('language'), 'en');
});

test('call translate returns session id and latency', async () => {
  process.env.GEMINI_API_KEY = 'k';
  process.env.OPENAI_API_KEY = 'o';
  mockUpstream((url) => (url.includes('openai') ? json({ text: 'selam' }) : gemini('hi')));
  const r = await post('/api/v1/call/translate', { audio_base64: Buffer.alloc(100).toString('base64'), source_language: 'tr', target_language: 'en', session_id: 's1' });
  assert.equal(r.status, 200);
  assert.equal(r.body.session_id, 's1');
  assert.equal(r.body.translated_text, 'hi');
  assert.equal(typeof r.body.latency_ms, 'number');
});

test('empty transcript returns 422', async () => {
  process.env.OPENAI_API_KEY = 'o';
  mockUpstream(() => json({ text: '' }));
  const r = await post('/api/v1/call/translate', { audio_base64: 'AAAA', source_language: 'tr', target_language: 'en' });
  assert.equal(r.status, 422);
});

test('image translation sends inline image to gemini', async () => {
  process.env.GEMINI_API_KEY = 'k';
  mockUpstream(() => gemini('çevrildi'));
  const r = await post('/api/v1/translate/image', { image_base64: 'QUJD', target_language: 'tr' });
  assert.equal(r.status, 200);
  assert.equal(JSON.parse(calls[0].init.body).contents[0].parts[0].inlineData.data, 'QUJD');
});

test('groq works alone for text and speech', async () => {
  process.env.GROQ_API_KEY = 'g';
  mockUpstream((url) => (url.includes('audio/transcriptions') ? json({ text: 'selam' }) : json({ choices: [{ message: { content: 'hi' } }] })));
  const text = await post('/api/v1/translate/text', { text: 'selam', target_language: 'en' });
  assert.equal(text.status, 200);
  assert.equal(text.body.model_used, 'groq');
  assert.match(calls[0].url, /api\.groq\.com\/openai\/v1\/chat\/completions/);
  const speech = await post('/api/v1/translate/speech', { audio_base64: Buffer.alloc(100).toString('base64'), source_language: 'tr', target_language: 'en' });
  assert.equal(speech.status, 200);
  assert.equal(speech.body.model_used, 'whisper+groq');
  assert.match(calls[1].url, /api\.groq\.com\/openai\/v1\/audio\/transcriptions/);
  assert.equal(calls[1].init.body.get('model'), 'whisper-large-v3-turbo');
});

test('groq is used as fallback when gemini fails', async () => {
  process.env.GEMINI_API_KEY = 'k';
  process.env.GROQ_API_KEY = 'g';
  mockUpstream((url) => (url.includes('googleapis') ? json({ error: 'x' }, 500) : json({ choices: [{ message: { content: 'yedek' } }] })));
  const r = await post('/api/v1/translate/text', { text: 'hello', target_language: 'tr' });
  assert.equal(r.body.model_used, 'groq');
});

test('unknown route is 404 and bad json is 400', async () => {
  assert.equal((await realFetch(`${base}/nope`)).status, 404);
  const res = await realFetch(`${base}/api/v1/translate/text`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
  assert.equal(res.status, 400);
});
