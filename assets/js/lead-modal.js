// Lead Modal + Google Sheets integration

const LEAD_ENDPOINT = "COLE_AQUI_A_URL_DO_WEB_APP";

const leadCta = document.getElementById("leadCta");
const leadModal = document.getElementById("leadModal");
const leadClose = document.getElementById("leadClose");
const leadForm = document.getElementById("leadForm");
const leadStatus = document.getElementById("leadStatus");
const leadSubmit = document.getElementById("leadSubmit");

let lastFocusedEl = null;

function openLeadModal() {
  lastFocusedEl = document.activeElement;
  leadModal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLeadModal() {
  leadModal.classList.remove("open");
  document.body.style.overflow = "";
  lastFocusedEl?.focus();
}

leadCta.addEventListener("click", openLeadModal);
leadClose.addEventListener("click", closeLeadModal);

leadModal.addEventListener("click", (e) => {
  if (e.target === leadModal) closeLeadModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && leadModal.classList.contains("open")) {
    closeLeadModal();
  }
});

leadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  leadSubmit.disabled = true;

  const data = {
    name: leadForm.name.value.trim(),
    email: leadForm.email.value.trim(),
    phone: leadForm.phone.value.trim(),
    whatsapp: leadForm.whatsapp.value.trim(),
    city: leadForm.city.value.trim(),
    state: leadForm.state.value.trim(),
    company: leadForm.company.value.trim(),
    role: leadForm.role.value.trim(),
    page_url: window.location.href,
    user_agent: navigator.userAgent,
  };

  try {
    leadStatus.textContent = "Enviando…";

    await fetch(LEAD_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data),
    });

    leadStatus.textContent = "Recebido! Entraremos em contato.";
    leadForm.reset();
    setTimeout(closeLeadModal, 800);

  } catch {
    leadStatus.textContent = "Erro ao enviar. Tente novamente.";
  } finally {
    leadSubmit.disabled = false;
  }
});

