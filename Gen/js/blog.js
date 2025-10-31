// blog.js - lists all posts and supports linking to single post with #post-<id>
(async function(){
  const db = APP.db;
  const allPostsEl = document.getElementById('allPosts');

  function renderCard(data){
    const node = document.createElement('div');
    node.className = 'card post';
    node.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center">
        <img src="${escapeHtml(data.avatar || '/assets/about.jpg')}" style="width:44px;height:44px;border-radius:50%;object-fit:cover" onerror="this.style.display='none'"/>
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div><div style="font-weight:700">${escapeHtml(data.author || 'Apex Saffan')}</div><div class="muted" style="font-size:12px">${new Date(data.createdAt).toLocaleString()}</div></div>
            ${data.pinned ? '<div style="background:var(--accent-2);color:#fff;padding:6px;border-radius:8px;font-weight:700;font-size:12px">PINNED</div>' : ''}
          </div>
          <div style="font-weight:800;margin-top:8px">${escapeHtml(data.title || 'Untitled')}</div>
        </div>
      </div>
      <div class="post-body">${linkifySafe(data.body || '')}</div>
      <div style="margin-top:10px;display:flex;gap:8px">
        <button class="btn like-btn">❤ <span class="like-count">${data.likes || window.randLikes()}</span></button>
        <button class="btn comment-btn">💬 Comment</button>
        <a class="btn" href="#post-${data.id}">Open</a>
      </div>
    `;
    node.querySelector('.like-btn').addEventListener('click', async ()=>{
      try{
        const span = node.querySelector('.like-count');
        span.textContent = parseInt(span.textContent||'0') + 1;
        if(data.id) await db.collection('posts').doc(data.id).update({ likes: firebase.firestore.FieldValue.increment(1) });
      }catch(e){console.error(e); toast('Failed to like','err');}
    });
    node.querySelector('.comment-btn').addEventListener('click', ()=> {
      toast("Comment coming soon 😅 — Joke: Why do programmers prefer dark mode? Because light attracts bugs.");
    });
    return node;
  }

  async function loadAll(){
    try{
      allPostsEl.innerHTML = '';
      const snap = await db.collection('posts').orderBy('createdAt','desc').get();
      const posts = [];
      snap.forEach(doc=>{ const d=doc.data(); d.id=doc.id; posts.push(d); });
      if(posts.length===0){ allPostsEl.innerHTML = '<div class="card">No posts yet</div>'; return; }
      posts.forEach(p=> allPostsEl.appendChild(renderCard(p)));
    }catch(e){ console.error(e); toast('Failed to load posts','err'); }
  }

  // search
  const searchAll = document.getElementById('searchAll');
  searchAll && searchAll.addEventListener('input', (e)=>{
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('#allPosts .post').forEach(card=>{
      const body = (card.querySelector('.post-body')?.textContent||'').toLowerCase();
      card.style.display = body.includes(q) ? 'block' : 'none';
    });
  });

  // single post view via hash #post-<id>
  async function openSingle(id){
    try{
      const snap = await db.collection('posts').doc(id).get();
      if(!snap.exists) { toast('Post not found','err'); return; }
      const data = snap.data(); data.id = snap.id;
      // increment views for admin only: only increment if admin logged-in and has admin claim
      // For demo: increment for any signed-in user (but in production restrict to admin)
      const user = firebase.auth().currentUser;
      if(user){
        await db.collection('posts').doc(id).update({ views: firebase.firestore.FieldValue.increment(1) });
      }
      // show modal-like overlay using simple replacement of content
      const overlay = document.createElement('div');
      overlay.style.position='fixed'; overlay.style.inset=0; overlay.style.background='rgba(6,13,20,0.45)'; overlay.style.display='flex'; overlay.style.alignItems='center'; overlay.style.justifyContent='center'; overlay.style.padding='20px'; overlay.style.zIndex=9999;
      const card = document.createElement('div'); card.className='card'; card.style.maxWidth='720px'; card.innerHTML = `<div style="display:flex;gap:12px;align-items:center"><img src="${escapeHtml(data.avatar||'/assets/about.jpg')}" style="width:56px;height:56px;border-radius:10px;object-fit:cover"/><div style="flex:1"><div style="font-weight:800">${escapeHtml(data.title||'Untitled')}</div><div class="muted">${new Date(data.createdAt).toLocaleString()}</div></div></div><div style="margin-top:12px">${linkifySafe(data.body||'')}</div><div style="margin-top:12px">Views: ${data.views||0}</div><div style="display:flex;gap:8px;margin-top:10px"><button class="btn close-btn">Close</button></div>`;
      overlay.appendChild(card);
      document.body.appendChild(overlay);
      overlay.querySelector('.close-btn').addEventListener('click', ()=> overlay.remove());
    }catch(e){ console.error(e); toast('Failed to open post','err'); }
  }

  // respond to hash changes
  window.addEventListener('hashchange', ()=>{
    const h = location.hash || '';
    if(h.startsWith('#post-')){ const id = h.split('#post-')[1]; if(id) openSingle(id); }
  });

  // initial load
  await loadAll();
  if(location.hash && location.hash.startsWith('#post-')){ const id = location.hash.split('#post-')[1]; if(id) openSingle(id); }
})();
