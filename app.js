const STORAGE_KEY = "local-ai-lead-engine-v1";

const sampleLeads = [
  {
    id: crypto.randomUUID(),
    business: "Garcia Roofing Pros",
    contact: "Maria Garcia",
    niche: "Roofing",
    language: "Spanish",
    pain: 5,
    buying: 5,
    appIdea: "AI roof estimate intake and follow-up dashboard",
    link: "Example: Google Maps profile",
    status: "New",
    notes: "Spanish website, mentions free estimates, likely gets missed calls after storms."
  },
  {
    id: crypto.randomUUID(),
    business: "Elite Air & Heat",
    contact: "Owner",
    niche: "HVAC",
    language: "Bilingual",
    pain: 5,
    buying: 4,
    appIdea: "Emergency request triage and appointment scheduler",
    link: "Example: Website",
    status: "Contacted",
    notes: "Se habla espanol on site; no instant quote or online booking."
  },
  {
    id: crypto.randomUUID(),
    business: "Bright Home Cleaning",
    contact: "Sofia",
    niche: "Cleaning",
    language: "Spanish",
    pain: 4,
    buying: 4,
    appIdea: "Cleaning quote calculator and client portal",
    link: "Example: Instagram",
    status: "Replied",
    notes: "Posts in Spanish and English, all bookings appear to happen through DMs."
  },
  {
    id: crypto.randomUUID(),
    business: "Prime Auto Detail",
    contact: "Jay",
    niche: "Auto Detailing",
    language: "English",
    pain: 4,
    buying: 3,
    appIdea: "Mobile detail booking page with upsell packages",
    link: "Example: Facebook",
    status: "Booked",
    notes: "Good reviews and active photos, but no packaged booking flow."
  }
];

let leads = loadLeads();
let activeTemplate = "email";

const form = document.querySelector("#leadForm");
const rows = document.querySelector("#leadRows");
const messageLead = document.querySelector("#messageLead");
const messageBox = document.querySelector("#messageBox");

function loadLeads() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveLeads() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

function scoreLead(lead) {
  const languageBonus = lead.language === "Spanish" || lead.language === "Bilingual" ? 1 : 0;
  return Number(lead.pain || 0) + Number(lead.buying || 0) + languageBonus;
}

function scoreClass(score) {
  if (score >= 10) return "hot";
  if (score >= 8) return "warm";
  return "cold";
}

function render() {
  const search = document.querySelector("#searchInput").value.trim().toLowerCase();
  const language = document.querySelector("#languageFilter").value;
  const status = document.querySelector("#statusFilter").value;
  const filtered = leads
    .filter((lead) => language === "All" || lead.language === language)
    .filter((lead) => status === "All" || lead.status === status)
    .filter((lead) => {
      const blob = `${lead.business} ${lead.contact} ${lead.niche} ${lead.appIdea} ${lead.notes}`.toLowerCase();
      return !search || blob.includes(search);
    })
    .sort((a, b) => scoreLead(b) - scoreLead(a));

  rows.innerHTML = filtered.map((lead) => {
    const score = scoreLead(lead);
    return `
      <tr>
        <td class="score ${scoreClass(score)}">${score}</td>
        <td><strong>${escapeHtml(lead.business)}</strong><br><span>${escapeHtml(lead.contact || "No contact yet")}</span></td>
        <td>${escapeHtml(lead.niche)}</td>
        <td>${escapeHtml(lead.language)}</td>
        <td>${escapeHtml(lead.appIdea || "Needs app angle")}</td>
        <td>${escapeHtml(lead.status)}</td>
        <td>
          <div class="row-actions">
            <button class="secondary" type="button" data-edit="${lead.id}">Edit</button>
            <button class="secondary" type="button" data-delete="${lead.id}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  document.querySelector("#totalMetric").textContent = leads.length;
  document.querySelector("#hotMetric").textContent = leads.filter((lead) => scoreLead(lead) >= 10).length;
  document.querySelector("#spanishMetric").textContent = leads.filter((lead) => ["Spanish", "Bilingual"].includes(lead.language)).length;
  document.querySelector("#bookedMetric").textContent = leads.filter((lead) => lead.status === "Booked").length;

  messageLead.innerHTML = leads
    .sort((a, b) => scoreLead(b) - scoreLead(a))
    .map((lead) => `<option value="${lead.id}">${escapeHtml(lead.business)} (${scoreLead(lead)})</option>`)
    .join("");
  renderMessage();
}

function renderMessage() {
  const lead = leads.find((item) => item.id === messageLead.value) || leads[0];
  if (!lead) {
    messageBox.value = "Add or load a lead to generate outreach.";
    return;
  }
  const spanish = lead.language === "Spanish" || lead.language === "Bilingual";
  const templates = {
    email: spanish
      ? `Subject: idea rapida de IA para ${lead.business}\n\nHola ${lead.contact || "equipo de " + lead.business}, vi que ayudan con ${lead.niche.toLowerCase()} y se me ocurrio una herramienta simple de IA que podrian usar: ${lead.appIdea || "un sistema de cotizaciones y seguimiento"}.\n\nLa idea seria ayudarles a responder mas rapido, capturar mas prospectos y no perder oportunidades cuando llegan mensajes o llamadas.\n\nYo ayudo a negocios locales a construir esto rapido con Base44. Quieres que te mande una version de 2 minutos de como se veria para ${lead.business}?`
      : `Subject: quick AI idea for ${lead.business}\n\nHey ${lead.contact || "team"}, I saw ${lead.business} is in ${lead.niche.toLowerCase()} and had a simple AI tool idea: ${lead.appIdea || "a quote intake and follow-up system"}.\n\nIt could help you respond faster, capture more leads, and stop losing opportunities from calls, forms, or DMs.\n\nI help local businesses build this fast with Base44. Want me to send the 2-minute version of how it would work for ${lead.business}?`,
    dm: spanish
      ? `Hola ${lead.contact || ""}, vi ${lead.business} y creo que podrian usar una herramienta simple de IA para ${lead.appIdea || "capturar cotizaciones y dar seguimiento"}. Ayudo a negocios locales a montarlo rapido con Base44. Quieres que te mande 3 ideas para su negocio?`
      : `Hey ${lead.contact || ""}, I saw ${lead.business} and think you could use a simple AI tool for ${lead.appIdea || "quotes and follow-up"}. I help local businesses build these fast with Base44. Want me to send 3 ideas for your business?`,
    call: spanish
      ? `Hola, hablo con ${lead.contact || "el dueno"}? Soy Bryan. Vi ${lead.business} y no llamo para venderles marketing. Estoy ayudando a negocios locales a crear herramientas simples de IA, como ${lead.appIdea || "un sistema de cotizaciones y seguimiento"}.\n\nPregunta rapida: hoy dia, cuando alguien pide precio o informacion, lo manejan por llamadas, mensajes, o alguna pagina?`
      : `Hey, is this ${lead.contact || "the owner"}? This is Bryan. I saw ${lead.business}, and I am not calling to sell marketing. I help local businesses build simple AI tools, like ${lead.appIdea || "a quote and follow-up system"}.\n\nQuick question: when someone asks for pricing or info right now, does that come through calls, texts, DMs, or a website form?`
  };
  messageBox.value = templates[activeTemplate];
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function leadFromForm() {
  return {
    id: document.querySelector("#editingId").value || crypto.randomUUID(),
    business: document.querySelector("#business").value.trim(),
    contact: document.querySelector("#contact").value.trim(),
    niche: document.querySelector("#niche").value,
    language: document.querySelector("#language").value,
    pain: Number(document.querySelector("#pain").value),
    buying: Number(document.querySelector("#buying").value),
    appIdea: document.querySelector("#appIdea").value.trim(),
    link: document.querySelector("#link").value.trim(),
    status: document.querySelector("#status").value,
    notes: document.querySelector("#notes").value.trim()
  };
}

function fillForm(lead) {
  document.querySelector("#editingId").value = lead.id;
  document.querySelector("#business").value = lead.business;
  document.querySelector("#contact").value = lead.contact;
  document.querySelector("#niche").value = lead.niche;
  document.querySelector("#language").value = lead.language;
  document.querySelector("#pain").value = String(lead.pain);
  document.querySelector("#buying").value = String(lead.buying);
  document.querySelector("#appIdea").value = lead.appIdea;
  document.querySelector("#link").value = lead.link;
  document.querySelector("#status").value = lead.status;
  document.querySelector("#notes").value = lead.notes;
  document.querySelector("#editBadge").textContent = "Editing";
  document.querySelector("#saveBtn").textContent = "Update Lead";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const lead = leadFromForm();
  leads = leads.filter((item) => item.id !== lead.id).concat(lead);
  saveLeads();
  form.reset();
  document.querySelector("#editingId").value = "";
  document.querySelector("#editBadge").textContent = "New";
  document.querySelector("#saveBtn").textContent = "Save Lead";
  render();
});

rows.addEventListener("click", (event) => {
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;
  if (editId) fillForm(leads.find((lead) => lead.id === editId));
  if (deleteId) {
    leads = leads.filter((lead) => lead.id !== deleteId);
    saveLeads();
    render();
  }
});

document.querySelector("#seedBtn").addEventListener("click", () => {
  leads = sampleLeads.map((lead) => ({ ...lead, id: crypto.randomUUID() }));
  saveLeads();
  render();
});

document.querySelector("#exportBtn").addEventListener("click", () => {
  const headers = ["Business", "Contact", "Niche", "Language", "Score", "App Idea", "Status", "Link", "Notes"];
  const lines = leads.map((lead) => [
    lead.business,
    lead.contact,
    lead.niche,
    lead.language,
    scoreLead(lead),
    lead.appIdea,
    lead.status,
    lead.link,
    lead.notes
  ]);
  const csv = [headers, ...lines]
    .map((row) => row.map((cell) => `"${String(cell || "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "local-ai-leads.csv";
  link.click();
  URL.revokeObjectURL(url);
});

document.querySelectorAll("#searchInput, #languageFilter, #statusFilter").forEach((el) => {
  el.addEventListener("input", render);
});

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
    button.classList.add("active");
    activeTemplate = button.dataset.template;
    renderMessage();
  });
});

messageLead.addEventListener("input", renderMessage);

document.querySelector("#copyBtn").addEventListener("click", async () => {
  await navigator.clipboard.writeText(messageBox.value);
});

document.querySelectorAll(".finder").forEach((button) => {
  button.addEventListener("click", () => {
    const city = document.querySelector("#cityInput").value.trim() || "your city";
    document.querySelector("#queryBox").value = button.dataset.query.replace("{{city}}", city);
  });
});

document.querySelector("#copyQueryBtn").addEventListener("click", async () => {
  await navigator.clipboard.writeText(document.querySelector("#queryBox").value);
});

render();
