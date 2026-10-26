// Dados fictícios padronizados do 8º Ano
const dadosBoletim = [
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

// NOTA IMPORTANTE: A frequência de 92% abaixo é apenas demonstrativa/fictícia para esta etapa.
const FREQUENCIA_DEMONSTRATIVA = "92%";

// Função para normalizar notas na escala de 0 a 10
function normalizarNota(valor) {
  // Tratamento de valores nulos, vazios ou indefinidos
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Se o valor vier como texto com vírgula, troca por ponto
  if (typeof valor === "string") {
    valor = valor.replace(",", ".");
  }

  // Converte para número decimal
  let numero = parseFloat(valor);

  // Se não for um número válido, descarta
  if (isNaN(numero)) {
    return null;
  }

  // Regra de conversão para a escala de 0 a 10
  if (numero >= 0 && numero <= 10) {
    return numero;
  } else if (numero > 10 && numero <= 100) {
    return numero / 10;
  } else {
    // Valores fora da regra (ex: menores que 0 ou maiores que 100) são inválidos
    return null;
  }
}

// Função principal que processa os dados e desenha na tela
function renderizarBoletim() {
  const corpoTabela = document.getElementById("corpo-tabela");
  corpoTabela.innerHTML = ""; // Limpa a tabela antes de preencher

  let somaMediasValidas = 0;
  let totalDisciplinasComMedia = 0;
  let totalFaltasGeral = 0;
  let qtdBomDesempenho = 0;
  let qtdAtencao = 0;

  // Itera por cada disciplina usando forEach
  dadosBoletim.forEach((item) => {
    // Normaliza as notas de cada trimestre
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    // Soma as faltas dos três trimestres
    const totalFaltasDisciplina = item.faltas.reduce((acc, f) => acc + f, 0);
    totalFaltasGeral += totalFaltasDisciplina;

    // Junta apenas as notas válidas (ignora null)
    const notasValidas = [n1, n2, n3].filter((n) => n !== null);

    let mediaFormatada = "—";
    let situacaoTexto = "Nota ainda não disponível";
    let situacaoClasse = "situacao-indisponivel";

    // Se houver pelo menos uma nota disponível, calcula a média
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

    // Formatação visual para exibição das notas individuais
    const exibeN1 = n1 !== null ? n1.toFixed(1).replace(".", ",") : "—";
    const exibeN2 = n2 !== null ? n2.toFixed(1).replace(".", ",") : "—";
    const exibeN3 = n3 !== null ? n3.toFixed(1).replace(".", ",") : "—";

    // Cria a linha (tr) da tabela no HTML via DOM
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${item.disciplina}</strong></td>
      <td>${exibeN1}</td>
      <td>${exibeN2}</td>
      <td>${exibeN3}</td>
      <td><strong>${mediaFormatada}</strong></td>
      <td>${totalFaltasDisciplina}</td>
      <td class="${situacaoClasse}">${situacaoTexto}</td>
    `;
    corpoTabela.appendChild(tr);
  });

  // Atualiza os Cards de Resumo no topo da página
  const mediaGeralGeral = totalDisciplinasComMedia > 0 
    ? (somaMediasValidas / totalDisciplinasComMedia).toFixed(1).replace(".", ",") 
    : "—";

  document.getElementById("card-media").textContent = mediaGeralGeral;
  document.getElementById("card-faltas").textContent = totalFaltasGeral;
  document.getElementById("card-bom-desempenho").textContent = qtdBomDesempenho;
  document.getElementById("card-atencao").textContent = qtdAtencao;
}

// Executa a função assim que a página carrega
renderizarBoletim();