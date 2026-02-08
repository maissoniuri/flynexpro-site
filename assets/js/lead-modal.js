// assets/js/lead-modal.js
(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  // ✅ URL do Google Apps Script (Web App)
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzTsIyNYezrDV6jn61IijxLYTy7CDEGnalPYsHqUD6CrX__c6ry9C0Sk4V1P5ER__o/exec";

  function setStatus(el, msg, kind) {
    if (!el) return;
    el.textContent = msg || "";
    el.style.marginLeft = "0.75rem";
    el.style.fontSize = "0.9rem";
    el.style.color =
      kind === "ok"
        ? "rgba(180,255,210,0.92)"
        : kind === "err"
        ? "rgba(255,190,190,0.92)"
        : "rgba(255,255,255,0.72)";
  }

  async function postToAppsScript(payload) {
    // 1) Tenta normal (para conseguir ler resposta)
    try {
      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // evita preflight em muitos casos
        body: JSON.stringify(payload),
      });

      const text = await res.text().catch(() => "");

      // Se o Apps Script retornar JSON: {"ok":true}
      // ou texto simples "ok"
      let ok = res.ok;
      if (text) {
        try {
          const maybe = JSON.parse(text);
          if (typeof maybe?.ok === "boolean") ok = ok && maybe.ok;
        } catch {
          // se não for JSON, ok continua res.ok
        }
      }
      return { ok, text, opaque: false };
    } catch (err) {
      // 2) Fallback: no-cors (não dá pra ler resposta, mas costuma gravar na planilha)
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      return { ok: true, text: "", opaque: true };
    }
  }

  ready(() => {
    const cta = document.getElementById("leadCta");
    const modal = document.getElementById("leadModal");
    const closeBtn = document.getElementById("leadClose");

    const form = document.getElementById("leadForm");
    const statusEl = document.getElementById("leadStatus");
    const submitBtn = document.getElementById("leadSubmit");

    if (!cta || !modal || !closeBtn || !form || !statusEl || !submitBtn) return;

    // estado inicial fechado
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    modal.style.display = "none";
    cta.setAttribute("aria-expanded", "false");

    function openLead() {
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      modal.style.display = "flex";
      cta.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      setStatus(statusEl, "", "idle");
      closeBtn.focus({ preventScroll: true });
    }

    function closeLead() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      modal.style.display = "none";
      cta.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      setStatus(statusEl, "", "idle");
      cta.focus({ preventScroll: true });
    }

    cta.addEventListener("click", openLead);
    closeBtn.addEventListener("click", closeLead);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeLead();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("open")) closeLead();
    });

    // ✅ Submit
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // honeypot anti-bot
      const hpInput = form.querySelector('input[name="website"]');
      const hp = (hpInput?.value || "").trim();
      if (hp) return;

      if (!SCRIPT_URL || !SCRIPT_URL.includes("script.google.com/macros/s/")) {
        setStatus(statusEl, "Configuração pendente: SCRIPT_URL inválida.", "err");
        return;
      }

      const data = new FormData(form);
      const payload = {
        website: String(data.get("website") || ""),
        name: String(data.get("name") || "").trim(),
        email: String(data.get("email") || "").trim(),
        phone: String(data.get("phone") || "").trim(),
        whatsapp: String(data.get("whatsapp") || "").trim(),
        city: String(data.get("city") || "").trim(),
        state: String(data.get("state") || "").trim(),
        company: String(data.get("company") || "").trim(),
        role: String(data.get("role") || "").trim(),
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        ts: new Date().toISOString(),
      };

      if (!payload.name || !payload.email) {
        setStatus(statusEl, "Preencha Nome e E-mail.", "err");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.7";
      setStatus(statusEl, "Enviando…", "idle");

      try {
        const result = await postToAppsScript(payload);

        if (!result.ok) {
          setStatus(
            statusEl,
            "Falha ao enviar. Verifique permissões do Web App (implantação) e a planilha.",
            "err"
          );
          return;
        }

        setStatus(statusEl, "✅ Enviado com sucesso! Em breve entraremos em contato.", "ok");
        form.reset();

        setTimeout(() => {
          closeLead();
          setStatus(statusEl, "", "idle");
        }, 900);
      } catch (err) {
        console.error(err);
        setStatus(statusEl, "Erro ao enviar. Tente novamente.", "err");
      } finally {
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
      }
    });
  });
})();
