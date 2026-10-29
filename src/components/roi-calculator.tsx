"use client";

import { useMemo, useState } from "react";
import { formatBRL } from "@/lib/format";

const PHASE1_SETUP = 5750; // ponto médio de R$ 4.500–7.000
const PHASE1_MONTHLY = 325; // ponto médio de R$ 250–400

function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-sm">
        <span className="font-medium text-navy-100">{label}</span>
        <span className="rounded-lg bg-white/10 px-2.5 py-0.5 font-semibold text-white">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-[#c9a227]"
      />
    </label>
  );
}

export function RoiCalculator() {
  const [clients, setClients] = useState(500);
  const [minutes, setMinutes] = useState(30);
  const [hourly, setHourly] = useState(35);
  const [newClients, setNewClients] = useState(1);
  const [fee, setFee] = useState(650);

  const r = useMemo(() => {
    const hours = (clients * minutes) / 60;
    const hoursValue = hours * hourly;
    const revenue12 = fee * newClients * 78; // soma de 1..12 meses de carteira crescente
    const mrr12 = fee * newClients * 12;
    let payback: number | null = null;
    for (let m = 1; m <= 36; m++) {
      const revenue = (fee * newClients * m * (m + 1)) / 2;
      const cost = PHASE1_SETUP + PHASE1_MONTHLY * m;
      if (revenue >= cost) {
        payback = m;
        break;
      }
    }
    return { hours, hoursValue, revenue12, mrr12, payback };
  }, [clients, minutes, hourly, newClients, fee]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-6 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
        <Slider label="Empresas na carteira" value={clients} min={100} max={1000} step={10} display={String(clients)} onChange={setClients} />
        <Slider
          label="Retrabalho evitado por cliente/mês"
          value={minutes}
          min={5}
          max={90}
          step={5}
          display={`${minutes} min`}
          onChange={setMinutes}
        />
        <Slider label="Custo da hora da equipe" value={hourly} min={20} max={120} step={5} display={formatBRL(hourly)} onChange={setHourly} />
        <Slider
          label="Clientes novos por mês via site"
          value={newClients}
          min={0}
          max={5}
          step={1}
          display={String(newClients)}
          onChange={setNewClients}
        />
        <Slider label="Honorário médio mensal" value={fee} min={300} max={2000} step={50} display={formatBRL(fee)} onChange={setFee} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-white p-6">
          <p className="text-sm font-medium text-slate-500">Horas de equipe liberadas</p>
          <p className="mt-2 font-serif text-4xl font-bold text-navy-900">{Math.round(r.hours)} h/mês</p>
          <p className="mt-2 text-sm text-slate-500">≈ {formatBRL(r.hoursValue)} por mês em capacidade da equipe</p>
        </div>
        <div className="rounded-3xl bg-white p-6">
          <p className="text-sm font-medium text-slate-500">Receita nova no 1º ano</p>
          <p className="mt-2 font-serif text-4xl font-bold text-navy-900">{formatBRL(r.revenue12)}</p>
          <p className="mt-2 text-sm text-slate-500">e {formatBRL(r.mrr12)}/mês recorrentes a partir do 13º mês</p>
        </div>
        <div className="rounded-3xl bg-gold-500 p-6 sm:col-span-2">
          <p className="text-sm font-semibold text-navy-900">Payback da Fase 1 (considerando apenas clientes novos)</p>
          <p className="mt-2 font-serif text-4xl font-bold text-navy-950">
            {r.payback ? `${r.payback} ${r.payback === 1 ? "mês" : "meses"}` : "acima de 36 meses"}
          </p>
          <p className="mt-2 text-sm text-navy-900/80">
            Base: setup de {formatBRL(PHASE1_SETUP)} + {formatBRL(PHASE1_MONTHLY)}/mês (pontos médios da proposta). As horas
            liberadas pelo portal entram como ganho adicional.
          </p>
        </div>
      </div>
    </div>
  );
}
