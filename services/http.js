class UpstreamError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = 'UpstreamError';
    this.status = status;
  }
}

async function request(url, init, timeoutMs = 30000) {
  let response;
  try {
    response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  } catch (e) {
    const reason = e.name === 'TimeoutError' ? 'timeout' : e.message;
    throw new UpstreamError(`Upstream request failed: ${reason}`, 504);
  }
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new UpstreamError(`Upstream returned ${response.status}: ${body.slice(0, 300)}`, 502);
  }
  return response.json();
}

function postJson(url, body, headers = {}, timeoutMs) {
  return request(
    url,
    { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) },
    timeoutMs
  );
}

module.exports = { UpstreamError, request, postJson };
