(function(){
  if (!localStorage.getItem('agentation_admin')) return;
  const ENDPOINT = 'http://localhost:4747';
  let sessionId = sessionStorage.getItem('agentation_session');
  let active = false;
  let hovered = null;

  // --- CSS selector builder ---
  function cssPath(el) {
    const parts = [];
    while (el && el.nodeType === 1 && el !== document.body) {
      let sel = el.tagName.toLowerCase();
      if (el.id) { sel += '#' + CSS.escape(el.id); parts.unshift(sel); break; }
      const siblings = Array.from(el.parentNode ? el.parentNode.children : []).filter(c => c.tagName === el.tagName);
      if (siblings.length > 1) sel += ':nth-of-type(' + (siblings.indexOf(el) + 1) + ')';
      parts.unshift(sel);
      el = el.parentNode;
    }
    return parts.join(' > ') || el.tagName.toLowerCase();
  }

  function elementLabel(el) {
    const id = el.id ? '#' + el.id : '';
    const cls = el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : '';
    const text = el.textContent.trim().slice(0, 40);
    return (el.tagName.toLowerCase() + (id || cls) + (text ? ' "' + text + '"' : '')).trim();
  }

  // --- Session ---
  async function ensureSession() {
    if (sessionId) {
      // verify session still exists on the server
      const check = await fetch(ENDPOINT + '/sessions/' + sessionId);
      if (!check.ok) { sessionId = null; sessionStorage.removeItem('agentation_session'); }
    }
    if (!sessionId) {
      const res = await fetch(ENDPOINT + '/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: location.href })
      });
      if (!res.ok) { const b = await res.text(); throw new Error('Session error ' + res.status + ': ' + b); }
      const data = await res.json();
      sessionId = data.id;
      sessionStorage.setItem('agentation_session', sessionId);
    }
    return sessionId;
  }

  // --- Styles ---
  const style = document.createElement('style');
  style.textContent = `
    #ag-btn {
      position: fixed; bottom: calc(90px + env(safe-area-inset-bottom)); right: 16px; z-index: 99999;
      width: 44px; height: 44px; border-radius: 50%;
      background: #18835A; color: #fff; border: none; cursor: pointer;
      font-size: 20px; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,.25); transition: background .15s;
    }
    #ag-btn.active { background: #D4614A; }
    #ag-btn .ag-count {
      position: absolute; top: -4px; right: -4px;
      background: #D4614A; color: #fff; font-size: 10px; font-weight: 700;
      width: 18px; height: 18px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid #fff;
    }
    .ag-highlight {
      outline: 2px dashed #D4614A !important;
      outline-offset: 2px !important;
      cursor: crosshair !important;
    }
    #ag-popup {
      position: fixed; z-index: 999999;
      background: #fff; border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,.18);
      padding: 14px; width: 260px;
      font-family: -apple-system, sans-serif; font-size: 13px;
    }
    #ag-popup .ag-label {
      font-size: 11px; color: #68A882; margin-bottom: 8px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    #ag-popup textarea {
      width: 100%; box-sizing: border-box; border: 1px solid #BCDECE;
      border-radius: 8px; padding: 8px; font-size: 13px; resize: none;
      font-family: inherit; outline: none; height: 72px;
    }
    #ag-popup textarea:focus { border-color: #18835A; }
    #ag-popup .ag-actions { display: flex; gap: 8px; margin-top: 8px; }
    #ag-popup .ag-submit {
      flex: 1; background: #18835A; color: #fff; border: none;
      border-radius: 8px; padding: 7px; font-size: 13px; font-weight: 600;
      cursor: pointer;
    }
    #ag-popup .ag-submit:hover { background: #0F6040; }
    #ag-popup .ag-cancel {
      background: #F4FAF6; color: #2D6045; border: none;
      border-radius: 8px; padding: 7px 12px; font-size: 13px; cursor: pointer;
    }
    #ag-popup .ag-sent {
      text-align: center; color: #18835A; font-weight: 600; padding: 8px 0;
    }
    body.ag-mode, body.ag-mode * { cursor: crosshair !important; }
  `;
  document.head.appendChild(style);

  // --- Toggle button ---
  const btn = document.createElement('button');
  btn.id = 'ag-btn';
  btn.title = 'Annotate';
  btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>';
  document.body.appendChild(btn);

  // --- Popup ---
  const popup = document.createElement('div');
  popup.id = 'ag-popup';
  popup.style.display = 'none';
  popup.innerHTML = `
    <div class="ag-label" id="ag-popup-label"></div>
    <textarea id="ag-ta" placeholder="Describe what you want here..."></textarea>
    <div class="ag-actions">
      <button class="ag-cancel" id="ag-cancel">Cancel</button>
      <button class="ag-submit" id="ag-submit">Send note</button>
    </div>`;
  document.body.appendChild(popup);

  let pendingEl = null;

  function positionPopup(el) {
    const rect = el.getBoundingClientRect();
    const top = rect.bottom + window.scrollY + 8;
    const left = Math.min(rect.left + window.scrollX, window.innerWidth - 276);
    popup.style.top = top + 'px';
    popup.style.left = Math.max(8, left) + 'px';
  }

  function closePopup() {
    popup.style.display = 'none';
    if (pendingEl) { pendingEl.classList.remove('ag-highlight'); pendingEl = null; }
    const ta = popup.querySelector('#ag-ta');
    ta.value = '';
    ta.style.display = '';
    popup.querySelector('.ag-actions').style.display = 'flex';
    const submitBtn = document.getElementById('ag-submit');
    submitBtn.textContent = 'Send note';
    submitBtn.disabled = false;
    popup.querySelector('#ag-popup-label').textContent = '';
    const sent = popup.querySelector('.ag-sent');
    if (sent) sent.remove();
    const err = popup.querySelector('.ag-err');
    if (err) err.remove();
  }

  btn.addEventListener('click', () => {
    active = !active;
    btn.classList.toggle('active', active);
    document.body.classList.toggle('ag-mode', active);
    if (!active) closePopup();
  });

  document.getElementById('ag-cancel').addEventListener('click', closePopup);

  document.getElementById('ag-submit').addEventListener('click', async () => {
    const comment = popup.querySelector('#ag-ta').value.trim();
    if (!comment || !pendingEl) return;
    const el = pendingEl;
    const path = cssPath(el);
    const label = elementLabel(el);
    const rect = el.getBoundingClientRect();

    const submitBtn = document.getElementById('ag-submit');
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;
    try {
      const sid = await ensureSession();
      const res = await fetch(ENDPOINT + '/sessions/' + sid + '/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment,
          element: label,
          elementPath: path,
          x: Math.round(rect.left + rect.width / 2),
          y: Math.round(rect.top + rect.height / 2),
          url: location.href,
          timestamp: new Date().toISOString()
        })
      });
      if (!res.ok) { const body = await res.text(); throw new Error('Server ' + res.status + ': ' + body); }
      popup.querySelector('.ag-actions').style.display = 'none';
      popup.querySelector('#ag-ta').style.display = 'none';
      const sent = document.createElement('div');
      sent.className = 'ag-sent';
      sent.textContent = 'Note sent';
      popup.appendChild(sent);
      setTimeout(closePopup, 1000);
      updateCount();
    } catch(e) {
      submitBtn.textContent = 'Send note';
      submitBtn.disabled = false;
      let errEl = popup.querySelector('.ag-err');
      if (!errEl) { errEl = document.createElement('div'); errEl.className = 'ag-err'; errEl.style.cssText = 'color:#D4614A;font-size:11px;margin-top:6px;'; popup.querySelector('.ag-actions').after(errEl); }
      errEl.textContent = e.message || 'Could not reach server';
      console.error('Agentation error:', e);
    }
  });

  // keyboard shortcut: Enter to submit, Esc to cancel
  popup.querySelector('#ag-ta').addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) document.getElementById('ag-submit').click();
    if (e.key === 'Escape') closePopup();
  });

  // --- Hover / click tracking ---
  const SKIP = new Set(['ag-btn', 'ag-popup']);
  function isAgEl(el) {
    return el.closest('#ag-btn, #ag-popup');
  }

  document.addEventListener('mouseover', e => {
    if (!active || isAgEl(e.target)) return;
    if (hovered && hovered !== pendingEl) hovered.classList.remove('ag-highlight');
    hovered = e.target;
    if (hovered !== pendingEl) hovered.classList.add('ag-highlight');
  }, true);

  document.addEventListener('mouseout', e => {
    if (!active || isAgEl(e.target)) return;
    if (e.target !== pendingEl) e.target.classList.remove('ag-highlight');
  }, true);

  document.addEventListener('click', e => {
    if (!active || isAgEl(e.target)) return;
    e.preventDefault(); e.stopPropagation();
    closePopup();
    pendingEl = e.target;
    pendingEl.classList.add('ag-highlight');
    popup.querySelector('#ag-popup-label').textContent = elementLabel(pendingEl);
    popup.querySelector('#ag-ta').style.display = '';
    positionPopup(pendingEl);
    popup.style.display = 'block';
    setTimeout(() => popup.querySelector('#ag-ta').focus(), 50);
  }, true);

  // --- Badge count ---
  async function updateCount() {
    try {
      const res = await fetch(ENDPOINT + '/pending');
      const data = await res.json();
      const n = data.count || 0;
      let badge = btn.querySelector('.ag-count');
      if (n > 0) {
        if (!badge) { badge = document.createElement('span'); badge.className = 'ag-count'; btn.appendChild(badge); }
        badge.textContent = n;
      } else if (badge) badge.remove();
    } catch(e) {}
  }
  updateCount();
})();
