// assets/js/lead-modal.js
(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(() => {
    const cta = document.getElementById("leadCta");
    const modal = document.getElementById("leadModal");
    const closeBtn = document.getElementById("leadClose");

    if (!cta || !modal || !closeBtn) return;

    // garante estado inicial fechado
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    modal.style.display = "none";
    cta.setAttribute("aria-expanded", "false");

    function openLead() {
      modal.classList.add("open");              // ✅ principal (CSS)
      modal.setAttribute("aria-hidden", "false");
      modal.style.display = "flex";             // ✅ fallback se o CSS falhar
      cta.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";

      // foco acessível
      closeBtn.focus({ preventScroll: true });
    }

    function closeLead() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      modal.style.display = "none";
      cta.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";

      // devolve foco
      cta.focus({ preventScroll: true });
    }

    cta.addEventListener("click", openLead);
    closeBtn.addEventListener("click", closeLead);

    // clicar fora do painel fecha
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeLead();
    });

    // ESC fecha
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("open")) closeLead();
    });
  });
})();
