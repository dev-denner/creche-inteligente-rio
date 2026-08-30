# Entendimento dos dados — SME-Rio Inscrição Creche

Este documento registra o que foi verificado sobre o dataset em `../dadoscreche`
(fora deste repositório, não versionado aqui). Fonte primária:
`dadoscreche/README.md` e `dadoscreche/Bases IC_ ClassificadoseFila/README_dicionario_dados.md`,
confirmado com consultas DuckDB/pandas pontuais durante esta missão.

**Aviso do próprio dataset**: os dados passaram por anonimização (aleatorização,
generalização, supressão). Indicadores absolutos gerados a partir deles **não
representam a realidade** — servem só para ilustrar dinâmicas do processo.

## Bases existentes

| Pasta/arquivo | Conteúdo | Tamanho |
| --- | --- | --- |
| `Bases IC_ ClassificadoseFila/01_QueryA_InscricoesPorAno.csv.gz` | Inscrições e opções de creche, 2021–2025 | 837.179 linhas |
| `Bases IC_ ClassificadoseFila/02_QueryB_RespostasSocioEconomicas.csv.gz` | Respostas ao questionário socioeconômico (formato longo) | 4.357.119 linhas |
| `Bases IC_ ClassificadoseFila/03_QueryC_PerguntasComDescricao.csv` | Catálogo de perguntas e pontuação de classificação por ano | 65 linhas |
| `Bases IC_ ClassificadoseFila/04_UnidadesEscolaresComEndereco.csv` | Endereço das unidades escolares | 2.188 linhas, **sem cabeçalho** |
| `OferecimentosEvagas/Parceiras{2021..2025}.xlsx` | Monitoramento mensal de matrículas de creches conveniadas (parceiras) | 1 planilha/ano, cabeçalho em várias linhas, schema varia por ano |
| `OferecimentosEvagas/total(a)alunoscreche{2021..2025}.xlsx` | Consolidado de alunos/turmas por unidade pública, por grupamento etário | 1 planilha/ano, cabeçalho em 2 linhas (turno x métrica) |
| `OferecimentosEvagas/Unidades_Unificadas_com_Localizacao.xlsx` | Catálogo de unidades com lat/long e `microárea` | 2 abas (`Unidades_Unificadas`, `Planilha1`) |
| `NascidosvivosRJ.xlsx` | Nascidos vivos por bairro de residência e ano (2016–2026), fonte SIM/DATASUS | 1 aba, cabeçalho a partir da linha 5 |
| `Microáreas_SME_revisãoIPP/*.shp` (+ .dbf/.prj/.shx) | Polígonos de microáreas usadas pela SME para território | 233 polígonos; campos `objectid`, `cre`, `cod_territ`, `globalid`, área, perímetro |

Confirmado por leitura direta: Query A tem exatamente 837.179 linhas (bate com o
README); distribuição por ano — 2021: 198.498, 2022: 158.122, 2023: 123.174,
2024: 197.406, 2025: 159.979 (soma 837.179).

## Grão de cada base

- **Query A**: uma linha por *opção de creche escolhida* dentro de uma inscrição.
  Uma criança pode ter várias linhas (várias opções) e reaparecer em anos
  diferentes com o mesmo `aluno_anon`.
- **Query B**: uma linha por *pergunta respondida* dentro de uma inscrição
  (formato longo — não uma coluna por pergunta).
- **Query C**: uma linha por *pergunta usada em um processo/ano* — é o
  catálogo/régua de pontuação, não um fato transacional.
- **Query D**: uma linha por *unidade escolar* (catálogo, sem grão temporal).
- **Parceiras / totalalunoscreche**: uma linha por *unidade escolar parceira ou
  pública*, com colunas repetidas por grupamento etário (Berçário I/II,
  Maternal I/II) — snapshot mensal/anual, não série longa dentro do arquivo.
- **Unidades_Unificadas_com_Localizacao**: uma linha por unidade (catálogo com
  geolocalização e microárea).
- **NascidosvivosRJ**: uma linha por bairro de residência, colunas = anos
  (2016–2026), fonte externa (SIM/DATASUS), não é dado da SME.
- **Microáreas (shapefile)**: um polígono por microárea (`cod_territ`), 233 ao todo.

## Chaves de relacionamento

- Query A ↔ Query B: `(prm_id, plm_id, ipl_id)` — chave da inscrição.
- Query A ↔ Query D: `unidade` (Query A) = `esc_codigo` (Query D, coluna 1,
  posicional pois o CSV não tem cabeçalho). Casa 872/872 unidades da Query A.
- Query B ↔ Query C: `ich_perg_id` — identificador da pergunta *dentro daquele
  processo/ano específico* (não é estável entre anos).
- Query C entre anos: `perg_id` — identificador estável da pergunta no
  catálogo geral, usado para comparar a mesma pergunta ao longo do tempo.
- `aluno_anon` é estável entre opções e entre os 5 processos — é a chave para
  reconstruir a trajetória de uma criança ano a ano.
- Território: `Unidades_Unificadas_com_Localizacao.microárea` (ex.: `1.1`,
  `1.9`) é o candidato natural para juntar unidades ao shapefile de microáreas
  (`cod_territ`), mas **essa junção não foi validada nesta missão** — os
  formatos (`1.1` vs. um código de território) não foram conferidos linha a
  linha e podem exigir tratamento.
- As planilhas de oferta (`Parceiras*`, `totalalunoscreche*`) trazem `CRE`,
  `Designação`/`Nº`/`Código SGA` e nome da unidade, mas **não foi confirmado
  nesta missão** um campo que junte diretamente com `unidade` (`esc_codigo`)
  da Query A — provavelmente exige normalização de nome ou uso de um código
  SGA/INEP que aparece só nalgumas planilhas (visto em `Parceiras2024.xlsx`,
  aba "Maio-2024": colunas `CÓDIGO SGA`, `INEP`, `CNPJ`, `SISEP`).

## Campos relevantes por base

- **Query A**: `ano`, `opcao` (ordem de preferência), `unidade`/`nome_unidade`,
  `grupamento` (faixa etária), `horario` (Integral/Parcial), `situacao`,
  `aluno_anon`, `sexo_crianca`, `nascimento_aluno_anomes` (yyyy-MM),
  `responsavel_anon`, `CEP`/`bairro` do responsável.
- **Query C**: `perg_pontuacao` (0–100, pontos da régua de classificação) e
  `perg_criterio` (Sim = critério de desempate, não pontuação).
- **Oferta**: `Meta`/vagas por grupamento, `Turmas`/`Alunos` (Turno Parcial e
  Turno Integral aparecem como colunas separadas em alguns anos), `Incluídos`,
  `Excedente`.
- **NascidosVivosRJ**: nascimentos por bairro e ano — proxy de demanda
  potencial futura, não demanda real de creche.

## Armadilhas dos dados

1. **`situacao` sem acento/til**: o valor gravado é `Cancelado na confirmacao`
   (sem cedilha, sem til). Filtrar por "Cancelado na confirmação" (com acento)
   devolve zero linhas.
2. **A Query A não vem filtrada por situação.** Contém todos os desfechos,
   inclusive os ~39% cancelados pelo sistema. Qualquer contagem de "demanda"
   ou "fila" precisa declarar explicitamente qual subconjunto de `situacao`
   está sendo usado.
3. **`perg_pontuacao` não é comparável entre anos sem tratamento.** O
   questionário foi redesenhado entre 2023 e 2024 (das 13 perguntas de 2023,
   só 3 seguem em 2024) e os pesos mudaram — ex.: deficiência da criança
   (`perg_id = 2`) valia 100 pontos até 2023 e passou a valer 25 em 2024. Em
   2025 o `perg_id = 2` some da lista por completo, substituído por
   `perg_id = 31` ("A criança é público-alvo da educação especial?", 25
   pontos) — semanticamente parecido, mas é um `perg_id` novo, então uma
   junção ingênua por `perg_id` perde esse critério em 2025. Séries temporais
   de "pontuação total" só fazem sentido normalizadas por `perg_id` e por ano,
   com atenção a perguntas que mudam de identificador ao trocar de redação.
4. **Query D não tem cabeçalho** — ler com `header=None` / posicional, senão
   perde-se a primeira unidade e os nomes de coluna ficam inválidos.
5. **CEP/bairro do responsável nulos em ~2,8% das linhas da Query A.**
6. **As planilhas de oferta (`Parceiras*.xlsx`, `totalalunoscreche*.xlsx`) têm
   cabeçalho em múltiplas linhas e mudam de schema ano a ano** (nomes de
   coluna, acentuação, abas — ex.: 2025 tem aba `Consolidado`, 2021 tem aba
   `2021`; `Parceiras2024.xlsx` tem 3 abas incluindo uma de apoio). Qualquer
   parser precisa ser escrito por ano, não genérico.
7. **`NascidosvivosRJ.xlsx` cobre até 2026**, mas o dado real de inscrição só
   vai até o processo de 2025 — atenção para não comparar períodos
   incompatíveis.
8. **`Microareas_SME_revisao.dbf` tem só 6 campos técnicos** (sem nome de
   bairro/território legível) — para virar mapa legível é preciso outra
   tabela de-para que não foi identificada nesta missão.
9. **Query B é grande (4,36M linhas, ~436MB descompactado).** Não abre no
   Excel (teto de 1.048.576 linhas) e não deve ser carregada inteira em
   memória em máquinas comuns — usar DuckDB ou leitura em chunks.

## Diferenças entre anos

- Nº de perguntas de classificação: 13 perguntas por ano em todos os anos, mas
  o conteúdo mudou fortemente entre 2023 e 2024 (reforma do questionário) e
  novamente entre 2024 e 2025 (pesos redistribuídos, ex.: CadÚnico passou de
  25 para 51 pontos).
- Volume de opções por ano varia bastante (de 123k em 2023 a ~198k em 2021 e
  2024) e não é diretamente proporcional ao número de crianças distintas.
- Nº de unidades distintas por ano salta de ~500 (2021–2023) para ~840
  (2024–2025) — pode refletir expansão real da rede ou mudança na extração;
  não investigado a fundo nesta missão.

## Limitações decorrentes da anonimização

- Não há endereço exato de famílias nem de unidades — só bairro/CEP do lado
  da família, e o que constar em `04_UnidadesEscolaresComEndereco` do lado da
  unidade.
- Não há data exata de nascimento da criança, só `yyyy-MM`.
- Não há identificação real de criança/responsável — apenas códigos estáveis
  (`aluno_anon`, `responsavel_anon`), então qualquer contato com a família
  real (convocação) precisaria de um passo de reidentificação fora deste
  dataset, que este projeto não tem e não deve simular.
- Indicadores absolutos (totais, percentuais) **não representam a realidade**
  segundo o próprio README oficial — servem para ilustrar dinâmica, não para
  dimensionar política pública real.

## O que parece necessário para cada frente do desafio

- **Planejamento de oferta (quantas vagas abrir e onde)**: Query A (demanda
  por opção/território/grupamento) + planilhas de oferta/vagas
  (`OferecimentosEvagas/*`) + `NascidosvivosRJ` (demanda potencial futura) +
  território (`Unidades_Unificadas_com_Localizacao` + shapefile de
  microáreas). O elo entre planilhas de oferta e Query A ainda precisa ser
  estabelecido (ver seção de chaves).
- **Priorização da fila (em que ordem chamar)**: Query A (`situacao =
  'Lista de espera'` como ponto de partida, a confirmar com a equipe) + Query
  B (respostas) + Query C (pontuação/critério de desempate), sempre
  segmentado por ano porque a régua muda.
- **Convocação (garantir que a família chegue à vaga no prazo)**: Query A
  (datas de criação, mudanças de `situacao` ao longo do tempo — mas a
  extração atual é um snapshot, não histórico de transições) + unidades
  (Query D / `Unidades_Unificadas_com_Localizacao`) para distância/logística.
  Não há, nas bases inspecionadas, um campo de "data de convocação" ou "prazo
  de resposta" explícito — precisa ser confirmado com a equipe/SME se existe
  em outra extração.

## Não investigado nesta missão

- Conteúdo completo do `.docx` de parametrização
  (`SME_Processo_Inscricao_Creche_parametrização.docx`).
- Validação linha a linha da junção `microárea` ↔ `cod_territ`.
- Join entre planilhas de oferta e Query A por unidade.
- Query B em detalhe (carregada só via schema/dicionário, não explorada
  linha a linha nesta missão).
