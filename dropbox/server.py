#!/usr/bin/env python3
"""Secure DropBox v2 - upload/download/preview/share with encryption & .env config."""

import os, sys, json, time, secrets, hashlib, mimetypes, re, base64, struct
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import unquote, urlparse, parse_qs, quote
from pathlib import Path

# ── Paths ───────────────────────────────────────────────
BASE = Path(os.path.dirname(os.path.abspath(__file__)))
ENV_FILE = BASE / ".env"
FILES_DIR = BASE / "files"
SHARE_DIR = BASE / "shares"
PASSWORDS_DIR = BASE / "passwords"

FILES_DIR.mkdir(exist_ok=True)
SHARE_DIR.mkdir(exist_ok=True)
PASSWORDS_DIR.mkdir(exist_ok=True)

# ── Load .env ───────────────────────────────────────────
def load_env():
    cfg = {
        "PORT": "8080",
        "PASSWORD": "dropbox123",
        "SESSION_SECRET": secrets.token_hex(32),
        "MAX_UPLOAD_MB": "2048",
        "RATE_LIMIT_MAX": "30",
        "RATE_LIMIT_WINDOW": "60",
        "LOCKOUT_SECONDS": "300",
        "MAX_ATTEMPTS": "5",
        "SESSION_HOURS": "24",
        "SHARE_DAYS": "7",
        "ALLOWED_EXTENSIONS": "",
        "ENCRYPT_KEY": "",
    }
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                k, v = line.split("=", 1)
                cfg[k.strip()] = v.strip().strip('"').strip("'")
    if not cfg["ENCRYPT_KEY"]:
        cfg["ENCRYPT_KEY"] = secrets.token_hex(36)
        with open(ENV_FILE, "a") as f:
            f.write(f"\nENCRYPT_KEY={cfg['ENCRYPT_KEY']}\n")
    if not cfg["SESSION_SECRET"] or cfg["SESSION_SECRET"] == secrets.token_hex(32):
        existing = None
        if ENV_FILE.exists():
            for line in ENV_FILE.read_text().splitlines():
                if line.startswith("SESSION_SECRET="):
                    existing = line.split("=", 1)[1].strip()
        if existing:
            cfg["SESSION_SECRET"] = existing
        else:
            cfg["SESSION_SECRET"] = secrets.token_hex(32)
            with open(ENV_FILE, "a") as f:
                f.write(f"SESSION_SECRET={cfg['SESSION_SECRET']}\n")
    return cfg

CFG = load_env()

PORT = int(CFG["PORT"])
PASSWORD = CFG["PASSWORD"] if CFG["PASSWORD"] else None
SESSION_SECRET = CFG["SESSION_SECRET"]
MAX_UPLOAD = int(CFG["MAX_UPLOAD_MB"]) * 1024 * 1024
RATE_LIMIT_MAX = int(CFG["RATE_LIMIT_MAX"])
RATE_LIMIT_WINDOW = int(CFG["RATE_LIMIT_WINDOW"])
LOCKOUT_SECONDS = int(CFG["LOCKOUT_SECONDS"])
MAX_ATTEMPTS = int(CFG["MAX_ATTEMPTS"])
SESSION_HOURS = int(CFG["SESSION_HOURS"])
SHARE_DAYS = int(CFG["SHARE_DAYS"])
ALLOWED_EXT = [e.strip().lower() for e in CFG["ALLOWED_EXTENSIONS"].split(",") if e.strip()] or None
ENCRYPT_KEY = CFG["ENCRYPT_KEY"]

if not ENV_FILE.exists():
    with open(ENV_FILE, "w") as f:
        f.write("# DropBox Configuration\n")
        f.write(f"PORT={PORT}\n")
        f.write(f'PASSWORD="{PASSWORD or ""}"\n')
        f.write(f"MAX_UPLOAD_MB={CFG['MAX_UPLOAD_MB']}\n")
        f.write(f"RATE_LIMIT_MAX={RATE_LIMIT_MAX}\n")
        f.write(f"SHARE_DAYS={SHARE_DAYS}\n")
        f.write(f"ALLOWED_EXTENSIONS={CFG['ALLOWED_EXTENSIONS']}\n")

# ── XOR Encryption ──────────────────────────────────────
def xorCrypt(data, key):
    key_bytes = key.encode() if isinstance(key, str) else key
    if isinstance(data, str):
        data = data.encode()
    return bytes(b ^ key_bytes[i % len(key_bytes)] for i, b in enumerate(data))

def encrypt_str(plaintext, key=ENCRYPT_KEY):
    return base64.b64encode(xorCrypt(plaintext, key)).decode()

def decrypt_str(ciphertext, key=ENCRYPT_KEY):
    try:
        return xorCrypt(base64.b64decode(ciphertext), key).decode()
    except Exception:
        return None

# ── Password Storage ────────────────────────────────────
def save_password(name, username, password, url="", notes=""):
    entry = json.dumps({"name": name, "user": username, "pass": password, "url": url, "notes": notes, "ts": time.time()})
    enc = encrypt_str(entry)
    safe_name = re.sub(r'[<>:"/\\|?*]', '_', name).strip(".")
    fp = PASSWORDS_DIR / f"{safe_name}.enc"
    fp.write_text(enc)
    return True

def list_passwords():
    result = []
    for fp in sorted(PASSWORDS_DIR.glob("*.enc")):
        try:
            dec = decrypt_str(fp.read_text().strip())
            if dec:
                data = json.loads(dec)
                data["file"] = fp.stem
                data.pop("pass", None)
                result.append(data)
        except Exception:
            result.append({"file": fp.stem, "name": fp.stem, "error": True})
    return result

def get_password(name):
    safe_name = re.sub(r'[<>:"/\\|?*]', '_', name).strip(".")
    fp = PASSWORDS_DIR / f"{safe_name}.enc"
    if fp.exists():
        dec = decrypt_str(fp.read_text().strip())
        if dec:
            return json.loads(dec)
    return None

def delete_password(name):
    safe_name = re.sub(r'[<>:"/\\|?*]', '_', name).strip(".")
    fp = PASSWORDS_DIR / f"{safe_name}.enc"
    if fp.exists():
        fp.unlink()
        return True
    return False

# ── Rate limiter ────────────────────────────────────────
rate_store = {}
def check_rate(ip):
    now = time.time()
    rate_store.setdefault(ip, [])
    rate_store[ip] = [t for t in rate_store[ip] if now - t < RATE_LIMIT_WINDOW]
    if len(rate_store[ip]) >= RATE_LIMIT_MAX:
        return False
    rate_store[ip].append(now)
    return True

# ── Sessions ────────────────────────────────────────────
sessions = {}
LOGIN_ATTEMPTS = {}

def is_locked(ip):
    if ip in LOGIN_ATTEMPTS:
        attempts, locked_until = LOGIN_ATTEMPTS[ip]
        if locked_until and time.time() < locked_until:
            return True
        if locked_until and time.time() >= locked_until:
            LOGIN_ATTEMPTS[ip] = (0, None)
    return False

def record_attempt(ip, success):
    if success:
        LOGIN_ATTEMPTS.pop(ip, None)
        return
    attempts, _ = LOGIN_ATTEMPTS.get(ip, (0, None))
    attempts += 1
    if attempts >= MAX_ATTEMPTS:
        LOGIN_ATTEMPTS[ip] = (attempts, time.time() + LOCKOUT_SECONDS)
    else:
        LOGIN_ATTEMPTS[ip] = (attempts, None)

def make_session():
    token = secrets.token_hex(32)
    sessions[token] = time.time()
    return token

def valid_session(token):
    if not token or token not in sessions:
        return False
    if time.time() - sessions[token] > SESSION_HOURS * 3600:
        sessions.pop(token, None)
        return False
    sessions[token] = time.time()
    return True

def check_password(pw):
    if PASSWORD is None:
        return True
    return secrets.compare_digest(pw, PASSWORD)

# ── Share management ────────────────────────────────────
def cleanup_shares():
    now = time.time()
    for fp in SHARE_DIR.glob("*.json"):
        try:
            data = json.loads(fp.read_text())
            if data.get("expires", 0) < now:
                fp.unlink()
        except Exception:
            fp.unlink()

def create_share(name):
    cleanup_shares()
    token = secrets.token_urlsafe(32)
    data = {"name": name, "token": token, "expires": time.time() + SHARE_DAYS * 86400, "created": time.time()}
    safe = hashlib.sha256(name.encode()).hexdigest()[:16]
    (SHARE_DIR / f"{safe}.json").write_text(json.dumps(data))
    return token

def get_share(token):
    cleanup_shares()
    for fp in SHARE_DIR.glob("*.json"):
        try:
            data = json.loads(fp.read_text())
            if data.get("token") == token and time.time() < data.get("expires", 0):
                return data
        except Exception:
            pass
    return None

# ── HTML ────────────────────────────────────────────────
LOGIN_HTML = """<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>DropBox - Login</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,sans-serif;background:#0a0a0a;color:#e0e0e0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px}
.login{background:#141414;border:1px solid #222;border-radius:16px;padding:40px 32px;width:100%;max-width:380px;text-align:center}
.login h1{font-size:26px;margin-bottom:6px;color:#fff;letter-spacing:-.5px}
.login p{color:#666;margin-bottom:28px;font-size:14px}
.field{position:relative;margin-bottom:16px}
.field input{width:100%;padding:14px 16px;background:#0a0a0a;border:1px solid #333;border-radius:10px;color:#fff;font-size:15px;outline:none;transition:border .2s}
.field input:focus{border-color:#4a9eff}
.btn{width:100%;padding:14px;background:#4a9eff;color:#fff;border:none;border-radius:10px;font-size:15px;cursor:pointer;font-weight:600;transition:background .2s}
.btn:hover{background:#3a8eef}
.error{color:#ff4a4a;font-size:13px;margin-bottom:16px}
.locked{color:#ff6b6b;font-size:13px;margin-bottom:16px}
</style></head><body>
<div class="login">
<h1>DropBox</h1>
<p>Enter password to continue</p>
__ERROR__
<form method="POST" action="/login">
<div class="field"><input type="password" name="password" placeholder="Password" autofocus required></div>
<button class="btn" type="submit">Login</button>
</form>
</div></body></html>"""

MAIN_HTML = """<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>DropBox</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,sans-serif;background:#0a0a0a;color:#e0e0e0;min-height:100vh}
.topbar{display:flex;align-items:center;justify-content:space-between;background:#111;padding:14px 20px;border-bottom:1px solid #1a1a1a;position:sticky;top:0;z-index:50;backdrop-filter:blur(10px)}
.topbar h1{font-size:18px;color:#fff;font-weight:700;letter-spacing:-.3px}
.nav{display:flex;gap:4px}
.nav-btn{padding:6px 14px;border:none;border-radius:6px;cursor:pointer;font-size:13px;background:transparent;color:#888;transition:all .15s}
.nav-btn:hover,.nav-btn.active{background:#1a1a2a;color:#4a9eff}
.container{max-width:800px;margin:0 auto;padding:16px}
.section{display:none}
.section.active{display:block}
.upload-zone{border:2px dashed #2a2a2a;border-radius:14px;padding:36px 20px;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:20px;background:#111}
.upload-zone:hover,.upload-zone.dragover{border-color:#4a9eff;background:#111122}
.upload-zone .icon{font-size:36px;margin-bottom:8px;opacity:.4}
.upload-zone p{color:#555;font-size:13px}
.upload-zone .browse{color:#4a9eff;cursor:pointer;text-decoration:underline}
.progress{width:100%;height:3px;background:#1a1a1a;border-radius:2px;margin-top:14px;overflow:hidden;display:none}
.progress .bar{height:100%;background:linear-gradient(90deg,#4a9eff,#00d4ff);width:0%;transition:width .3s}
.status{margin-top:6px;font-size:12px;color:#555}
.files-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.files-header h2{font-size:14px;color:#888;font-weight:500}
.file-list{list-style:none}
.file-item{display:flex;align-items:center;padding:10px 12px;background:#111;border:1px solid #1a1a1a;border-radius:10px;margin-bottom:4px;transition:background .15s;gap:10px}
.file-item:hover{background:#161622}
.file-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px}
.file-icon.img{background:#0a1a0a;color:#4aff4a}
.file-icon.vid{background:#1a0a1a;color:#c44aff}
.file-icon.doc{background:#0a0a1a;color:#4a9eff}
.file-icon.zip{background:#1a1a0a;color:#ffaa4a}
.file-icon.pdf{background:#1a0a0a;color:#ff4a4a}
.file-icon.other{background:#111;color:#555}
.file-info{flex:1;min-width:0}
.file-name{font-size:14px;color:#ddd;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
.file-name:hover{color:#4a9eff}
.file-meta{font-size:11px;color:#444;margin-top:2px}
.file-actions{display:flex;gap:5px;flex-shrink:0}
.btn{padding:5px 10px;border:none;border-radius:6px;cursor:pointer;font-size:11px;text-decoration:none;transition:all .15s;display:inline-flex;align-items:center;gap:3px;white-space:nowrap}
.btn-v{background:#0a1a0a;color:#4aff4a;border:1px solid #1a2a1a}.btn-v:hover{background:#1a2a1a}
.btn-d{background:#0a0a1a;color:#4a9eff;border:1px solid #1a1a2a}.btn-d:hover{background:#1a1a2a}
.btn-s{background:#1a0a1a;color:#c44aff;border:1px solid #2a1a2a}.btn-s:hover{background:#2a1a2a}
.btn-x{background:#1a0a0a;color:#ff4a4a;border:1px solid #2a1a1a}.btn-x:hover{background:#2a1a1a}
.empty{text-align:center;padding:40px 16px;color:#333;font-size:14px}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a3a1a;border:1px solid #2a5a2a;color:#4aff4a;padding:10px 20px;border-radius:8px;font-size:13px;display:none;z-index:300;max-width:90vw;text-align:center}
.toast.error{background:#3a1a1a;border-color:#5a2a2a;color:#ff4a4a}
.modal-bg{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.9);z-index:200;display:none;align-items:center;justify-content:center;padding:8px}
.modal{background:#111;border:1px solid #222;border-radius:12px;max-width:95vw;max-height:95vh;overflow:hidden;position:relative;width:100%}
.modal-close{position:absolute;top:6px;right:10px;background:rgba(0,0,0,.6);border:none;color:#888;font-size:28px;cursor:pointer;z-index:10;padding:4px 10px;border-radius:6px}
.modal-close:hover{color:#fff;background:rgba(0,0,0,.8)}
.modal img,.modal video{max-width:95vw;max-height:90vh;display:block;margin:0 auto}
.modal iframe{width:100%;height:85vh;border:none}
.modal-text{padding:16px;max-width:95vw;max-height:85vh;overflow:auto;font-family:'Cascadia Code','Fira Code',monospace;font-size:12px;color:#bbb;white-space:pre-wrap;word-break:break-all;line-height:1.5}
.share-url{background:#0a0a0a;border:1px solid #222;border-radius:8px;padding:10px 14px;color:#4a9eff;font-family:monospace;font-size:12px;width:100%;outline:none;cursor:pointer;margin-top:8px;word-break:break-all}
.share-url:focus{border-color:#4a9eff}
.pw-form{background:#111;border:1px solid #1a1a1a;border-radius:12px;padding:20px;margin-bottom:12px}
.pw-form h3{font-size:15px;color:#ccc;margin-bottom:14px}
.pw-field{margin-bottom:10px}
.pw-field label{display:block;font-size:12px;color:#666;margin-bottom:4px}
.pw-field input{width:100%;padding:10px 12px;background:#0a0a0a;border:1px solid #222;border-radius:8px;color:#fff;font-size:13px;outline:none}
.pw-field input:focus{border-color:#4a9eff}
.pw-actions{display:flex;gap:8px;margin-top:14px}
.pw-btn{padding:8px 16px;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500}
.pw-btn.primary{background:#4a9eff;color:#fff}.pw-btn.primary:hover{background:#3a8eef}
.pw-btn.danger{background:#3a1a1a;color:#ff4a4a}.pw-btn.danger:hover{background:#5a2a2a}
.pw-btn.secondary{background:#1a1a1a;color:#888}.pw-btn.secondary:hover{background:#2a2a2a}
.pw-item{background:#111;border:1px solid #1a1a1a;border-radius:8px;padding:12px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center}
.pw-item .name{font-size:14px;color:#ddd}
.pw-item .user{font-size:12px;color:#666}
.pw-item .pw-actions{display:flex;gap:5px}
@media(max-width:640px){
.topbar{padding:12px 14px}
.topbar h1{font-size:16px}
.nav-btn{padding:5px 10px;font-size:12px}
.container{padding:12px}
.file-item{flex-wrap:wrap}
.file-actions{width:100%;justify-content:flex-end;margin-top:6px}
.btn{padding:5px 8px;font-size:10px}
.modal img,.modal video{max-width:100vw}
}
</style></head><body>
<div class="topbar">
<h1>DropBox</h1>
<div class="nav">
<button class="nav-btn active" onclick="showSection('files')">Files</button>
<button class="nav-btn" onclick="showSection('passwords')">Passwords</button>
<a class="nav-btn" href="/logout">Logout</a>
</div>
</div>
<div class="container">
<div class="section active" id="sec-files">
<div class="upload-zone" id="drop-zone">
<div class="icon">+</div>
<p>Drag & drop files or <span class="browse" onclick="document.getElementById('fi').click()">browse</span></p>
<div class="progress" id="progress"><div class="bar" id="bar"></div></div>
<div class="status" id="status"></div>
</div>
<input type="file" id="fi" multiple>
<div class="files-header"><h2 id="file-count"></h2></div>
<ul class="file-list" id="fl"></ul>
</div>
<div class="section" id="sec-passwords">
<div class="pw-form" id="pw-form">
<h3>Save Password</h3>
<div class="pw-field"><label>Name</label><input id="pw-name" placeholder="e.g. Gmail"></div>
<div class="pw-field"><label>Username / Email</label><input id="pw-user" placeholder="user@example.com"></div>
<div class="pw-field"><label>Password</label><input id="pw-pass" type="password" placeholder="********"></div>
<div class="pw-field"><label>URL (optional)</label><input id="pw-url" placeholder="https://..."></div>
<div class="pw-actions">
<button class="pw-btn primary" onclick="savePw()">Save</button>
<button class="pw-btn secondary" onclick="togglePwForm()">Cancel</button>
</div>
</div>
<button class="pw-btn primary" onclick="togglePwForm()" id="pw-add-btn" style="margin-bottom:12px">+ Add Password</button>
<ul class="file-list" id="pw-list"></ul>
</div>
</div>
<div class="toast" id="toast"></div>
<div class="modal-bg" id="modal" onclick="if(event.target===this)closeModal()">
<div class="modal"><button class="modal-close" onclick="closeModal()">&times;</button><div id="modal-body"></div></div>
</div>
<script>
let curSection='files';
function showSection(s){curSection=s;document.querySelectorAll('.section').forEach(e=>e.classList.remove('active'));document.getElementById('sec-'+s).classList.add('active');document.querySelectorAll('.nav-btn').forEach(e=>e.classList.remove('active'));document.querySelectorAll('.nav-btn').forEach(e=>{if(e.textContent.toLowerCase().includes(s.slice(0,-1)))e.classList.add('active')});if(s==='files')loadFiles();if(s==='passwords')loadPw()}
const drop=document.getElementById('drop-zone'),fi=document.getElementById('fi'),fl=document.getElementById('fl'),
pr=document.getElementById('progress'),bar=document.getElementById('bar'),st=document.getElementById('status'),
fc=document.getElementById('file-count'),toast=document.getElementById('toast');
function fmt(b){if(b<1024)return b+' B';if(b<1048576)return(b/1024).toFixed(1)+' KB';if(b<1073741824)return(b/1048576).toFixed(1)+' MB';return(b/1073741824).toFixed(2)+' GB'}
function msg(m,e){toast.textContent=m;toast.className='toast'+(e?' error':'');toast.style.display='block';setTimeout(()=>toast.style.display='none',3000)}
function ext(n){return n.split('.').pop().toLowerCase()}
function ic(n){const e=ext(n);if(['jpg','jpeg','png','gif','webp','svg','bmp','ico'].includes(e))return'img';if(['mp4','webm','mkv','avi','mov'].includes(e))return'veid';if(['pdf'].includes(e))return'pdf';if(['zip','rar','7z','tar','gz'].includes(e))return'zip';if(['txt','md','py','js','html','css','json','csv','xml','yml','sh','sql','rs','go','java','c','cpp','h','log','ini','cfg','bat','ps1'].includes(e))return'doc';return'other'}
drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('dragover')});
drop.addEventListener('dragleave',()=>drop.classList.remove('dragover'));
drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('dragover');upload(e.dataTransfer.files)});
fi.addEventListener('change',()=>{if(fi.files.length)upload(fi.files);fi.value=''});
function upload(files){for(let f of files){if(f.size>2147483648){msg(f.name+' too large (max 2GB)',1);continue}let fd=new FormData();fd.append('file',f,f.name);let xhr=new XMLHttpRequest();pr.style.display='block';bar.style.width='0%';st.textContent='Uploading '+f.name+'...';xhr.upload.onprogress=e=>{if(e.lengthComputable){let p=Math.round(e.loaded/e.total*100);bar.style.width=p+'%';st.textContent='Uploading '+f.name+'... '+p+'%'}};xhr.onload=()=>{pr.style.display='none';bar.style.width='0%';st.textContent='';if(xhr.status===200){msg(f.name+' uploaded');loadFiles()}else msg('Upload failed',1)};xhr.onerror=()=>{pr.style.display='none';st.textContent='';msg('Error',1)};xhr.open('POST','/upload');xhr.send(fd)}}
function loadFiles(){fetch('/files').then(r=>r.json()).then(files=>{fl.innerHTML='';fc.textContent=files.length+' file'+(files.length!==1?'s':'');if(!files.length){fl.innerHTML='<div class="empty">No files yet</div>';return}files.forEach(f=>{let li=document.createElement('li');li.className='file-item';let c=ic(f.name);li.innerHTML='<div class="file-icon '+c+'">'+(c==='img'?'\\ud83d\\uddbc':c==='vid'?'\\ud83c\\udfac':c==='pdf'?'\\ud83d\\udcc4':c==='zip'?'\\ud83d\\udce6':c==='doc'?'\\ud83d\\udcbb':'\\ud83d\\udcc1')+'</div>'+'<div class="file-info"><div class="file-name" onclick="viewFile(\\''+f.name.replace(/'/g,"\\\\'")+'\\')">'+f.name+'</div><div class="file-meta">'+fmt(f.size)+(f.modified?' \\u00b7 '+f.modified:'')+'</div></div>'+'<div class="file-actions">'+'<button class="btn btn-v" onclick="viewFile(\\''+f.name.replace(/'/g,"\\\\'")+'\\')">View</button>'+'<a class="btn btn-d" href="/download?name='+encodeURIComponent(f.name)+'">Save</a>'+'<button class="btn btn-s" onclick="shareFile(\\''+f.name.replace(/'/g,"\\\\'")+'\\')">Share</button>'+'<button class="btn btn-x" onclick="delFile(\\''+f.name.replace(/'/g,"\\\\'")+'\\')">Del</button></div>';fl.appendChild(li)})})}
function viewFile(n){let e=ext(n),url='/download?name='+encodeURIComponent(n);let mb=document.getElementById('modal-body');if(['jpg','jpeg','png','gif','webp','svg','bmp'].includes(e)){mb.innerHTML='<img src="'+url+'" style="max-width:100%;max-height:85vh;display:block;margin:auto">'}else if(['mp4','webm','ogg'].includes(e)){mb.innerHTML='<video controls autoplay src="'+url+'" style="max-width:100%;max-height:85vh;display:block;margin:auto"></video>'}else if(e==='pdf'){mb.innerHTML='<iframe src="'+url+'" style="width:100%;height:85vh;border:none"></iframe>'}else if(['txt','md','py','js','html','css','json','csv','xml','yml','sh','sql','rs','go','java','c','cpp','h','log','ini','cfg','bat','ps1'].includes(e)){fetch(url).then(r=>r.text()).then(t=>{mb.innerHTML='<pre class="modal-text">'+t.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</pre>'}).catch(()=>{mb.innerHTML='<div class="modal-text">Failed to load file</div>'})}else{mb.innerHTML='<div class="modal-text">Preview not available for .'+e+'<br><a href="'+url+'" style="color:#4a9eff;margin-top:12px;display:inline-block">Download file</a></div>'}document.getElementById('modal').style.display='flex'}
function closeModal(){document.getElementById('modal').style.display='none';document.getElementById('modal-body').innerHTML=''}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
function shareFile(n){fetch('/share?name='+encodeURIComponent(n),{method:'POST'}).then(r=>r.json()).then(d=>{if(d.url){navigator.clipboard.writeText(d.url).catch(()=>{});msg('Share link copied!')}else msg('Failed',1)})}
function delFile(n){if(!confirm('Delete '+n+'?'))return;fetch('/delete?name='+encodeURIComponent(n),{method:'POST'}).then(r=>{if(r.ok){msg(n+' deleted');loadFiles()}else msg('Failed',1)})}
function togglePwForm(){let f=document.getElementById('pw-form'),b=document.getElementById('pw-add-btn');if(f.style.display==='none'){f.style.display='block';b.style.display='none'}else{f.style.display='none';b.style.display='inline-block'}}
function savePw(){let n=document.getElementById('pw-name').value,u=document.getElementById('pw-user').value,p=document.getElementById('pw-pass').value,url=document.getElementById('pw-url').value;if(!n||!p){msg('Name and password required',1);return}fetch('/api/passwords',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:n,user:u,pass:p,url:url})}).then(r=>r.json()).then(d=>{if(d.ok){msg('Password saved');document.getElementById('pw-name').value='';document.getElementById('pw-user').value='';document.getElementById('pw-pass').value='';document.getElementById('pw-url').value='';togglePwForm();loadPw()}else msg('Failed',1)})}
function loadPw(){fetch('/api/passwords').then(r=>r.json()).then(list=>{let el=document.getElementById('pw-list');el.innerHTML='';if(!list.length){el.innerHTML='<div class="empty">No passwords saved</div>';return}list.forEach(p=>{let li=document.createElement('li');li.className='pw-item';li.innerHTML='<div><div class="name">'+p.name+'</div><div class="user">'+(p.user||'-')+'</div></div>'+'<div class="pw-actions">'+'<button class="btn btn-d" onclick="showPw(\\''+p.file.replace(/'/g,"\\\\'")+'\\')">Show</button>'+'<button class="btn btn-x" onclick="delPw(\\''+p.name.replace(/'/g,"\\\\'")+'\\')">Del</button></div>';el.appendChild(li)})})}
function showPw(f){fetch('/api/passwords/'+encodeURIComponent(f)).then(r=>r.json()).then(d=>{if(d.pass){navigator.clipboard.writeText(d.pass).catch(()=>{});msg('Password copied!')}})}
function delPw(n){if(!confirm('Delete '+n+'?'))return;fetch('/api/passwords/'+encodeURIComponent(n),{method:'DELETE'}).then(r=>{if(r.ok){msg('Deleted');loadPw()}else msg('Failed',1)})}
loadFiles();</script></body></html>"""


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        sys.stdout.write(f"{time.strftime('%H:%M:%S')} {self.client_address[0]} {args[0]}\n")
        sys.stdout.flush()

    def get_ip(self):
        return self.client_address[0]

    def get_cookie(self, name):
        for c in self.headers.get("Cookie", "").split(";"):
            c = c.strip()
            if c.startswith(name + "="):
                return c[len(name) + 1:]
        return None

    def send_html(self, html, code=200):
        self.send_response(code)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.end_headers()
        self.wfile.write(html.encode())

    def send_json(self, data, code=200):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def send_text(self, text, code=200):
        self.send_response(code)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(text.encode())

    def require_auth(self):
        token = self.get_cookie("session")
        if not valid_session(token):
            if PASSWORD is None:
                return True
            self.send_html(LOGIN_HTML.replace("__ERROR__", ""))
            return False
        return True

    def do_GET(self):
        if not check_rate(self.get_ip()):
            self.send_text("Rate limited. Try again later.", 429)
            return

        parsed = urlparse(self.path)
        path = parsed.path
        params = parse_qs(parsed.query)

        if path == "/":
            if not self.require_auth():
                return
            self.send_html(MAIN_HTML)

        elif path == "/files":
            if not self.require_auth():
                return
            files = []
            for name in sorted(os.listdir(FILES_DIR)):
                fp = FILES_DIR / name
                if name.startswith(".") or fp.is_dir():
                    continue
                sz = fp.stat().st_size
                mt = time.strftime("%Y-%m-%d %H:%M", time.localtime(fp.stat().st_mtime))
                files.append({"name": name, "size": sz, "modified": mt})
            self.send_json(files)

        elif path == "/download":
            name = params.get("name", [""])[0]
            if not name:
                self.send_text("Missing name", 400)
                return
            name = os.path.basename(unquote(name))
            fp = FILES_DIR / name
            if not fp.is_file():
                self.send_text("Not found", 404)
                return

            token_param = params.get("token", [""])[0]
            if token_param:
                share = get_share(token_param)
                if not share or share["name"] != name:
                    self.send_text("Link expired or invalid", 403)
                    return
            elif not self.require_auth():
                return

            is_preview = "preview" in params
            sz = fp.stat().st_size
            ct = mimetypes.guess_type(str(fp))[0] or "application/octet-stream"
            self.send_response(200)
            self.send_header("Content-Type", ct)
            self.send_header("Content-Length", sz)
            self.send_header("Content-Disposition", "inline" if is_preview else f'attachment; filename="{name}"')
            self.send_header("X-Content-Type-Options", "nosniff")
            self.end_headers()
            with open(fp, "rb") as f:
                while True:
                    chunk = f.read(65536)
                    if not chunk:
                        break
                    self.wfile.write(chunk)

        elif path == "/api/passwords":
            if not self.require_auth():
                return
            self.send_json(list_passwords())

        elif path.startswith("/api/passwords/"):
            if not self.require_auth():
                return
            name = unquote(path.split("/api/passwords/", 1)[1])
            data = get_password(name)
            if data:
                self.send_json(data)
            else:
                self.send_text("Not found", 404)

        else:
            self.send_text("Not found", 404)

    def do_POST(self):
        if not check_rate(self.get_ip()):
            self.send_text("Rate limited", 429)
            return

        parsed = urlparse(self.path)
        path = parsed.path
        params = parse_qs(parsed.query)

        if path == "/login":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode()
            password = ""
            for part in body.split("&"):
                if part.startswith("password="):
                    password = unquote(part[9:])

            if is_locked(self.get_ip()):
                remaining = int(LOCKOUT_SECONDS - (time.time() - LOGIN_ATTEMPTS.get(self.get_ip(), (0, 0))[1]))
                self.send_html(LOGIN_HTML.replace("__ERROR__", f'<div class="locked">Too many attempts. Wait {remaining}s.</div>'))
                return

            if check_password(password):
                record_attempt(self.get_ip(), True)
                token = make_session()
                self.send_response(302)
                self.send_header("Location", "/")
                self.send_header("Set-Cookie", f"session={token}; Path=/; HttpOnly; SameSite=Lax; Max-Age={SESSION_HOURS*3600}")
                self.end_headers()
            else:
                record_attempt(self.get_ip(), False)
                self.send_html(LOGIN_HTML.replace("__ERROR__", '<div class="error">Wrong password</div>'))
            return

        if path == "/logout":
            token = self.get_cookie("session")
            if token:
                sessions.pop(token, None)
            self.send_response(302)
            self.send_header("Location", "/")
            self.send_header("Set-Cookie", "session=; Path=/; Max-Age=0")
            self.end_headers()
            return

        if path == "/upload":
            token = self.get_cookie("session")
            if not valid_session(token) and PASSWORD is not None:
                self.send_text("Unauthorized", 401)
                return

            content_type = self.headers.get("Content-Type", "")
            if "multipart/form-data" not in content_type:
                self.send_text("Expected multipart/form-data", 400)
                return

            content_length = int(self.headers.get("Content-Length", 0))
            if content_length > MAX_UPLOAD + 1024:
                self.send_text("File too large", 413)
                return

            boundary = content_type.split("boundary=")[1].encode()
            body = self.rfile.read(content_length)

            parts = body.split(b"--" + boundary)
            for part in parts:
                if b'filename="' not in part:
                    continue
                header_end = part.find(b"\r\n\r\n")
                if header_end == -1:
                    continue
                headers_raw = part[:header_end].decode(errors="replace")
                file_data = part[header_end + 4:]
                if file_data.endswith(b"\r\n"):
                    file_data = file_data[:-2]

                fn_start = headers_raw.find('filename="') + 10
                fn_end = headers_raw.find('"', fn_start)
                filename = headers_raw[fn_start:fn_end]
                if not filename:
                    continue

                name = os.path.basename(unquote(filename))
                name = re.sub(r'[<>:"/\\|?*]', '_', name)
                if not name or name.startswith("."):
                    continue

                if ALLOWED_EXT:
                    ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""
                    if ext not in ALLOWED_EXT:
                        self.send_json({"error": f".{ext} files not allowed"}, 400)
                        return

                fp = FILES_DIR / name
                with open(fp, "wb") as f:
                    f.write(file_data)

                self.send_json({"ok": True, "name": name})
                return
            self.send_text("No file found", 400)
            return

        if path == "/delete":
            token = self.get_cookie("session")
            if not valid_session(token) and PASSWORD is not None:
                self.send_text("Unauthorized", 401)
                return
            name = params.get("name", [""])[0]
            if not name:
                self.send_text("Missing name", 400)
                return
            name = os.path.basename(unquote(name))
            if name.startswith("."):
                self.send_text("Invalid", 400)
                return
            fp = FILES_DIR / name
            if fp.is_file():
                fp.unlink()
                safe = hashlib.sha256(name.encode()).hexdigest()[:16]
                sf = SHARE_DIR / f"{safe}.json"
                if sf.exists():
                    sf.unlink()
                self.send_json({"ok": True})
            else:
                self.send_text("Not found", 404)
            return

        if path == "/share":
            token = self.get_cookie("session")
            if not valid_session(token) and PASSWORD is not None:
                self.send_text("Unauthorized", 401)
                return
            name = params.get("name", [""])[0]
            if not name:
                self.send_json({"error": "missing name"}, 400)
                return
            name = os.path.basename(unquote(name))
            fp = FILES_DIR / name
            if not fp.is_file():
                self.send_json({"error": "not found"}, 404)
                return
            stoken = create_share(name)
            host = self.headers.get("Host", f"localhost:{PORT}")
            url = f"http://{host}/download?name={quote(name)}&token={stoken}"
            self.send_json({"url": url})
            return

        if path == "/api/passwords":
            token = self.get_cookie("session")
            if not valid_session(token) and PASSWORD is not None:
                self.send_text("Unauthorized", 401)
                return
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))
            save_password(body.get("name", ""), body.get("user", ""), body.get("pass", ""), body.get("url", ""), body.get("notes", ""))
            self.send_json({"ok": True})
            return

        self.send_text("Not found", 404)

    def do_DELETE(self):
        if not check_rate(self.get_ip()):
            self.send_text("Rate limited", 429)
            return

        parsed = urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/passwords/"):
            token = self.get_cookie("session")
            if not valid_session(token) and PASSWORD is not None:
                self.send_text("Unauthorized", 401)
                return
            name = unquote(path.split("/api/passwords/", 1)[1])
            if delete_password(name):
                self.send_json({"ok": True})
            else:
                self.send_text("Not found", 404)
            return

        self.send_text("Not found", 404)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    print(f"\n  DropBox v2 running at http://localhost:{port}")
    print(f"  Files:  {FILES_DIR}")
    print(f"  Shares: {SHARE_DIR}")
    print(f"  Passwords: {PASSWORDS_DIR}")
    if PASSWORD:
        print(f"  Password: {PASSWORD}")
    else:
        print(f"  Auth: DISABLED")
    print(f"  Max upload: {MAX_UPLOAD // (1024*1024)}MB")
    print(f"  Config: {ENV_FILE}\n")
    server = HTTPServer(("0.0.0.0", port), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Shutting down...")
        server.shutdown()
