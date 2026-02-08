// assets/js/lead-modal.js
(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  // ✅ Cole aqui a URL do seu Google Apps Script (Web App)
  // Ex.: "https://script.google.com/macros/s/XXXX/exec"
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzTsIyNYezrDV6jn61IijxLYTy7CDEGnalPYsHqUD6CrX__c6ry9C0Sk4V1P5ER__o/exec";

  ready(() => {
    const cta = document.getElementById("leadCta");
    const modal = document.getElementById("leadModal");
    const closeBtn = document.getElementById("leadClose");

    // ✅ form + UI
    const form = document.getElementById("leadForm");
    const statusEl = document.getElementById("leadStatus");
    const submitBtn = document.getElementById("leadSubmit");

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

    // =========================
    // ✅ Envio para Google Sheets (Apps Script Web App)
    // =========================
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // honeypot anti-bot
        const hp = (form.elements.website?.value || "").trim();
        if (hp) return;

        if (!SCRIPT_URL || SCRIPT_URL.includes("COLE_AQUI")) {
          if (statusEl) statusEl.textContent = "Configuração pendente: falta SCRIPT_URL.";
          return;
        }

        const payload = {
          name: document.getElementById("leadName")?.value.trim() || "",
          email: document.getElementById("leadEmail")?.value.trim() || "",
          phone: document.getElementById("leadPhone")?.value.trim() || "",
          whatsapp: document.getElementById("leadWhatsapp")?.value.trim() || "",
          city: document.getElementById("leadCity")?.value.trim() || "",
          state: document.getElementById("leadState")?.value.trim() || "",
          company: document.getElementById("leadCompany")?.value.trim() || "",
          role: document.getElementById("leadRole")?.value.trim() || "",
          page_url: window.location.href,
          user_agent: navigator.userAgent,
        };

        try {
          if (submitBtn) submitBtn.disabled = true;
          if (statusEl) statusEl.textContent = "Enviando...";

          // text/plain evita preflight chato em muitos casos
          const res = await fetch(SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload),
          });

          const json = await res.json().catch(() => ({}));
          if (!res.ok || !json.ok) {
            throw new Error(json.error || `Falha ao salvar (${res.status})`);
          }

          if (statusEl) statusEl.textContent = "Enviado! ✅";
          form.reset();

          // fecha modal após um tempinho
          setTimeout(() => {
            closeLead();
            if (statusEl) statusEl.textContent = "";
          }, 700);
        } catch (err) {
          console.error(err);
          if (statusEl) statusEl.textContent = "Erro ao enviar. Tente novamente.";
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }
  });
})();
