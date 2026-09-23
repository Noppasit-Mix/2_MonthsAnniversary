(function () {
"use strict";
document.documentElement.classList.add("js");

/* =======================================================
   ⚙️ CONFIG — แก้แค่ตรงนี้พอ
   ======================================================= */
const CONFIG = {
  startDate: "2026-07-24T20:00:00", // วันที่เริ่มคบกัน
  partnerName: "ปีใหม่",             // ชื่อเล่นแฟน
  yourName: "มิกซ์",               // ชื่อเรา
  heartCount: 20,                   // จำนวนหัวใจลอยพื้นหลัง
  balloonCount: 10                  // จำนวนลูกโป่งตอนกด Secret
};

/* qs  = หยิบ 1 ตัว | qsa = หยิบทั้งหมด */
const qs  = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

document.addEventListener("DOMContentLoaded", () => {
  initCounter();
  initHearts();
  initReveal();
  initFlipCards();
  initEnvelope();
  initMusic();
  initTheme();
  initSecret();
  initNames();
  initQuizGate();
});

/* ---------- ชื่อใน footer ---------- */
function initNames() {
  const n = qs("#footName"), m = qs("#footMe");
  if (n) n.textContent = CONFIG.partnerName;
  if (m) m.textContent = CONFIG.yourName;
}

/* ---------- ตัวนับเวลา ---------- */
function initCounter() {
  const start = new Date(CONFIG.startDate);
  const since = qs("#sinceDate");
  if (since && !isNaN(start)) {
    since.textContent = start.toLocaleDateString("th-TH", {
      day: "numeric", month: "long", year: "numeric"
    });
  }
  const els = { d: qs("#cDays"), h: qs("#cHours"), m: qs("#cMins"), s: qs("#cSecs") };

  const tick = () => {
    let diff = Date.now() - start.getTime();
    if (diff < 0) diff = 0;
    const sec = Math.floor(diff / 1000);
    const set = (el, v, pad) => {
      if (!el) return;
      const txt = pad ? String(v).padStart(2, "0") : String(v);
      if (el.textContent !== txt) el.textContent = txt;
    };
    set(els.d, Math.floor(sec / 86400));
    set(els.h, Math.floor(sec / 3600) % 24, true);
    set(els.m, Math.floor(sec / 60) % 60, true);
    set(els.s, sec % 60, true);
  };
  tick();
  setInterval(tick, 1000);
}

/* ---------- หัวใจลอยพื้นหลัง ---------- */
function initHearts() {
  const box = qs("#heartsBg");
  if (!box) return;
  const glyphs = ["💗", "💕", "🤍", "🌸", "✿", "💞"];
  for (let i = 0; i < CONFIG.heartCount; i++) {
    const h = document.createElement("span");
    h.className = "heart-float";
    h.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    h.style.left = Math.random() * 100 + "%";
    h.style.fontSize = 12 + Math.random() * 22 + "px";
    h.style.animationDuration = 13 + Math.random() * 16 + "s";
    h.style.animationDelay = -Math.random() * 25 + "s";
    box.appendChild(h);
  }
}

/* ---------- Reveal ตอนเลื่อน (มีตาข่ายกันตก) ---------- */
function initReveal() {
  const items = qsa(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach(el => el.classList.add("visible"));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add("visible"), i * 90);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: "0px 0px -40px 0px" });

  items.forEach(el => io.observe(el));

  // 🔒 กันพลาด: 2.5 วิ ถ้าอันไหนอยู่ในจอแล้วยังไม่โผล่ ให้โชว์เลย
  setTimeout(() => {
    items.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("visible");
    });
  }, 2500);
}

/* ---------- การ์ดพลิก ---------- */
function initFlipCards() {
  qsa(".flip-card").forEach(card => {
    const toggle = () => card.classList.toggle("is-flipped");
    card.addEventListener("click", toggle);
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
  });
}

/* ---------- ซองจดหมาย ---------- */
function initEnvelope() {
  const env = qs("#envelope"), overlay = qs("#letterOverlay"),
        close = qs("#paperClose"), hint = qs("#envHint");
  if (!env || !overlay) return;

  const open = () => {
    env.classList.add("open");
    if (hint) hint.textContent = "💗";
    setTimeout(() => {
      overlay.classList.add("show");
      overlay.setAttribute("aria-hidden", "false");
      fireConfetti(60);
    }, 850);
  };
  const hide = () => {
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden", "true");
    env.classList.remove("open");
    if (hint) hint.textContent = "อ่านอีกรอบได้นะ";
  };

  env.addEventListener("click", open);
  if (close) close.addEventListener("click", hide);
  overlay.addEventListener("click", e => { if (e.target === overlay) hide(); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && overlay.classList.contains("show")) hide();
  });
}

/* ---------- เพลง ---------- */
/* ---------- เพลง ---------- */
function initMusic() {
  const btn = qs("#musicBtn"), audio = qs("#bgm");
  const slider = qs("#volumeSlider");
  if (!btn || !audio) return;
  
  // ตั้งค่าระดับเสียงเริ่มต้น
  audio.volume = slider ? slider.value : 0.45;

  if (slider) {
    slider.addEventListener("input", (e) => {
      audio.volume = e.target.value;
    });
  }

  btn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play()
        .then(() => { 
          btn.classList.add("playing"); 
          btn.textContent = "🎶"; 
          if (slider) slider.classList.add("show"); // แสดงแถบระดับเสียง
        })
        .catch(() => { 
          btn.textContent = "🚫"; 
          setTimeout(() => btn.textContent = "🎵", 1400); 
        });
    } else {
      audio.pause();
      btn.classList.remove("playing");
      btn.textContent = "🎵";
      if (slider) slider.classList.remove("show"); // ซ่อนแถบระดับเสียง
    }
  });

  // เผื่อกรณีเพลงหยุดเล่นเอง
  audio.addEventListener("ended", () => {
    btn.classList.remove("playing");
    btn.textContent = "🎵";
    if (slider) slider.classList.remove("show");
  });
}

/* ---------- ธีมสว่าง/มืด ---------- */
function initTheme() {
  const btn = qs("#themeBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const dark = document.body.classList.toggle("dark");
    btn.textContent = dark ? "☀️" : "🌙";
  });
}

/* ---------- ปุ่ม Secret ---------- */
function initSecret() {
  const btn = qs("#secretBtn"), msg = qs("#secretMsg");
  if (!btn) return;
  btn.addEventListener("click", () => {
    fireConfetti(160);
    launchBalloons(CONFIG.balloonCount);
    if (msg) msg.classList.add("show");
    btn.textContent = "อีกรอบก็ได้นะ 💗";
  });
}

/* =======================================================
   🎉 CONFETTI
   ======================================================= */
const confetti = (() => {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return { fire: () => {} };
  const ctx = canvas.getContext("2d");
  const colors = ["#f7b3c2", "#e58aa0", "#c98a75", "#ffd9c0", "#fff1e6", "#f3a8b8"];
  let parts = [], raf = null, dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  function drawHeart(x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.3);
    ctx.bezierCurveTo(x, y, x - s, y, x - s, y + s * 0.35);
    ctx.bezierCurveTo(x - s, y + s * 0.8, x, y + s * 1.1, x, y + s * 1.35);
    ctx.bezierCurveTo(x, y + s * 1.1, x + s, y + s * 0.8, x + s, y + s * 0.35);
    ctx.bezierCurveTo(x + s, y, x, y, x, y + s * 0.3);
    ctx.fill();
  }

  function loop() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    parts = parts.filter(p => p.y < window.innerHeight + 60 && p.life > 0);
    parts.forEach(p => {
      p.vy += 0.12; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 0.4;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 60));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.heart) drawHeart(0, 0, p.size * 0.55);
      else ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    });
    if (parts.length) raf = requestAnimationFrame(loop);
    else { cancelAnimationFrame(raf); raf = null; ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); }
  }

  function fire(count = 120) {
    const W = window.innerWidth, H = window.innerHeight;
    for (let i = 0; i < count; i++) {
      parts.push({
        x: W / 2 + (Math.random() - 0.5) * W * 0.55,
        y: H * 0.62 + Math.random() * 40,
        vx: (Math.random() - 0.5) * 11,
        vy: -(7 + Math.random() * 9),
        size: 6 + Math.random() * 9,
        color: colors[(Math.random() * colors.length) | 0],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.25,
        heart: Math.random() < 0.32,
        life: 150 + Math.random() * 90
      });
    }
    if (parts.length > 700) parts.splice(0, parts.length - 700);
    if (!raf) raf = requestAnimationFrame(loop);
  }
  return { fire };
})();

function fireConfetti(n) { confetti.fire(n); }

/* =======================================================
   🎈 BALLOONS
   ======================================================= */
function launchBalloons(count = 12) {
  const colors = ["#f7b3c2", "#e58aa0", "#ffd9c0", "#c98a75", "#ffe3ea", "#f6c8b6"];
  for (let i = 0; i < count; i++) {
    const b = document.createElement("div");
    b.className = "balloon";
    b.style.left = Math.random() * 92 + "vw";
    b.style.background = colors[(Math.random() * colors.length) | 0];
    b.style.setProperty("--drift", (Math.random() - 0.5) * 130 + "px");
    b.style.animationDuration = 6 + Math.random() * 5 + "s";
    b.style.animationDelay = Math.random() * 1.2 + "s";
    b.style.transform = `scale(${0.7 + Math.random() * 0.7})`;
    document.body.appendChild(b);
    b.addEventListener("animationend", () => b.remove());
    setTimeout(() => b.remove(), 13000);
  }
}

/* ---------- QUIZ GATE (ด่านคำถามก่อนเข้าเว็บ) ---------- */
function initQuizGate() {
  const gate = qs("#quizGate");
  if (!gate) return;

  const cards = qsa(".quiz-card", gate);
  const answeredCorrect = [false, false, false];

  // 👇 กำหนดข้อความตอบผิดของแต่ละข้อเรียงตามลำดับ (ข้อ 1, ข้อ 2, ข้อ 3) 👇
  const wrongMessages = [
    "แมวหรือใหม่ทัก 😏",      // ข้อความสำหรับข้อ 1 (cardIdx = 0)
    "คนทักจำไม่ได้ละงัยย",         // ข้อความสำหรับข้อ 2 (cardIdx = 1)
    "โอเครร๊๊"                   // ข้อความสำหรับข้อ 3 (cardIdx = 2)
  ];

  cards.forEach((card, cardIdx) => {
    const btns = qsa(".quiz-btn", card);

    btns.forEach(btn => {
      btn.addEventListener("click", () => {
        const isCorrect = btn.getAttribute("data-correct") === "true";

        if (isCorrect) {
          btn.classList.add("btn-correct");
          card.classList.add("is-correct");
          btns.forEach(b => b.disabled = true); // ล็อกตัวเลือกข้อนั้น
          answeredCorrect[cardIdx] = true;

          // ถ้าเคยตอบผิดไปแล้ว พอตอบถูกให้ซ่อนข้อความเตือน
          const existingMsg = card.querySelector(".quiz-wrong-msg");
          if (existingMsg) existingMsg.style.display = "none";

          // ถ้าตอบถูกครบทั้ง 3 ข้อ
          if (answeredCorrect.every(Boolean)) {
            setTimeout(() => {
              fireConfetti(180);
              gate.classList.add("unlocked");
              document.body.classList.remove("locked");

              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: "instant" });
                if (typeof initReveal === "function") initReveal();
              }, 300);
            }, 600);
          }
        } else {
          // ตอบผิด จะเป็นสีแดง สั่นเตือน และเลือกตอบข้ออื่นต่อได้
          btn.classList.add("btn-wrong");
          btn.disabled = true;
          card.classList.remove("shake");
          void card.offsetWidth; // รีเซ็ต animation
          card.classList.add("shake");

          // === แสดงข้อความเมื่อตอบผิดตามแต่ละข้อ ===
          let wrongMsg = card.querySelector(".quiz-wrong-msg");
          if (!wrongMsg) {
            wrongMsg = document.createElement("p");
            wrongMsg.className = "quiz-wrong-msg";
            card.appendChild(wrongMsg);
          }
          // ดึงข้อความจาก Array ด้านบนมาแสดง ตามลำดับของข้อ (cardIdx)
          wrongMsg.innerHTML = wrongMessages[cardIdx];
        }
      });
    });
  });
}

})();