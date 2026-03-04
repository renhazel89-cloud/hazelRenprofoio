document.addEventListener("DOMContentLoaded", function() {

  const navToggle = document.getElementById("navToggle");
  const overlay = document.getElementById("overlayNav");
  const navClose = document.getElementById("navClose");

  function openNav() {
    if (!overlay) return;
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    if (navToggle) navToggle.setAttribute("aria-expanded", "true");
  }
  function closeNav() {
    if (!overlay) return;
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const isOpen = overlay && overlay.classList.contains("open");
      isOpen ? closeNav() : openNav();
    });
  }
  if (navClose) {
    navClose.addEventListener("click", closeNav);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeNav();
      closeModal();
    }
  });

  /* MODAL */
  const projects = Array.from(document.querySelectorAll(".project-card"));
  const modal = document.getElementById("modal") || document.getElementById("mediaModal");
  const modalBody = document.getElementById("modalBody") || document.getElementById("modalContent");
  const modalCloseBtn = document.getElementById("modalClose");

  function openModalWith(mediaSrc, type) {
    if (!modal || !modalBody) return;
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
    modalBody.innerHTML = "";
    if (type === "video") {
      const video = document.createElement("video");
      video.controls = true;
      video.src = mediaSrc;
      video.style.maxWidth = "100%";
      video.style.maxHeight = "80vh";
      video.playsInline = true;
      video.autoplay = true;
      video.muted = false; // modal plays with sound
      modalBody.appendChild(video);
      video.play().catch(()=>{});
    } else {
      const img = document.createElement("img");
      img.src = mediaSrc;
      img.style.maxWidth = "100%";
      img.style.maxHeight = "80vh";
      modalBody.appendChild(img);
    }
    const dl = document.getElementById("modalDownload");
    if (dl) dl.href = mediaSrc;
  }

  function closeModal() {
    if (!modal || !modalBody) return;
    const v = modalBody.querySelector("video");
    if (v) {
      try { v.pause(); v.src = ""; } catch(e){}
    }
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    modalBody.innerHTML = "";
  }

  /* Attach click/keyboard to open modal */
  projects.forEach(p => {
    p.addEventListener("click", () => {
      const type = p.dataset.type || 'image';
      const src = p.dataset.media || p.getAttribute('data-media') || p.dataset.src || p.getAttribute('data-src');
      if (!src) return;
      openModalWith(src, type);
    });
    p.tabIndex = 0;
    p.addEventListener('keydown', (e) => { if (e.key === 'Enter') p.click(); });

    /* Hover preview for video thumbs */
    const vid = p.querySelector("video.thumb-video");
    if (vid) {
      // ensure video src is set from data-src lazily
      const src = vid.getAttribute("data-src");
      if (src) {
        // also set preload to metadata for quick poster/frame
        vid.preload = "metadata";
        // do not set src until hover to avoid heavy network usage
      }
      let hoverTimer = null;

      p.addEventListener("mouseenter", () => {
        // small delay to avoid accidental plays
        hoverTimer = setTimeout(async () => {
          if (src && !vid.src) vid.src = src;
          try {
            vid.muted = true;
            vid.currentTime = 0;
            await vid.play();
          } catch(e){ /* autoplay may be blocked; ignore */ }
        }, 120);
      });

      p.addEventListener("mouseleave", () => {
        clearTimeout(hoverTimer);
        try {
          vid.pause();
          vid.currentTime = 0;
        } catch(e){}
      });

      // tap on mobile: on first touch, toggle play/pause (so user can preview)
      p.addEventListener("touchstart", (ev) => {
        if (!vid.src && vid.dataset.src) vid.src = vid.dataset.src;
        if (vid.paused) {
          vid.muted = true;
          vid.play().catch(()=>{});
        } else {
          vid.pause();
          vid.currentTime = 0;
        }
      });
    }
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (modal) modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  /* Enhance category cards: if they contain an <img> that failed, keep visual intact */
  const catImgs = document.querySelectorAll(".cat-media img");
  catImgs.forEach(img => {
    img.addEventListener("error", () => {
      // hide broken image and keep background color
      img.style.display = "none";
    });
  });

});