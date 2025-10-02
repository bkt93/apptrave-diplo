function navBg() {
    const nav = document.querySelector('#navbar .navbar-overlay');
    if (!nav) return;

    const NAV_SCROLL = 20; // esto puede variar un poco, en 20px queda bien
    const applyClass = () => {
        nav.classList.toggle('navbar-solid', window.scrollY > NAV_SCROLL);
    };

    applyClass();
    window.addEventListener('scroll', applyClass, { passive: true });
}

function loadNav() {
    fetch('navbar.html')
        .then(r => r.text())
        .then(html => {
            document.getElementById('navbar').innerHTML = html;

            const current = (location.pathname.split('/').pop() || 'index.html'); // uso método pop para las rutas

            document.querySelectorAll('#navbar .nav-link').forEach(a => {
                const href = a.getAttribute('href');
                if (href === current || (current === 'index.html' && href === 'home.html')) {
                    a.classList.add('active');
                }
            });

            navBg(); // acá llamo a la function, al añadir esta nueva función para llamar al nav, debo incluirla o no se me activa el background para el nav
        });
}

document.addEventListener('DOMContentLoaded', loadNav);



// esta function la obtuve de stackoverflow para no utilizar una librería de galería
(function () {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    function init() {
        const grid = document.querySelector(".galeria-grid");
        const lightbox = document.querySelector(".lightbox");
        const img = document.querySelector(".lightbox-img");
        const btnClose = document.querySelector(".lb-close");
        const btnIn = document.querySelector(".lb-zoom-in");
        const btnOut = document.querySelector(".lb-zoom-out");
        const btnReset = document.querySelector(".lb-reset");

        if (!grid || !lightbox || !img) return;

        let scale = 1, posX = 0, posY = 0;
        let isPanning = false, startX = 0, startY = 0;

        function applyTransform() {
            img.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
        }
        function resetTransform() { scale = 1; posX = 0; posY = 0; applyTransform(); }

        function openLightbox(src) {
            img.src = src;
            lightbox.classList.add("is-open");
            lightbox.setAttribute("aria-hidden", "false");
            resetTransform();
            setTimeout(() => lightbox.focus(), 0);
            document.body.style.overflow = "hidden";
        }
        function closeLightbox() {
            lightbox.classList.remove("is-open");
            lightbox.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }

        function zoom(delta, centerX, centerY) {
            const prevScale = scale;
            scale = Math.min(6, Math.max(1, scale + delta));
            if (centerX != null && centerY != null) {
                const rect = img.getBoundingClientRect();
                const cx = centerX - rect.left;
                const cy = centerY - rect.top;
                const dx = cx - rect.width / 2;
                const dy = cy - rect.height / 2;
                posX -= (dx / prevScale) * (scale - prevScale);
                posY -= (dy / prevScale) * (scale - prevScale);
            }
            applyTransform();
        }

        // Abrir
        grid.addEventListener("click", (e) => {
            const btn = e.target.closest(".galeria-item");
            if (!btn) return;
            const src = btn.dataset.full || btn.querySelector("img")?.src;
            if (src) openLightbox(src);
        });

        // Cerrar
        btnClose?.addEventListener("click", closeLightbox);
        lightbox.addEventListener("click", (e) => {
            if (e.target.classList.contains("lightbox-backdrop")) closeLightbox();
        });
        window.addEventListener("keydown", (e) => {
            if (!lightbox.classList.contains("is-open")) return;
            if (e.key === "Escape") closeLightbox();
            if (e.key === "+" || (e.key === "=" && e.shiftKey)) zoom(0.2);
            if (e.key === "-") zoom(-0.2);
            if (e.key === "0") resetTransform();
        });

        // Botones
        btnIn?.addEventListener("click", () => zoom(0.25));
        btnOut?.addEventListener("click", () => zoom(-0.25));
        btnReset?.addEventListener("click", resetTransform);

        // Wheel zoom
        lightbox.addEventListener("wheel", (e) => {
            if (!lightbox.classList.contains("is-open")) return;
            e.preventDefault();
            const delta = e.deltaY < 0 ? 0.15 : -0.15;
            zoom(delta, e.clientX, e.clientY);
        }, { passive: false });

        // Pan (mouse)
        lightbox.addEventListener("mousedown", (e) => {
            if (!lightbox.classList.contains("is-open")) return;
            if (e.target.closest(".lightbox-ui") || e.target === btnClose) return;
            isPanning = true;
            startX = e.clientX - posX;
            startY = e.clientY - posY;
        });
        window.addEventListener("mousemove", (e) => {
            if (!isPanning) return;
            posX = e.clientX - startX;
            posY = e.clientY - startY;
            applyTransform();
        });
        window.addEventListener("mouseup", () => { isPanning = false; });

        // Pan/Zoom (touch)
        let touchStartDist = 0;
        function distance(t1, t2) {
            const dx = t1.clientX - t2.clientX;
            const dy = t1.clientY - t2.clientY;
            return Math.hypot(dx, dy);
        }

        lightbox.addEventListener("touchstart", (e) => {
            if (!lightbox.classList.contains("is-open")) return;
            if (e.touches.length === 1) {
                const t = e.touches[0];
                startX = t.clientX - posX;
                startY = t.clientY - posY;
                isPanning = true;
            } else if (e.touches.length === 2) {
                isPanning = false;
                touchStartDist = distance(e.touches[0], e.touches[1]);
            }
        }, { passive: false });

        lightbox.addEventListener("touchmove", (e) => {
            if (!lightbox.classList.contains("is-open")) return;
            if (e.touches.length === 1 && isPanning) {
                const t = e.touches[0];
                posX = t.clientX - startX;
                posY = t.clientY - startY;
                applyTransform();
            } else if (e.touches.length === 2) {
                const newDist = distance(e.touches[0], e.touches[1]);
                const delta = (newDist - touchStartDist) / 300; 
                zoom(delta);
                touchStartDist = newDist;
            }
        }, { passive: false });

        lightbox.addEventListener("touchend", () => { isPanning = false; });
    }
})();

