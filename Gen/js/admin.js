// admin.js - admin UI: sign-in modal, create/edit post, edit pinned, export subscribers
(function(){
  const db = APP.db;
  const auth = APP.auth;

  const adminBtn = document.getElementById('adminBtn') || document.getElementById('adminBtn2');
  if(!adminBtn) return;
  adminBtn.addEventListener('click', openAdminModal);

  function showModal(contentHtml){
    let backdrop = document.getElementById('adminBackdrop');
    if(!backdrop){
      backdrop = document.createElement('div'); backdrop.id='adminBackdrop';
      backdrop.style.position='fixed'; backdrop.style.inset=0; backdrop.style.display='flex'; backdrop.style.alignItems='center'; backdrop.style.justifyContent='center'; backdrop.style.background='rgba(6,13,20,0.45)'; backdrop.style.zIndex=9999;
      document.body.appendChild(backdrop);
    }
    backdrop.innerHTML = `<div class="card" style="max-width:760px;width:94%">${contentHtml}</div>`;
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });
  }

  function closeModal(){ const b = document.getElementById('adminBackdrop'); b && b.remove(); }

  function adminLoginHtml(){
    return `
      <h3>Admin sign in</h3>
      <input id="admEmail" class="input" placeholder="Admin email" />
      <input id="admPass" class="input" placeholder="Password" type="password" />
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px">
        <button class="btn" id="admCancel">Cancel</button>
        <button class="btn primary" id="admDoSign">Sign in</button>
      </div>
    `;
  }

  async function openAdminModal(){
    showModal(adminLoginHtml());
    document.getElementById('admCancel').addEventListener('click', closeModal);
    document.getElementById('admDoSign').addEventListener('click', async ()=>{
      const email = document.getElementById('admEmail').value.trim();
      const pass = document.getElementById('admPass').value.trim();
      if(!email || !pass){ toast('Enter admin credentials','err'); return; }
      try{
        await auth.signInWithEmailAndPassword(email, pass);
        toast('Signed in as admin');
        closeModal();
        openManagePanel();
      }catch(e){
        console.error(e);
        toast('Admin sign in failed','err');
      }
    });
  }

  async function openManagePanel(){
    const postsSnap = await db.collection('posts').get();
    const subsSnap = await db.collection('subscribers').get();
    showModal(`<h3>Admin panel</h3>
      <div style="display:flex;gap:8px"><div style="flex:1">Total posts: <b>${postsSnap.size}</b><br>Subscribers: <b>${subsSnap.size}</b></div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <button class="btn" id="createPost">New Post</button>
        <button class="btn" id="editPinned">Edit pinned</button>
        <button class="btn" id="exportSubs">Export subscribers</button>
        <button class="btn" id="closeAdmin">Close</button>
      </div></div>`);

    document.getElementById('closeAdmin').addEventListener('click', ()=> { closeModal(); });
    document.getElementById('createPost').addEventListener('click', ()=> openPostEditor());
    document.getElementById('editPinned').addEventListener('click', ()=> openPinnedEditor());
    document.getElementById('exportSubs').addEventListener('click', exportSubscribers);
  }

  function openPostEditor(existing){
    showModal(`<h3>${existing ? 'Edit post' : 'New post'}</h3>
      <input id="postTitle" class="input" placeholder="Title" value="${existing ? escapeHtml(existing.title||'') : ''}" />
      <div id="editor" style="height:220px;background:#fff;border-radius:8px"></div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px"><button class="btn" id="cancelPost">Cancel</button><button class="btn primary" id="savePost">Publish</button></div>`);

    const quill = new Quill('#editor', { theme: 'snow' });
    if(existing) quill.root.innerHTML = existing.body || '';
    document.getElementById('cancelPost').addEventListener('click', closeModal);
    document.getElementById('savePost').addEventListener('click', async ()=>{
      const title = document.getElementById('postTitle').value.trim();
      const body = quill.root.innerHTML.trim();
      if(!body || body === '<p><br></p>'){ toast('Post body cannot be empty', 'err'); return; }
      try{
        if(existing && existing.id) {
          await db.collection('posts').doc(existing.id).update({ title, body });
          toast('Post updated');
        } else {
          const docRef = await db.collection('posts').add({ title, body, author: 'Apex Saffan', createdAt: new Date().toISOString(), likes: window.randLikes(), views: 0, pinned: false });
          // create notification doc for server to act upon
          await db.collection('notifications').add({ postId: docRef.id, message: `New post: ${title || 'Untitled'}`, createdAt: new Date().toISOString() });
          toast('Post published');
        }
        closeModal();
      }catch(e){ console.error(e); toast('Failed to publish', 'err'); }
    });
  }

  async function openPinnedEditor(){
    // fetch pinned post if any
    const snap = await db.collection('posts').where('pinned','==',true).limit(1).get();
    const pinned = snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
    showModal(`<h3>Edit pinned</h3>
      <input id="pinTitle" class="input" placeholder="Pin title" value="${pinned ? escapeHtml(pinned.title || '') : ''}" />
      <div id="pinEditor" style="height:180px;background:#fff;border-radius:8px"></div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px"><button class="btn" id="cancelPin">Cancel</button><button class="btn primary" id="savePin">Save</button></div>`);

    const quill = new Quill('#pinEditor', { theme: 'snow' });
    if (pinned) quill.root.innerHTML = pinned.body || '';

    document.getElementById('cancelPin').addEventListener('click', closeModal);
    document.getElementById('savePin').addEventListener('click', async ()=>{
      const title = document.getElementById('pinTitle').value.trim();
      const body = quill.root.innerHTML.trim();
      try{
        if(pinned && pinned.id){
          await db.collection('posts').doc(pinned.id).update({ title, body, pinned: true });
        } else {
          await db.collection('posts').add({ title, body, author: 'Apex Saffan', createdAt: new Date().toISOString(), likes: window.randLikes(), views: 0, pinned: true });
        }
        toast('Pinned saved');
        closeModal();
      }catch(e){ console.error(e); toast('Failed to save pinned', 'err'); }
    });
  }

  async function exportSubscribers(){
    try{
      const snap = await db.collection('subscribers').get();
      const rows = []; snap.forEach(doc => { const d = doc.data(); rows.push([d.name||'', d.email||'', d.phone||'', d.joinedAt||''].join(',')); });
      const csv = rows.join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'subscribers.csv'; a.click(); URL.revokeObjectURL(url);
      toast('Exported subscribers');
    }catch(e){ console.error(e); toast('Export failed', 'err'); }
  }

})();
