// home.js - loads pinned post, latest posts, handles likes and comment toast
(async function () {
  const db = APP.db;
  const feedList = document.getElementById('feedList');
  const pinnedContent = document.getElementById('pinnedContent');
  const totalPostsEl = document.getElementById('totalPosts');
  const activeUsersEl = document.getElementById('activeUsers');

  function renderPostCard(data) {
    const node = document.createElement('div');
    node.className = 'card post';
    const created = new Date(data.createdAt).toLocaleString();
    const likes = (typeof data.likes === 'number' && data.likes > 0) ? data.likes : window.randLikes();
    node.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center">
        <img src="${escapeHtml(data.avatar || '/assets/about.jpg')}" class="avatar" style="width:44px;height:44px;border-radius:50%;object-fit:cover" onerror="this.style.display='none'"/>
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div><div style="font-weight:700">${escapeHtml(data.author || 'Apex Saffan')}</div><div class="muted" style="font-size:12px">${escapeHtml(created)}</div></div>
            ${data.pinned ? '<div style="background:var(--accent-2);color:#fff;padding:6px;border-radius:8px;font-weight:700;font-size:12px">PINNED</div>' : ''}
          </div>
          <div style="font-weight:800;margin-top:8px">${escapeHtml(data.title || 'Untitled')}</div>
        </div>
      </div>
      <div class="post-body">${linkifySafe(data.body || '')}</div>
      <div style="margin-top:10px;display:flex;gap:8px">
        <button class="btn like-btn">❤ <span class="like-count">${likes}</span></button>
        <button class="btn comment-btn">💬 Comment</button>
        <a class="btn" href="/blog.html#post-${data.id}">Read</a>
      </div>
    `;

    node.querySelector('.like-btn').addEventListener('click', async () => {
      try {
        const span = node.querySelector('.like-count');
        span.textContent = parseInt(span.textContent || '0') + 1;
        if (data.id) {
          await db.collection('posts').doc(data.id).update({ likes: firebase.firestore.FieldValue.increment(1) });
        }
      } catch (e) {
        console.error(e);
        toast('Failed to like', 'err');
      }
    });

    node.querySelector('.comment-btn').addEventListener('click', () => {
      toast("Comment feature coming soon 😅 — Joke: Why don't programmers like nature? Too many bugs.");
    });

    return node;
  }

  async function loadPosts() {
    try {
      feedList.innerHTML = '';
      // show skeleton
      const s = document.createElement('div'); s.className = 'card skeleton-card'; s.innerHTML = '<div class="skeleton h-10"></div>';
      feedList.appendChild(s);

      const snap = await db.collection('posts').orderBy('createdAt', 'desc').get();
      const posts = [];
      snap.forEach(doc => {
        const data = doc.data(); data.id = doc.id; posts.push(data);
      });

      // pinned
      const pinned = posts.find(p => p.pinned === true);
      if (pinned) {
        pinnedContent.innerHTML = `<div style="font-weight:700">${escapeHtml(pinned.title || '')}</div><div class="muted" style="margin-top:6px">${linkifySafe(pinned.body || '')}</div>`;
      } else {
        pinnedContent.innerHTML = `<div style="font-weight:700">Welcome to Apex Smart!</div><div class="muted" style="margin-top:6px">Pinned message editable by admin.</div>`;
      }

      // show recent (7 days)
      feedList.innerHTML = '';
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const recent = posts.filter(p => new Date(p.createdAt).getTime() > sevenDaysAgo);
      if (recent.length === 0) {
        const n = document.createElement('div'); n.className = 'card'; n.textContent = 'No recent posts';
        feedList.appendChild(n);
      } else {
        recent.forEach(p => feedList.appendChild(renderPostCard(p)));
      }

      totalPostsEl.textContent = posts.length;
      activeUsersEl.textContent = 63 + Math.floor(Math.random() * 10);

    } catch (e) {
      console.error(e);
      toast('Failed to load posts', 'err');
    }
  }

  // search filter
  const searchInput = document.getElementById('searchFeed');
  searchInput && searchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('#feedList .post').forEach(card => {
      const body = (card.querySelector('.post-body')?.textContent || '').toLowerCase();
      card.style.display = (body.includes(q) ? 'block' : 'none');
    });
  });

  // initial load
  loadPosts();

})();
