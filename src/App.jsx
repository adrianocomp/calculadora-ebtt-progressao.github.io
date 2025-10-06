import React, { useState } from 'react';

export default function CalculadoraPrejuizoEBTT() {
  const [dados, setDados] = useState({
    dataInicioRecebido: '',
    nivelRecebido: 'D301',
    dataCorreto: '',
    nivelCorreto: 'D302',
    dataFinal: '',
    salarioD301: 12862.13,
    salarioD302: 13376.61,
    salarioD303: 15309.9,
    salarioD304: 15998.84,
    juros: 0.5,
    correcao: 0.0,
  });

  const [resultado, setResultado] = useState(null);
  const [detalhamento, setDetalhamento] = useState([]);

  function calcularPrejuizo() {
    if (!dados.dataInicioRecebido || !dados.dataCorreto || !dados.dataFinal) {
      alert('Preencha todas as datas antes de calcular.');
      return;
    }

    const inicio = new Date(dados.dataCorreto);
    const fim = new Date(dados.dataFinal);
    const meses = (fim.getFullYear() - inicio.getFullYear()) * 12 + (fim.getMonth() - inicio.getMonth()) + 1;

    let salarioRecebido = dados.salarioD301;
    let salarioCorreto = dados.salarioD302;
    let totalNominal = 0;
    let totalCorrigido = 0;
    const linhas = [];

    for (let i = 0; i < meses; i++) {
      const dataAtual = new Date(inicio);
      dataAtual.setMonth(inicio.getMonth() + i);

      if (i >= 24 && i < 48) salarioCorreto = dados.salarioD303;
      if (i >= 48) salarioCorreto = dados.salarioD304;

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
    });

    setDetalhamento(linhas);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setDados({ ...dados, [name]: value });
  }

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Calculadora de Prejuízo EBTT</h1>
      <h2 className="text-2xl font-bold mb-4 text-center">Desenvolvido por Adriano Santos</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Data em que começou a receber o nível D301:</label>
          <input type="date" name="dataInicioRecebido" value={dados.dataInicioRecebido} onChange={handleChange} className="border rounded p-2 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">Nível recebido:</label>
          <select name="nivelRecebido" value={dados.nivelRecebido} onChange={handleChange} className="border rounded p-2 w-full">
            <option>D301</option>
            <option>D302</option>
            <option>D303</option>
            <option>D304</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Data que deveria ter progredido:</label>
          <input type="date" name="dataCorreto" value={dados.dataCorreto} onChange={handleChange} className="border rounded p-2 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">Nível correto:</label>
          <select name="nivelCorreto" value={dados.nivelCorreto} onChange={handleChange} className="border rounded p-2 w-full">
            <option>D301</option>
            <option>D302</option>
            <option>D303</option>
            <option>D304</option>
          </select>
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
