// Declara um array vazio para armazenar as tarefas
let tarefas = [];

// Define o filtro atual para exibir as tarefas (pode ser 'todas', 'pendentes' ou 'concluidas')
let filtroAtual = 'todas';

// Função que salva a lista de tarefas no armazenamento local do navegador (localStorage)
function salvarTarefas() {
  localStorage.setItem('tarefas', JSON.stringify(tarefas));
}

// Função que carrega as tarefas salvas no localStorage quando a página é carregada
function carregarTarefas() {
  const armazenadas = localStorage.getItem('tarefas');
  if (armazenadas) tarefas = JSON.parse(armazenadas);
  atualizarLista();
}

// Função para adicionar uma nova tarefa à lista
function adicionarTarefa() {
  const entrada = document.getElementById('entradaTarefa');
  const texto = entrada.value.trim();
  if (!texto) return; // Não adiciona tarefas vazias
  tarefas.push({ texto, concluida: false });
  salvarTarefas();
  atualizarLista();
  entrada.value = '';
  entrada.focus();
}

// Função que cria e exibe um li da tarefa na lista HTML
function exibirTarefa(tarefa, indice) {
  const li = document.createElement('li');
  li.className = 'list-group-item d-flex justify-content-between align-items-center fade-in';
  li.setAttribute('data-id', indice);

  // Cria um span para mostrar o texto da tarefa
  const span = document.createElement('span');
  span.textContent = tarefa.texto;
  span.style.cursor = 'pointer';

  // Aplica classes CSS diferentes dependendo se a tarefa ta concluída ou não
  if (tarefa.concluida) span.classList.add('concluida');
  if (!tarefa.concluida) span.classList.add('pendente');

  // Evento de clique para marcar ou desmarcar a tarefa como concluída
  span.onclick = () => {
    tarefas[indice].concluida = !tarefas[indice].concluida;
    salvarTarefas();
    atualizarLista();
  };

  // Evento de duplo clique para deixar editar o texto da tarefa
  span.ondblclick = () => {
    const input = document.createElement('input');
    input.className = 'editando';
    input.value = tarefa.texto;

    // Ao perder o foco, salva o novo texto da tarefa se não estiver vazio
    input.onblur = () => {
      const novoTexto = input.value.trim();
      if (novoTexto !== '') {
        tarefas[indice].texto = novoTexto;
        salvarTarefas();
        atualizarLista();
      }
    };

    // Se o usuário der enter, finaliza a ediçao
    input.onkeypress = (e) => {
      if (e.key === 'Enter') input.blur();
    };

    // Substitui o span pelo input para edição e foca o campo
    li.replaceChild(input, span);
    input.focus();
  };

  // Cria um botão pra remover a tarefa
  const botaoRemover = document.createElement('button');
  botaoRemover.className = 'btn btn-danger btn-sm';
  botaoRemover.textContent = 'Remover';

  // Aplica uma animação de desaparecimento e remove a tarefa da lista
  botaoRemover.onclick = () => {
    li.classList.add('fade-out');
    setTimeout(() => {
      tarefas.splice(indice, 1);
      salvarTarefas();
      atualizarLista();
    }, 300);
  };

  // Adiciona o texto e o botão de remover ao item da lista e adiciona à lista no DOM
  li.appendChild(span);
  li.appendChild(botaoRemover);
  document.getElementById('listaTarefas').appendChild(li);
}

// Função que atualiza a lista de tarefas exibida na tela conforme o filtro selecionado
function atualizarLista() {
  const lista = document.getElementById('listaTarefas');
  lista.innerHTML = ''; // Limpa a lista antes de renderizar novamente

  // Remove a classe 'active' de todos os botões de filtro
  document.querySelectorAll('.filtros .btn').forEach(btn => btn.classList.remove('active'));

  // Adiciona a classe 'active' no botão do filtro atual para destacar
  document.querySelector(`.filtros .btn[onclick*="${filtroAtual}"]`).classList.add('active');

  // Itera sobre as tarefas e decide se deve mostrar cada uma com base no filtro
  tarefas.forEach((tarefa, indice) => {
    const mostrar =
      filtroAtual === 'todas' ||
      (filtroAtual === 'pendentes' && !tarefa.concluida) ||
      (filtroAtual === 'concluidas' && tarefa.concluida);
    if (mostrar) exibirTarefa(tarefa, indice);
  });

  // Reativa o recurso drag and drop para reordenar tarefas após a renderização
  Sortable.create(lista, {
    animation: 150,
    onEnd: function (evt) {
      // Atualiza a ordem das tarefas no vetor conforme o movimento do item na lista
      const [moved] = tarefas.splice(evt.oldIndex, 1);
      tarefas.splice(evt.newIndex, 0, moved);
      salvarTarefas();
      atualizarLista();
    }
  });
}

// Função para remover todas as tarefas que tao marcadas como concluídas
function limparConcluidas() {
  tarefas = tarefas.filter(tarefa => !tarefa.concluida);
  salvarTarefas();
  atualizarLista();
}

// Evento que adiciona uma nova tarefa quando o usuário pressiona a tecla Enter no input
document.getElementById('entradaTarefa').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') adicionarTarefa();
});

// Quando a página carrega, executa a função para carregar as tarefas salvas no localStorage
window.onload = carregarTarefas;