/* Cookie Consent Banner (AdSense/LGPD-friendly) */

(function () {
  const STORAGE_KEY = 'cookieConsentV1';
  const existing = window.localStorage && window.localStorage.getItem(STORAGE_KEY);
  if (existing) return;

  const lang = (document.documentElement.getAttribute('lang') || 'pt-BR').toLowerCase();

  const copyByLang = {
    'pt-br': {
      text: 'Usamos cookies para melhorar a experiência do site e personalizar anúncios. Você pode aceitar ou gerenciar suas preferências de cookies.',
    },
    en: {
      text: 'We use cookies to improve your browsing experience and personalize ads. You can accept or manage your cookie preferences.',
    },
    es: {
      text: 'Usamos cookies para mejorar tu experiencia de navegación y personalizar anuncios. Puedes aceptar o gestionar tus preferencias de cookies.',
    },
  };

  const copy = copyByLang[lang] || copyByLang['pt-br'];

  const style = document.createElement('style');
  style.textContent = `
    #cookie-consent-banner {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 999999;
      background: #ffffff;
      border-top: 1px solid rgba(0,0,0,0.08);
      box-shadow: 0 -10px 30px rgba(0,0,0,0.08);
      padding: 14px 16px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    #cookie-consent-banner .cc-inner {
      max-width: 980px;
      margin: 0 auto;
      display: flex;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
    }
    #cookie-consent-banner p {
      margin: 0;
      color: #111827;
      font-size: 13px;
      line-height: 1.4;
      flex: 1 1 520px;
      min-width: 260px;
    }
    #cookie-consent-banner .cc-actions {
      display: flex;
      gap: 10px;
      flex: 0 0 auto;
    }
    #cookie-consent-banner button {
      background: #28a745;
      color: #000000;
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.08s ease, filter 0.15s ease;
      white-space: nowrap;
    }
    #cookie-consent-banner button:hover {
      filter: brightness(1.05);
      transform: translateY(-1px);
    }

    #cookie-consent-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000000;
      background: rgba(17,24,39,0.55);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    #cookie-consent-modal-overlay.open {
      display: flex;
    }
    #cookie-consent-modal {
      width: 100%;
      max-width: 620px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 30px 90px rgba(0,0,0,0.25);
      padding: 16px;
    }
    #cookie-consent-modal h3 {
      margin: 0 0 12px;
      font-size: 16px;
      color: #111827;
    }
    .cc-pref-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 10px 0;
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }
    .cc-pref-row:last-child {
      border-bottom: none;
    }
    .cc-pref-row label {
      display: block;
      cursor: pointer;
      user-select: none;
    }
    .cc-pref-row .cc-desc {
      color: #4b5563;
      font-size: 13px;
      line-height: 1.35;
      margin-top: 2px;
    }
    #cookie-consent-modal .cc-save {
      width: 100%;
      margin-top: 14px;
      background: #28a745;
      color: #000000;
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.08s ease, filter 0.15s ease;
    }
    #cookie-consent-modal .cc-save:hover {
      filter: brightness(1.05);
      transform: translateY(-1px);
    }
  `;
  document.head.appendChild(style);

  function storeConsent(payload) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function hideBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) banner.style.display = 'none';
  }

  function buildBanner() {
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.innerHTML = `
      <div class="cc-inner">
        <p>${copy.text}</p>
        <div class="cc-actions">
          <button type="button" id="cc-accept-all">Aceitar Todos</button>
          <button type="button" id="cc-decline">Recusar</button>
          <button type="button" id="cc-preferences">Preferências</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);
    return banner;
  }

  function buildModal() {
    const overlay = document.createElement('div');
    overlay.id = 'cookie-consent-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
      <div id="cookie-consent-modal">
        <h3>Preferências de Cookies</h3>
        <div class="cc-pref-row">
          <div>
            <input type="checkbox" id="cc-necessary" checked disabled />
          </div>
          <label for="cc-necessary">
            Cookies Necessários
            <div class="cc-desc">Sempre ativos para garantir o funcionamento básico do site.</div>
          </label>
        </div>
        <div class="cc-pref-row">
          <div>
            <input type="checkbox" id="cc-marketing" />
          </div>
          <label for="cc-marketing">
            Cookies de Marketing/AdSense
            <div class="cc-desc">Usados para personalizar anúncios e medir resultados.</div>
          </label>
        </div>
        <div class="cc-pref-row">
          <div>
            <input type="checkbox" id="cc-analysis" />
          </div>
          <label for="cc-analysis">
            Cookies de Análise
            <div class="cc-desc">Usados para entender como o site é utilizado e melhorar a experiência.</div>
          </label>
        </div>
        <button type="button" class="cc-save" id="cc-save-preferences">Salvar Preferências</button>
      </div>
    `;

    overlay.querySelector('#cc-save-preferences').style.background = '#28a745';
    overlay.querySelector('#cc-save-preferences').style.color = '#000000';

    document.body.appendChild(overlay);
    return overlay;
  }

  const banner = buildBanner();
  const modalOverlay = buildModal();

  const acceptAllBtn = document.getElementById('cc-accept-all');
  const declineBtn = document.getElementById('cc-decline');
  const preferencesBtn = document.getElementById('cc-preferences');
  const saveBtn = document.getElementById('cc-save-preferences');

  function openModal() {
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  preferencesBtn.addEventListener('click', function () {
    openModal();
  });

  acceptAllBtn.addEventListener('click', function () {
    storeConsent({
      decision: 'accepted',
      necessary: true,
      marketing: true,
      analysis: true,
      ts: Date.now(),
    });
    closeModal();
    hideBanner();
  });

  declineBtn.addEventListener('click', function () {
    storeConsent({
      decision: 'rejected',
      necessary: true,
      marketing: false,
      analysis: false,
      ts: Date.now(),
    });
    closeModal();
    hideBanner();
  });

  saveBtn.addEventListener('click', function () {
    const marketing = !!document.getElementById('cc-marketing').checked;
    const analysis = !!document.getElementById('cc-analysis').checked;

    storeConsent({
      decision: 'preferences',
      necessary: true,
      marketing,
      analysis,
      ts: Date.now(),
    });

    closeModal();
    hideBanner();
  });

  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });
})();

