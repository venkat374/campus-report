// src/api.js
export async function apiGet(path) {
  const res = await fetch(path);
  if (!res.ok) {
    const text = await res.text().catch(()=>null);
    throw new Error(`GET ${path} failed: ${res.status} ${text || res.statusText}`);
  }
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const txt = await res.text();
  let parsed = null;
  try { parsed = txt ? JSON.parse(txt) : null; } catch {}
  if (!res.ok) {
    // try to surface backend message
    const msg = (parsed && parsed.error) || txt || res.statusText;
    throw new Error(`POST ${path} failed: ${res.status} ${msg}`);
  }
  return parsed;
}
