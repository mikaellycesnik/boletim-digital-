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

// Instâncias dos Gráficos Chart.js
let chartMediaDisciplina = null;
let chartEvolucaoMedia = null;
let chartFaltasTrimestre = null;

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
  msg