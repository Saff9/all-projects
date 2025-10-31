// subscribe.js - save subscribers and provide simple signup/login using Firebase Auth
(function(){
  const db = APP.db;
  const auth = APP.auth;

  const subName = document.getElementById('subName');
  const subEmail = document.getElementById('subEmail');
  const subPhone = document.getElementById('subPhone');
  const subscribeBtn = document.getElementById('subscribeBtn');
  const subMsg = document.getElementById('subMsg');

  const loginEmail = document.getElementById('loginEmail');
  const loginPass = document.getElementById('loginPass');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const signupBtn = document.getElementById('signupBtn');
  const authMsg = document.getElementById('authMsg');

  subscribeBtn && subscribeBtn.addEventListener('click', async ()=>{
    const name = subName.value.trim(); const email = subEmail.value.trim(); const phone = subPhone.value.trim();
    if(!email && !phone){ subMsg.textContent = 'Provide email or phone to subscribe'; subMsg.style.color = 'var(--danger)'; return; }
    try{
      await db.collection('subscribers').add({ name: name||null, email: email||null, phone: phone||null, joinedAt: new Date().toISOString() });
      subMsg.textContent = 'Subscribed — we stored your info';
      subMsg.style.color = '';
      subName.value=''; subEmail.value=''; subPhone.value='';
    }catch(e){ console.error(e); subMsg.textContent = 'Subscription failed'; subMsg.style.color = 'var(--danger)'; }
  });

  signupBtn && signupBtn.addEventListener('click', async ()=>{
    const email = loginEmail.value.trim(); const pass = loginPass.value.trim();
    if(!email || !pass){ authMsg.textContent = 'Enter email & password'; authMsg.style.color = 'var(--danger)'; return; }
    try{
      await auth.createUserWithEmailAndPassword(email, pass);
      authMsg.textContent = 'Account created and signed in';
      authMsg.style.color = '';
    }catch(e){ console.error(e); authMsg.textContent = e.message || 'Sign up failed'; authMsg.style.color = 'var(--danger)'; }
  });

  loginBtn && loginBtn.addEventListener('click', async ()=>{
    const email = loginEmail.value.trim(); const pass = loginPass.value.trim();
    if(!email || !pass){ authMsg.textContent = 'Enter email & password'; authMsg.style.color = 'var(--danger)'; return; }
    try{
      await auth.signInWithEmailAndPassword(email, pass);
      authMsg.textContent = 'Signed in';
      authMsg.style.color = '';
      logoutBtn.style.display = 'inline-flex';
    }catch(e){ console.error(e); authMsg.textContent = e.message || 'Sign in failed'; authMsg.style.color = 'var(--danger)'; }
  });

  logoutBtn && logoutBtn.addEventListener('click', async ()=>{
    try{ await auth.signOut(); authMsg.textContent = 'Signed out'; logoutBtn.style.display = 'none'; }catch(e){ console.error(e); }
  });

  // show subscriber count (optional)
  (async function updateSubCount(){
    try{
      const snap = await db.collection('subscribers').get();
      // if you want to show it somewhere add element with id subscriberCount
      const el = document.getElementById('subscriberCount');
      if(el) el.textContent = snap.size;
    }catch(e){ console.error(e); }
  })();

})();
