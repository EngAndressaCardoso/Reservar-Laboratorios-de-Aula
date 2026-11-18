// Dados iniciais obrigatórios da atividade (UNINASSAU)
const laboratorios = [
  {
    id: 1,
    nome: "Laboratório 01",
    bloco: "Bloco A • Sala 101",
    capacidade: 30,
    disponivel: true,
    recursos: "30 Computadores • Projetor",
    icone: "💻"
  },
  {
    id: 2,
    nome: "Laboratório 02",
    bloco: "Bloco B • Sala 204",
    capacidade: 40,
    disponivel: false, // Indisponível conforme especificação inicial
    recursos: "40 Computadores • Lousa Digital",
    icone: "⚡"
  },
  {
    id: 3,
    nome: "Laboratório 03",
    bloco: "Bloco C • Sala 112",
    capacidade: 25, // < 30 alunos (restrição para aulas regulares)
    disponivel: true,
    recursos: "25 Bancadas • Redes e Hardware",
    icone: "🔬"
  }
];

// Lista dinâmica de reservas feitas em tempo de execução (RF05)
let reservas = [];

// Inicialização da aplicação
document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  renderLabs();
  populateLabSelect();
  renderAgenda();

  // Define data mínima como hoje
  const dateInput = document.getElementById("reserva-data");
  if (dateInput) {
    dateInput.valueAsDate = new Date();
  }

  // Listener do formulário de reserva (RF02 / RF03)
  const form = document.getElementById("reservation-form");
  form.addEventListener("submit", handleReservationSubmit);
});

// Controle de navegação entre telas (SPA)
function setupNavigation() {
  const navButtons = document.querySelectorAll(".nav-item");
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      navigateTo(target);
    });
  });
}

function navigateTo(viewId) {
  // Atualiza telas
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.remove("active");
  });
  const targetView = document.getElementById(viewId);
  if (targetView) targetView.classList.add("active");

  // Atualiza menu ativo
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-target") === viewId);
  });

  // Limpa alertas ao trocar de tela
  hideAlert();
}

// Renderiza os cards de laboratórios (Tela 01 e Tela 02 - RF01)
function renderLabs() {
  const inicioGrid = document.getElementById("inicio-labs-grid");
  const fullGrid = document.getElementById("labs-full-grid");
  const searchTerm = (document.getElementById("search-lab")?.value || "").toLowerCase();

  // Cards da tela inicial (todos os 3)
  inicioGrid.innerHTML = laboratorios
    .map((lab) => createLabCardHTML(lab, false))
    .join("");

  // Cards da tela de Laboratórios (com filtro de busca)
  const filteredLabs = laboratorios.filter(
    (lab) =>
      lab.nome.toLowerCase().includes(searchTerm) ||
      lab.bloco.toLowerCase().includes(searchTerm)
  );

  fullGrid.innerHTML = filteredLabs
    .map((lab) => createLabCardHTML(lab, true))
    .join("");
}

function createLabCardHTML(lab, showAction) {
  const statusClass = lab.disponivel ? "available" : "unavailable";
  const statusText = lab.disponivel ? "Disponível" : "Indisponível";
  const capacityWarning =
    lab.capacidade < 30
      ? `<div class="lab-warning">⚠️ Capacidade inferior a 30 alunos (restrito para aulas regulares)</div>`
      : "";

  const actionBtn =
    showAction && lab.disponivel
      ? `<button class="btn-primary" style="margin-top: 8px;" onclick="selectLabAndReserve(${lab.id})">Reservar este espaço</button>`
      : "";

  return `
    <div class="lab-card ${!lab.disponivel ? "unavailable" : ""}">
      <div class="lab-card-top">
        <div class="lab-icon-box">${lab.icone}</div>
        <span class="badge ${statusClass}">${statusText}</span>
      </div>
      <div>
        <div class="lab-title">${lab.nome}</div>
        <div class="lab-meta">${lab.bloco} • <strong>${lab.capacidade} alunos</strong></div>
        <div class="lab-meta" style="margin-top: 4px;">${lab.recursos}</div>
      </div>
      ${capacityWarning}
      ${actionBtn}
    </div>
  `;
}

// Preenche o <select> de laboratórios no formulário
function populateLabSelect() {
  const select = document.getElementById("lab-select");
  select.innerHTML = `<option value="">Selecione um laboratório...</option>`;

  laboratorios.forEach((lab) => {
    const option = document.createElement("option");
    option.value = lab.id;
    if (!lab.disponivel) {
      option.disabled = true;
      option.textContent = `${lab.nome} (${lab.capacidade} alunos) — INDISPONÍVEL`;
    } else {
      option.textContent = `${lab.nome} (${lab.capacidade} alunos) — Disponível`;
    }
    select.appendChild(option);
  });
}

// Atalho ao clicar em "Reservar este espaço" no card
function selectLabAndReserve(labId) {
  navigateTo("view-nova-reserva");
  document.getElementById("lab-select").value = labId;
}

// Validação e Criação da Reserva (RF02 / RF03)
function handleReservationSubmit(event) {
  event.preventDefault();
  hideAlert();

  const professor = document.getElementById("prof-nome").value.trim();
  const matricula = document.getElementById("prof-matricula").value.trim();
  const labId = parseInt(document.getElementById("lab-select").value, 10);
  const data = document.getElementById("reserva-data").value;
  const horario = document.getElementById("reserva-horario").value;
  const tipo = document.getElementById("reserva-tipo").value;
  const finalidade = document.getElementById("reserva-finalidade").value.trim();

  // 1. Validação de campos obrigatórios
  if (!professor || !matricula || !labId || !data || !horario || !finalidade) {
    showAlert("Por favor, preencha todos os campos obrigatórios antes de confirmar.");
    return;
  }

  const labSelecionado = laboratorios.find((l) => l.id === labId);

  // 2. Validação de laboratório indisponível
  if (!labSelecionado || !labSelecionado.disponivel) {
    showAlert(`O ${labSelecionado?.nome || "laboratório"} está indisponível para reservas no momento.`);
    return;
  }

  // 3. Regra de Negócio (Página 9 do PDF): Capacidade < 30 alunos não permite Aula Regular
  if (labSelecionado.capacidade < 30 && tipo === "Aula Regular") {
    showAlert(
      `Regra Acadêmica: O ${labSelecionado.nome} possui capacidade para apenas ${labSelecionado.capacidade} alunos e não pode ser reservado para "Aula Regular" (mínimo exigido: 30 alunos).`
    );
    return;
  }

  // 4. Verifica conflito de horário na mesma data e laboratório
  const conflito = reservas.some(
    (r) => r.labId === labId && r.data === data && r.horario === horario
  );
  if (conflito) {
    showAlert(`Já existe uma reserva confirmada para o ${labSelecionado.nome} nesta data e horário.`);
    return;
  }

  // Cria o objeto da reserva conforme UML
  const novaReserva = {
    codigo: `RL-2026-${String(reservas.length + 1).padStart(4, "0")}`,
    professor,
    matricula,
    labId: labSelecionado.id,
    labNome: labSelecionado.nome,
    capacidade: labSelecionado.capacidade,
    data,
    horario,
    tipo,
    finalidade
  };

  reservas.unshift(novaReserva);

  // Atualiza nome na sidebar e listas
  document.getElementById("sidebar-prof-name").textContent = professor;
  renderAgenda();
  showConfirmationScreen(novaReserva);
  event.target.reset();
  document.getElementById("reserva-data").valueAsDate = new Date();
}

// Exibe a Tela 04 (Reserva Confirmada)
function showConfirmationScreen(reserva) {
  const dataFormatada = reserva.data.split("-").reverse().join("/");
  const summaryBox = document.getElementById("confirmation-summary");

  summaryBox.innerHTML = `
    <strong>${reserva.labNome}</strong> (${reserva.capacidade} alunos)<br/>
    <span>📅 Data: <strong>${dataFormatada}</strong> &nbsp;|&nbsp; ⏰ <strong>${reserva.horario}</strong></span><br/>
    <span>👨‍🏫 Prof. ${reserva.professor} (${reserva.matricula})</span><br/>
    <span>📌 ${reserva.tipo}: ${reserva.finalidade}</span><br/>
    <span style="color: var(--green-primary); font-size: 12px; font-weight: 600;">Protocolo #${reserva.codigo}</span>
  `;

  navigateTo("view-confirmada");
}

// Atualiza a Tela 05 (Agenda de Reservas) e o resumo da Tela 01 (RF05)
function renderAgenda() {
  const agendaList = document.getElementById("agenda-list");
  const recentList = document.getElementById("inicio-recent-list");
  const countLabel = document.getElementById("agenda-count-label");

  countLabel.textContent = `${reservas.length} ${reservas.length === 1 ? "reserva registrada" : "reservas registradas"}`;

  if (reservas.length === 0) {
    const emptyHTML = `<div class="empty-state">Nenhuma reserva realizada nesta sessão. Clique em <strong>"+ Nova reserva"</strong> para agendar.</div>`;
    agendaList.innerHTML = emptyHTML;
    recentList.innerHTML = emptyHTML;
    return;
  }

  const itemsHTML = reservas
    .map((r) => {
      const dataBr = r.data.split("-").reverse().join("/");
      return `
        <div class="agenda-item">
          <div class="agenda-item-left">
            <div class="agenda-time">${dataBr}<br/><small>${r.horario}</small></div>
            <div class="agenda-info">
              <strong>${r.labNome} — ${r.finalidade}</strong>
              <span>Prof. ${r.professor} (${r.matricula}) • ${r.tipo}</span>
            </div>
          </div>
          <span class="badge available">Confirmada</span>
        </div>
      `;
    })
    .join("");

  agendaList.innerHTML = itemsHTML;
  recentList.innerHTML = reservas
    .slice(0, 2)
    .map((r) => {
      const dataBr = r.data.split("-").reverse().join("/");
      return `
        <div class="agenda-item">
          <div class="agenda-item-left">
            <div class="agenda-time">${dataBr}<br/><small>${r.horario}</small></div>
            <div class="agenda-info">
              <strong>${r.labNome} — ${r.finalidade}</strong>
              <span>Prof. ${r.professor}</span>
            </div>
          </div>
          <span class="badge available">Confirmada</span>
        </div>
      `;
    })
    .join("");
}

function showAlert(message) {
  const alertBox = document.getElementById("form-alert");
  alertBox.textContent = message;
  alertBox.classList.remove("hidden");
}

function hideAlert() {
  const alertBox = document.getElementById("form-alert");
  if (alertBox) alertBox.classList.add("hidden");
}
