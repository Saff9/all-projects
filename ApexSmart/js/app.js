// Shared JS for all pages (modular Firebase + UI glue)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, getDocs, doc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

// ========== Firebase config - keep or replace with your own ==========
const firebaseConfig = {
  apiKey: "AIzaSyBZTAhJne3gOVwBrZ_NHQFo0ubWR8HzNL8",
  authDomain: "sample-firebase-ai-app-d0a89.firebaseapp.com",
  projectId: "sample-firebase-ai-app-d0a89",
  storageBucket: "sample-firebase-ai-app-d0a89.firebasestorage.app",
  messagingSenderId: "537274583564",
  appId: "1:537274583564:web:44ea454c2abed7d9a4bc29"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const postsCol = collection(db, 'posts');

// Basic utilities
function qS(sel){return document.querySelector(sel)}
function qSA(sel){return Array.from(document.querySelectorAll(sel))}

function toast(msg, type='ok'){
  const wrap = qS('#toastWrap');
  if(!wrap) return;
  const d = document.createElement('div'); d.className='toast'; d.textContent = msg; wrap.appendChild(d);
  setTimeout(()=>d.remove(), 2800);
}

// Theme handling (persist)
function applyTheme(t){
  if(!t) t = localStorage.getItem('siteTheme') || 'dark';
  document.body.classList.toggle('light', t === 'light');
  document.body.classList.toggle('dark', t !== 'light');
  localStorage.setItem('siteTheme', t);
}
qSA('[id^="themeToggle"]').forEach(btn => btn?.addEventListener('click', ()=>{
  const current = localStorage.getItem('siteTheme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}));
applyTheme(localStorage.getItem('siteTheme'));

// Clock
function updateClock(){
  const now = new Date();
  const time = now.toLocaleTimeString();
  const date = now.toLocaleDateString('en-US', {weekday:'long',year:'numeric',month:'long',day:'numeric'});
  qSA('#clockTime,#drawerClockTime').forEach(el=>el && (el.textContent = time));
  qSA('#clockDate,#drawerClockDate').forEach(el=>el && (el.textContent = date));
}
updateClock(); setInterval(updateClock,1000);

// ========= Page-specific behaviors =========
const path = location.pathname.split('/').pop();
const page = path === '' ? 'index.html' : path;

// Simple render helpers for posts
function createPostCard(data, id){
  const card = document.createElement('article'); card.className='post-card';
  const head = document.createElement('div'); head.className='post-head';
  const av = document.createElement('div'); av.className='post-avatar'; av.textContent = (data.author||'GZ').slice(0,2).toUpperCase();
  const meta = document.createElement('div'); meta.className='post-meta';
  const name = document.createElement('div'); name.className='post-author'; name.textContent = data.author || 'Apex Smart';
  const time = document.createElement('div'); time.className='post-time'; time.textContent = new Date((data.timestamp && data.timestamp.seconds) ? data.timestamp.seconds*1000 : (data.timestamp||Date.now())).toLocaleString();
  meta.appendChild(name); meta.appendChild(time); head.appendChild(av); head.appendChild(meta); card.appendChild(head);
  if(data.title) { const t = document.createElement('div'); t.className='post-title'; t.textContent = data.title; card.appendChild(t);}
  const body = document.createElement('div'); body.className='post-body'; body.innerHTML = data.content || '';
  card.appendChild(body);
  if(data.image) { const img = document.createElement('img'); img.className='post-image'; img.src = data.image; img.alt = data.title || 'post image'; img.onerror = ()=>{img.style.display='none'}; card.appendChild(img); }

  // actions
  const actions = document.createElement('div'); actions.className='post-actions';
  const likeBtn = document.createElement('button'); likeBtn.className='action-btn like-btn'; likeBtn.innerHTML = `<i class="fas fa-heart"></i> <span>${data.likes||0}</span>`;
  likeBtn.addEventListener('click', async ()=>{
    try{
      const postRef = doc(db,'posts',id);
      await updateDoc(postRef,{ likes: (data.likes||0)+1 });
      toast('Liked');
    }catch(e){toast('Error liking post','err')}
  });
  actions.appendChild(likeBtn);
  card.appendChild(actions);

  // click to open single post (blog view / index)
  card.addEventListener('click', (e)=>{
    // don't open if clicking like
    if(e.target.closest('.like-btn')) return;
    // single post view handled by blog.html (or can route)
    if(page === 'blog.html'){
      // show details modal or navigate? we'll open new page `blog.html#id`
      location.hash = id;
    } else {
      // index: open blog with anchor
      location.href = `blog.html#${id}`;
    }
  });

  return card;
}

// Real-time listener for posts collection
async function initPostsListener(){
  try{
    const q = query(postsCol, orderBy('timestamp','desc'));
    onSnapshot(q, snapshot => {
      const posts = [];
      snapshot.forEach(docSnap => posts.push({ id: docSnap.id, ...docSnap.data()}));
      renderPosts(posts);
    });
  }catch(e){console.error('posts listener error',e)}
}

function renderPosts(posts){
  // global counts
  qS('#badgeCount') && (qS('#badgeCount').textContent = posts.length);
  qS('#postCount') && (qS('#postCount').textContent = posts.length);

  // pinned first (if any pinned flag)
  const pinned = posts.find(p=>p.pinned === true);
  if(pinned){
    const pinnedEl = qS('#pinnedPost'); if(pinnedEl){ pinnedEl.innerHTML = ''; pinnedEl.appendChild(createPostCard(pinned,pinned.id)); }
  }

  // index: only last 7 days
  if(page === 'index.html'){
    const feed = qS('#homeFeed'); if(!feed) return; feed.innerHTML = '';
    const weekAgo = Date.now() - 7*24*60*60*1000;
    const recent = posts.filter(p => (p.timestamp && p.timestamp.seconds ? p.timestamp.seconds*1000 : p.timestamp) >= weekAgo);
    recent.forEach(p => feed.appendChild(createPostCard(p,p.id)));
  }

  // blog page: all posts
  if(page === 'blog.html'){
    const feed = qS('#allFeed'); if(!feed) return; feed.innerHTML = '';
    posts.forEach(p=> feed.appendChild(createPostCard(p,p.id)));

    // if hash present, try to open single post view
    const id = location.hash.replace('#','');
    if(id){ openSinglePostById(id, posts); }
  }
}

async function openSinglePostById(id, posts){
  try{
    const post = posts.find(p=>p.id === id);
    if(!post) return;
    // build a simple overlay
    const overlay = document.createElement('div'); overlay.style.position='fixed'; overlay.style.inset=0; overlay.style.background='rgba(0,0,0,0.6)'; overlay.style.zIndex=9999; overlay.style.overflow='auto';
    const inner = document.createElement('div'); inner.style.maxWidth='720px'; inner.style.margin='40px auto'; inner.style.padding='20px'; inner.style.background='var(--panel)'; inner.style.borderRadius='12px'; inner.innerHTML = `<h2 style="font-family:Poppins">${post.title||''}</h2><div style="color:var(--muted);margin-bottom:12px">By ${post.author||'Apex'} • ${new Date((post.timestamp && post.timestamp.seconds) ? post.timestamp.seconds*1000 : post.timestamp).toLocaleString()}</div>${post.content||''}`;
    const close = document.createElement('button'); close.textContent='Close'; close.className='btn-ghost'; close.style.marginTop='14px'; close.addEventListener('click', ()=>overlay.remove()); inner.appendChild(close);
    overlay.appendChild(inner); document.body.appendChild(overlay);
  }catch(e){console.error(e)}
}

// Create pinned placeholder if none in DB
async function ensurePinnedExists(){
  // Not required; UI shows none if not present.
}

// Publish form (admin)
async function publishPost({title, content, image, category='thoughts', author='Apex Saffan', pinned=false}){
  try{
    await addDoc(postsCol, { title, content, image, category, author, likes:0, pinned, timestamp: serverTimestamp() });
    toast('Published');
  }catch(e){console.error(e); toast('Publish failed','err')}
}

// If on admin page, wire up admin controls (local-only admin credential like original)
function initAdminControls(){
  const ADMIN_EMAIL = 'saffanakbar942@gmail.com';
  const ADMIN_PASS = 'saffan942';
  let isAdmin = false;

  // login UI (simple prompt for this static example)
  const openLogin = qS('#openLogin');
  if(openLogin) openLogin.addEventListener('click', ()=>{
    const email = prompt('Admin email'); const pass = prompt('Password');
    if(email === ADMIN_EMAIL && pass === ADMIN_PASS){ isAdmin = true; qSA('#adminLink,#drawerAdminLink').forEach(el=>el && (el.style.display='inline-block')); qSA('#composerLocal,#newPostBtnLocal').forEach(el=>el && (el.style.display='block')); toast('Admin signed in'); }
    else{ toast('Invalid credentials','err') }
  });

  // New post (on admin page)
  const newPostBtnLocal = qS('#newPostBtnLocal');
  if(newPostBtnLocal) newPostBtnLocal.addEventListener('click', ()=>{
    const composer = qS('#composerLocal'); if(!composer) return; composer.style.display = (composer.style.display === 'none' || !composer.style.display) ? 'block' : 'none';
  });

  // Publish local
  const publishBtnLocal = qS('#publishBtnLocal');
  if(publishBtnLocal) publishBtnLocal.addEventListener('click', async ()=>{
    const title = qS('#composeTitleLocal')?.value || '';
    const image = qS('#composeImageLocal')?.value || '';
    // For simplicity we take text content from a prompt (or you can integrate Quill)
    const content = prompt('Post content (HTML allowed)') || '';
    await publishPost({title,content,image});
  });
}

// Initialize listeners depending on page
if(['index.html','blog.html','admin.html','about.html'].includes(page)){
  initPostsListener();
}

if(page === 'admin.html'){
  initAdminControls();
}

// handle drawer open/close
qS('#menuBtn')?.addEventListener('click', ()=>{ qS('#drawer').style.left = '0'; qS('#drawerBackdrop').style.display = 'block'; });
qS('#closeDrawer')?.addEventListener('click', ()=>{ qS('#drawer').style.left = '-100%'; qS('#drawerBackdrop').style.display = 'none'; });
qS('#drawerBackdrop')?.addEventListener('click', ()=>{ qS('#drawer').style.left = '-100%'; qS('#drawerBackdrop').style.display = 'none'; });

// quick search filters (client-side)
qS('#searchInput')?.addEventListener('input', (e)=>{
  const q = e.target.value.toLowerCase();
  qSA('.post-card').forEach(card => { const txt = card.textContent.toLowerCase(); card.style.display = txt.includes(q) ? '' : 'none'; });
});
qS('#searchInputBlog')?.addEventListener('input', (e)=>{
  const q = e.target.value.toLowerCase();
  qSA('.post-card').forEach(card => { const txt = card.textContent.toLowerCase(); card.style.display = txt.includes(q) ? '' : 'none'; });
});

// Expose publishPost for manual calls in console (optional)
window.publishPost = publishPost;

// Safety: log friendly message
console.log('Apex Smart UI loaded — page:', page);
