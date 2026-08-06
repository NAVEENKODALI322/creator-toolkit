/* ============================================
   cookie-consent.js
   Site-wide Cookie Consent Banner + GA4 loader
   Include this ONE script on every page, right
   before </body>, replacing any direct GA4 tag.
   ============================================ */

(function () {
  const GA4_MEASUREMENT_ID = "G-GR9K0R0PMW"; // <-- replace with your real GA4 ID

  const CONSENT_KEY = "ct_cookie_consent"; // localStorage key

  function loadGA4() {
    if (window.__ga4Loaded) return;
    window.__ga4Loaded = true;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA4_MEASUREMENT_ID;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA4_MEASUREMENT_ID, { anonymize_ip: true });
  }

  function getConsent() {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch (e) {}
  }

  function showBanner() {
    const banner = document.createElement("div");
    banner.id = "cookieConsentBanner";
    banner.innerHTML = `
      <div class="cc-inner">
        <p class="cc-text">
          🍪 We use cookies to improve your experience and analyze site traffic.
          By continuing, you agree to our
          <a href="/privacy.html" class="cc-link">Privacy Policy</a>.
        </p>
        <div class="cc-actions">
          <button id="ccAccept" class="cc-btn cc-btn-accept">Accept</button>
          <button id="ccDecline" class="cc-btn cc-btn-decline">Decline</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);

    // inject minimal styles (scoped, won't clash with home-v2.css)
    const style = document.createElement("style");
    style.textContent = `
      #cookieConsentBanner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 9999;
        background: #1a1a2e;
        border-top: 1px solid #2a2a3e;
        padding: 16px 20px;
        box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
        animation: ccSlideUp 0.3s ease-out;
      }
      @keyframes ccSlideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
      #cookieConsentBanner .cc-inner {
        max-width: 900px;
        margin: 0 auto;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      #cookieConsentBanner .cc-text {
        color: #c0c0d0;
        font-size: 14px;
        line-height: 1.5;
        margin: 0;
        flex: 1;
        min-width: 240px;
      }
      #cookieConsentBanner .cc-link {
        color: #00D4FF;
        text-decoration: underline;
      }
      #cookieConsentBanner .cc-actions {
        display: flex;
        gap: 10px;
        flex-shrink: 0;
      }
      #cookieConsentBanner .cc-btn {
        padding: 8px 20px;
        border-radius: 8px;
        border: none;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
      }
      #cookieConsentBanner .cc-btn-accept {
        background: #6C63FF;
        color: #fff;
      }
      #cookieConsentBanner .cc-btn-decline {
        background: transparent;
        color: #c0c0d0;
        border: 1px solid #2a2a3e;
      }
      @media (max-width: 480px) {
        #cookieConsentBanner .cc-inner { flex-direction: column; align-items: stretch; }
        #cookieConsentBanner .cc-actions { justify-content: flex-end; }
      }
    `;
    document.head.appendChild(style);

    document.getElementById("ccAccept").addEventListener("click", function () {
      setConsent("accepted");
      loadGA4();
      banner.remove();
    });

    document.getElementById("ccDecline").addEventListener("click", function () {
      setConsent("declined");
      banner.remove();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    const consent = getConsent();
    if (consent === "accepted") {
      loadGA4();
    } else if (consent === "declined") {
      // do nothing, respect choice
    } else {
      showBanner();
    }
  });
})();
