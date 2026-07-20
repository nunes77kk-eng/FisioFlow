<div align="center">

#  FisioFlow

### Sistema de Gestão para Clínica de Fisioterapia

---

##  Sobre o projeto

O **FisioFlow** é um sistema web completo para o dia a dia de uma clínica de fisioterapia. Ele resolve o problema de clínicas que ainda controlam pacientes e agenda em papel ou planilhas soltas, centralizando tudo em um só lugar, com controle de acesso por perfil e uma agenda que impede marcações em conflito.

O sistema tem **duas faces**:

- **Site institucional (landing page)** — apresenta a clínica, os tratamentos e a equipe, e permite que o visitante solicite um agendamento que é enviado direto para o **WhatsApp** da clínica.
- **Painel administrativo** — área restrita (com login) onde a equipe gerencia pacientes, fisioterapeutas, tratamentos e a agenda, além de um dashboard com indicadores.

### Público-alvo

Recepcionistas, fisioterapeutas e administradores de clínicas de fisioterapia de pequeno e médio porte.

---

##  Funcionalidades

- 🔐 **Login com autenticação JWT** e três perfis de acesso: `admin`, `recepcionista` e `fisioterapeuta`.
- 📊 **Dashboard** com totais, agendamentos por status e próximos atendimentos.
- 🧑‍🤝‍🧑 **CRUD de Pacientes** com validação de CPF (dígitos verificadores) e busca.
- 👩‍⚕️ **CRUD de Fisioterapeutas** com registro CREFITO e especialidade.
- 🧾 **CRUD de Tratamentos** com duração e valor.
- 📅 **CRUD de Agendamentos** com **detecção automática de conflito de horário** do fisioterapeuta e controle de status (agendado, confirmado, concluído, cancelado).
- 🔎 Busca, filtros e **paginação** em todas as listagens.
- 📱 **Interface 100% responsiva** com feedback visual: mensagens de sucesso/erro (toasts), estados de carregamento (spinners/skeletons) e validação de formulários.
- 💬 **Formulário de contato integrado ao WhatsApp** na landing page.

---

## 🏗️ Arquitetura

O FisioFlow segue uma **arquitetura REST em camadas**. O backend expõe uma API sob o prefixo `/api` e **também serve o frontend estático**, o que permite hospedar tudo em um único serviço (ideal para o Railway).

```
Navegador (HTML/CSS/JS)  ──fetch()──►  API REST (/api)
        ▲                                   │
        │                                   ▼
   arquivos estáticos              Controllers → Models → MySQL
   servidos pelo Express
```

**Fluxo de uma requisição no backend:**

```
Rota  →  Middleware (auth/validação)  →  Controller  →  Model  →  MySQL
```

Cada camada tem uma responsabilidade única:

| Camada | Responsabilidade |
|--------|------------------|
| **Routes** | Define endpoints e regras de validação (express-validator). |
| **Middlewares** | Autenticação JWT, autorização por perfil, validação e tratamento de erros. |
| **Controllers** | Regras de negócio (ex.: checar conflito de horário). |
| **Models** | Acesso ao banco via SQL parametrizado (mysql2). |
| **Config/Utils** | Pool de conexões e funções auxiliares (CPF, respostas padronizadas). |

---

## 🛠️ Tecnologias

**Frontend:** HTML5, CSS3 e JavaScript puro (ES6+), consumindo a API via `fetch()`. Sem frameworks — leve e fácil de manter.

**Backend:** Node.js + Express (API REST), com `mysql2` (pool de conexões), `jsonwebtoken` (JWT), `bcryptjs` (hash de senha), `express-validator` (validação), além de `helmet`, `cors`, `compression` e `morgan`.

**Banco de dados:** MySQL 8 (InnoDB, utf8mb4), com chaves estrangeiras, índices e constraints.

---

## 📂 Estrutura de pastas

```
fisioclinica/
├── backend/
│   ├── src/
│   │   ├── config/          # Conexão com o banco (pool)
│   │   ├── controllers/     # Regras de negócio
│   │   ├── middlewares/     # Auth, validação, erros
│   │   ├── models/          # Acesso a dados (SQL)
│   │   ├── routes/          # Endpoints da API
│   │   ├── utils/           # Funções auxiliares (CPF, respostas)
│   │   ├── app.js           # Configuração do Express
│   │   └── server.js        # Ponto de entrada
│   ├── scripts/
│   │   └── init-db.js       # Cria o schema e popula dados de teste
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── css/                 # styles.css (landing) + painel.css (admin)
│   ├── js/                  # config, api, ui, layout + 1 arquivo por tela
│   ├── imagens/             # logo.svg
│   ├── paginas/             # login, dashboard, pacientes, fisioterapeutas,
│   │                        # tratamentos, agendamentos
│   └── index.html           # Landing page
├── database/
│   └── banco.sql            # Schema completo + dados de teste
├── documentacao/
│   ├── README.md            # Documentação técnica detalhada
│   ├── MANUAL_DO_USUARIO.md # Manual de uso (fonte do PDF)
│   └── Manual.pdf           # Manual do usuário em PDF
├── package.json             # Ponto de entrada de deploy (Railway)
├── railway.json             # Configuração do Railway
├── Procfile                 # Comando de start (fallback)
├── .env.example
├── .gitignore
└── README.md                # (este arquivo)
```

---

## 🗄️ Modelo de dados

Cinco tabelas relacionadas (mínimo exigido), todas InnoDB/utf8mb4:

| Tabela | Descrição | Destaques |
|--------|-----------|-----------|
| `pacientes` | Pacientes da clínica | `cpf` **único** com CHECK de 11 dígitos; índices em nome/ativo |
| `fisioterapeutas` | Profissionais | `crefito` e `email` **únicos** |
| `tratamentos` | Serviços oferecidos | `nome` único; CHECK de valor ≥ 0 e duração > 0 |
| `usuarios` | Contas de acesso | `email` único; ENUM de perfil; FK opcional p/ fisioterapeuta |
| `agendamentos` | Agenda | FKs para as três entidades; ENUM de status; índices em data/status |

**Regras de integridade (FK):**

- Excluir um **paciente** remove seus agendamentos em cascata (`ON DELETE CASCADE`).
- Excluir um **fisioterapeuta** ou **tratamento** que esteja em uso é **bloqueado** (`ON DELETE RESTRICT` → a API responde **409 Conflito**).
- Excluir um **usuário** vinculado a um fisioterapeuta apenas desfaz o vínculo (`ON DELETE SET NULL`).

O arquivo [`database/banco.sql`](database/banco.sql) cria todo o schema e insere **dados de teste** (10 pacientes, 10 fisioterapeutas, 10 tratamentos, 12 usuários e 12 agendamentos).

---

## 🚀 Como rodar localmente

### Pré-requisitos

- **Node.js 18+**
- **MySQL 8+** rodando localmente

### 1. Instalar dependências

```bash
cd fisioclinica
npm install          # instala as dependências na raiz (usadas pelo backend)
```

> Alternativamente, você pode instalar dentro de `backend/` (`cd backend && npm install`). Ambos funcionam.

### 2. Configurar variáveis de ambiente

Copie o exemplo e ajuste com os dados do seu MySQL:

```bash
cp .env.example .env
```

Edite o `.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=fisioflow
JWT_SECRET=um-segredo-bem-grande-e-aleatorio
```

### 3. Criar o banco e popular os dados

**Opção A — pelo script (recomendado):**

```bash
npm run db:init
```

**Opção B — importando o SQL manualmente:**

```bash
mysql -u root -p < database/banco.sql
```

### 4. Iniciar a aplicação

```bash
npm start        # produção
# ou
npm run dev      # desenvolvimento (reinício automático com nodemon)
```

Acesse:

- 🌐 **Site + Painel:** http://localhost:3000
- ❤️ **Healthcheck da API:** http://localhost:3000/api/health

### 🔑 Credenciais de teste

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Administrador | `admin@fisioflow.com` | `senha123` |

> Todos os usuários de teste usam a senha `senha123`.

---

## ☁️ Deploy no Railway

1. Suba este repositório para o **GitHub**.
2. No [Railway](https://railway.app), crie um projeto a partir do repositório (**Deploy from GitHub repo**).
3. Adicione o plugin **MySQL** ao projeto (**New → Database → MySQL**). O Railway injeta automaticamente `MYSQL_URL` e as variáveis `MYSQL*` — o backend já detecta essas variáveis.
4. Nas **Variables** do serviço da aplicação, defina:
   - `JWT_SECRET` → um valor longo e aleatório.
   - `AUTO_INIT_DB` → `true` **apenas no primeiro deploy** (cria as tabelas e popula os dados se o banco estiver vazio). Depois pode remover ou deixar em `false`.
5. O Railway usa o `railway.json`/`Procfile` e executa `npm start` automaticamente. A aplicação sobe servindo a API e o frontend na mesma URL.

> Como alternativa ao `AUTO_INIT_DB`, você pode rodar `npm run db:init` uma vez pelo terminal do Railway.

---

## 🔌 Referência da API

Todos os endpoints (exceto `login` e `health`) exigem o header `Authorization: Bearer <token>`.

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Autentica e retorna o token JWT |
| POST | `/api/auth/cadastro` | Cria usuário (**somente admin**) |
| GET | `/api/auth/perfil` | Dados do usuário logado |

### Recursos (CRUD completo)
Para **pacientes**, **fisioterapeutas**, **tratamentos** e **agendamentos**:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/<recurso>` | Lista (aceita `?page`, `?limit`, `?busca`) |
| GET | `/api/<recurso>/:id` | Detalha um registro |
| POST | `/api/<recurso>` | Cria |
| PUT | `/api/<recurso>/:id` | Atualiza |
| DELETE | `/api/<recurso>/:id` | Remove |

> `agendamentos` também aceita `?status=` como filtro e retorna **409** em conflito de horário.

### Outros
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/dashboard` | Indicadores do painel |
| GET | `/api/health` | Verificação de saúde |

**Formato de resposta padrão:**

```json
{ "sucesso": true, "mensagem": "...", "data": { } }
```

**Erros** retornam o código HTTP adequado (401, 404, 409, 422…) com `{ "sucesso": false, "mensagem": "..." }`.

---

## 🎯 Decisões de projeto

- **Serviço único:** o Express serve API e frontend juntos, simplificando o deploy (um só serviço no Railway).
- **JWT + bcrypt:** senhas nunca são armazenadas em texto puro; o acesso é controlado por perfil.
- **Exclusão consciente:** cascata para agendamentos do paciente, bloqueio (409) para fisioterapeutas/tratamentos em uso — evita perda acidental de histórico.
- **Contato por WhatsApp:** o botão "Agendar" da landing page monta uma mensagem pré-preenchida no WhatsApp da clínica, sem depender de um fluxo público de escrita no banco.

> ⚙️ Lembre de trocar o número de WhatsApp em `frontend/js/landing.js` (constante `WHATSAPP_CLINICA`) pelo número real da clínica.

---

## 🔭 Melhorias futuras

- Relatórios financeiros e exportação (PDF/Excel).
- Notificações automáticas de lembrete (e-mail/WhatsApp) para os pacientes.
- Visualização da agenda em calendário semanal.
- Prontuário eletrônico por paciente (evolução das sessões).
- Testes automatizados (Jest/Supertest) e pipeline de CI.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Sinta-se livre para usar e adaptar.

---

<div align="center">
Feito com 💙 para clínicas de fisioterapia — <b>FisioFlow</b>
</div>
