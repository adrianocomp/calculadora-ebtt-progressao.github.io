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

  function parseDateToMonthStart(dateStr) {
    if (!dateStr) return null;
    const [y, m] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, 1);
  }

  function monthsDiff(start, end) {
    return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  }

  function nivelPorMesesDesde(baseMeses, nivelInicialIndex) {
    const niveis = ['D301', 'D302', 'D303', 'D304', 'D401', 'D402'];
    const idx = nivelInicialIndex + Math.floor(baseMeses / 24);
    return niveis[Math.min(idx, niveis.length - 1)];
  }

  function calcularPrejuizo() {
    const { dataInicioRecebido, dataCorreto, dataFinal, juros, correcao } = dados;
    if (!dataInicioRecebido || !dataCorreto || !dataFinal) {
      alert('Preencha todas as datas.');
      return;
    }

    const baseRecebido = parseDateToMonthStart(dataInicioRecebido);
    const baseCorreto = parseDateToMonthStart(dataCorreto);
    const fim = parseDateToMonthStart(dataFinal);

    if (!baseRecebido || !baseCorreto || !fim) {
      alert('Datas inválidas.');
      return;
    }
    if (baseCorreto > fim) {
      alert('A data correta de progressão deve ser anterior à data final.');
      return;
    }

    let current = new Date(baseCorreto.getFullYear(), baseCorreto.getMonth(), 1);
    const linhas = [];
    let totalNominal = 0;
    let totalCorrigido = 0;
    const jurosMensal = Number(juros) / 100;
    const correcaoMensal = Number(correcao) / 100;

    while (current <= fim) {
      const ano = current.getFullYear();
      const mes = current.getMonth() + 1;

      const mesesDesdeRecebido = monthsDiff(baseRecebido, current);
      const mesesDesdeCorreto = monthsDiff(baseCorreto, current);

      const nivelRecebido = nivelPorMesesDesde(Math.max(0, mesesDesdeRecebido), 0);
      const nivelCorreto = nivelPorMesesDesde(Math.max(0, mesesDesdeCorreto), 1);

      const salarioRecebido = obterSalario(ano, mes, nivelRecebido);
      const salarioCorreto = obterSalario(ano, mes, nivelCorreto);

      const diff = Math.max(0, salarioCorreto - salarioRecebido);
      const ferias = diff / 36;
      const decimo = diff / 12;
      const bruto = diff + ferias + decimo;

      const mesesAteFim = monthsDiff(current, fim);
      const fator = Math.pow(1 + jurosMensal + correcaoMensal, mesesAteFim);
      const valorCorrigido = bruto * fator;

      totalNominal += bruto;
      totalCorrigido += valorCorrigido;

      linhas.push({
        mesAno: current.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }),
        nivelRecebido,
        nivelCorreto,
        diferenca: diff.toFixed(2),
        ferias: ferias.toFixed(2),
        decimo: decimo.toFixed(2),
        bruto: bruto.toFixed(2),
        valorCorrigido: valorCorrigido.toFixed(2),
        brutoNum: bruto,
        valorCorrigidoNum: valorCorrigido,
      });

      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }

    // últimos 60 meses
    const ultimos60 = linhas.slice(-60);
    const totalNominal60 = ultimos60.reduce((s, r) => s + r.brutoNum, 0);
    const totalCorrigido60 = ultimos60.reduce((s, r) => s + r.valorCorrigidoNum, 0);

    setResultado({
      periodo: `${baseCorreto.toLocaleDateString('pt-BR')} a ${fim.toLocaleDateString('pt-BR')}`,
      meses: linhas.length,
      totalNominal: totalNominal.toFixed(2),
      totalCorrigido: totalCorrigido.toFixed(2),
      totalNominal60: totalNominal60.toFixed(2),
      totalCorrigido60: totalCorrigido60.toFixed(2),
    });

    setDetalhamento(linhas);
  }

  function handleChange(e) {
    setDados({ ...dados, [e.target.name]: e.target.value });
  }

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Calculadora de Perdas Salariais - Reenquadramento EBTT</h1>
      <h5 className="text-base font-bold mb-4 text-center">Desenvolvido por Adriano Santos - IFMG Ribeirão das Neves</h5>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Data em que você foi acelerado para o nível D301:</label>
          <input type="date" name="dataInicioRecebido" value={dados.dataInicioRecebido} onChange={handleChange} className="border p-2 rounded w-full" />
        </div>
        <div>
          <label>Nível recebido:</label>
          <input type="text" value="D301" disabled className="border rounded p-2 w-full bg-gray-100" />
        </div>
        <div>
          <label>Data correta que deveria ter progredido para o nível D302:</label>
          <input type="date" name="dataCorreto" value={dados.dataCorreto} onChange={handleChange} className="border p-2 rounded w-full" />
        </div>
        <div>
          <label>Nível correto:</label>
          <input type="text" value="D302" disabled className="border rounded p-2 w-full bg-gray-100" />
        </div>
        <div>
          <label>Data final de cálculo:</label>
          <input type="date" name="dataFinal" value={dados.dataFinal} onChange={handleChange} className="border p-2 rounded w-full" />
        </div>
        <div>
          <label>Juros moratórios (%/mês):</label>
          <input type="number" name="juros" value={dados.juros} onChange={handleChange} className="border p-2 rounded w-full" />
        </div>
        <div>
          <label>Correção monetária (%/mês):</label>
          <input type="number" name="correcao" value={dados.correcao} onChange={handleChange} className="border p-2 rounded w-full" />
        </div>
      </div>

      <button onClick={calcularPrejuizo} className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700">Calcular</button>

      {resultado && (
        <div className="mt-6 bg-green-100 p-4 rounded-xl border border-green-300">
          <p><strong>Período:</strong> {resultado.periodo}</p>
          <p><strong>Total nominal:</strong> R$ {resultado.totalNominal}</p>
          <p><strong>Total corrigido:</strong> R$ {resultado.totalCorrigido}</p>
          <p><strong>Últimos 60 meses (nominal):</strong> R$ {resultado.totalNominal60}</p>
          <p><strong>Últimos 60 meses (corrigido):</strong> R$ {resultado.totalCorrigido60}</p>
        </div>
      )}

      {detalhamento.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Mês/Ano</th>
                <th className="border p-2">Nível Recebido</th>
                <th className="border p-2">Nível Correto</th>
                <th className="border p-2">Diferença</th>
                <th className="border p-2">Férias (1/3)</th>
                <th className="border p-2">13º</th>
                <th className="border p-2">Total Bruto</th>
                <th className="border p-2">Corrigido</th>
              </tr>
            </thead>
            <tbody>
              {detalhamento.map((l, i) => (
                <tr key={i} className="text-center">
                  <td className="border p-2">{l.mesAno}</td>
                  <td className="border p-2">{l.nivelRecebido}</td>
                  <td className="border p-2">{l.nivelCorreto}</td>
                  <td className="border p-2">R$ {l.diferenca}</td>
                  <td className="border p-2">R$ {l.ferias}</td>
                  <td className="border p-2">R$ {l.decimo}</td>
                  <td className="border p-2">R$ {l.bruto}</td>
                  <td className="border p-2 font-semibold">R$ {l.valorCorrigido}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
