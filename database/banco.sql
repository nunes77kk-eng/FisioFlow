-- =====================================================================
--  FisioFlow - Banco de Dados MySQL
--  Sistema de gestao para clinica de fisioterapia
--
--  Compativel com MySQL 8.0+
--  Charset: utf8mb4 (suporte completo a acentos e emojis)
--
--  Ordem de execucao:
--    1) CREATE DATABASE
--    2) CREATE TABLE (com PK, FK, constraints e indices)
--    3) INSERT INTO (dados de teste)
--
--  Senha padrao de TODOS os usuarios de teste: senha123
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) BANCO DE DADOS
-- ---------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS fisioflow
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE fisioflow;

-- Recria as tabelas do zero (respeitando dependencias de FK)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS agendamentos;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS tratamentos;
DROP TABLE IF EXISTS fisioterapeutas;
DROP TABLE IF EXISTS pacientes;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 2) TABELAS
-- ---------------------------------------------------------------------

-- Tabela: pacientes
CREATE TABLE pacientes (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome           VARCHAR(120)  NOT NULL,
  cpf            CHAR(11)      NOT NULL,
  data_nascimento DATE         NOT NULL,
  sexo           ENUM('M','F','O') NOT NULL DEFAULT 'O',
  telefone       VARCHAR(20)   NOT NULL,
  email          VARCHAR(150)  DEFAULT NULL,
  endereco       VARCHAR(200)  DEFAULT NULL,
  observacoes    TEXT          DEFAULT NULL,
  ativo          TINYINT(1)    NOT NULL DEFAULT 1,
  criado_em      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_pacientes_cpf (cpf),
  KEY idx_pacientes_nome (nome),
  KEY idx_pacientes_ativo (ativo),
  CONSTRAINT chk_pacientes_cpf CHECK (CHAR_LENGTH(cpf) = 11)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: fisioterapeutas
CREATE TABLE fisioterapeutas (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome           VARCHAR(120)  NOT NULL,
  crefito        VARCHAR(20)   NOT NULL,
  especialidade  VARCHAR(120)  NOT NULL,
  telefone       VARCHAR(20)   NOT NULL,
  email          VARCHAR(150)  NOT NULL,
  ativo          TINYINT(1)    NOT NULL DEFAULT 1,
  criado_em      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_fisio_crefito (crefito),
  UNIQUE KEY uq_fisio_email (email),
  KEY idx_fisio_especialidade (especialidade),
  KEY idx_fisio_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: tratamentos
CREATE TABLE tratamentos (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome           VARCHAR(120)   NOT NULL,
  descricao      VARCHAR(255)   DEFAULT NULL,
  duracao_min    SMALLINT UNSIGNED NOT NULL DEFAULT 60,
  valor          DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  ativo          TINYINT(1)     NOT NULL DEFAULT 1,
  criado_em      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tratamentos_nome (nome),
  KEY idx_tratamentos_ativo (ativo),
  CONSTRAINT chk_tratamentos_valor CHECK (valor >= 0),
  CONSTRAINT chk_tratamentos_duracao CHECK (duracao_min > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: usuarios (autenticacao / controle de acesso)
CREATE TABLE usuarios (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome           VARCHAR(120)  NOT NULL,
  email          VARCHAR(150)  NOT NULL,
  senha_hash     VARCHAR(255)  NOT NULL,
  perfil         ENUM('admin','recepcionista','fisioterapeuta') NOT NULL DEFAULT 'recepcionista',
  fisioterapeuta_id INT UNSIGNED DEFAULT NULL,
  ativo          TINYINT(1)    NOT NULL DEFAULT 1,
  ultimo_acesso  TIMESTAMP     NULL DEFAULT NULL,
  criado_em      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email),
  KEY idx_usuarios_perfil (perfil),
  KEY fk_usuarios_fisio (fisioterapeuta_id),
  CONSTRAINT fk_usuarios_fisio
    FOREIGN KEY (fisioterapeuta_id) REFERENCES fisioterapeutas (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: agendamentos (relaciona paciente + fisioterapeuta + tratamento)
CREATE TABLE agendamentos (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  paciente_id       INT UNSIGNED NOT NULL,
  fisioterapeuta_id INT UNSIGNED NOT NULL,
  tratamento_id     INT UNSIGNED NOT NULL,
  data_hora         DATETIME     NOT NULL,
  status            ENUM('agendado','confirmado','concluido','cancelado') NOT NULL DEFAULT 'agendado',
  observacoes       VARCHAR(255) DEFAULT NULL,
  criado_em         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_agend_data (data_hora),
  KEY idx_agend_status (status),
  KEY fk_agend_paciente (paciente_id),
  KEY fk_agend_fisio (fisioterapeuta_id),
  KEY fk_agend_tratamento (tratamento_id),
  CONSTRAINT fk_agend_paciente
    FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_agend_fisio
    FOREIGN KEY (fisioterapeuta_id) REFERENCES fisioterapeutas (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_agend_tratamento
    FOREIGN KEY (tratamento_id) REFERENCES tratamentos (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3) DADOS DE TESTE
-- ---------------------------------------------------------------------

-- Pacientes (10 registros)
INSERT INTO pacientes (nome, cpf, data_nascimento, sexo, telefone, email, endereco, observacoes) VALUES
('Ana Beatriz Souza',      '79862846410', '1990-03-15', 'F', '(31) 98801-1001', 'ana.souza@email.com',    'Rua das Flores, 120 - Betim/MG',      'Dor lombar cronica.'),
('Carlos Eduardo Lima',    '06147246003', '1985-07-22', 'M', '(31) 98801-1002', 'carlos.lima@email.com',  'Av. Amazonas, 900 - Betim/MG',        'Pos-operatorio de joelho.'),
('Mariana Oliveira Costa', '18187360631', '1998-11-05', 'F', '(31) 98801-1003', 'mari.costa@email.com',   'Rua Sao Paulo, 45 - Contagem/MG',     'Tendinite no ombro direito.'),
('Rafael Almeida Pinto',   '17912328335', '1979-01-30', 'M', '(31) 98801-1004', 'rafael.pinto@email.com', 'Rua Minas Gerais, 300 - Betim/MG',    'Hernia de disco L4-L5.'),
('Juliana Ferreira Rocha', '13353876928', '2001-06-18', 'F', '(31) 98801-1005', 'ju.rocha@email.com',     'Av. Brasil, 1500 - Betim/MG',         'Reabilitacao de tornozelo.'),
('Bruno Henrique Dias',    '77481539731', '1992-09-12', 'M', '(31) 98801-1006', 'bruno.dias@email.com',   'Rua Ceara, 78 - Contagem/MG',         'Bursite no quadril.'),
('Patricia Gomes Alves',   '29054110406', '1988-04-25', 'F', '(31) 98801-1007', 'paty.alves@email.com',   'Rua Bahia, 210 - Betim/MG',           'RPG postural.'),
('Diego Martins Nunes',    '41896920187', '1995-12-08', 'M', '(31) 98801-1008', 'diego.nunes@email.com',  'Av. Governador, 55 - Betim/MG',       'Dor cervical.'),
('Fernanda Ribeiro Melo',  '57655951209', '1983-02-14', 'F', '(31) 98801-1009', 'fe.melo@email.com',      'Rua Goias, 33 - Contagem/MG',         'Fibromialgia.'),
('Gustavo Barbosa Cruz',   '85592797508', '2000-08-27', 'M', '(31) 98801-1010', 'gustavo.cruz@email.com', 'Rua Espirito Santo, 410 - Betim/MG',  'Lesao muscular na coxa.');

-- Fisioterapeutas (10 registros)
INSERT INTO fisioterapeutas (nome, crefito, especialidade, telefone, email) VALUES
('Dra. Camila Andrade',   'CREFITO-4/12345-F', 'Ortopedia e Traumatologia', '(31) 99900-2001', 'camila.andrade@fisioflow.com'),
('Dr. Rodrigo Teixeira',  'CREFITO-4/12346-F', 'Fisioterapia Esportiva',    '(31) 99900-2002', 'rodrigo.teixeira@fisioflow.com'),
('Dra. Larissa Moraes',   'CREFITO-4/12347-F', 'Neurofuncional',            '(31) 99900-2003', 'larissa.moraes@fisioflow.com'),
('Dr. Felipe Cardoso',    'CREFITO-4/12348-F', 'RPG e Postura',             '(31) 99900-2004', 'felipe.cardoso@fisioflow.com'),
('Dra. Beatriz Nogueira', 'CREFITO-4/12349-F', 'Pilates Clinico',          '(31) 99900-2005', 'beatriz.nogueira@fisioflow.com'),
('Dr. Thiago Ramos',      'CREFITO-4/12350-F', 'Quiropraxia',              '(31) 99900-2006', 'thiago.ramos@fisioflow.com'),
('Dra. Aline Correia',    'CREFITO-4/12351-F', 'Fisioterapia Respiratoria','(31) 99900-2007', 'aline.correia@fisioflow.com'),
('Dr. Marcelo Freitas',   'CREFITO-4/12352-F', 'Reabilitacao de Coluna',    '(31) 99900-2008', 'marcelo.freitas@fisioflow.com'),
('Dra. Renata Vieira',    'CREFITO-4/12353-F', 'Fisioterapia Aquatica',     '(31) 99900-2009', 'renata.vieira@fisioflow.com'),
('Dr. Leonardo Pires',    'CREFITO-4/12354-F', 'Terapia Manual',            '(31) 99900-2010', 'leonardo.pires@fisioflow.com');

-- Tratamentos (10 registros)
INSERT INTO tratamentos (nome, descricao, duracao_min, valor) VALUES
('Avaliacao Fisioterapeutica',   'Avaliacao inicial completa com anamnese e testes.',        60, 150.00),
('Fisioterapia Ortopedica',      'Tratamento de lesoes musculoesqueleticas.',                50, 120.00),
('RPG - Reeducacao Postural',    'Correcao postural global e alongamento.',                  60, 140.00),
('Quiropraxia',                  'Ajustes articulares da coluna e articulacoes.',            40, 160.00),
('Pilates Clinico',              'Fortalecimento e controle motor supervisionado.',          55, 130.00),
('Fisioterapia Esportiva',       'Reabilitacao e prevencao de lesoes esportivas.',           50, 145.00),
('Fisioterapia Neurofuncional',  'Reabilitacao de disfuncoes neurologicas.',                 60, 155.00),
('Terapia Manual',               'Tecnicas manuais para alivio de dor e mobilidade.',        45, 135.00),
('Drenagem Linfatica',           'Estimulacao do sistema linfatico e reducao de edema.',     60, 110.00),
('Eletroterapia',                'Uso de correntes para analgesia e fortalecimento.',        30, 90.00);

-- Usuarios (12 registros) - senha de todos: senha123
INSERT INTO usuarios (nome, email, senha_hash, perfil, fisioterapeuta_id) VALUES
('Administrador do Sistema', 'admin@fisioflow.com',           '$2a$10$tlcDgXRsqFLkdKELlX.rseSG/uC.n0LvJYPXbNjcw5Ublmt4Z19cC', 'admin',          NULL),
('Sandra Recepcao',          'sandra.recepcao@fisioflow.com', '$2a$10$tlcDgXRsqFLkdKELlX.rseSG/uC.n0LvJYPXbNjcw5Ublmt4Z19cC', 'recepcionista',  NULL),
('Paulo Recepcao',           'paulo.recepcao@fisioflow.com',  '$2a$10$tlcDgXRsqFLkdKELlX.rseSG/uC.n0LvJYPXbNjcw5Ublmt4Z19cC', 'recepcionista',  NULL),
('Camila Andrade',           'camila.andrade@fisioflow.com',  '$2a$10$tlcDgXRsqFLkdKELlX.rseSG/uC.n0LvJYPXbNjcw5Ublmt4Z19cC', 'fisioterapeuta', 1),
('Rodrigo Teixeira',         'rodrigo.teixeira@fisioflow.com','$2a$10$tlcDgXRsqFLkdKELlX.rseSG/uC.n0LvJYPXbNjcw5Ublmt4Z19cC', 'fisioterapeuta', 2),
('Larissa Moraes',           'larissa.moraes@fisioflow.com',  '$2a$10$tlcDgXRsqFLkdKELlX.rseSG/uC.n0LvJYPXbNjcw5Ublmt4Z19cC', 'fisioterapeuta', 3),
('Felipe Cardoso',           'felipe.cardoso@fisioflow.com',  '$2a$10$tlcDgXRsqFLkdKELlX.rseSG/uC.n0LvJYPXbNjcw5Ublmt4Z19cC', 'fisioterapeuta', 4),
('Beatriz Nogueira',         'beatriz.nogueira@fisioflow.com','$2a$10$tlcDgXRsqFLkdKELlX.rseSG/uC.n0LvJYPXbNjcw5Ublmt4Z19cC', 'fisioterapeuta', 5),
('Thiago Ramos',             'thiago.ramos@fisioflow.com',    '$2a$10$tlcDgXRsqFLkdKELlX.rseSG/uC.n0LvJYPXbNjcw5Ublmt4Z19cC', 'fisioterapeuta', 6),
('Aline Correia',            'aline.correia@fisioflow.com',   '$2a$10$tlcDgXRsqFLkdKELlX.rseSG/uC.n0LvJYPXbNjcw5Ublmt4Z19cC', 'fisioterapeuta', 7),
('Marcelo Freitas',          'marcelo.freitas@fisioflow.com', '$2a$10$tlcDgXRsqFLkdKELlX.rseSG/uC.n0LvJYPXbNjcw5Ublmt4Z19cC', 'fisioterapeuta', 8),
('Gerente Operacional',      'gerente@fisioflow.com',         '$2a$10$tlcDgXRsqFLkdKELlX.rseSG/uC.n0LvJYPXbNjcw5Ublmt4Z19cC', 'admin',          NULL);

-- Agendamentos (12 registros)
INSERT INTO agendamentos (paciente_id, fisioterapeuta_id, tratamento_id, data_hora, status, observacoes) VALUES
( 1, 1,  2, '2026-07-20 09:00:00', 'confirmado', 'Sessao 3 de 10.'),
( 2, 2,  6, '2026-07-20 10:00:00', 'agendado',   'Retorno pos-cirurgico.'),
( 3, 4,  3, '2026-07-20 11:00:00', 'agendado',   'Foco em ombro direito.'),
( 4, 8,  2, '2026-07-21 08:00:00', 'confirmado', 'Avaliar dor irradiada.'),
( 5, 2,  6, '2026-07-21 14:00:00', 'agendado',   'Reabilitacao de tornozelo.'),
( 6, 1,  8, '2026-07-22 09:30:00', 'agendado',   NULL),
( 7, 4,  3, '2026-07-22 15:00:00', 'concluido',  'Boa evolucao postural.'),
( 8, 6,  4, '2026-07-23 10:30:00', 'agendado',   'Primeira sessao de quiropraxia.'),
( 9, 3,  7, '2026-07-23 16:00:00', 'cancelado',  'Paciente remarcou.'),
(10, 2,  6, '2026-07-24 08:30:00', 'confirmado', 'Lesao na coxa - fase 2.'),
( 1, 5,  5, '2026-07-24 17:00:00', 'agendado',   'Pilates de manutencao.'),
( 3, 10, 8, '2026-07-25 09:00:00', 'agendado',   'Terapia manual cervical.');

-- =====================================================================
--  Fim do script. Banco pronto para uso.
-- =====================================================================
