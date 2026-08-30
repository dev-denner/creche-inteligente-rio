# Conecta Creche Rio

**Transparência para a família. Inteligência operacional para as CREs. Evidências para a SME.**

Solução do **Time 6** para o **Claude Impact Lab Rio 2026**, desenvolvida a partir do desafio de dados da Secretaria Municipal de Educação do Rio de Janeiro (SME-Rio).

[**Acessar a demonstração**](https://creche-inteligente-rio.vercel.app/) · [**Painel CRE/SME**](https://creche-inteligente-rio.vercel.app/cre) · **Vídeo:** _(preencher)_

> Esta é uma demonstração construída com dados anonimizados de 2025. Os indicadores não representam a situação atual da rede e não devem ser usados para decisões reais de matrícula.

## Equipe

**Time:** Time 6

**Membros:**

- Denner Fernandes da Silva
- Isabelle de Oliveira Lemos
- Jéssica Pimentel Pereira

## O desafio

A Inscrição Creche organiza a demanda por vagas em creches e Espaços de Desenvolvimento Infantil (EDIs) da rede direta, conveniada e em parceria do Rio de Janeiro. A família pode indicar até cinco unidades, em ordem de preferência, enquanto a SME e as 11 Coordenadorias Regionais de Educação (CREs) planejam a oferta, classificam as inscrições e convocam as famílias.

Entre 2021 e 2025, o processo reuniu:

- 837 mil opções de creche;
- 343 mil inscrições;
- cerca de 260 mil crianças;
- 872 unidades escolares;
- mais de 45 mil inscrições em um único processo anual.

Mesmo com vagas ociosas em parte da rede, algumas unidades e territórios mantêm filas expressivas. O problema não é apenas falta de vagas: há um desencontro entre onde existe oferta e onde, em qual turno e em quais unidades as famílias concentram suas escolhas.

O briefing propõe três perguntas:

1. **Planejamento:** quantas vagas abrir e onde?
2. **Classificação:** como dar mais agilidade à fila sem comprometer os critérios socioeconômicos?
3. **Convocação:** como reduzir trabalho manual, localizar as famílias no prazo e evitar vagas paradas?

## A solução

O **Conecta Creche Rio** conecta as duas pontas do mesmo processo:

| Perspectiva | O que resolve | Entrega principal |
| --- | --- | --- |
| **Família** | Falta de clareza sobre posição, critérios, opções e próximos passos | Portal com inscrição, classificação, histórico, documentos e convocação em linguagem simples |
| **CRE** | Acompanhamento manual de filas, prazos e inconsistências | Painel operacional com pressão por unidade, convocações, alertas, revisão humana e auditoria |
| **SME** | Dificuldade para testar mudanças antes de aplicá-las | Laboratório de Política Pública com simulações determinísticas e resultados auditáveis |

## Portal da Família (`/`)

Centraliza a jornada de inscrição e acompanhamento da família, reunindo em um só lugar as informações necessárias para entender sua situação e agir no momento certo.

O portal permite:

- acessar por uma autenticação gov.br simulada;
- acompanhar múltiplas crianças vinculadas ao mesmo responsável;
- realizar uma nova inscrição em seis etapas: criança, responsável, moradia, vulnerabilidade, unidades e revisão;
- cadastrar dados da criança, responsável e endereço;
- selecionar, remover e reordenar até cinco unidades de creche;
- acompanhar inscrição, classificação e até cinco opções de unidade;
- consultar a situação, o histórico, a classificação e a concorrência de cada escolha;
- visualizar a régua de pontuação de 2025 em linguagem acessível;
- comparar opções e conhecer outras unidades;
- acompanhar uma convocação, seus prazos e próximos passos;
- cadastrar contatos de confiança;
- enviar e acompanhar documentos para comprovação;
- consultar as fontes de validação relacionadas ao CadÚnico e ao Bolsa Família;
- receber uma explicação contextualizada gerada pelo Claude;
- confirmar uma vaga e consultar um comprovante demonstrativo com próximos passos.

A ordem de preferência aparece como uma hipótese de política pública em estudo, nunca como regra vigente.

## Painel CRE/SME (`/cre`)

Oferece uma visão operacional e estratégica do processo, organizada em seis áreas: **Visão geral, Unidades e pressão, Convocações, Inconsistências, Auditoria e Laboratório de Política Pública**.

O painel permite:

- monitorar oferta, demanda e pressão por unidade e território;
- identificar unidades que exigem atenção prioritária;
- consultar indicadores detalhados de cada unidade e contextualizá-los com Claude;
- acompanhar convocações, prazos e movimentações da fila;
- recalcular a classificação após o vencimento de uma convocação;
- encaminhar inconsistências para revisão humana;
- rastrear ações e decisões por meio da trilha de auditoria;
- simular o efeito de pesos por ordem de preferência sem alterar a fila real.

## Como a solução responde aos três eixos

### 1. Planejamento: enxergar onde a pressão acontece

O agregado `opportunity-2025.json` cruza oferta e demanda de 2025 para destacar unidades e territórios com maior pressão. A cobertura da junção é de **99,4% (831 de 836 unidades)**, com informação territorial disponível para **98,1%** delas.

Como as unidades públicas não possuem coluna de capacidade ou meta nesta extração, o painel não afirma “quantas vagas devem ser abertas”. Ele oferece evidências para priorização e deixa explícito onde seriam necessários dados complementares.

### 2. Classificação: testar antes de mudar

O Laboratório de Política Pública simula, sobre uma amostra anonimizada de 2025, o efeito de acrescentar pesos pela ordem de preferência à pontuação socioeconômica.

- 15 filas de maior demanda;
- 5.070 registros anonimizados;
- pesos parametrizáveis;
- recálculo determinístico no navegador;
- comparação de posições e impactos;
- registro na trilha de auditoria.

O laboratório é isolado do Portal da Família e está sempre identificado como **Proposta**. Ele não recomenda pesos nem altera qualquer classificação real. Detalhes em [`docs/policy-lab.md`](docs/policy-lab.md).

### 3. Convocação: transformar prazo em fluxo rastreável

A demonstração organiza uma régua multicanal com Portal, e-mail, WhatsApp, SMS, contatos de confiança e escalonamento para atendimento humano.

O briefing menciona três marcos relacionados ao prazo: classificação de cinco crianças por escolha com três dias de convocação e confirmação; ao menos uma tentativa de contato por dia durante três dias consecutivos; e três dias úteis para comparecimento da família. Como o marco inicial e a relação exata entre esses prazos precisam de validação operacional, o cronômetro da solução permanece identificado como **Demonstração / Pendente SME**.

Nenhuma mensagem é enviada de verdade.

## Diferenciais

### Classificação viva

Demonstra o encadeamento operacional de uma fila real anonimizada: **candidato convocado → prazo expirado → encerramento da convocação → próximo elegível**. O recálculo é determinístico e cada mudança gera um evento auditável na sessão.

### Triagem assistida, com decisão humana

O upload utiliza um arquivo local do navegador. Apenas nome, tipo e tamanho são enviados para análise; o conteúdo não é lido nem armazenado. O Claude organiza os metadados e sugere próximos passos, mas toda conclusão é encaminhada para revisão humana.

### IA explicável e limitada por desenho

O Claude recebe dados estruturados que já foram calculados por regras determinísticas. Ele atua como camada de explicação e contextualização — nunca como motor de classificação ou decisão.

**Claude pode:**

- explicar a situação da família;
- resumir indicadores de uma unidade;
- contextualizar resultados de uma simulação;
- apoiar a triagem inicial de metadados documentais;
- sugerir próximos passos permitidos.

**Claude nunca pode:**

- classificar crianças ou criar pontuação;
- alterar a posição na fila;
- validar vulnerabilidade;
- decidir matrícula ou elegibilidade;
- inventar vagas, dados ou regras normativas;
- escolher pesos ou recomendar a adoção de uma política.

## Transparência por padrão

Toda informação relevante recebe um dos cinco estados visuais abaixo:

| Estado | Significado |
| --- | --- |
| **Dado do desafio** | Informação fornecida ou derivada diretamente dos dados disponibilizados |
| **Histórico 2025** | Retrato anonimizado do processo de 2025, sem representar a rede atual |
| **Demonstração** | Comportamento funcional criado para apresentar a jornada |
| **Proposta** | Hipótese de produto ou política ainda não adotada |
| **Pendente SME** | Regra, dado ou integração que depende de validação institucional |

Essa separação evita que uma hipótese seja apresentada como regra vigente ou que uma simulação seja confundida com decisão administrativa.

## Onde o Claude atua

As chamadas são feitas no servidor; a chave da Anthropic nunca é exposta ao navegador.

| Ação | Endpoint | Limite da atuação |
| --- | --- | --- |
| Explicar a situação da família | `POST /api/claude/explain-family` | Não calcula nem altera posição |
| Analisar uma unidade | `POST /api/claude/analyze-unit` | Interpreta indicadores já calculados |
| Analisar uma política simulada | `POST /api/claude/analyze-policy` | Não escolhe pesos nem recomenda adoção |
| Apoiar triagem documental | `POST /api/claude/triage-document` | Não lê o arquivo nem valida vulnerabilidade |

Em caso de ausência ou erro da API, a aplicação exibe uma mensagem amigável e continua funcionando.

## O que funciona na demonstração

- agregados de 2025 gerados por pipeline reprodutível;
- quatro chamadas reais à API da Anthropic, quando a chave está configurada;
- simulação determinística sobre 5.070 registros anonimizados;
- cadastro de múltiplas crianças com persistência local no navegador durante a demonstração;
- wizard funcional de nova inscrição;
- seleção e reordenação de até cinco unidades reais do catálogo de 2025;
- upload local e triagem dos metadados reais do arquivo;
- inclusão e remoção de contatos de confiança;
- simulação de expiração e avanço da fila;
- revisão de inconsistências;
- trilha de auditoria durante a sessão;
- roteiro guiado de nove passos, com navegação persistida no navegador.

## O que está simulado ou depende de integração

- envio por Portal, e-mail, WhatsApp ou SMS;
- escalonamento para contatos de confiança e atendimento humano;
- autenticação gov.br;
- consulta ao CadÚnico e Bolsa Família;
- autenticação e identificação real por CPF;
- persistência em banco de dados — a demonstração usa `localStorage` no navegador;
- expiração automática por job agendado;
- encerramento oficial das demais opções após confirmação;
- definição operacional exata dos marcos de prazo.

## Limitações dos dados

Os dados da SME-Rio foram anonimizados por aleatorização, generalização e supressão. Por isso:

- os indicadores não representam a realidade atual da rede;
- não é possível identificar crianças ou responsáveis;
- a régua de pontuação deve ser interpretada por processo, pois mudou ao longo dos anos;
- unidades públicas não possuem capacidade/meta nesta extração, apenas matrícula e turmas;
- sinais de pressão apoiam investigação, mas não determinam sozinhos a abertura de vagas;
- agrupamentos por identificadores incompletos podem conter colisões e exigem cautela.

Consulte [`docs/data-understanding.md`](docs/data-understanding.md) e [`docs/opportunity-model.md`](docs/opportunity-model.md).

## Arquitetura

```text
Dados anonimizados da SME
        ↓
Pipeline offline (Python + DuckDB)
        ↓
Agregados JSON auditáveis
        ↓
Next.js — Portal da Família + Painel CRE/SME
        ↓
Claude — explicação e contextualização server-side
```

A aplicação nunca lê o dataset bruto em tempo de execução. Veja [`docs/architecture.md`](docs/architecture.md) e [`docs/deployment.md`](docs/deployment.md).

## Rodando localmente

### Aplicação Next.js

```bash
npm install
npm run dev
```

Acesse:

- Portal da Família: [http://localhost:3000](http://localhost:3000)
- Painel CRE/SME: [http://localhost:3000/cre](http://localhost:3000/cre)

Para habilitar o Claude, copie `.env.example` para `.env.local` e preencha `ANTHROPIC_API_KEY`. Nunca versione `.env.local`. Sem a chave, o restante da aplicação continua funcionando.

### Pipeline de dados

O pipeline requer o dataset da SME como pasta irmã do repositório (`../dadoscreche`). Consulte [`scripts/README.md`](scripts/README.md).

```bash
uv venv .venv
source .venv/bin/activate
uv pip install -r scripts/requirements.txt
python scripts/build_summary.py
python scripts/build_opportunity.py
python scripts/build_regua.py
python scripts/build_policy_lab.py
```

Os scripts geram:

- `data/processed/summary.json`
- `data/processed/opportunity-2025.json`
- `data/processed/regua-2025.json`
- `data/processed/policy-lab-2025.json`

## Documentação

- [Arquitetura](docs/architecture.md)
- [Deploy](docs/deployment.md)
- [Entendimento dos dados](docs/data-understanding.md)
- [Modelo de oportunidade](docs/opportunity-model.md)
- [Laboratório de Política Pública](docs/policy-lab.md)
- [Pipeline de dados](scripts/README.md)

## Modo Demo

Use o botão **Modo Demo** no cabeçalho para seguir um roteiro de nove passos pela jornada **Família → CRE → SME**. O guia navega entre as telas e preserva o passo atual, mas ações como confirmar vaga, simular expiração e revisar inconsistências continuam sob controle do apresentador.
