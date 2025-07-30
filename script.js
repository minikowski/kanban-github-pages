// Configuração inicial
const REPO_OWNER = 'seu-usuario';
const REPO_NAME = 'seu-repositorio';
const DATA_FILE = 'data/kanban.json';
const GITHUB_TOKEN = ''; // Adicione seu token de acesso pessoal do GitHub se necessário

// Lista de colaboradores
const COLLABORATORS = [
    "Adriana de Oliveira Ribeiro",
    "Aline Aranda Gonçalves dos Santos",
    "Aline Arantes Loureiro",
    "Ana Claudia da Silva",
    "Ana Claudia Monteiro dos Santos",
    "Ana Paula Alves Rodrigues",
    "Ana Paula Rodrigues de Mello",
    "Andressa Priscila Marrezi Silva",
    "Andrew Lourenço Rodrigues",
    "Bianca Gomides Tavares Silva",
    "Bruna Adriele Garcia Mendes",
    "Cintia Andreia Martins",
    "Claudio Marcio de Melo",
    "Daiane Aparecida Santana",
    "Daniela dos Santos Pereira",
    "Daniele Cristina Moreira Marques",
    "Danielly dos Santos Claudino",
    "Dener Diniz de Souza",
    "Edineia Ferreira Salvatore",
    "Elaine Alves Pereira",
    "Elizabeth Fukuchima Silverio Longo",
    "Eliziane Saline dos Santos",
    "Eva Cordeiro dos Santos",
    "Eva Maria Balaguer",
    "Fernanda Aparecida dos Santos Andrade",
    "Fernanda Urias",
    "Franciana Maria Pontes",
    "Gabriel Sampaio Strauss",
    "Gisele Santiago Estércio",
    "Isabely Vanessa Pascual Ferreira",
    "Janaina Cristina Baptista Justino",
    "Jenifer Alves Freschi",
    "Jeniffer Karolaine Guilherme da Silva",
    "Julia Gonçalves Bianco",
    "Juliana de Meira",
    "Juliana Luzia Dias",
    "Lais de Souza Gonçalves Carvalho",
    "Leonardo da Silva Santos",
    "Leticia Lupion Ramos",
    "Lindiana Souza Santos",
    "Livia Amabile Vivan Pagotti",
    "Luana Aparecida da Silva",
    "Lucas Henrique Nomura",
    "Marcia Pereira dos Santos",
    "Marcia Vaz Correia",
    "Maria Luiza Vazquez Carelli",
    "Neverton Noia da Silva",
    "Pamela Dieize Pereira Esmerio",
    "Patrick Braga",
    "Paulo Roberto Gianeti Coelho",
    "Ricardo Bernardes Candido",
    "Sandiele Ianes da Silva",
    "Tatiane Gouveia da Fonseca",
    "Thainara Assis Pereira",
    "Thais Aimê Alves Damazio",
    "Victor Luis Minikowski",
    "Viviane Alves Molina"
];

// Elementos do DOM
const employeeSelect = document.getElementById('employee-select');
const editEmployeesBtn = document.getElementById('edit-employees');
const addTaskBtn = document.getElementById('add-task');
const saveDataBtn = document.getElementById('save-data');
const printStatsBtn = document.getElementById('print-stats');
const kanbanBoard = document.querySelector('.kanban-board');
const taskModal = document.getElementById('task-modal');
const employeeModal = document.getElementById('employee-modal');
const statsModal = document.getElementById('stats-modal');

// Dados do Kanban
let kanbanData = {
    employees: COLLABORATORS,
    tasks: {}
};

// Inicializar dados
function initializeDefaultData() {
    kanbanData = {
        employees: COLLABORATORS,
        tasks: {}
    };
    
    kanbanData.employees.forEach(employee => {
        kanbanData.tasks[employee] = {
            todo: [],
            doing: [],
            done: []
        };
    });
}

// Atualizar o dropdown de colaboradores
function updateEmployeeSelect() {
    employeeSelect.innerHTML = '<option value="">Selecione um colaborador</option>';
    
    kanbanData.employees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee;
        option.textContent = employee;
        employeeSelect.appendChild(option);
    });
}

// Renderizar o quadro Kanban
function renderKanbanBoard() {
    const selectedEmployee = employeeSelect.value;
    if (!selectedEmployee) return;
    
    const tasks = kanbanData.tasks[selectedEmployee] || { todo: [], doing: [], done: [] };
    
    renderTaskColumn('todo-tasks', tasks.todo, 'todo');
    renderTaskColumn('doing-tasks', tasks.doing, 'doing');
    renderTaskColumn('done-tasks', tasks.done, 'done');
}

// Renderizar uma coluna de tarefas
function renderTaskColumn(columnId, tasks, status) {
    const column = document.getElementById(columnId);
    column.innerHTML = '';
    
    tasks.forEach((task, index) => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task';
        taskElement.dataset.status = status;
        taskElement.dataset.index = index;
        
        taskElement.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description || 'Sem descrição'}</p>
            <div class="task-actions">
                ${status !== 'done' ? 
                    `<button class="move-btn" data-status="${status}" data-index="${index}">
                        ${status === 'todo' ? '▶ Iniciar' : '▶ Concluir'}
                    </button>` : ''
                }
                <button class="delete-btn" data-status="${status}" data-index="${index}">
                    ✕ Excluir
                </button>
            </div>
        `;
        
        column.appendChild(taskElement);
    });
}

// Mover tarefa entre colunas
function moveTask(currentStatus, index) {
    const selectedEmployee = employeeSelect.value;
    if (!selectedEmployee) return;
    
    const tasks = kanbanData.tasks[selectedEmployee];
    const task = tasks[currentStatus][index];
    const taskTitle = task.title;
    
    // Remover da coluna atual
    tasks[currentStatus].splice(index, 1);
    
    // Adicionar à próxima coluna
    let action = '';
    if (currentStatus === 'todo') {
        tasks.doing.push(task);
        action = 'Tarefa iniciada';
    } else if (currentStatus === 'doing') {
        tasks.done.push(task);
        action = 'Tarefa concluída';
    }
    
    // Registrar no histórico
    logHistory(action, `${taskTitle} (${selectedEmployee})`);
    
    saveKanbanData();
    renderKanbanBoard();
}

// Adicionar nova tarefa
function addNewTask(title, description) {
    const selectedEmployee = employeeSelect.value;
    if (!selectedEmployee || !title.trim()) return;
    
    if (!kanbanData.tasks[selectedEmployee]) {
        kanbanData.tasks[selectedEmployee] = { todo: [], doing: [], done: [] };
    }
    
    kanbanData.tasks[selectedEmployee].todo.push({
        title: title.trim(),
        description: description.trim(),
        createdAt: new Date().toISOString()
    });
    
    // Registrar no histórico
    logHistory('Nova tarefa', `${title.trim()} (${selectedEmployee})`);
    
    saveKanbanData();
    renderKanbanBoard();
}

// Excluir tarefa
function deleteTask(status, index) {
    const selectedEmployee = employeeSelect.value;
    if (!selectedEmployee) return;
    
    const taskTitle = kanbanData.tasks[selectedEmployee][status][index].title;
    kanbanData.tasks[selectedEmployee][status].splice(index, 1);
    
    // Registrar no histórico
    logHistory('Tarefa excluída', `${taskTitle} (${selectedEmployee})`);
    
    saveKanbanData();
    renderKanbanBoard();
}

// Registrar histórico
function logHistory(action, details) {
    const historyLog = document.getElementById('history-log');
    const now = new Date();
    const timestamp = now.toLocaleString('pt-BR');
    
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
        <span class="history-timestamp">[${timestamp}]</span>
        <span class="history-action">${action}:</span>
        <span class="history-details">${details}</span>
    `;
    
    historyLog.prepend(historyItem);
}

// Salvar dados (simulado para GitHub Pages)
function saveKanbanData() {
    // Em um ambiente real com GitHub API, você faria uma requisição PUT para atualizar o arquivo
    // Aqui estamos apenas salvando no localStorage para demonstração
    localStorage.setItem('kanbanData', JSON.stringify(kanbanData));
    console.log('Dados salvos (simulado)');
    
    // Mostrar feedback visual
    saveDataBtn.textContent = 'Salvo!';
    setTimeout(() => {
        saveDataBtn.textContent = 'Salvar Alterações';
    }, 2000);
}

// Mostrar estatísticas
function showStatistics() {
    const selectedEmployee = employeeSelect.value;
    if (!selectedEmployee) {
        alert('Selecione um colaborador primeiro');
        return;
    }
    
    const tasks = kanbanData.tasks[selectedEmployee] || { todo: [], doing: [], done: [] };
    const totalTasks = tasks.todo.length + tasks.doing.length + tasks.done.length;
    
    let statsHTML = `
        <h3>Estatísticas para ${selectedEmployee}</h3>
        <p><strong>Tarefas a fazer:</strong> ${tasks.todo.length}</p>
        <p><strong>Tarefas em progresso:</strong> ${tasks.doing.length}</p>
        <p><strong>Tarefas concluídas:</strong> ${tasks.done.length}</p>
        <p><strong>Total de tarefas:</strong> ${totalTasks}</p>
        <p><strong>Progresso:</strong> ${totalTasks > 0 ? Math.round((tasks.done.length / totalTasks) * 100) : 0}%</p>
    `;
    
    document.getElementById('stats-content').innerHTML = statsHTML;
    
    // Gráfico
    const ctx = document.getElementById('stats-chart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['A Fazer', 'Fazendo', 'Feito'],
            datasets: [{
                data: [tasks.todo.length, tasks.doing.length, tasks.done.length],
                backgroundColor: [
                    '#e74c3c',
                    '#f39c12',
                    '#2ecc71'
                ]
            }]
        }
    });
    
    statsModal.style.display = 'block';
}

// Editar lista de colaboradores
function editEmployees() {
    const employeeList = document.getElementById('employee-list');
    employeeList.innerHTML = '';
    
    kanbanData.employees.forEach((employee, index) => {
        const employeeItem = document.createElement('div');
        employeeItem.className = 'employee-item';
        employeeItem.innerHTML = `
            <input type="text" value="${employee}" data-index="${index}">
            <button class="remove-employee" data-index="${index}">Remover</button>
        `;
        employeeList.appendChild(employeeItem);
    });
    
    employeeModal.style.display = 'block';
}

// Event Listeners
employeeSelect.addEventListener('change', renderKanbanBoard);

editEmployeesBtn.addEventListener('click', editEmployees);

addTaskBtn.addEventListener('click', () => {
    document.getElementById('task-title').value = '';
    document.getElementById('task-description').value = '';
    taskModal.style.display = 'block';
});

saveDataBtn.addEventListener('click', saveKanbanData);

printStatsBtn.addEventListener('click', showStatistics);

document.getElementById('save-task').addEventListener('click', () => {
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    addNewTask(title, description);
    taskModal.style.display = 'none';
});

document.getElementById('add-employee').addEventListener('click', () => {
    const employeeList = document.getElementById('employee-list');
    const newIndex = kanbanData.employees.length;
    
    const employeeItem = document.createElement('div');
    employeeItem.className = 'employee-item';
    employeeItem.innerHTML = `
        <input type="text" placeholder="Novo colaborador" data-index="${newIndex}">
        <button class="remove-employee" data-index="${newIndex}">Remover</button>
    `;
    employeeList.appendChild(employeeItem);
});

document.getElementById('save-employees').addEventListener('click', () => {
    const inputs = document.querySelectorAll('#employee-list input');
    const newEmployees = [];
    
    inputs.forEach(input => {
        if (input.value.trim()) {
            newEmployees.push(input.value.trim());
        }
    });
    
    kanbanData.employees = newEmployees;
    
    // Garantir que todos os colaboradores tenham uma estrutura de tarefas
    newEmployees.forEach(employee => {
        if (!kanbanData.tasks[employee]) {
            kanbanData.tasks[employee] = { todo: [], doing: [], done: [] };
        }
    });
    
    // Remover tarefas de colaboradores excluídos
    Object.keys(kanbanData.tasks).forEach(employee => {
        if (!newEmployees.includes(employee)) {
            delete kanbanData.tasks[employee];
        }
    });
    
    saveKanbanData();
    updateEmployeeSelect();
    employeeModal.style.display = 'none';
});

// Fechar modais
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        taskModal.style.display = 'none';
        employeeModal.style.display = 'none';
        statsModal.style.display = 'none';
    });
});

// Excluir tarefa (delegação de eventos)
kanbanBoard.addEventListener('click', (e) => {
    if (e.target.classList.contains('move-btn')) {
        const status = e.target.dataset.status;
        const index = parseInt(e.target.dataset.index);
        moveTask(status, index);
    }
    
    if (e.target.classList.contains('delete-btn')) {
        e.stopPropagation();
        const status = e.target.dataset.status;
        const index = parseInt(e.target.dataset.index);
        deleteTask(status, index);
    }
});

// Excluir colaborador (delegação de eventos)
document.getElementById('employee-list').addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-employee')) {
        e.target.parentElement.remove();
    }
});

// Carregar dados quando a página é aberta
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se há dados salvos no localStorage (para demonstração)
    const savedData = localStorage.getItem('kanbanData');
    if (savedData) {
        kanbanData = JSON.parse(savedData);
        updateEmployeeSelect();
    } else {
        initializeDefaultData();
    }
    
    // Renderizar o quadro inicial
    renderKanbanBoard();
});
