import { supabase } from './supabase.js';

// Load previously shown IDs from localStorage — dili ma-repeat after page reload
const shownNotifIds = new Set(
    JSON.parse(localStorage.getItem('capsule_shown_notifs') || '[]')
);
function saveShownIds() {
    localStorage.setItem('capsule_shown_notifs', JSON.stringify([...shownNotifIds]));
}

function createNotifBell() {
    const style = document.createElement('style');
    style.textContent = `
        #notif-bell-wrapper {
            position: fixed; top: 68px; right: 16px;
            z-index: 9999; font-family: 'Poppins', sans-serif;
        }
        #notif-bell-btn {
            background: #fff8f0; border: 2px solid #e8c99a;
            border-radius: 50%; width: 44px; height: 44px;
            font-size: 20px; cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.12);
            position: relative; transition: transform 0.2s;
            display: flex; align-items: center; justify-content: center;
        }
        #notif-bell-btn:hover { transform: scale(1.1); }
        #notif-badge {
            display: none; position: absolute;
            top: -5px; right: -5px;
            background: #e74c3c; color: white;
            border-radius: 50%; width: 18px; height: 18px;
            font-size: 10px; font-weight: bold;
            align-items: center; justify-content: center;
            border: 2px solid white;
        }
        #notif-badge.visible { display: flex !important; }

        /* ── DROPDOWN ── */
        #notif-dropdown {
            display: none;
            position: fixed;
            top: 120px; right: 12px;
            width: min(300px, calc(100vw - 24px));
            background: #fffdf8 !important;
            -webkit-backdrop-filter: none;
            backdrop-filter: none;
            border: 1.5px solid #e8c99a;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.20);
            overflow: hidden; z-index: 99999;
            opacity: 1 !important;
        }
        #notif-dropdown.open { display: block; }
        .notif-header {
            padding: 12px 16px; font-weight: 700; font-size: 13px;
            color: #7a5c3a; border-bottom: 1px solid #f0e0c0;
            background: #fff5e6 !important; display: flex;
            justify-content: space-between; align-items: center;
        }
        .notif-clear-btn {
            font-size: 11px; color: #c0956a; cursor: pointer;
            background: none; border: none; font-family: inherit;
            text-decoration: underline;
        }
        #notif-list { max-height: 260px; overflow-y: auto; background: #fffdf8 !important; }
        .notif-item {
            padding: 12px 16px; border-bottom: 1px solid #f5ead8;
            display: flex; gap: 10px; align-items: flex-start;
            cursor: pointer; transition: background 0.15s;
            background: #fffdf8 !important;
        }
        .notif-item:hover { background: #fff5e6 !important; }
        .notif-icon { font-size: 22px; flex-shrink: 0; }
        .notif-title { font-weight: 600; font-size: 12px; color: #4a3220; margin-bottom: 2px; }
        .notif-body {
            font-size: 11px; color: #8a6a4a; line-height: 1.4;
            display: -webkit-box; -webkit-line-clamp: 2;
            -webkit-box-orient: vertical; overflow: hidden;
        }
        .notif-time { font-size: 10px; color: #b89878; margin-top: 3px; }
        .notif-empty { padding: 24px 16px; text-align: center; color: #c0a080; font-size: 12px; }

        /* ── TOAST — top center, dili nag-overlap sa content ── */
        #notif-toast {
            position: fixed;
            top: 76px;
            left: 50%;
            transform: translateX(-50%);
            background: #4a3220; color: #fff8f0;
            padding: 12px 18px; border-radius: 12px;
            font-size: 12px; font-family: 'Poppins', sans-serif;
            box-shadow: 0 8px 24px rgba(0,0,0,0.25);
            z-index: 99999; display: none;
            width: min(280px, calc(100vw - 32px));
            line-height: 1.5; border-left: 4px solid #e8c99a;
            text-align: left;
        }
        #notif-toast.show { display: block; }

        @keyframes bellShake {
            0%   { transform: rotate(0); }
            15%  { transform: rotate(15deg); }
            30%  { transform: rotate(-12deg); }
            45%  { transform: rotate(10deg); }
            60%  { transform: rotate(-8deg); }
            75%  { transform: rotate(5deg); }
            100% { transform: rotate(0); }
        }
        .bell-shake { animation: bellShake 0.6s ease !important; }
    `;
    document.head.appendChild(style);

    const wrapper = document.createElement('div');
    wrapper.id = 'notif-bell-wrapper';
    wrapper.innerHTML = `
        <button id="notif-bell-btn" title="Notifications">
            🔔 <span id="notif-badge"></span>
        </button>
        <div id="notif-dropdown">
            <div class="notif-header">
                <span>🎁 Your Capsules</span>
                <button class="notif-clear-btn" id="notif-clear-btn">Clear all</button>
            </div>
            <div id="notif-list">
                <div class="notif-empty">No notifications yet 🌙</div>
            </div>
        </div>
    `;
    document.body.appendChild(wrapper);

    const toast = document.createElement('div');
    toast.id = 'notif-toast';
    document.body.appendChild(toast);

    document.getElementById('notif-bell-btn').addEventListener('click', () => {
        document.getElementById('notif-dropdown').classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target))
            document.getElementById('notif-dropdown').classList.remove('open');
    });
    document.getElementById('notif-clear-btn').addEventListener('click', clearAllNotifications);
}

function showToast(message) {
    const toast = document.getElementById('notif-toast');
    toast.innerHTML = message;
    toast.classList.add('show');
    const bell = document.getElementById('notif-bell-btn');
    bell.classList.add('bell-shake');
    setTimeout(() => bell.classList.remove('bell-shake'), 700);
    setTimeout(() => toast.classList.remove('show'), 5000);
}

function updateBadge(count) {
    const badge = document.getElementById('notif-badge');
    if (count > 0) {
        badge.classList.add('visible');
        badge.textContent = count > 9 ? '9+' : count;
    } else {
        badge.classList.remove('visible');
        badge.textContent = '';
    }
}

function addNotifItem(memory) {
    const list = document.getElementById('notif-list');
    const empty = list.querySelector('.notif-empty');
    if (empty) empty.remove();

    const isVideo = memory.file_url &&
        (memory.file_url.includes('.mp4') || memory.file_url.includes('.mov') || memory.file_url.includes('.webm'));
    const icon = isVideo ? '🎬' : '📸';
    const timeLabel = new Date(memory.open_date).toLocaleDateString('en-PH', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const item = document.createElement('div');
    item.className = 'notif-item';
    item.dataset.id = memory.id;
    item.innerHTML = `
        <div class="notif-icon">${icon}</div>
        <div class="notif-text">
            <div class="notif-title">🎉 Your capsule is now open!</div>
            <div class="notif-body">${memory.message || 'A memory from the past is waiting.'}</div>
            <div class="notif-time">Unlocked on ${timeLabel}</div>
        </div>
    `;
    item.addEventListener('click', () => {
        window.location.href = `capsule-detail.html?id=${memory.id}`;
    });
    list.prepend(item);
}

function clearAllNotifications() {
    const list = document.getElementById('notif-list');
    list.innerHTML = '<div class="notif-empty">No notifications yet 🌙</div>';
    updateBadge(0);
    shownNotifIds.clear();
    localStorage.removeItem('capsule_shown_notifs');
}

function playCapsuleOpenSound() {
    const bgMusic = window._bgMusic || document.getElementById('capsuleMusic');
    if (bgMusic && !bgMusic.paused) bgMusic.pause();
    window._capsuleSoundPlaying = true;
    const openSound = new Audio('./capsule-open.mp3');
    openSound.volume = 0.8;
    const resumeBg = () => {
        window._capsuleSoundPlaying = false;
        if (bgMusic) {
            bgMusic.play().then(() => {
                if (window._setMusicPlaying) window._setMusicPlaying(true);
            }).catch(() => {});
        }
    };
    openSound.play()
        .then(() => { openSound.addEventListener('ended', resumeBg, { once: true }); })
        .catch(() => { window._capsuleSoundPlaying = false; });
}

async function checkCapsules(userId) {
    if (!userId) return;
    const now = new Date().toISOString();

    const { data: readyMemories, error } = await supabase
        .from('memories')
        .select('*')
        .lte('open_date', now)
        .eq('is_notified', false)
        .eq('user_id', userId);

    if (error) { console.error('Notification check error:', error); return; }
    if (!readyMemories || readyMemories.length === 0) return;

    let newCount = 0;
    let shouldPlaySound = false;

    for (const memory of readyMemories) {
        if (shownNotifIds.has(memory.id)) continue;
        shownNotifIds.add(memory.id);
        saveShownIds();
        addNotifItem(memory);
        newCount++;

        if (newCount === 1) {
            const isVideo = memory.file_url &&
                (memory.file_url.includes('.mp4') || memory.file_url.includes('.mov'));
            const icon = isVideo ? '🎬' : '📸';
            showToast(`${icon} <strong>Your time capsule is now open!</strong><br>${memory.message || 'Click the bell to view your memory.'}`);
            shouldPlaySound = true;
        }

        if (Notification.permission === 'granted') {
            new Notification('🎉 Your Time Capsule is Open!', {
                body: memory.message || 'A memory from your past is ready!',
                icon: '/favicon.ico'
            });
        }

        await supabase
            .from('memories')
            .update({ is_notified: true })
            .eq('id', memory.id);
    }

    if (shouldPlaySound) playCapsuleOpenSound();

    if (newCount > 0) {
        const badge = document.getElementById('notif-badge');
        const currentCount = parseInt(badge.textContent) || 0;
        updateBadge(currentCount + newCount);
    }
}

async function requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
    }
}

async function init(userId) {
    createNotifBell();
    await requestPermission();
    await checkCapsules(userId);
    setInterval(() => checkCapsules(userId), 60000);
}

export { init };
