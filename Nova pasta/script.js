// Estado da aplicação
let currentComponents = {};
let currentGames = {};
let draggedElement = null;
let dragOffset = { x: 0, y: 0 };

// Formas básicas disponíveis
const basicShapes = [
    { id: 'circle', name: 'Círculo', icon: '⭕', color: '#ff6b6b' },
    { id: 'square', name: 'Quadrado', icon: '🟦', color: '#4ecdc4' },
    { id: 'triangle', name: 'Triângulo', icon: '🔺', color: '#45b7d1' },
    { id: 'rectangle', name: 'Retângulo', icon: '🟪', color: '#96ceb4' },
    { id: 'diamond', name: 'Losango', icon: '🔷', color: '#feca57' },
    { id: 'star', name: 'Estrela', icon: '⭐', color: '#ff9ff3' },
    { id: 'heart', name: 'Coração', icon: '❤️', color: '#ff6b6b' },
    { id: 'hexagon', name: 'Hexágono', icon: '⬡', color: '#54a0ff' }
];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    createShapesGrid();
    loadSavedData();
    setupEventListeners();
});

// Gerenciamento de abas
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Atualiza componentes disponíveis na aba de jogos
            if (targetTab === 'game-creator') {
                updateComponentsSelection();
            }
        });
    });
}

// Criação da grade de formas básicas
function createShapesGrid() {
    const shapesGrid = document.getElementById('shapesGrid');
    shapesGrid.innerHTML = '';

    basicShapes.forEach(shape => {
        const shapeElement = document.createElement('div');
        shapeElement.className = 'shape';
        shapeElement.draggable = true;
        shapeElement.dataset.shapeId = shape.id;
        
        shapeElement.innerHTML = `
            <div class="shape-icon" style="color: ${shape.color}">${shape.icon}</div>
            <div class="shape-name">${shape.name}</div>
        `;
        
        // Event listeners para drag and drop
        shapeElement.addEventListener('dragstart', handleShapeDragStart);
        shapeElement.addEventListener('dragend', handleDragEnd);
        
        shapesGrid.appendChild(shapeElement);
    });
}

// Configuração de event listeners
function setupEventListeners() {
    // Área de montagem de componentes
    const shapeAssemblyArea = document.getElementById('shapeAssemblyArea');
    shapeAssemblyArea.addEventListener('dragover', handleDragOver);
    shapeAssemblyArea.addEventListener('drop', handleShapeDrop);
    shapeAssemblyArea.addEventListener('dragleave', handleDragLeave);

    // Área de montagem de jogos
    const gameAssemblyArea = document.getElementById('gameAssemblyArea');
    gameAssemblyArea.addEventListener('dragover', handleDragOver);
    gameAssemblyArea.addEventListener('drop', handleGameDrop);
    gameAssemblyArea.addEventListener('dragleave', handleDragLeave);

    // Botões de controle
    document.getElementById('clearShapeAssembly').addEventListener('click', clearShapeAssembly);
    document.getElementById('saveComponent').addEventListener('click', showComponentForm);
    document.getElementById('clearGameAssembly').addEventListener('click', clearGameAssembly);
    document.getElementById('saveGame').addEventListener('click', showGameForm);

    // Formulários
    document.getElementById('confirmComponent').addEventListener('click', saveComponent);
    document.getElementById('confirmGame').addEventListener('click', saveGame);
}

// Handlers de drag and drop para formas
function handleShapeDragStart(e) {
    draggedElement = {
        type: 'shape',
        data: basicShapes.find(s => s.id === e.target.dataset.shapeId)
    };
    e.dataTransfer.effectAllowed = 'copy';
}

function handleComponentDragStart(e) {
    const componentId = e.target.dataset.componentId;
    draggedElement = {
        type: 'component',
        data: currentComponents[componentId]
    };
    e.dataTransfer.effectAllowed = 'copy';
}

function handleDragEnd(e) {
    draggedElement = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
        e.currentTarget.classList.remove('dragover');
    }
}

function handleShapeDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    if (!draggedElement || draggedElement.type !== 'shape') return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 30; // Ajuste para centralizar
    const y = e.clientY - rect.top - 30;
    
    addShapeToAssembly(draggedElement.data, x, y);
    updateComponentPreview();
}

function handleGameDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    if (!draggedElement || draggedElement.type !== 'component') return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 40;
    const y = e.clientY - rect.top - 40;
    
    addComponentToGameAssembly(draggedElement.data, x, y);
    updateGamePreview();
}

// Adicionar forma à área de montagem
function addShapeToAssembly(shape, x, y) {
    const assemblyArea = document.getElementById('shapeAssemblyArea');
    const shapeElement = document.createElement('div');
    const shapeId = `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    shapeElement.className = 'assembly-shape';
    shapeElement.dataset.shapeId = shape.id;
    shapeElement.dataset.uniqueId = shapeId;
    shapeElement.style.left = `${Math.max(0, Math.min(x, assemblyArea.clientWidth - 60))}px`;
    shapeElement.style.top = `${Math.max(0, Math.min(y, assemblyArea.clientHeight - 60))}px`;
    
    shapeElement.innerHTML = `
        <div style="color: ${shape.color}; font-size: 1.5rem;">${shape.icon}</div>
        <div style="font-size: 0.7rem; margin-top: 2px;">${shape.name}</div>
        <button onclick="removeShape('${shapeId}')" style="position: absolute; top: -8px; right: -8px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; cursor: pointer;">×</button>
    `;
    
    // Adicionar funcionalidade de arrastar dentro da área
    makeElementDraggable(shapeElement);
    
    assemblyArea.appendChild(shapeElement);
}

// Adicionar componente à área de montagem do jogo
function addComponentToGameAssembly(component, x, y) {
    const assemblyArea = document.getElementById('gameAssemblyArea');
    const componentElement = document.createElement('div');
    const componentId = `game-comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    componentElement.className = 'assembly-component';
    componentElement.dataset.componentId = component.id;
    componentElement.dataset.uniqueId = componentId;
    componentElement.style.left = `${Math.max(0, Math.min(x, assemblyArea.clientWidth - 80))}px`;
    componentElement.style.top = `${Math.max(0, Math.min(y, assemblyArea.clientHeight - 80))}px`;
    
    componentElement.innerHTML = `
        <div style="font-size: 1.5rem;">${component.icon}</div>
        <div style="font-size: 0.8rem; margin-top: 2px;">${component.name}</div>
        <button onclick="removeGameComponent('${componentId}')" style="position: absolute; top: -8px; right: -8px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; cursor: pointer;">×</button>
    `;
    
    makeElementDraggable(componentElement);
    assemblyArea.appendChild(componentElement);
}

// Tornar elemento arrastável dentro da área
function makeElementDraggable(element) {
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    element.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = parseInt(element.style.left);
        startTop = parseInt(element.style.top);
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        e.preventDefault();
    });
    
    function handleMouseMove(e) {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const newLeft = startLeft + deltaX;
        const newTop = startTop + deltaY;
        
        const parent = element.parentElement;
        const maxLeft = parent.clientWidth - element.offsetWidth;
        const maxTop = parent.clientHeight - element.offsetHeight;
        
        element.style.left = `${Math.max(0, Math.min(newLeft, maxLeft))}px`;
        element.style.top = `${Math.max(0, Math.min(newTop, maxTop))}px`;
    }
    
    function handleMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // Atualizar preview após mover
        if (element.classList.contains('assembly-shape')) {
            updateComponentPreview();
        } else if (element.classList.contains('assembly-component')) {
            updateGamePreview();
        }
    }
}

// Remover forma da montagem
function removeShape(uniqueId) {
    const element = document.querySelector(`[data-unique-id="${uniqueId}"]`);
    if (element) {
        element.remove();
        updateComponentPreview();
    }
}

// Remover componente do jogo
function removeGameComponent(uniqueId) {
    const element = document.querySelector(`[data-unique-id="${uniqueId}"]`);
    if (element) {
        element.remove();
        updateGamePreview();
    }
}

// Limpar área de montagem de componentes
function clearShapeAssembly() {
    document.getElementById('shapeAssemblyArea').innerHTML = '';
    updateComponentPreview();
}

// Limpar área de montagem de jogos
function clearGameAssembly() {
    document.getElementById('gameAssemblyArea').innerHTML = '';
    updateGamePreview();
}

// Atualizar preview do componente
function updateComponentPreview() {
    const assemblyArea = document.getElementById('shapeAssemblyArea');
    const preview = document.getElementById('componentPreview');
    const shapes = assemblyArea.querySelectorAll('.assembly-shape');
    
    if (shapes.length === 0) {
        preview.innerHTML = '<p class="empty-state">Arraste formas para a área de montagem para criar um componente</p>';
        return;
    }
    
    const shapesList = Array.from(shapes).map(shape => {
        const shapeId = shape.dataset.shapeId;
        const shapeData = basicShapes.find(s => s.id === shapeId);
        return `<span class="shape-tag">${shapeData.icon} ${shapeData.name}</span>`;
    }).join('');
    
    preview.innerHTML = `
        <h4>Formas utilizadas:</h4>
        <div style="margin-top: 10px;">${shapesList}</div>
        <p style="margin-top: 15px; color: #6c757d; font-size: 0.9rem;">
            Total de peças: ${shapes.length}
        </p>
    `;
}

// Atualizar preview do jogo
function updateGamePreview() {
    const assemblyArea = document.getElementById('gameAssemblyArea');
    const preview = document.getElementById('gamePreview');
    const components = assemblyArea.querySelectorAll('.assembly-component');
    
    if (components.length === 0) {
        preview.innerHTML = '<p class="empty-state">Arraste componentes para a área de montagem para criar um jogo</p>';
        return;
    }
    
    const componentsList = Array.from(components).map(comp => {
        const compId = comp.dataset.componentId;
        const compData = currentComponents[compId];
        return `<span class="component-tag">${compData.icon} ${compData.name}</span>`;
    }).join('');
    
    preview.innerHTML = `
        <h4>Componentes utilizados:</h4>
        <div style="margin-top: 10px;">${componentsList}</div>
        <p style="margin-top: 15px; color: #6c757d; font-size: 0.9rem;">
            Total de componentes: ${components.length}
        </p>
    `;
}

// Mostrar formulário de componente
function showComponentForm() {
    const assemblyArea = document.getElementById('shapeAssemblyArea');
    const shapes = assemblyArea.querySelectorAll('.assembly-shape');
    
    if (shapes.length === 0) {
        alert('Adicione pelo menos uma forma antes de salvar o componente!');
        return;
    }
    
    document.getElementById('componentForm').classList.remove('hidden');
}

// Mostrar formulário de jogo
function showGameForm() {
    const assemblyArea = document.getElementById('gameAssemblyArea');
    const components = assemblyArea.querySelectorAll('.assembly-component');
    
    if (components.length === 0) {
        alert('Adicione pelo menos um componente antes de salvar o jogo!');
        return;
    }
    
    document.getElementById('gameForm').classList.remove('hidden');
}

// Salvar componente
function saveComponent() {
    const name = document.getElementById('componentName').value.trim();
    const icon = document.getElementById('componentIcon').value.trim() || '🔧';
    const category = document.getElementById('componentCategory').value;
    
    if (!name) {
        alert('Por favor, digite um nome para o componente!');
        return;
    }
    
    const assemblyArea = document.getElementById('shapeAssemblyArea');
    const shapes = Array.from(assemblyArea.querySelectorAll('.assembly-shape')).map(shape => {
        const shapeId = shape.dataset.shapeId;
        const shapeData = basicShapes.find(s => s.id === shapeId);
        return {
            ...shapeData,
            position: {
                x: parseInt(shape.style.left),
                y: parseInt(shape.style.top)
            }
        };
    });
    
    const componentId = `comp-${Date.now()}`;
    const component = {
        id: componentId,
        name,
        icon,
        category,
        shapes,
        createdAt: new Date().toISOString()
    };
    
    currentComponents[componentId] = component;
    saveToStorage();
    displayComponents();
    updateComponentsSelection();
    
    // Limpar formulário e fechar
    document.getElementById('componentName').value = '';
    document.getElementById('componentIcon').value = '';
    document.getElementById('componentForm').classList.add('hidden');
    clearShapeAssembly();
    
    alert('Componente salvo com sucesso!');
}

// Salvar jogo
function saveGame() {
    const name = document.getElementById('gameName').value.trim();
    const description = document.getElementById('gameDescription').value.trim();
    
    if (!name) {
        alert('Por favor, digite um nome para o jogo!');
        return;
    }
    
    const assemblyArea = document.getElementById('gameAssemblyArea');
    const components = Array.from(assemblyArea.querySelectorAll('.assembly-component')).map(comp => {
        const compId = comp.dataset.componentId;
        const compData = currentComponents[compId];
        return {
            ...compData,
            position: {
                x: parseInt(comp.style.left),
                y: parseInt(comp.style.top)
            }
        };
    });
    
    const gameId = `game-${Date.now()}`;
    const game = {
        id: gameId,
        name,
        description,
        components,
        createdAt: new Date().toISOString()
    };
    
    currentGames[gameId] = game;
    saveToStorage();
    displayGames();
    
    // Limpar formulário e fechar
    document.getElementById('gameName').value = '';
    document.getElementById('gameDescription').value = '';
    document.getElementById('gameForm').classList.add('hidden');
    clearGameAssembly();
    
    alert('Jogo salvo com sucesso!');
}

// Exibir componentes na biblioteca
function displayComponents() {
    const grid = document.getElementById('componentsGrid');
    const components = Object.values(currentComponents);
    
    if (components.length === 0) {
        grid.innerHTML = '<p class="empty-state">Seus componentes criados aparecerão aqui</p>';
        return;
    }
    
    grid.innerHTML = components.map(comp => `
        <div class="component-card">
            <div class="component-header">
                <span class="component-icon">${comp.icon}</span>
                <span class="component-name">${comp.name}</span>
            </div>
            <div class="component-category">${comp.category}</div>
            <div class="component-shapes">
                <strong>Formas:</strong> ${comp.shapes.map(s => `${s.icon} ${s.name}`).join(', ')}
            </div>
            <div class="controls">
                <button onclick="deleteComponent('${comp.id}')" class="button button-danger" style="padding: 0.5rem 1rem; font-size: 0.8rem;">🗑️ Excluir</button>
            </div>
        </div>
    `).join('');
}

// Exibir jogos na biblioteca
function displayGames() {
    const grid = document.getElementById('gamesGrid');
    const games = Object.values(currentGames);
    
    if (games.length === 0) {
        grid.innerHTML = '<p class="empty-state">Seus jogos criados aparecerão aqui</p>';
        return;
    }
    
    grid.innerHTML = games.map(game => `
        <div class="game-card">
            <div class="game-title">${game.name}</div>
            <div class="game-description">${game.description || 'Sem descrição'}</div>
            <div class="game-components">
                <h4>Componentes:</h4>
                <div class="components-chips">
                    ${game.components.map(comp => `
                        <span class="component-chip">${comp.icon} ${comp.name}</span>
                    `).join('')}
                </div>
            </div>
            <div class="game-actions">
                <button onclick="deleteGame('${game.id}')" class="button button-danger" style="padding: 0.5rem 1rem; font-size: 0.8rem;">🗑️ Excluir</button>
            </div>
        </div>
    `).join('');
}

// Atualizar seleção de componentes na aba de jogos
function updateComponentsSelection() {
    const selection = document.getElementById('componentsSelection');
    const components = Object.values(currentComponents);
    
    if (components.length === 0) {
        selection.innerHTML = '<p class="empty-state">Crie componentes primeiro para montar jogos</p>';
        return;
    }
    
    selection.innerHTML = components.map(comp => `
        <div class="component-item" draggable="true" data-component-id="${comp.id}">
            <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">${comp.icon}</div>
            <div style="font-size: 0.8rem; font-weight: 600;">${comp.name}</div>
            <div style="font-size: 0.7rem; color: #6c757d;">${comp.category}</div>
        </div>
    `).join('');
    
    // Adicionar event listeners para os componentes
    selection.querySelectorAll('.component-item').forEach(item => {
        item.addEventListener('dragstart', handleComponentDragStart);
        item.addEventListener('dragend', handleDragEnd);
    });
}

// Excluir componente
function deleteComponent(componentId) {
    if (confirm('Tem certeza que deseja excluir este componente?')) {
        delete currentComponents[componentId];
        saveToStorage();
        displayComponents();
        updateComponentsSelection();
    }
}

// Excluir jogo
function deleteGame(gameId) {
    if (confirm('Tem certeza que deseja excluir este jogo?')) {
        delete currentGames[gameId];
        saveToStorage();
        displayGames();
    }
}

// Salvar dados no armazenamento (usando variáveis em memória para Claude.ai)
function saveToStorage() {
    // Em um ambiente real, você usaria localStorage aqui
    // localStorage.setItem('gameBuilderComponents', JSON.stringify(currentComponents));
    // localStorage.setItem('gameBuilderGames', JSON.stringify(currentGames));
    
    // Para Claude.ai, mantemos os dados em memória durante a sessão
    console.log('Dados salvos em memória:', {
        components: Object.keys(currentComponents).length,
        games: Object.keys(currentGames).length
    });
}

// Carregar dados salvos
function loadSavedData() {
    // Em um ambiente real, você carregaria do localStorage aqui
    // const savedComponents = localStorage.getItem('gameBuilderComponents');
    // const savedGames = localStorage.getItem('gameBuilderGames');
    
    // if (savedComponents) currentComponents = JSON.parse(savedComponents);
    // if (savedGames) currentGames = JSON.parse(savedGames);
    
    // Para demonstração, vamos criar alguns componentes de exemplo
    createExampleComponents();
    
    displayComponents();
    displayGames();
}

// Criar componentes de exemplo para demonstração
function createExampleComponents() {
    // Exemplo 1: Dado
    currentComponents['example-dice'] = {
        id: 'example-dice',
        name: 'Dado Clássico',
        icon: '🎲',
        category: 'Funcional',
        shapes: [
            { ...basicShapes.find(s => s.id === 'square'), position: { x: 50, y: 50 } },
            { ...basicShapes.find(s => s.id === 'circle'), position: { x: 100, y: 100 } },
            { ...basicShapes.find(s => s.id === 'circle'), position: { x: 150, y: 50 } }
        ],
        createdAt: new Date().toISOString()
    };
    
    // Exemplo 2: Torre
    currentComponents['example-tower'] = {
        id: 'example-tower',
        name: 'Torre de Blocos',
        icon: '🏗️',
        category: 'Estrutural',
        shapes: [
            { ...basicShapes.find(s => s.id === 'rectangle'), position: { x: 75, y: 200 } },
            { ...basicShapes.find(s => s.id === 'square'), position: { x: 85, y: 150 } },
            { ...basicShapes.find(s => s.id === 'square'), position: { x: 85, y: 100 } },
            { ...basicShapes.find(s => s.id === 'triangle'), position: { x: 85, y: 50 } }
        ],
        createdAt: new Date().toISOString()
    };
    
    // Exemplo de jogo
    currentGames['example-game'] = {
        id: 'example-game',
        name: 'Jogo da Torre Mágica',
        description: 'Construa a torre mais alta usando dados e blocos. Role o dado para determinar quantas peças pode usar!',
        components: [
            currentComponents['example-dice'],
            currentComponents['example-tower']
        ],
        createdAt: new Date().toISOString()
    };
}