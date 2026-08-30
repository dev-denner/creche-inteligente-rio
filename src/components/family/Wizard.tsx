"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFamilyStore } from "@/lib/family-store";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { DocumentTriage } from "@/components/family/DocumentTriage";

type CatalogUnit = {
  unidade: number;
  nome_unidade: string;
  bairro: string | null;
  grupamento: string;
  horario: string;
  comp: "ALTA" | "MÉDIA" | "BAIXA";
};

// Real 2025 rubric, hardcoded here to avoid a server round-trip mid-wizard --
// values match data/processed/regua-2025.json (regenerate both from the same
// pipeline if the régua ever changes). Two criteria that carry no points
// (tie-break only) are omitted from this demonstrative document flow.
type Criterio = { id: string; label: string; pts: number; auto?: string };
const CRITERIOS: Criterio[] = [
  { id: "28", label: "Criança cuja família seja inscrita no CadÚnico", pts: 51, auto: "CadÚnico" },
  { id: "31", label: "A criança é público-alvo da educação especial", pts: 25 },
  { id: "6", label: "Faz parte do programa Bolsa Família ou possui Cartão Carioca", pts: 2, auto: "Bolsa Família" },
  { id: "17", label: "Vítima de violência doméstica no convívio da criança", pts: 4 },
  { id: "20", label: "Família monoparental", pts: 4 },
  { id: "25", label: "Pais ou responsáveis com deficiência", pts: 3 },
  { id: "18", label: "Doenças crônicas graves na família", pts: 3 },
  { id: "16", label: "Uso abusivo de drogas/álcool na família", pts: 2 },
  { id: "12", label: "Membro da família presidiário/ex-presidiário (5 anos)", pts: 2 },
  { id: "23", label: "Candidato é refugiado", pts: 2 },
];

const STEPS = ["Criança", "Responsável", "Moradia", "Vulnerabilidade", "Unidades", "Revisão"];

export function Wizard({ catalog }: { catalog: CatalogUnit[] }) {
  const router = useRouter();
  const { addChild, addAudit } = useFamilyStore();

  const [step, setStep] = useState(1);
  const [child, setChild] = useState({ name: "", cpf: "", nasc: "", group: "Berçário" });
  const [resp, setResp] = useState({ name: "Ana Souza", tel: "", email: "ana.souza@email.com" });
  const [canais, setCanais] = useState({ portal: true, email: true, whats: false, sms: false });
  const [contacts, setContacts] = useState([{ name: "", tel: "", rel: "Avó/Avô" }]);
  const [addr, setAddr] = useState({ cep: "", log: "", num: "", comp: "", bairro: "", mun: "Rio de Janeiro" });
  const [vuln, setVuln] = useState<Record<string, boolean>>({});
  const [docs, setDocs] = useState<Record<string, string>>({});
  const [filtro, setFiltro] = useState("");
  const [opts, setOpts] = useState<CatalogUnit[]>([]);
  const [signed, setSigned] = useState(false);
  const [protocol, setProtocol] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const f = filtro.trim().toLowerCase();
    const rows = !f
      ? catalog.slice(0, 30)
      : catalog.filter((u) => u.nome_unidade.toLowerCase().includes(f) || (u.bairro ?? "").toLowerCase().includes(f)).slice(0, 30);
    return rows;
  }, [catalog, filtro]);

  const vulnOk = Object.keys(vuln).every((id) => docs[id] || CRITERIOS.find((c) => c.id === id)?.auto);
  const totalPts = Object.keys(vuln).reduce((sum, id) => sum + (CRITERIOS.find((c) => c.id === id)?.pts ?? 0), 0);

  function toggleCrit(id: string) {
    setVuln((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  }

  function addOpt(u: CatalogUnit) {
    if (opts.length >= 5) return;
    if (opts.find((o) => o.unidade === u.unidade && o.grupamento === u.grupamento && o.horario === u.horario)) return;
    setOpts((prev) => [...prev, u]);
  }
  function rmOpt(i: number) {
    setOpts((prev) => prev.filter((_, idx) => idx !== i));
  }
  function mvOpt(i: number, d: number) {
    const j = i + d;
    if (j < 0 || j >= opts.length) return;
    setOpts((prev) => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function cepLookup() {
    if (addr.cep.replace(/\D/g, "").length >= 5) {
      setAddr((prev) => ({ ...prev, log: "Rua das Acácias", bairro: prev.bairro || "Tijuca" }));
    }
  }

  function submit() {
    const proto = `2027-00${Math.floor(4000 + Math.random() * 999)}`;
    addChild({
      id: `c${Date.now()}`,
      name: child.name || "João Souza",
      cpfChild: child.cpf || "***.***.***-**",
      group: child.group,
      protocol: proto,
      options: opts.map((o) => ({
        unidade: o.unidade,
        nome_unidade: o.nome_unidade,
        bairro: o.bairro,
        grupamento: o.grupamento,
        horario: o.horario,
        comp: o.comp === "ALTA" ? "Alta" : o.comp === "MÉDIA" ? "Média" : "Baixa",
      })),
      vulnCriteria: Object.keys(vuln).map((id) => CRITERIOS.find((c) => c.id === id)?.label ?? id),
      vulnPts: totalPts,
      createdAt: Date.now(),
    });
    addAudit({
      ts: "agora",
      tipo: "Inscrição",
      desc: `Nova inscrição ${proto} — ${child.name || "João Souza"} (${child.group})`,
      origin: "Portal",
    });
    setProtocol(proto);
  }

  if (protocol) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-10 text-center">
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <p className="text-3xl">✅</p>
          <h1 className="text-xl font-semibold" style={{ color: "var(--azul9)" }}>
            Inscrição enviada!
          </h1>
          <p className="mt-2 text-sm text-black/70">
            Protocolo <strong>{protocol}</strong>. Documentação recebida e assinada via gov.br
            (simulado). Acompanhe pelo bloco da criança na home.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-md px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "var(--azul7)" }}
          >
            Ir para Minhas inscrições
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6">
      <h1 className="text-xl font-semibold" style={{ color: "var(--azul9)" }}>
        Nova inscrição — Inscrição Creche 2027
      </h1>
      <p className="mb-4 text-sm text-black/60">
        Momento 1 · Inscrição ➜ Momento 2 · Documentação ➜ Momento 3 · Acompanhamento
      </p>

      <div className="mb-4 flex flex-wrap gap-1">
        {STEPS.map((name, i) => (
          <span
            key={name}
            className="min-w-[90px] flex-1 rounded-md px-2 py-2 text-center text-xs font-bold"
            style={
              step === i + 1
                ? { background: "var(--azul7)", color: "#fff" }
                : step > i + 1
                  ? { background: "var(--verde1)", color: "var(--verde7)" }
                  : { background: "var(--c1)", color: "var(--c5)" }
            }
          >
            {i + 1}. {name}
          </span>
        ))}
      </div>

      <div className="rounded-lg bg-white p-5 shadow-sm">
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <Alert>
              <strong>Momento 1 — Inscrição.</strong> O CPF da criança é o identificador oficial
              único da inscrição.
            </Alert>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nome completo da criança*">
                <input className="input" value={child.name} onChange={(e) => setChild({ ...child, name: e.target.value })} placeholder="Ex.: João Souza" />
              </Field>
              <Field label="CPF da criança* (identificador oficial)">
                <input className="input" value={child.cpf} onChange={(e) => setChild({ ...child, cpf: e.target.value })} placeholder="000.000.000-00" />
              </Field>
              <Field label="Data de nascimento*">
                <input type="date" className="input" value={child.nasc} onChange={(e) => setChild({ ...child, nasc: e.target.value })} />
              </Field>
              <Field label="Grupamento">
                <select className="input" value={child.group} onChange={(e) => setChild({ ...child, group: e.target.value })}>
                  {["Berçário", "Maternal I", "Maternal II"].map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </Field>
            </div>
            <StepNav onNext={() => setStep(2)} />
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <Alert>Estes dados servem para a Prefeitura falar com você sobre a vaga.</Alert>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nome da pessoa responsável">
                <input className="input" value={resp.name} onChange={(e) => setResp({ ...resp, name: e.target.value })} />
              </Field>
              <Field label="CPF (via gov.br)">
                <input className="input" value="123.456.789-10" disabled />
              </Field>
              <Field label="Celular*">
                <input className="input" value={resp.tel} onChange={(e) => setResp({ ...resp, tel: e.target.value })} placeholder="(21) 9 0000-0000" />
              </Field>
              <Field label="E-mail*">
                <input className="input" value={resp.email} onChange={(e) => setResp({ ...resp, email: e.target.value })} />
              </Field>
            </div>
            <h3 className="text-sm font-semibold" style={{ color: "var(--azul9)" }}>
              Canais de notificação
            </h3>
            {[
              ["portal", "Portal (sempre ativo)", true],
              ["email", "E-mail (sempre ativo)", true],
              ["whats", "WhatsApp — opcional", false],
              ["sms", "SMS — opcional", false],
            ].map(([k, l, lock]) => (
              <label key={k as string} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={canais[k as keyof typeof canais]}
                  disabled={!!lock}
                  onChange={(e) => setCanais({ ...canais, [k as string]: e.target.checked })}
                />
                {l}
                {(k === "whats" || k === "sms") && <ProvenanceBadge kind="pendente-sme" className="ml-1" />}
              </label>
            ))}
            <h3 className="mt-2 text-sm font-semibold" style={{ color: "var(--azul9)" }}>
              Contatos de confiança
            </h3>
            {contacts.map((c, i) => (
              <div key={i} className="grid items-end gap-2 sm:grid-cols-3">
                <Field label="Nome">
                  <input className="input" value={c.name} onChange={(e) => setContacts(contacts.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)))} />
                </Field>
                <Field label="Telefone">
                  <input className="input" value={c.tel} onChange={(e) => setContacts(contacts.map((x, idx) => (idx === i ? { ...x, tel: e.target.value } : x)))} />
                </Field>
                <div className="flex gap-2">
                  <select className="input" value={c.rel} onChange={(e) => setContacts(contacts.map((x, idx) => (idx === i ? { ...x, rel: e.target.value } : x)))}>
                    {["Avó/Avô", "Tia/Tio", "Vizinha/Vizinho", "Amiga/Amigo", "Outro"].map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                  {contacts.length > 1 && (
                    <button onClick={() => setContacts(contacts.filter((_, idx) => idx !== i))} className="btn-secondary">
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button onClick={() => setContacts([...contacts, { name: "", tel: "", rel: "Tia/Tio" }])} className="btn-secondary w-fit">
              ➕ Adicionar outro contato
            </button>
            <StepNav onBack={() => setStep(1)} onNext={() => setStep(3)} />
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <Alert>O endereço ajuda a sugerir unidades próximas.</Alert>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="CEP*">
                <input className="input" value={addr.cep} onChange={(e) => setAddr({ ...addr, cep: e.target.value })} onBlur={cepLookup} placeholder="20000-000" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Logradouro">
                  <input className="input" value={addr.log} onChange={(e) => setAddr({ ...addr, log: e.target.value })} />
                </Field>
              </div>
              <Field label="Número">
                <input className="input" value={addr.num} onChange={(e) => setAddr({ ...addr, num: e.target.value })} />
              </Field>
              <Field label="Complemento">
                <input className="input" value={addr.comp} onChange={(e) => setAddr({ ...addr, comp: e.target.value })} />
              </Field>
              <Field label="Bairro*">
                <input className="input" value={addr.bairro} onChange={(e) => setAddr({ ...addr, bairro: e.target.value })} />
              </Field>
            </div>
            <StepNav onBack={() => setStep(2)} onNext={() => setStep(4)} />
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <ProvenanceBadge kind="historico-2025" />
              <span className="text-xs text-black/50">Régua histórica 2025 — dataset do desafio (pontos reais)</span>
            </div>
            <Alert>
              Marque apenas o que se aplica. Cada critério marcado exige comprovação. CadÚnico e
              Bolsa Família seriam verificados via API (integração simulada).
            </Alert>
            {CRITERIOS.map((c) => {
              const on = !!vuln[c.id];
              return (
                <div key={c.id} className="rounded-lg border p-3" style={on ? { borderColor: "var(--azul7)", background: "var(--azul0)" } : { borderColor: "var(--c3)" }}>
                  <label className="flex items-start gap-2 text-sm font-semibold">
                    <input type="checkbox" checked={on} onChange={() => toggleCrit(c.id)} />
                    <span>
                      {c.label} <GovPts pts={c.pts} /> {c.auto && <GovAuto label={c.auto} />}
                    </span>
                  </label>
                  {on &&
                    (c.auto ? (
                      <p className="ml-6 mt-1 text-xs text-black/60">
                        ✓ Verificação automática {c.auto} (integração simulada)
                      </p>
                    ) : docs[c.id] ? (
                      <p className="ml-6 mt-1 text-xs text-black/60">📎 {docs[c.id]}</p>
                    ) : (
                      <div className="ml-6 mt-2 rounded-md border-2 border-dashed border-black/20 bg-[var(--c0)] p-2 text-center text-sm">
                        <label className="cursor-pointer font-semibold" style={{ color: "var(--azul7)" }}>
                          📎 Selecionar arquivo (PDF/JPG/PNG até 5MB)
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && setDocs({ ...docs, [c.id]: e.target.files[0].name })}
                          />
                        </label>
                      </div>
                    ))}
                </div>
              );
            })}
            {!vulnOk && <div className="rounded-md p-2 text-sm" style={{ background: "var(--lar1)", color: "var(--lar7)" }}>⚠️ Há critérios marcados sem comprovação anexada.</div>}
            <DocumentTriage />
            <StepNav onBack={() => setStep(3)} onNext={() => setStep(5)} nextDisabled={!vulnOk} />
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col gap-4">
            <Alert>
              Escolha <strong>até 5 unidades</strong> em ordem de preferência real. Ordene as
              unidades pelo seu desejo real.
            </Alert>
            <Field label="Buscar por nome ou bairro">
              <input className="input" value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Ex.: Tijuca ou Cidade de Deus" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold" style={{ color: "var(--azul9)" }}>
                  Unidades reais (histórico 2025)
                </h3>
                <div className="flex max-h-96 flex-col gap-2 overflow-y-auto pr-1">
                  {filtered.map((u, i) => (
                    <div key={i} className="rounded-lg border border-black/10 bg-white p-3 text-sm">
                      <strong>{u.nome_unidade}</strong>
                      <br />
                      <span className="text-xs text-black/50">
                        {u.bairro ?? "bairro não disponível"} · {u.grupamento} · {u.horario}
                      </span>
                      <br />
                      <CompLabel comp={u.comp} />
                      <button onClick={() => addOpt(u)} disabled={opts.length >= 5} className="btn-secondary mt-2 w-full disabled:opacity-40">
                        ➕ Adicionar
                      </button>
                    </div>
                  ))}
                  {filtered.length === 0 && <p className="text-xs text-black/50">Nenhuma unidade para este filtro.</p>}
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold" style={{ color: "var(--azul9)" }}>
                  Suas escolhas ({opts.length}/5) — ordem de preferência
                </h3>
                <div className="flex flex-col gap-2">
                  {opts.map((o, i) => (
                    <div key={i} className="rounded-lg border border-black/10 bg-white p-3 text-sm">
                      <div className="flex justify-between gap-2">
                        <div>
                          <strong>
                            {i + 1}ª — {o.nome_unidade}
                          </strong>
                          <br />
                          <span className="text-xs text-black/50">
                            {o.bairro} · {o.horario}
                          </span>
                          <br />
                          <CompLabel comp={u_comp(o)} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <button onClick={() => mvOpt(i, -1)} className="btn-secondary">↑</button>
                          <button onClick={() => mvOpt(i, 1)} className="btn-secondary">↓</button>
                          <button onClick={() => rmOpt(i)} className="btn-secondary">✕</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {opts.length === 0 && <p className="text-xs text-black/50">Nenhuma unidade escolhida ainda.</p>}
                </div>
                <div className="mt-3 rounded-lg p-3 text-sm" style={{ background: "var(--roxo1)", color: "var(--roxo7)" }}>
                  🧪 <strong>Proposta em avaliação (SME):</strong> a ordem de preferência poderá
                  somar pontos no futuro (ver Laboratório de Política Pública). <ProvenanceBadge kind="proposta" />
                </div>
              </div>
            </div>
            <StepNav onBack={() => setStep(4)} onNext={() => setStep(6)} nextDisabled={opts.length === 0} />
          </div>
        )}

        {step === 6 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold" style={{ color: "var(--azul9)" }}>
              Revise antes de enviar
            </h3>
            <div className="grid gap-2 text-xs text-black/50 sm:grid-cols-2">
              <div><strong className="block text-sm text-black">{child.name || "—"}</strong>Criança · CPF {child.cpf || "—"} · {child.group}</div>
              <div><strong className="block text-sm text-black">{resp.name}</strong>Responsável · {resp.tel || "tel. não informado"} · {contacts.filter((c) => c.name).length} contato(s)</div>
              <div><strong className="block text-sm text-black">{addr.bairro || "—"}</strong>Bairro · CEP {addr.cep || "—"}</div>
              <div>
                <strong className="block text-sm text-black">
                  {totalPts} pts <ProvenanceBadge kind="historico-2025" />
                </strong>
                Vulnerabilidade declarada · {Object.keys(vuln).length} critério(s)
              </div>
            </div>
            <table className="table">
              <thead><tr><th>Ordem</th><th>Unidade</th><th>Turno</th><th>Concorrência</th></tr></thead>
              <tbody>
                {opts.map((o, i) => (
                  <tr key={i}><td>{i + 1}ª</td><td>{o.nome_unidade}</td><td>{o.horario}</td><td><CompLabel comp={u_comp(o)} /></td></tr>
                ))}
              </tbody>
            </table>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={signed} onChange={(e) => setSigned(e.target.checked)} />
              Declaro que as informações são verdadeiras e estou ciente de que critérios comprovados
              passam por validação (triagem com apoio de IA e decisão humana nas exceções).
            </label>
            <div className="flex gap-2">
              <button onClick={() => setStep(5)} className="btn-secondary">← Voltar</button>
              <button onClick={submit} disabled={!signed} className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-40" style={{ background: "var(--verde7)" }}>
                🔏 Assinar com gov.br e enviar inscrição
              </button>
            </div>
            <ProvenanceBadge kind="demonstracao" />
          </div>
        )}
      </div>
    </div>
  );
}

function u_comp(o: CatalogUnit): "ALTA" | "MÉDIA" | "BAIXA" {
  return o.comp;
}

function CompLabel({ comp }: { comp: "ALTA" | "MÉDIA" | "BAIXA" }) {
  const color = comp === "ALTA" ? "var(--verm7)" : comp === "MÉDIA" ? "var(--lar7)" : "var(--verde7)";
  return (
    <span style={{ color, fontWeight: 700 }} className="text-xs">
      Concorrência: {comp}
    </span>
  );
}

function GovPts({ pts }: { pts: number }) {
  return (
    <span className="ml-1 rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: "var(--azul0)", color: "var(--azul9)" }}>
      {pts} pts
    </span>
  );
}
function GovAuto({ label }: { label: string }) {
  return (
    <span className="ml-1 rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: "var(--verde1)", color: "var(--verde7)" }}>
      verificação automática {label}
    </span>
  );
}

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 rounded-lg p-3 text-sm" style={{ background: "var(--azul0)", color: "var(--azul9)" }}>
      <span aria-hidden="true">ℹ️</span>
      <span>{children}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold">{label}</label>
      {children}
    </div>
  );
}

function StepNav({ onBack, onNext, nextDisabled }: { onBack?: () => void; onNext: () => void; nextDisabled?: boolean }) {
  return (
    <div className="flex gap-2">
      {onBack && (
        <button onClick={onBack} className="btn-secondary">
          ← Voltar
        </button>
      )}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        style={{ background: "var(--azul7)" }}
      >
        Continuar
      </button>
    </div>
  );
}
