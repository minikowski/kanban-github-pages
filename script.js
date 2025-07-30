// Configuração inicial
const REPO_OWNER = 'seu-usuario'; // Substitua pelo seu usuário do GitHub
const REPO_NAME = 'seu-repositorio'; // Substitua pelo nome do repositório
const DATA_FILE = 'data/kanban.json';
const GITHUB_TOKEN = ''; // Adicione seu token de acesso pessoal do GitHub se necessário

// Elementos do DOM
const employeeSelect = document.getElementById('employee-select');
const editEmployeesBtn = document.getElementById('edit-employees');
const addTaskBtn = document.getElementById('add-task');
const printStatsBtn = document.getElementById('print-stats');
const kanbanBoard = document.querySelector('.kanban-board');
const taskModal = document.getElementById('task-modal');
const employeeModal = document.getElementById('employee-modal');
const statsModal = document.getElementById('stats-modal');

// Dados do Kanban
let kanbanData = {
    employees: Array.from({length: 50}, (_, i) => `Funcionário ${i+1}`),
    tasks: {}
};

// Carregar dados do arquivo JSON
async function loadKanbanData() {
    try {
        const response = await fetch(`https://${REPO_OWNER}.github.io/${REPO_NAME}/${DATA_FILE}`);
        if (response.ok) {
            kanbanData = await response.json();
        } else {
            // Se o arquivo não existir, inicialize com dados padrão
            initializeDefaultData();
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        initializeDefaultData();
    }
    
    updateEmployeeSelect();
    renderKanbanBoard();
}

// Inicializar dados padrão
function initializeDefaultData() {
    kanbanData = {
        employees: Array.from({length: 50}, (_, i) => `Funcionário ${i+1}`),
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

// Atualizar o dropdown de funcionários
function updateEmployeeSelect() {
    employeeSelect.innerHTML = '<option value="">Selecione um funcionário</option>';
    
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
            <button class="delete-btn" data-status="${status}" data-index="${index}">×</button>
            <h3>${task.title}</h3>
            <p>${task.description || 'Sem descrição'}</p>
        `;
        
        taskElement.addEventListener('click', () => moveTask(status, index));
        
        column.appendChild(taskElement);
    });
}

// Mover tarefa entre colunas
function moveTask(currentStatus, index) {
    const selectedEmployee = employeeSelect.value;
    if (!selectedEmployee) return;
    
    const tasks = kanbanData.tasks[selectedEmployee];
    const task = tasks[currentStatus][index];
    
    // Remover da coluna atual
    tasks[currentStatus].splice(index, 1);
    
    // Adicionar à próxima coluna
    if (currentStatus === 'todo') {
        tasks.doing.push(task);
    } else if (currentStatus === 'doing') {
        tasks.done.push(task);
    }
    
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
    
    saveKanbanData();
    renderKanbanBoard();
}

// Excluir tarefa
function deleteTask(status, index) {
    const selectedEmployee = employeeSelect.value;
    if (!selectedEmployee) return;
    
    kanbanData.tasks[selectedEmployee][status].splice(index, 1);
    saveKanbanData();
    renderKanbanBoard();
}

// Salvar dados no arquivo JSON (simulado para GitHub Pages)
function saveKanbanData() {
    // Em um ambiente real com GitHub API, você faria uma requisição PUT para atualizar o arquivo
    // Aqui estamos apenas salvando no localStorage para demonstração
    localStorage.setItem('kanbanData', JSON.stringify(kanbanData));
    console.log('Dados salvos (simulado)');
}

// Mostrar estatísticas
function showStatistics() {
    const selectedEmployee = employeeSelect.value;
    if (!selectedEmployee) {
        alert('Selecione um funcionário primeiro');
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

// Editar lista de funcionários
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
        <input type="text" placeholder="Novo funcionário" data-index="${newIndex}">
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
    
    // Garantir que todos os funcionários tenham uma estrutura de tarefas
    newEmployees.forEach(employee => {
        if (!kanbanData.tasks[employee]) {
            kanbanData.tasks[employee] = { todo: [], doing: [], done: [] };
        }
    });
    
    // Remover tarefas de funcionários excluídos
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
    if (e.target.classList.contains('delete-btn')) {
        e.stopPropagation();
        const status = e.target.dataset.status;
        const index = parseInt(e.target.dataset.index);
        deleteTask(status, index);
    }
});

// Excluir funcionário (delegação de eventos)
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
        loadKanbanData();
    }
});