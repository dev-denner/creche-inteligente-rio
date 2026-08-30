# Laboratório de Política Pública — o que é real e o que é simulado

Gerado por `scripts/build_policy_lab.py` → `data/processed/policy-lab-2025.json`.
Alimenta a feature **Laboratório de Política Pública** da Visão CRE: testar
o efeito de dar peso à ordem de preferência da família, somado à pontuação
socioeconômica, **sem** alterar a classificação real do Portal da Família.

## O que é REAL nesta amostra

- **15 filas reais de 2025** (unidade × grupamento × horário), escolhidas
  como as 15 de maior demanda de 1ª preferência — mesma lógica de ranking
  já usada em `opportunity-2025.json`.
- **5.070 candidatos reais** (linhas reais da Query A dentro dessas 15 filas,
  qualquer `opcao`, qualquer `situacao`).
- **`opcao` real**: a ordem de preferência que aquela família de fato
  registrou para aquela unidade específica.
- **`pontuacao` real reconstruída**: soma dos pontos da régua oficial de
  2025 (Query C) para cada pergunta em que a família respondeu "Sim"
  (Query B), por inscrição. Verificado nesta missão: 71.930 das 71.949
  inscrições de 2025 têm pontuação reconstruída (0–100, média 27,7); as
  demais ficam em 0 por não ter nenhuma resposta registrada (mesmo padrão
  de ~2,4% de inscrições sem resposta já documentado em
  `docs/data-understanding.md`).
- **`situacao` real** da opção, para contexto (não usada no cálculo de
  ranking).
- CRE, bairro e nome da unidade: do catálogo `Unidades_Unificadas_com_Localizacao`.

## O que NÃO é replicado (e por quê)

- **Critérios de desempate oficiais** (`perg_criterio = 'Sim'`, ex.: "possui
  irmão participando", "mãe adolescente") não valem pontos e não entram na
  soma — a régua real os usa só para desempatar pontuações iguais, e não
  reconstituímos essa lógica de desempate aqui. Em caso de empate de
  pontuação nesta amostra, a ordem é apenas o `candidato_id` (rótulo
  sequencial, arbitrário).
- **Não sabemos se a classificação oficial usa `resposta` ou
  `confirmado`** — usamos `resposta = 'Sim'` (a resposta dada pela
  família); `confirmado` marca validação e pode divergir. Não confirmado
  com a SME.
- **Não filtramos por `situacao`** ao montar a fila — a posição calculada
  aqui é puramente por pontuação, não a fila operacional oficial (que pode
  ter outras regras administrativas).

## Privacidade

- `candidato_id` é um rótulo sequencial **atribuído por este pipeline**,
  não o `aluno_anon` do dataset — não é correlacionável com a aparição da
  mesma criança em outras análises ou outros anos.
- Nenhuma resposta individual por pergunta é exposta — só o total agregado
  por candidato. Isso evita reconstruir/expor qual critério de
  vulnerabilidade específico (deficiência, CadÚnico, violência doméstica
  etc.) cada candidato real atendeu.

## Cálculo do cenário simulado

Determinístico, feito no navegador (não pelo Claude), a partir desta
amostra:

```
pontuacao_simulada = pontuacao_real + peso[opcao]
```

com `peso` parametrizável pelos controles do laboratório (padrão:
1ª=20, 2ª=15, 3ª=10, 4ª=5, 5ª=0, 6ª=0). Posição antes/depois = ordenação
por pontuação (real vs. simulada) dentro da mesma fila, desempate estável
por `candidato_id`. Mudança de posição = posição antes − posição depois
(positivo = subiu).

## Por que isso NÃO é a régua vigente

Esta é uma **proposta em avaliação**, não uma regra aplicada. O Portal da
Família continua usando exclusivamente a régua histórica 2025 sem peso de
preferência (`src/lib/demo-scenario.ts`, `src/lib/regua.ts`) — os dois
cálculos são isolados de propósito, e nenhuma alteração no Laboratório
reflete no Portal da Família.
