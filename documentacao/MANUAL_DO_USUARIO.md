# Manual do Usuário — FisioFlow

Guia prático para usar o sistema de gestão da clínica no dia a dia.

---

## 1. Acessando o sistema

1. Abra o navegador e acesse o endereço do sistema (em desenvolvimento: `http://localhost:3000`).
2. Você verá o **site da clínica**. Para entrar na área administrativa, clique em **Área da equipe / Entrar** (ou acesse `/paginas/login.html`).
3. Informe seu **e-mail** e **senha** e clique em **Entrar**.

**Credenciais de demonstração:**
- E-mail: `admin@fisioflow.com`
- Senha: `senha123`

Se os dados estiverem incorretos, uma mensagem em vermelho avisará. Após entrar, você é levado ao **Dashboard**.

---

## 2. Dashboard

A tela inicial do painel mostra um resumo da clínica:

- **Cartões de totais:** quantidade de pacientes, fisioterapeutas, tratamentos e agendamentos.
- **Próximos agendamentos:** os atendimentos mais próximos.
- **Agendamentos por status:** distribuição entre agendado, confirmado, concluído e cancelado.

Use o **menu lateral** para navegar entre as áreas. No celular, toque no ícone de menu (☰) para abri-lo.

---

## 3. Pacientes

Na opção **Pacientes** do menu você pode:

- **Buscar:** digite o nome na caixa de busca (a lista filtra automaticamente).
- **Cadastrar:** clique em **Novo paciente**, preencha os campos e clique em **Salvar**.
  - O **CPF** é validado automaticamente. Se for inválido ou já cadastrado, o sistema avisa.
- **Editar:** clique no ícone de lápis na linha do paciente.
- **Excluir:** clique no ícone de lixeira e confirme.
  - ⚠️ Ao excluir um paciente, os agendamentos dele também são removidos.

A lista é paginada — use os botões de página no rodapé para navegar.

---

## 4. Fisioterapeutas

Na opção **Fisioterapeutas** você gerencia os profissionais da clínica:

- Cadastre nome, **registro CREFITO**, especialidade, telefone e e-mail.
- O CREFITO e o e-mail não podem se repetir.
- Um fisioterapeuta que **possua agendamentos** não pode ser excluído (o sistema bloqueia para preservar o histórico). Cancele ou reatribua os agendamentos antes.

---

## 5. Tratamentos

Na opção **Tratamentos** você cadastra os serviços oferecidos:

- Informe **nome**, descrição, **duração (minutos)** e **valor (R$)**.
- Um tratamento que esteja sendo usado em algum agendamento não pode ser excluído.

---

## 6. Agendamentos

Esta é a área central da operação. Na opção **Agendamentos** você pode:

### Criar um agendamento
1. Clique em **Novo agendamento**.
2. Selecione o **paciente**, o **fisioterapeuta** e o **tratamento** nas listas.
3. Escolha a **data e a hora**.
4. Defina o **status** (por padrão, "Agendado") e adicione observações se quiser.
5. Clique em **Salvar**.

> 🔒 **Conflito de horário:** se o fisioterapeuta escolhido já tiver um atendimento naquele mesmo horário, o sistema **não permite** salvar e avisa o motivo. Escolha outro horário ou outro profissional.

### Acompanhar e filtrar
- Use a **busca** para encontrar por nome do paciente.
- Use o **filtro de status** para ver apenas agendados, confirmados, concluídos ou cancelados.
- Cada agendamento mostra um **selo colorido** indicando o status.

### Alterar status
Edite o agendamento (ícone de lápis) e mude o campo **Status** — por exemplo, de "Agendado" para "Confirmado" quando o paciente confirmar presença, ou "Concluído" após o atendimento.

### Excluir
Clique na lixeira e confirme.

---

## 7. Mensagens do sistema

O sistema sempre dá um retorno visual:

- 🟢 **Verde (sucesso):** a ação foi concluída.
- 🔴 **Vermelho (erro):** algo impediu a ação (o texto explica o motivo).
- ⏳ **Carregando:** um indicador aparece enquanto os dados são processados.

---

## 8. Sair do sistema

Clique no seu nome/avatar no topo (ou na opção **Sair** do menu) para encerrar a sessão com segurança. Por segurança, a sessão também expira após um período de inatividade, pedindo um novo login.

---

## 9. Site público e WhatsApp

A página inicial (fora do painel) é o site da clínica. No formulário de contato, ao preencher os dados e enviar, o visitante é direcionado ao **WhatsApp da clínica** com uma mensagem já pronta — facilitando o primeiro contato e o agendamento.

---

## 10. Dúvidas frequentes

**Esqueci minha senha.**
Peça a um administrador para redefinir seu acesso (a criação/gestão de usuários é feita por quem tem perfil de administrador).

**Não consigo excluir um fisioterapeuta/tratamento.**
Isso é proposital: existem agendamentos vinculados. Remova ou reatribua esses agendamentos primeiro.

**O horário que quero está bloqueado.**
Aquele fisioterapeuta já tem atendimento no mesmo horário. Escolha outro horário ou profissional.

---

*FisioFlow — Sistema de Gestão para Clínica de Fisioterapia.*
