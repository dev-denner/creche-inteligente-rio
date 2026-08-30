# Modelo de oportunidade — oferta × demanda (2025)

Gerado por `scripts/build_opportunity.py` → `data/processed/opportunity-2025.json`.
Evidência da junção em `scripts/explore_offer_join.py` (roda independente, só
imprime um relatório, não escreve nada).

**Resumo**: a junção entre demanda (Query A) e oferta (`OferecimentosEvagas`)
**funciona bem como chave** (99,4% das unidades citadas na Query A 2025 têm
algum registro de oferta), mas o conceito de "vaga"/"capacidade" só existe
nos dados para uma parte da rede (unidades parceiras). Por isso o modelo é
honesto sobre onde consegue calcular déficit/superávit e onde só consegue
reportar demanda e matrícula.

## Chave de junção

Testamos, nesta ordem, código da unidade → SGA → INEP → combinação de
atributos → nome (ver `scripts/explore_offer_join.py`). **Não foi preciso
chegar a nome**: o código da unidade, tratado como **inteiro simples, sem
padding de zeros assumido**, já une todas as bases:

```
int(unidade)              -- Query A, campo "unidade"
== int(esc_codigo)        -- Query D (04_UnidadesEscolaresComEndereco)
== int(DESIGNACAO)        -- Unidades_Unificadas_com_Localizacao.xlsx
== int(CÓDIGO SGA)        -- Parceiras2025.xlsx (unidades parceiras)
== int(Designacao)        -- totaalunoscreche2025.xlsx (unidades públicas)
```

**Por que zfill(7) uniforme está errado**: unidades parceiras usam códigos
curtos (`1004`) e unidades públicas usam códigos mais longos (`101601`) no
mesmo campo `unidade` da Query A — só que com larguras de zero-padding
*diferentes* (Query A grava `01004` com 5 caracteres para a parceira e
`0101601` com 7 caracteres para a pública). Forçar os dois para 7 dígitos
corrompe os códigos curtos e derruba a taxa de match de ~99% para ~25-40%.
Convertendo tudo para inteiro puro (removendo qualquer padding), a
comparação fica correta e determinística.

## Cobertura da junção (medida, não estimada)

| Comparação | Candidatos | Casados | Cobertura |
| --- | ---: | ---: | ---: |
| Query D `esc_codigo` × unidade (Query A, 5 anos) | 2.084 | 872 | **100,0%** das 872 unidades da Query A |
| `Unidades_Unificadas.DESIGNACAO` × unidade (Query A, 5 anos) | 1.941 | 852 | **97,7%** |
| Oferta 2025 (Parceiras2025 ∪ totalalunoscreche2025) × unidade (Query A, 2025) | 1.904 | 831 | **99,4%** (de 836 unidades) |

`Unidades_Unificadas.DESIGNACAO` é chave única (0 duplicados) — é o melhor
catálogo mestre disponível, e é dele que vêm CRE, bairro, microárea e
lat/long no agregado.

`esc_codigo` da Query D **não é único** (83 linhas com código repetido, 40
desses códigos duplicados aparecem em unidades citadas na Query A) — são
majoritariamente o mesmo prédio físico com dois registros (um "ativo" com
endereço, tipo 1, e um legado sem endereço, tipo 3). Não usamos Query D como
catálogo mestre por causa disso; usamos `Unidades_Unificadas` (chave limpa).

As 5 unidades da Query A 2025 sem nenhum registro de oferta em 2025 são
todas parceiras "CP Associação Creche Esperança" (Realengo, Magalhães
Bastos, Irajá, Coelho Neto, Ilha do Governador) — hipótese mais provável é
saída do convênio antes da extração de maio/2025; não confirmado com a SME.

## Armadilha encontrada nesta missão

`grupamento` na Query A vem com **espaço em branco à direita** em pelo menos
um valor (`"Maternal II "`, 12 caracteres, contra `"Maternal II"` nos
arquivos de oferta). Sem `TRIM()`, todo o grupamento Maternal II falha
silenciosamente na junção — a cobertura cai de 99,4% para 92,6% sem
nenhum erro, só números errados. `build_opportunity.py` aplica `TRIM()` no
`grupamento` da Query A antes de agregar; deixamos o teste de cobertura
mínima (≥95%) no script como trava contra essa classe de regressão.

## Definição de demanda

Três métricas, deliberadamente **não reduzidas a uma única "demanda"**:

- **Demanda de 1ª preferência** (`demanda_1a_preferencia`): número de
  inscrições distintas com `opcao = 1` para aquela unidade × grupamento ×
  horário. Cada inscrição contribui no máximo uma linha com `opcao = 1`
  (verificado: 0 inscrições com mais de uma linha `opcao=1` em 2025) — não
  há risco de dupla contagem aqui por construção.
- **Demanda total de preferência** (`demanda_total_preferencia_unidade`):
  `COUNT(DISTINCT inscrição)` que citou a unidade em **qualquer** opção
  (1 a 6), agregada só por unidade (não por grupamento/horário, porque a
  mesma inscrição pode combinar grupamento/horário diferentes em opções
  diferentes na mesma unidade). Usamos `COUNT(DISTINCT ...)` sobre a chave
  da inscrição, não `COUNT(*)` de linhas — uma inscrição com 3 opções na
  mesma unidade conta 1, não 3.
- **Fila observada por situação** (`fila_por_situacao`): contagem de opções
  por valor de `situacao`, por unidade × grupamento × horário. Não
  escolhemos uma definição de "fila ativa" — o agregado traz todas as 8
  categorias (`Confirmado`, `Lista de espera`, `Cancelado na confirmacao`,
  `Cancelado pelo sistema`, `Cancelado`, `Selecionado da lista`, `Ativo`,
  `Selecionado`) para a equipe decidir depois. Exemplo real (unidade 7013,
  Berçário/Integral, CRE 7): 320 em `Lista de espera`, 41 `Confirmado`, 110
  `Cancelado pelo sistema`, 8 `Cancelado na confirmacao`, 3 `Cancelado`, 0
  nas demais — a escolha de que subconjunto conta como "fila" muda o número
  em uma ordem de grandeza (de 41 a 481 dependendo do que se soma).

Checagem de integridade: a soma de `demanda_1a_preferencia` no agregado
(71.949) bate exatamente com `COUNT(*)` de linhas `opcao=1, ano=2025` na
Query A crua — zero perda, zero duplicação.

## Definição de oferta

**Não tratamos matrícula como capacidade nem oferta como vaga disponível
por padrão** — só quando o próprio dado distingue os dois.

### Unidades parceiras (`Parceiras2025.xlsx`, aba `MAIO -2025`)

Tem uma coluna `Meta` (capacidade contratada no fomento) **e** uma coluna
`Aluno` (matrícula) **por grupamento** (BI, BII, Mat.I, Mat.II) — e uma
coluna `Vagas` já calculada pela própria SME como `Meta − Aluno`. Não
derivamos essa conta; só a lemos. BI e BII são somados no agregado para
casar com o único grupamento "Berçário" que a Query A usa em 2025 (a Query A
não distingue Berçário I/II neste processo).

Campos no agregado: `meta_capacidade`, `matriculas`, `vagas_ofertadas`
(pode ser negativo = turma além da meta), `capacidade_disponivel: true`.

Essa base **não separa por horário** (Integral/Parcial) — o agregado
repete o mesmo valor de oferta parceira para as linhas Integral e Parcial
da mesma unidade/grupamento quando a demanda existir nos dois turnos; isso
é uma limitação de granularidade da fonte, não do nosso pipeline.

### Unidades públicas (`totaalunoscreche2025.xlsx`, aba `Consolidado`)

Tem `Aluno` (matrícula) e `Turma` (nº de turmas abertas) por grupamento ×
turno (Integral/Parcial — este arquivo casa exatamente com o `horario` da
Query A). **Não tem nenhuma coluna de meta/capacidade contratada.**

Por isso, para unidades públicas o agregado traz `matriculas` e `turmas`,
mas `meta_capacidade`, `vagas_ofertadas` e `saldo_potencial` ficam `null`
com `capacidade_disponivel: false`. Não inventamos uma capacidade a partir
de alunos/turma — isso seria uma suposição não sustentada pelo dado (por
exemplo, número de alunos por turma varia por grupamento e por unidade, e
usar a média para estimar capacidade "sobraria" ou "faltaria" vaga de forma
artificial).

**Consequência prática**: das 836 unidades citadas na Query A em 2025, ~493
(59%, tipo `publica`) só têm matrícula+turma; ~343 (41%, tipo `parceira`)
têm capacidade real e permitem calcular déficit/superávit. Rankings de
"vaga ociosa"/"pressão real" neste modelo **só cobrem a fatia parceira** —
isso está marcado explicitamente em cada registro (`capacidade_disponivel`)
e nos dois top-10 abaixo.

## O que podemos e não podemos chamar de "vaga ociosa"

- **Podemos** chamar de vaga ofertada/vaga ociosa potencial o `vagas_ofertadas`
  de unidades **parceiras**, porque vem de uma coluna `Meta` (capacidade
  contratada) que a própria SME mantém e comparamos com `Aluno` (matrícula)
  real do mesmo mês.
- **Não podemos** chamar matrícula de unidades **públicas** de "capacidade
  ocupada" nem inferir vaga ociosa nelas — o dado não tem meta/capacidade
  contratada nesta extração. Alunos matriculados podem estar abaixo da
  capacidade real por vários motivos (turma em formação, redução por
  inclusão, etc.) que não temos como distinguir de "vaga realmente livre".
- **Não podemos** assumir que uma criança em `Lista de espera` em uma
  unidade com `vagas_ofertadas > 0` será necessariamente chamada para essa
  vaga — famílias listam até 5-6 opções, e a convocação pode vir de outra
  unidade. `saldo_potencial` é um indicador de tensão oferta×fila **nessa
  unidade especificamente**, não uma previsão de quem será chamado.

## Fórmulas usadas

```
demanda_1a_preferencia            = COUNT(inscrições distintas com opcao=1)
demanda_total_preferencia_unidade = COUNT(DISTINCT inscrição que citou a unidade em qualquer opcao)
fila_por_situacao[s]              = COUNT(opções com situacao = s)
vagas_ofertadas (só parceiras)     = Meta − Aluno   [já vem pronto na fonte]
relacao_demanda_1a_por_capacidade = demanda_1a_preferencia / meta_capacidade   [null se meta=0]
saldo_potencial (só parceiras)     = vagas_ofertadas − fila_por_situacao["Lista de espera"]
```

## Métricas observadas vs. derivadas

| Métrica | Observada (direto da fonte) | Derivada (calculada por nós) |
| --- | --- | --- |
| `demanda_1a_preferencia` | — | sim (agregação de linhas `opcao=1`) |
| `demanda_total_preferencia_unidade` | — | sim (contagem distinta por inscrição) |
| `fila_por_situacao` | — | sim (agregação por `situacao`) |
| `meta_capacidade`, `matriculas` (parceiras) | sim (colunas `Meta`/`Aluno`) | — |
| `vagas_ofertadas` (parceiras) | sim (coluna `Vagas` já calculada pela SME) | — |
| `matriculas`, `turmas` (públicas) | sim (colunas `Aluno`/`Turma`) | — |
| `relacao_demanda_1a_por_capacidade` | — | sim |
| `saldo_potencial` | — | sim, e **é uma leitura nossa, não um indicador oficial da SME** |
| CRE, bairro, microárea, lat/long | sim (`Unidades_Unificadas_com_Localizacao`) | — |

## Territorialidade

`Unidades_Unificadas_com_Localizacao.xlsx` traz `CRE`, `microárea`,
`LATITUDE`/`LONGITUDE` e `bairro` por unidade, com 1.941/1.941 unidades
com lat/long preenchido e 1.890/1.941 com microárea preenchida. No
agregado 2025, 820/836 unidades (98,1%) da Query A ganharam essas colunas.
Preservamos lat/long e microárea nos registros para uso territorial futuro,
mas **não geramos mapa nesta missão**.

A junção entre `microárea` (formato `"7.14"`) e o shapefile
`Microareas_SME_revisao.shp` (`cod_territ`) **não foi validada** — o
shapefile só tem 6 campos técnicos, sem nome de território legível, e não
foi conferido linha a linha se `"7.14"` bate com o `cod_territ` do
polígono correspondente. Fica como próximo passo antes de qualquer mapa.

## Limitações gerais deste modelo

1. Cobre só 2025 (a régua e as planilhas de oferta variam por ano — ver
   `docs/data-understanding.md` — extrapolar para outros anos exige
   reparsear cada arquivo, cujo schema já vimos que muda ano a ano).
2. `saldo_potencial` compara vaga de um mês (maio/2025) com fila acumulada
   ao longo do processo seletivo inteiro — não são exatamente a mesma
   janela de tempo.
3. Não sabemos se a criança em `Lista de espera` já foi atendida em outra
   unidade (a Query A é um snapshot por opção, não um histórico de
   transição de status).
4. Indicadores absolutos deste dataset, por ser anonimizado, **não
   representam a realidade** (aviso do próprio README oficial da SME).
