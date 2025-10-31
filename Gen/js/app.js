// Shared app utilities + Firebase init
// Replace the firebaseConfig placeholders with your Firebase project's config values
window.APP = window.APP || {};

(function () {
  // ====== Firebase config - REPLACE with your config ======
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MSG_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
  // =======================================================
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.firestore();
  const auth = firebase.auth();

  APP.db = db;
  APP.auth = auth;

  // helper toast
  window.toast = function (msg, type = "ok") {
    const d = document.createElement('div');
    d.textContent = msg;
    d.style.position = 'fixed';
    d.style.right = '18px';
    d.style.bottom = '18px';
    d.style.padding = '10px 14px';
    d.style.borderRadius = '10px';
    d.style.background = type === 'err' ? 'linear-gradient(90deg,#ff6b6b,#ff8787)' : 'linear-gradient(90deg,var(--accent),#5ad1d6)';
    d.style.color = '#fff';
    d.style.zIndex = 9999;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 3500);
  };

  // escape text to avoid injection for plain text fields
  window.escapeHtml = function (text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  };

  // linkify simple urls (basic)
  window.linkifySafe = function (html) {
    // We assume admin content (Quill) may contain safe html.
    // For user-provided plain-text, use escapeHtml first.
    if (!html) return '';
    // very tiny linkify: replace http links with anchor tags
    return html.replace(/(https?:\/\/[^\s<]+)/g, function (url) {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
  };

  // random seed likes (>=58)
  window.randLikes = function () {
    return Math.floor(Math.random() * 30) + 58;
  };

  // skeleton loader toggles (simple)
  window.showSkeleton = function (selector, show) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.style.display = show ? 'block' : 'none';
  };

  // auth state observer for admin button visibility
  auth.onAuthStateChanged((user) => {
    const adminBtn = document.getElementById('adminBtn') || document.getElementById('adminBtn2');
    if (user) {
      // optionally check custom claims or a 'roles' doc for admin
      adminBtn && (adminBtn.style.display = 'inline-flex');
    } else {
      adminBtn && (adminBtn.style.display = 'inline-flex'); // show admin button for login (we'll show login flow on click)
    }
  });

  // admin button click -> open admin dialog (handled in admin.js)
})();
