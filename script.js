/* =========================================
   1. SMOOTH INERTIA SCROLL & NAVIGATION
   ========================================= */
let targetScroll = window.scrollY;
let currentScroll = window.scrollY;
let isInertiaActive = true;

function luncurkanScrollKe(posisiY) {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    targetScroll = Math.max(0, Math.min(maxScroll, posisiY));
    isInertiaActive = true;
}

window.addEventListener("wheel", function (e) {
    if (e.ctrlKey) return;
    e.preventDefault();
    luncurkanScrollKe(targetScroll + e.deltaY * 0.95);
}, { passive: false });

window.addEventListener("scroll", function () {
    if (!isInertiaActive) {
        targetScroll = window.scrollY;
        currentScroll = window.scrollY;
    }
}, { passive: true });

document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
            e.preventDefault();
            luncurkanScrollKe(targetEl.offsetTop);
        }
    });
});

/* =========================================
   2. INTRO SCREEN
   ========================================= */
(function initIntroScreen() {
    const intro = document.getElementById("intro-screen");
    const video = document.getElementById("intro-video");
    let sudahMulai = false;

    function mulaiHalamanUtama() {
        if (sudahMulai) return;
        sudahMulai = true;

        if (intro) {
            intro.classList.add("fade-out");
            setTimeout(function () {
                intro.style.display = "none";
            }, 700);
        }
        setTimeout(function () {
            document.body.classList.add("page-loaded");
        }, 200);
    }

    if (video) {
        video.addEventListener("ended", mulaiHalamanUtama);
        video.addEventListener("error", mulaiHalamanUtama);
        setTimeout(mulaiHalamanUtama, 3500);
    } else if (document.readyState === "complete") {
        mulaiHalamanUtama();
    } else {
        window.addEventListener("load", mulaiHalamanUtama);
        setTimeout(mulaiHalamanUtama, 1500);
    }
})();

/* =========================================
   3. MOTTO WORD HIGHLIGHT & RENDER LOOP
   ========================================= */
const mottoEl = document.getElementById("motto-text");
let kataKataMotto = [];

if (mottoEl) {
    const teksAsli = mottoEl.textContent.trim();
    mottoEl.innerHTML = teksAsli
        .split(/\s+/)
        .map(function (kata) {
            return '<span class="word">' + kata + '</span>';
        })
        .join(" ");
    kataKataMotto = mottoEl.querySelectorAll(".word");
}

const cursorGlow = document.getElementById("cursor-glow");
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let glowX = mouseX;
let glowY = mouseY;

window.addEventListener("mousemove", function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
}, { passive: true });

function renderLoop() {
    if (isInertiaActive) {
        const selisih = targetScroll - currentScroll;
        if (Math.abs(selisih) > 0.1) {
            currentScroll += selisih * 0.075;
            window.scrollTo(0, currentScroll);
        } else {
            currentScroll = targetScroll;
            isInertiaActive = false;
        }
    }

    const tinggiLayar = window.innerHeight;

    document.querySelectorAll(".reveal").forEach(function (el) {
        if (el.getBoundingClientRect().top < tinggiLayar - 60) {
            el.classList.add("active");
        }
    });

    const trackMotto = document.getElementById("motto-section");
    if (trackMotto && kataKataMotto.length > 0) {
        const rect = trackMotto.getBoundingClientRect();
        const jarakScrollMaks = rect.height - tinggiLayar;
        let progres = -rect.top / jarakScrollMaks;
        progres = Math.max(0, Math.min(1, progres));

        const totalKata = kataKataMotto.length;
        kataKataMotto.forEach(function (spanKata, index) {
            const titikMulai = index / totalKata;
            const titikSelesai = (index + 1.4) / totalKata;
            let tingkatTerang = (progres - titikMulai) / (titikSelesai - titikMulai);
            tingkatTerang = Math.max(0, Math.min(1, tingkatTerang));
            spanKata.style.opacity = (0.16 + tingkatTerang * 0.84).toFixed(3);
        });
    }

    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;
    if (cursorGlow) {
        cursorGlow.style.left = glowX + "px";
        cursorGlow.style.top = glowY + "px";
    }

    requestAnimationFrame(renderLoop);
}

renderLoop();

/* =========================================
   4. GALLERY & LIGHTBOX
   ========================================= */
let galeriTerbuka = false;

function toggleMoreArt() {
    const karyaEkstra = document.querySelectorAll(".extra-art");
    const labelBtn = document.getElementById("more-btn-label");
    const subBtn = document.getElementById("more-btn-sub");

    galeriTerbuka = !galeriTerbuka;

    karyaEkstra.forEach(function (kartu) {
        kartu.classList.toggle("hidden-art", !galeriTerbuka);
    });

    if (galeriTerbuka) {
        labelBtn.textContent = "Less -";
        subBtn.textContent = "Tutup karya tambahan";
    } else {
        labelBtn.textContent = "More +";
        subBtn.textContent = "Lihat semua karya";
    }
}

function bukaLightbox(srcGambar, judul, deskripsi) {
    const modal = document.getElementById("art-lightbox");
    document.getElementById("lightbox-img").src = srcGambar;
    document.getElementById("lightbox-title").textContent = judul;
    document.getElementById("lightbox-desc").textContent = deskripsi;
    modal.classList.add("open");
}

function tutupLightbox(e) {
    if (e.target.id === "art-lightbox" || e.target.classList.contains("lightbox-close")) {
        document.getElementById("art-lightbox").classList.remove("open");
    }
}

function bukaVideoLightbox() {
    const modalVideo = document.getElementById("video-lightbox");
    const player = document.getElementById("full-showcase-video");
    const bgVideoSource = document.querySelector(".gallery-bg-video source");
    const bgVideo = document.querySelector(".gallery-bg-video");

    if (modalVideo && player) {
        const sumberAsli = bgVideoSource ? bgVideoSource.getAttribute("src") : (bgVideo ? bgVideo.currentSrc : "");
        if (sumberAsli && player.getAttribute("src") !== sumberAsli) {
            player.src = sumberAsli;
            player.load();
        }

        modalVideo.classList.add("open");
        player.currentTime = 0;
        player.play().catch(function () {});
    }
}

function tutupVideoLangsung() {
    const modalVideo = document.getElementById("video-lightbox");
    const player = document.getElementById("full-showcase-video");
    if (modalVideo) modalVideo.classList.remove("open");
    if (player) player.pause();
}

function tutupVideoLightbox(e) {
    if (e.target.id === "video-lightbox") {
        tutupVideoLangsung();
    }
}

/* =========================================
   5. EXPERIENCE TABS & SCROLL SYNC
   ========================================= */
function aktifkanTabExp(targetId) {
    document.querySelectorAll(".exp-tab-btn").forEach(function (btn) {
        btn.classList.toggle("active", btn.getAttribute("data-target") === targetId);
    });

    document.querySelectorAll(".exp-detail-card").forEach(function (kartu) {
        kartu.classList.toggle("active", kartu.getAttribute("data-exp") === targetId);
    });
}

function pilihTabExp(targetId) {
    aktifkanTabExp(targetId);
    const kartu = document.querySelector('.exp-detail-card[data-exp="' + targetId + '"]');
    if (kartu) {
        const posisiTujuan = kartu.getBoundingClientRect().top + window.scrollY - 130;
        luncurkanScrollKe(posisiTujuan);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".exp-tab-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            pilihTabExp(btn.getAttribute("data-target"));
        });
    });
});

setInterval(function () {
    const kartuList = document.querySelectorAll(".exp-detail-card");
    if (kartuList.length === 0) return;

    const batasBaca = window.innerHeight * 0.45;
    let idAktif = kartuList[0].getAttribute("data-exp");

    kartuList.forEach(function (kartu) {
        if (kartu.getBoundingClientRect().top <= batasBaca) {
            idAktif = kartu.getAttribute("data-exp");
        }
    });

    const kartuTerakhir = kartuList[kartuList.length - 1];
    const rectTerakhir = kartuTerakhir.getBoundingClientRect();
    if (rectTerakhir.bottom <= window.innerHeight * 0.85 && rectTerakhir.bottom > 100) {
        idAktif = kartuTerakhir.getAttribute("data-exp");
    }

    aktifkanTabExp(idAktif);
}, 120);

/* =========================================
   6. SPECIALIZATION WRITE-UP & SLIDER
   ========================================= */
const dataSlideRole = {
    modeler: {
        index: 0,
        gambar: ["img/environtment 1.png", "img/putin's kremlin office.png"]
    },
    character: {
        index: 0,
        gambar: ["img/an225.png", "img/an225 model.png"]
    }
};

function bukaWriteUpRole(articleId) {
    const overlay = document.getElementById("role-writeup-page");
    document.querySelectorAll(".writeup-article").forEach(function (el) {
        el.classList.add("hidden-writeup");
    });

    const target = document.getElementById(articleId);
    if (target) {
        target.classList.remove("hidden-writeup");
    }

    if (overlay) {
        overlay.scrollTop = 0;
        overlay.classList.add("open");
        document.body.style.overflow = "hidden";
    }
}

function tutupWriteUpRole() {
    const overlay = document.getElementById("role-writeup-page");
    if (overlay) {
        overlay.classList.remove("open");
        document.body.style.overflow = "";
    }
}

function geserSlideRole(kategori, arah) {
    const data = dataSlideRole[kategori];
    if (!data) return;

    const imgEl = document.getElementById("slider-img-" + kategori);
    const countEl = document.getElementById("slider-count-" + kategori);

    data.index = (data.index + arah + data.gambar.length) % data.gambar.length;

    if (imgEl) {
        imgEl.classList.add("fading");
        setTimeout(function () {
            imgEl.src = data.gambar[data.index];
            imgEl.classList.remove("fading");
        }, 150);
    }

    if (countEl) {
        countEl.textContent = (data.index + 1) + " / " + data.gambar.length;
    }
}

const roleOverlay = document.getElementById("role-writeup-page");
if (roleOverlay) {
    roleOverlay.addEventListener("wheel", function (e) {
        if (roleOverlay.classList.contains("open")) {
            e.stopPropagation();
            roleOverlay.scrollTop += e.deltaY;
        }
    }, { passive: false });
}

window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        tutupVideoLangsung();
        tutupWriteUpRole();
        const modalGambar = document.getElementById("art-lightbox");
        if (modalGambar) modalGambar.classList.remove("open");
    }
});

/* =========================================
   7. CONTACT & UTILITIES
   ========================================= */
function salinEmail() {
    const emailEl = document.getElementById("user-email-text");
    const btnEl = document.getElementById("copy-email-btn");
    if (!emailEl || !btnEl) return;

    navigator.clipboard.writeText(emailEl.textContent.trim()).then(function () {
        btnEl.textContent = "Copied!";
        setTimeout(function () {
            btnEl.textContent = "Copy";
        }, 2000);
    });
}

const backToTopBtn = document.getElementById("back-to-top-btn");

window.addEventListener("scroll", function () {
    if (!backToTopBtn) return;
    backToTopBtn.classList.toggle("show", window.scrollY > 350);
}, { passive: true });

function kembaliKeAtas() {
    luncurkanScrollKe(0);
}

/* =========================================
   8. NAV SCROLL-SPY & STAGGERED REVEAL
   ========================================= */
(function initNavScrollSpy() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll("nav a[href^='#']");
    if (!sections.length || !navLinks.length) return;

    let ticking = false;
    window.addEventListener("scroll", function () {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                let currentId = "";
                const scrollPos = window.scrollY + 220;

                for (let i = 0; i < sections.length; i++) {
                    const sec = sections[i];
                    if (scrollPos >= sec.offsetTop && scrollPos < sec.offsetTop + sec.offsetHeight) {
                        currentId = sec.getAttribute("id");
                        break;
                    }
                }

                for (let j = 0; j < navLinks.length; j++) {
                    const link = navLinks[j];
                    link.style.color = (currentId && link.getAttribute("href") === "#" + currentId) ? "#ffffff" : "";
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
})();

(function initBiDirectionalScrollReveal() {
    const targetSelectors = [
        "section:not(#home) .toolbox-header",
        "section:not(#home) h2",
        "section:not(#home) h3",
        "section:not(#home) p",
        ".profile-grid > div",
        ".gallery-grid-2x2 > *",
        ".toolbox-row",
        ".skills-grid > *",
        ".exp-interactive-layout > *",
        ".role-showcase-row",
        ".motto-words",
        ".contact-group-box",
        ".social-row-item",
        ".direct-contact-card"
    ];

    const elements = document.querySelectorAll(targetSelectors.join(", "));
    if (!elements.length) return;

    elements.forEach(function (el) {
        el.classList.add("scroll-item");

        const parent = el.parentElement;
        if (parent) {
            const siblings = Array.from(parent.children).filter(function (child) {
                return child.matches(targetSelectors.join(", "));
            });
            const indexInRow = siblings.indexOf(el);
            if (indexInRow > 0) {
                const delay = Math.min(indexInRow * 75, 360);
                el.style.setProperty("--stagger-delay", delay + "ms");
            }
        }
    });

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
            } else if (entry.boundingClientRect.top > 0) {
                entry.target.classList.remove("is-visible");
            }
        });
    }, {
        root: null,
        rootMargin: "0px 0px -60px 0px",
        threshold: 0.08
    });

    elements.forEach(function (el) {
        observer.observe(el);
    });
})();

(function initCustomScrollIndicator() {
    const thumb = document.getElementById("custom-scroll-thumb");
    if (!thumb) return;

    const trackHeight = 110;
    const thumbHeight = 36;
    const maxTravel = trackHeight - thumbHeight;
    let ticking = false;

    function updateScrollThumb() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;

        thumb.style.transform = "translateY(" + (progress * maxTravel).toFixed(2) + "px)";
        ticking = false;
    }

    window.addEventListener("scroll", function () {
        if (!ticking) {
            window.requestAnimationFrame(updateScrollThumb);
            ticking = true;
        }
    }, { passive: true });

    window.addEventListener("resize", updateScrollThumb, { passive: true });
    updateScrollThumb();
})();