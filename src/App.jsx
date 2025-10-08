import React, { useState } from 'react';
export default function CalculadoraPrejuizoEBTT() {
  const [dados, setDados] = useState({
    dataInicioRecebido: '',
    dataCorreto: '',
    dataFinal: '',
    juros: 0.5,
    correcao: 0.0,
  });

  const [resultado, setResultado] = useState(null);
  const [detalhamento, setDetalhamento] = useState([]);

  const tabelas = [
    { ano: 2017, mes: 8, D301: 11323.71, D302: 11629.58, D303: 12060.77, D304: 12512.71, D401: 15806.58, D402: 16325.34 },
    { ano: 2018, mes: 8, D301: 11561.91, D302: 11950.86, D303: 12411.89, D304: 12893.12, D401: 16199.24, D402: 16790.46 },
    { ano: 2019, mes: 8, D301: 11800.12, D302: 12272.12, D303: 12763.01, D304: 13273.52, D401: 16591.91, D402: 17255.91 },
    { ano: 2023, mes: 5, D301: 12862.13, D302: 13376.61, D303: 13911.69, D304: 14468.14, D401: 18085.19, D402: 18808.60 },
    { ano: 2025, mes: 1, D301: 14019.74, D302: 14650.62, D303: 15309.90, D304: 15998.84, D401: 19758.57, D402: 20647.71 }
  ];

  function obterSalario(ano, mes, nivel) {
    for (let i = tabelas.length - 1; i >= 0; i--) {
      const t = tabelas[i];
      if (ano > t.ano || (ano === t.ano && mes >= t.mes)) {
        return t[nivel];
      }
    }
    return tabelas[0][nivel];
  }

  function calcularPrejuizo() {
    if (!dados.dataInicioRecebido || !dados.dataCorreto || !dados.dataFinal) {
      alert('Preencha todas as datas antes de calcular.');
      return;
    }

    const inicio = new Date(dados.dataCorreto);
    const fim = new Date(dados.dataFinal);
    let meses = (fim.getFullYear() - inicio.getFullYear()) * 12 + (fim.getMonth() - inicio.getMonth()) + 1;
    if (meses > 60) meses = 60; // Limite máximo de 60 meses

    let totalNominal = 0;
    let totalCorrigido = 0;
    const linhas = [];

    for (let i = 0; i < meses; i++) {
      const dataAtual = new Date(inicio);
      dataAtual.setMonth(inicio.getMonth() + i);
      const ano = dataAtual.getFullYear();
      const mes = dataAtual.getMonth() + 1;

      let salarioRecebido = obterSalario(ano, mes, 'D301');
      let salarioCorreto = obterSalario(ano, mes, 'D302');

      // Progressões futuras: após 24 e 48 meses
      if (i >= 24 && i < 48) {
        salarioCorreto = obterSalario(ano, mes, 'D303');
      } else if (i >= 48) {
        salarioCorreto = obterSalario(ano, mes, 'D304');
      }

      const diferenca = salarioCorreto - salarioRecebido;
      const ferias = diferenca / 3 / 12;
      const decimo = diferenca / 12;
      const bruto = diferenca + ferias + decimo;

      const jurosMensal = dados.juros / 100;
      const correcaoMensal = dados.correcao / 100;
      const fator = Math.pow(1 + jurosMensal + correcaoMensal, meses - i);

      const valorCorrigido = bruto * fator;

      totalNominal += bruto;
      totalCorrigido += valorCorrigido;

      linhas.push({
        mesAno: dataAtual.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }),
        diferenca: diferenca.toFixed(2),
        ferias: ferias.toFixed(2),
        decimo: decimo.toFixed(2),
        bruto: bruto.toFixed(2),
        valorCorrigido: valorCorrigido.toFixed(2),
      });
    }

    setResultado({
      periodo: `${inicio.toLocaleDateString('pt-BR')} a ${fim.toLocaleDateString('pt-BR')}`,
      meses,
      totalNominal: totalNominal.toFixed(2),
      totalCorrigido: totalCorrigido.toFixed(2),
      aviso: meses === 60 ? 'O cálculo foi limitado a 60 meses.' : ''
    });

    setDetalhamento(linhas);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setDados({ ...dados, [name]: value });
  }

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Calculadora de Perdas Salariais - Reenquadramento EBTT</h1>
      <h5 className="text-base font-bold mb-4 text-center">Desenvolvido por Adriano Santos - IFMG Ribeirão das Neves</h5>
      <h5 className="text-sm font-bold mb-4 text-center"> Isenção de responsabilidade: Os valores são aproximados para o professor ter ideia do prejuízo financeiro. Para fins processuais, peritos são contratados para o cálculo exato.</h5>
      <h5 className="text-sm font-bold mb-4 text-center">ADIFMG - Associação dos Docentes do Instituto Federal de Minas Gerais</h5>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Data em que você foi acelerado para o nível D301:</label>
          <input type="date" name="dataInicioRecebido" value={dados.dataInicioRecebido} onChange={handleChange} className="border rounded p-2 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">Nível recebido:</label>
          <input type="text" value="D301" disabled className="border rounded p-2 w-full bg-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium">Data correta que deveria ter progredido para o nível D302:</label>
          <input type="date" name="dataCorreto" value={dados.dataCorreto} onChange={handleChange} className="border rounded p-2 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">Nível correto:</label>
          <input type="text" value="D302" disabled className="border rounded p-2 w-full bg-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium">Data final de cálculo:</label>
          <input type="date" name="dataFinal" value={dados.dataFinal} onChange={handleChange} className="border rounded p-2 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">Juros moratórios (% ao mês):</label>
          <input type="number" name="juros" value={dados.juros} onChange={handleChange} step="0.1" className="border rounded p-2 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">Correção monetária (% ao mês):</label>
          <input type="number" name="correcao" value={dados.correcao} onChange={handleChange} step="0.1" className="border rounded p-2 w-full" />
        </div>
      </div>

      <button onClick={calcularPrejuizo} className="mt-6 w-full bg-blue-600 text-white p-3 rounded-xl font-semibold hover:bg-blue-700 transition">Calcular Prejuízo</button>

      {resultado && (
        <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-xl">
          <p className="text-lg font-semibold">Período de cálculo: {resultado.periodo}</p>
          <p className="text-lg">Total nominal (sem juros/correção): <strong>R$ {resultado.totalNominal}</strong></p>
          <p className="text-lg">Total corrigido (juros + correção): <strong>R$ {resultado.totalCorrigido}</strong></p>
          {resultado.aviso && <p className="text-red-600 font-medium">{resultado.aviso}</p>}
          <p className="text-sm text-gray-600">Período total: {resultado.meses} meses</p>
        </div>
      )}

      {detalhamento.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Mês/Ano</th>
                <th className="border p-2">Diferença</th>
                <th className="border p-2">1/3 Férias</th>
                <th className="border p-2">13º Proporcional</th>
                <th className="border p-2">Total Bruto</th>
                <th className="border p-2">Com Juros + Correção</th>
              </tr>
            </thead>
            <tbody>
              {detalhamento.map((linha, idx) => (
                <tr key={idx} className="text-center">
                  <td className="border p-2">{linha.mesAno}</td>
                  <td className="border p-2">R$ {linha.diferenca}</td>
                  <td className="border p-2">R$ {linha.ferias}</td>
                  <td className="border p-2">R$ {linha.decimo}</td>
                  <td className="border p-2">R$ {linha.bruto}</td>
                  <td className="border p-2 font-semibold">R$ {linha.valorCorrigido}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
