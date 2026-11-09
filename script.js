// CONFIGURAÇÃO FIXA DO ALUNO
const CONFIG_ALUNO = {
  turma: "8B",
  numeroChamada: 25,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// Dados fictícios padronizados do 8º Ano
const dadosBoletimPadrao = [
  { disciplina: "Língua Portuguesa", tri1: 82, tri2: "7,8", tri3: 85, faltas: [2, 1, 1] },
  { disciplina: "Matemática", tri1: 52, tri2: "5,8", tri3: null, faltas: [3, 2, 1] },
  { disciplina: "Ciências", tri1: "8,1", tri2: 76, tri3: 8.0, faltas: [1, 2, 0] },
  { disciplina: "História", tri1: 7.0, tri2: 84, tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Geografia", tri1: 68, tri2: 7.3, tri3: "7,9", faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 86, tri2: "8,1", tri3: 8.7, faltas: [1, 0, 0] },
  { disciplina: "Arte", tri1: 9.0, tri2: 92, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 95, tri2: 9.0, tri3: "9,4", faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 88, tri2: 9.1, tri3: 93, faltas: [1, 0, 1] },
  { disciplina: "Educação Financeira", tri1: 74, tri2: "7,8", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Estudo Orientado", tri1: 8.0, tri2: 83, tri3: "8,5", faltas: [0, 1, 0] },
  { disciplina: "Redação e Leitura", tri1: 62, tri2: "6,8", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 48, tri2: 5.6, tri3: "6,0", faltas: [2, 2, 1] },
  { disciplina: "Literatura Arte e Movimento", tri1: "7,7", tri2: 80, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Práticas Experimentais", tri1: 58, tri2: "6,2", tri3: 6.4, faltas: [1, 1, 1] }
];

// Frequência demonstrativa/fictícia
const FREQUENCIA_DEMONSTRATIVA = "92%";

// Estado global da sessão (em memória apenas)
let pinSessao = "";
let dadosAtuais = [];
let modoEdicao = false;

// Função para normalizar notas na escala de 0 a 10 (Dados antigos/API)
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }
  if (typeof valor === "string") {
    valor = valor.replace(",", ".");
  }
  let numero = parseFloat(valor);
  if (isNaN(numero)) {
    return null;
  }
  if (numero >= 0 && numero <= 10) {
    return numero;
  } else if (numero > 10 && numero <= 100) {
    return numero / 10;
  } else {
    return null;
  }
}

// Validação estrita para o que o aluno digita no editor (0 a 10 ou vazio)
function validarNotaEditada(valorTexto) {
  if (valorTexto === null || valorTexto === undefined || valorTexto.trim() === "") {
    return { valido: true, valor: null };
  }
  const textoLimpo = valorTexto.trim().replace(",", ".");
  const num = Number(textoLimpo);
  if (!isNaN(num) && num >= 0 && num <= 10) {
    return { valido: true, valor: num };
  }
  return { valido: false, valor: null };
}

// Validação estrita para faltas (inteiro >= 0)
function validarFaltaEditada(valorTexto) {
  if (valorTexto === null || valorTexto === undefined || valorTexto.trim() === "") {
    return { valido: false, valor: null };
  }
  const num = Number(valorTexto.trim());
  if (Number.isInteger(num) && num >= 0) {
    return { valido: true, valor: num };
  }
  return { valido: false, valor: null };
}

// Fazer Login na API
async function fazerLogin() {
  const inputPin = document.getElementById("input-pin");
  const msgLogin = document.getElementById("msg-login");
  const pinDigitado = inputPin.value.trim();

  if (!pinDigitado) {
    msgLogin.textContent = "Por favor, digite o PIN.";
    msgLogin.className = "mensagem-status msg-erro";
    return;
  }

  msgLogin.textContent = "Conectando...";
  msgLogin.className = "mensagem-status msg-info";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    if (resposta.status === 401) {
      msgLogin.textContent = "Turma, chamada ou PIN inválidos.";
      msgLogin.className = "mensagem-status msg-erro";
      return;
    }

    if (resposta.status === 429) {
      msgLogin.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
      msgLogin.className = "mensagem-status msg-erro";
      return;
    }

    if (!resposta.ok) {
      msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
      msgLogin.className = "mensagem-status msg-erro";
      return;
    }

    const resultado = await resposta.json();
    
    // Sucesso no login: armazena PIN na memória e limpa o campo do DOM
    pinSessao = pinDigitado;
    inputPin.value = "";

    // Oculta tela de login e exibe boletim
    document.getElementById("secao-login").style.display = "none";
    document.getElementById("conteudo-boletim").style.display = "block";

    // Trata os dados recebidos da API ou usa os locais
    if (resultado.dados && Array.isArray(resultado.dados.disciplinas) && resultado.dados.disciplinas.length > 0) {
      dadosAtuais = resultado.dados.disciplinas;
    } else {
      dadosAtuais = JSON.parse(JSON.stringify(dadosBoletimPadrao));
    }

    renderizarBoletim();

  } catch (erro) {
    msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
    msgLogin.className = "mensagem-status msg-erro";
  }
}

// Renderizar Tabela e Cards
function renderizarBoletim() {
  const corpoTabela = document.getElementById("corpo-tabela");
  corpoTabela.innerHTML = ""; // Limpa antes de preencher

  let somaMediasValidas = 0;
  let totalDisciplinasComMedia = 0;
  let totalFaltasGeral = 0;
  let qtdBomDesempenho = 0;
  let qtdAtencao = 0;

  dadosAtuais.forEach((item, index) => {
    // Normalização das notas
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    // Faltas
    let f1 = 0, f2 = 0, f3 = 0;
    if (Array.isArray(item.faltas)) {
      f1 = typeof item.faltas[0] === "number" ? item.faltas[0] : 0;
      f2 = typeof item.faltas[1] === "number" ? item.faltas[1] : 0;
      f3 = typeof item.faltas[2] === "number" ? item.faltas[2] : 0;
    }
    const totalFaltasDisciplina = f1 + f2 + f3;
    totalFaltasGeral += totalFaltasDisciplina;

    // Cálculo das Média
    const notasValidas = [n1, n2, n3].filter((n) => n !== null);
    let mediaFormatada = "—";
    let situacaoTexto = "Nota ainda não disponível";
    let situacaoClasse = "situacao-indisponivel";

    if (notasValidas.length > 0) {
      const somaNotas = notasValidas.reduce((acc, nota) => acc + nota, 0);
      const media = somaNotas / notasValidas.length;
      
      mediaFormatada = media.toFixed(1).replace(".", ",");
      somaMediasValidas += media;
      totalDisciplinasComMedia++;

      if (media >= 6.0) {
        situacaoTexto = "Bom desempenho";
        situacaoClasse = "situacao-bom";
        qtdBomDesempenho++;
      } else {
        situacaoTexto = "Atenção";
        situacaoClasse = "situacao-atencao";
        qtdAtencao++;
      }
    }

    const exibeN1 = n1 !== null ? n1.toFixed(1).replace(".", ",") : "";
    const exibeN2 = n2 !== null ? n2.toFixed(1).replace(".", ",") : "";
    const exibeN3 = n3 !== null ? n3.toFixed(1).replace(".", ",") : "";

    const tr = document.createElement("tr");

    if (modoEdicao) {
      // Criação de campos editáveis (modo de edição)
      const tdDisc = document.createElement("td");
      const strongDisc = document.createElement("strong");
      strongDisc.textContent = item.disciplina; // Segurança do DOM
      tdDisc.appendChild(strongDisc);

      const tdN1 = document.createElement("td");
      tdN1.innerHTML = `<input type="text" class="input-edicao" id="edit-n1-${index}" value="${exibeN1}" size="4" placeholder="0-10">`;

      const tdN2 = document.createElement("td");
      tdN2.innerHTML = `<input type="text" class="input-edicao" id="edit-n2-${index}" value="${exibeN2}" size="4" placeholder="0-10">`;

      const tdN3 = document.createElement("td");
      tdN3.innerHTML = `<input type="text" class="input-edicao" id="edit-n3-${index}" value="${exibeN3}" size="4" placeholder="0-10">`;

      const tdMedia = document.createElement("td");
      tdMedia.innerHTML = `<strong>${mediaFormatada}</strong>`;

      const tdFaltas = document.createElement("td");
      tdFaltas.innerHTML = `
        <div style="display:flex; gap:4px; align-items:center;">
          <input type="text" class="input-edicao" id="edit-f1-${index}" value="${f1}" size="2" title="1º Tri">
          <input type="text" class="input-edicao" id="edit-f2-${index}" value="${f2}" size="2" title="2º Tri">
          <input type="text" class="input-edicao" id="edit-f3-${index}" value="${f3}" size="2" title="3º Tri">
        </div>
      `;

      const tdSit = document.createElement("td");
      tdSit.className = situacaoClasse;
      tdSit.textContent = situacaoTexto;

      tr.appendChild(tdDisc);
      tr.appendChild(tdN1);
      tr.appendChild(tdN2);
      tr.appendChild(tdN3);
      tr.appendChild(tdMedia);
      tr.appendChild(tdFaltas);
      tr.appendChild(tdSit);

    } else {
      // Modo de visualização simples
      const tdDisc = document.createElement("td");
      const strongDisc = document.createElement("strong");
      strongDisc.textContent = item.disciplina;
      tdDisc.appendChild(strongDisc);

      const tdN1 = document.createElement("td");
      tdN1.textContent = n1 !== null ? n1.toFixed(1).replace(".", ",") : "—";

      const tdN2 = document.createElement("td");
      tdN2.textContent = n2 !== null ? n2.toFixed(1).replace(".", ",") : "—";

      const tdN3 = document.createElement("td");
      tdN3.textContent = n3 !== null ? n3.toFixed(1).replace(".", ",") : "—";

      const tdMedia = document.createElement("td");
      tdMedia.innerHTML = `<strong>${mediaFormatada}</strong>`;

      const tdFaltas = document.createElement("td");
      tdFaltas.textContent = totalFaltasDisciplina;

      const tdSit = document.createElement("td");
      tdSit.className = situacaoClasse;
      tdSit.textContent = situacaoTexto;

      tr.appendChild(tdDisc);
      tr.appendChild(tdN1);
      tr.appendChild(tdN2);
      tr.appendChild(tdN3);
      tr.appendChild(tdMedia);
      tr.appendChild(tdFaltas);
      tr.appendChild(tdSit);
    }

    corpoTabela.appendChild(tr);
  });

  // Atualizar Cards de Resumo
  const mediaGeralGeral = totalDisciplinasComMedia > 0 
    ? (somaMediasValidas / totalDisciplinasComMedia).toFixed(1).replace(".", ",") 
    : "—";

  document.getElementById("card-media").textContent = mediaGeralGeral;
  document.getElementById("card-faltas").textContent = totalFaltasGeral;
  document.getElementById("card-bom-desempenho").textContent = qtdBomDesempenho;
  document.getElementById("card-atencao").textContent = qtdAtencao;
}

// Abrir Edição
function abrirEdicao() {
  modoEdicao = true;
  document.getElementById("btn-alterar").style.display = "none";
  document.getElementById("btn-salvar").style.display = "inline-block";
  document.getElementById("btn-cancelar").style.display = "inline-block";
  document.getElementById("msg-salvamento").textContent = "";
  renderizarBoletim();
}

// Cancelar Edição
function cancelarEdicao() {
  modoEdicao = false;
  document.getElementById("btn-alterar").style.display = "inline-block";
  document.getElementById("btn-salvar").style.display = "none";
  document.getElementById("btn-cancelar").style.display = "none";
  document.getElementById("msg-salvamento").textContent = "";
  renderizarBoletim();
}

// Salvar Dados Alterados na API
async function salvarDados() {
  const msgSalvamento = document.getElementById("msg-salvamento");
  msgSalvamento.textContent = "";
  
  // Limpa classes de campo inválido anteriores
  document.querySelectorAll(".campo-invalido").forEach(el => el.classList.remove("campo-invalido"));

  let possuiErros = false;
  const novasDisciplinas = [];

  // Validação de todos os campos digitados
  dadosAtuais.forEach((item, index) => {
    const elN1 = document.getElementById(`edit-n1-${index}`);
    const elN2 = document.getElementById(`edit-n2-${index}`);
    const elN3 = document.getElementById(`edit-n3-${index}`);
    const elF1 = document.getElementById(`edit-f1-${index}`);
    const elF2 = document.getElementById(`edit-f2-${index}`);
    const elF3 = document.getElementById(`edit-f3-${index}`);

    const resN1 = validarNotaEditada(elN1.value);
    const resN2 = validarNotaEditada(elN2.value);
    const resN3 = validarNotaEditada(elN3.value);
    const resF1 = validarFaltaEditada(elF1.value);
    const resF2 = validarFaltaEditada(elF2.value);
    const resF3 = validarFaltaEditada(elF3.value);

    if (!resN1.valido) { elN1.classList.add("campo-invalido"); possuiErros = true; }
    if (!resN2.valido) { elN2.classList.add("campo-invalido"); possuiErros = true; }
    if (!resN3.valido) { elN3.classList.add("campo-invalido"); possuiErros = true; }
    if (!resF1.valido) { elF1.classList.add("campo-invalido"); possuiErros = true; }
    if (!resF2.valido) { elF2.classList.add("campo-invalido"); possuiErros = true; }
    if (!resF3.valido) { elF3.classList.add("campo-invalido"); possuiErros = true; }

    novasDisciplinas.push({
      disciplina: item.disciplina,
      tri1: resN1.valor,
      tri2: resN2.valor,
      tri3: resN3.valor,
      faltas: [resF1.valor, resF2.valor, resF3.valor]
    });
  });

  if (possuiErros) {
    msgSalvamento.textContent = "Existem campos inválidos (Notas de 0 a 10 e Faltas inteiras >= 0).";
    msgSalvamento.className = "mensagem-status msg-erro";
    return;
  }

  msgSalvamento.textContent = "Salvando...";
  msgSalvamento.className = "mensagem-status msg-info";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/salvar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: {
          disciplinas: novasDisciplinas
        }
      })
    });

    if (!resposta.ok) {
      msgSalvamento.textContent = "Falha ao salvar as alterações. Tente novamente.";
      msgSalvamento.className = "mensagem-status msg-erro";
      return;
    }

    // Sucesso no salvamento
    dadosAtuais = novasDisciplinas;
    modoEdicao = false;
    
    document.getElementById("btn-alterar").style.display = "inline-block";
    document.getElementById("btn-salvar").style.display = "none";
    document.getElementById("btn-cancelar").style.display = "none";

    msgSalvamento.textContent = "Dados salvos com sucesso.";
    msgSalvamento.className = "mensagem-status msg-sucesso";

    renderizarBoletim();

  } catch (erro) {
    msgSalvamento.textContent = "Falha ao salvar as alterações. Tente novamente.";
    msgSalvamento.className = "mensagem-status msg-erro";
  }
}