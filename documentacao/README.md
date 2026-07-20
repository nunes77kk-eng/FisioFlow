# FisioFlow — Documentação Técnica

Documento complementar ao [README principal](../README.md). Aqui estão o planejamento do projeto, os requisitos, o dicionário de dados detalhado e a estimativa de valor comercial.

---

## 1. Planejamento

### 1.1 Objetivo

Desenvolver um sistema web para gestão de uma clínica de fisioterapia, permitindo o controle de pacientes, profissionais, tratamentos e agendamentos, com autenticação de usuários e um painel administrativo com indicadores.

### 1.2 Escopo

O sistema contempla:

- Site institucional público (apresentação da clínica + captação de contato via WhatsApp).
- Área administrativa protegida por login.
- CRUD completo das cinco entidades do negócio.
- Regras de agenda que impedem conflitos de horário.

**Fora do escopo (nesta versão):** pagamentos online, emissão de nota fiscal, prontuário eletrônico e integração com planos de saúde.

### 1.3 Perfis de usuário

| Perfil | Descrição |
|--------|-----------|
| **Administrador** | Acesso total, incluindo criação de novos usuários. |
| **Recepcionista** | Gestão de pacientes, tratamentos e agendamentos. |
| **Fisioterapeuta** | Consulta da agenda e dos pacientes. |

---

## 2. Requisitos

### 2.1 Requisitos funcionais (RF)

| ID | Requisito |
|----|-----------|
| RF01 | O sistema deve permitir login com e-mail e senha. |
| RF02 | O sistema deve controlar o acesso conforme o perfil do usuário. |
| RF03 | O sistema deve permitir cadastrar, listar, editar e excluir pacientes. |
| RF04 | O sistema deve validar o CPF do paciente (dígitos verificadores) e impedir duplicidade. |
| RF05 | O sistema deve permitir cadastrar, listar, editar e excluir fisioterapeutas. |
| RF06 | O sistema deve permitir cadastrar, listar, editar e excluir tratamentos. |
| RF07 | O sistema deve permitir cadastrar, listar, editar e excluir agendamentos. |
| RF08 | O sistema deve impedir dois agendamentos do mesmo fisioterapeuta no mesmo horário. |
| RF09 | O sistema deve permitir controlar o status do agendamento (agendado, confirmado, concluído, cancelado). |
| RF10 | O sistema deve exibir um dashboard com totais e próximos agendamentos. |
| RF11 | O sistema deve oferecer busca e paginação nas listagens. |
| RF12 | O site público deve permitir solicitar contato/agendamento via WhatsApp. |

### 2.2 Requisitos não-funcionais (RNF)

| ID | Requisito |
|----|-----------|
| RNF01 | As senhas devem ser armazenadas com hash (bcrypt), nunca em texto puro. |
| RNF02 | A autenticação deve usar tokens JWT com expiração. |
| RNF03 | A interface deve ser responsiva (desktop, tablet e celular). |
| RNF04 | A API deve seguir o padrão REST e retornar códigos HTTP adequados. |
| RNF05 | As consultas ao banco devem usar parâmetros (proteção contra SQL Injection). |
| RNF06 | O sistema deve fornecer feedback visual (carregamento, sucesso e erro). |
| RNF07 | O sistema deve rodar tanto em ambiente local quanto em nuvem (Railway) sem alteração de código. |
| RNF08 | O banco deve garantir integridade referencial com chaves estrangeiras e constraints. |

---

## 3. Dicionário de dados

### 3.1 `pacientes`
| Campo | Tipo | Restrições |
|-------|------|-----------|
| id | INT | PK, AUTO_INCREMENT |
| nome | VARCHAR(120) | NOT NULL |
| cpf | CHAR(11) | UNIQUE, CHECK 11 dígitos |
| data_nascimento | DATE | |
| sexo | ENUM('F','M','O') | |
| telefone | VARCHAR(20) | |
| email | VARCHAR(120) | |
| endereco | VARCHAR(200) | |
| observacoes | VARCHAR(255) | |
| ativo | TINYINT(1) | DEFAULT 1 |
| criado_em / atualizado_em | TIMESTAMP | automático |

### 3.2 `fisioterapeutas`
| Campo | Tipo | Restrições |
|-------|------|-----------|
| id | INT | PK |
| nome | VARCHAR(120) | NOT NULL |
| crefito | VARCHAR(20) | UNIQUE |
| especialidade | VARCHAR(80) | |
| telefone | VARCHAR(20) | |
| email | VARCHAR(120) | UNIQUE |

### 3.3 `tratamentos`
| Campo | Tipo | Restrições |
|-------|------|-----------|
| id | INT | PK |
| nome | VARCHAR(120) | UNIQUE, NOT NULL |
| descricao | VARCHAR(255) | |
| duracao_min | INT | CHECK > 0 |
| valor | DECIMAL(10,2) | CHECK >= 0 |

### 3.4 `usuarios`
| Campo | Tipo | Restrições |
|-------|------|-----------|
| id | INT | PK |
| nome | VARCHAR(120) | NOT NULL |
| email | VARCHAR(120) | UNIQUE, NOT NULL |
| senha_hash | VARCHAR(255) | NOT NULL |
| perfil | ENUM('admin','recepcionista','fisioterapeuta') | NOT NULL |
| fisioterapeuta_id | INT | FK → fisioterapeutas (ON DELETE SET NULL) |
| ativo | TINYINT(1) | DEFAULT 1 |

### 3.5 `agendamentos`
| Campo | Tipo | Restrições |
|-------|------|-----------|
| id | INT | PK |
| paciente_id | INT | FK → pacientes (ON DELETE CASCADE) |
| fisioterapeuta_id | INT | FK → fisioterapeutas (ON DELETE RESTRICT) |
| tratamento_id | INT | FK → tratamentos (ON DELETE RESTRICT) |
| data_hora | DATETIME | NOT NULL, índice |
| status | ENUM('agendado','confirmado','concluido','cancelado') | DEFAULT 'agendado', índice |
| observacoes | VARCHAR(255) | |

---

## 4. Tratamento de erros da API

| Código | Situação |
|--------|----------|
| 200 / 201 | Sucesso |
| 401 | Não autenticado (token ausente/ inválido) ou login incorreto |
| 403 | Sem permissão para a ação (perfil insuficiente) |
| 404 | Registro não encontrado |
| 409 | Conflito (CPF/e-mail/CREFITO duplicado, horário ocupado, exclusão bloqueada por vínculo) |
| 422 | Dados inválidos (falha de validação) |
| 500 | Erro interno |

---

## 5. Estimativa de valor comercial

A estimativa abaixo é uma **referência de mercado** para um sistema equivalente desenvolvido sob demanda no Brasil. Valores reais variam conforme região, complexidade e profissional/contratante.

| Item | Faixa estimada |
|------|----------------|
| Desenvolvimento de sistema web sob medida (escopo semelhante) | R$ 8.000 – R$ 20.000 |
| Modelo SaaS (assinatura por clínica) | R$ 100 – R$ 400 / mês |
| Manutenção evolutiva mensal | R$ 500 – R$ 1.500 / mês |

**Racional:** o sistema cobre o núcleo operacional de uma clínica (agenda + cadastros + acesso por perfil), que é justamente o que a maioria dos softwares de gestão de clínica cobra por assinatura. A arquitetura em serviço único reduz custo de hospedagem (um único serviço + banco).

> ⚠️ Estas cifras são estimativas de mercado apenas para fins de contexto e não constituem cotação ou aconselhamento financeiro.

---

## 6. Como testar rapidamente

Após subir a aplicação (ver README principal), faça login com `admin@fisioflow.com` / `senha123` e:

1. Abra o **Dashboard** e confira os totais.
2. Em **Agendamentos**, tente criar dois agendamentos para o mesmo fisioterapeuta no mesmo horário — o segundo será recusado (conflito).
3. Em **Tratamentos**, tente excluir um tratamento que já esteja em uso — a exclusão será bloqueada.
4. Cadastre um **paciente** com CPF inválido — o sistema recusa; com CPF válido, aceita.

---

*Para o passo a passo de uso das telas, consulte o [Manual do Usuário](MANUAL_DO_USUARIO.md) (também disponível em `Manual.pdf`).*
