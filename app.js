// State management
let state = {
    projects: [],
    currentProjectId: null,
    currentPromptId: null
};

const API_BASE = 'http://localhost:3000/api';

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await loadStateFromServer();
    initializeEventListeners();
    renderProjects();
    showEmptyStateOrProject();
});

// Server API Functions
async function loadStateFromServer() {
    try {
        const response = await fetch(`${API_BASE}/state`);
        const data = await response.json();
        state.projects = data.projects;
    } catch (error) {
        console.error('Error loading state from server:', error);
        alert('Failed to connect to server. Please make sure the server is running (npm start).');
    }
}

async function saveProject(projectData) {
    try {
        const response = await fetch(`${API_BASE}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error saving project:', error);
        throw error;
    }
}

async function updateProject(projectId, data) {
    try {
        const response = await fetch(`${API_BASE}/projects/${projectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating project:', error);
        throw error;
    }
}

async function deleteProject(projectId) {
    try {
        const response = await fetch(`${API_BASE}/projects/${projectId}`, {
            method: 'DELETE'
        });
        return await response.json();
    } catch (error) {
        console.error('Error deleting project:', error);
        throw error;
    }
}

async function savePrompt(promptData) {
    try {
        const response = await fetch(`${API_BASE}/prompts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(promptData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error saving prompt:', error);
        throw error;
    }
}

async function updatePrompt(promptId, data) {
    try {
        const response = await fetch(`${API_BASE}/prompts/${promptId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating prompt:', error);
        throw error;
    }
}

async function deletePrompt(promptId) {
    try {
        const response = await fetch(`${API_BASE}/prompts/${promptId}`, {
            method: 'DELETE'
        });
        return await response.json();
    } catch (error) {
        console.error('Error deleting prompt:', error);
        throw error;
    }
}

async function saveImage(imageData) {
    try {
        const response = await fetch(`${API_BASE}/images`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(imageData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error saving image:', error);
        throw error;
    }
}

async function deleteImage(imageId) {
    try {
        const response = await fetch(`${API_BASE}/images/${imageId}`, {
            method: 'DELETE'
        });
        return await response.json();
    } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
}

// Event Listeners
function initializeEventListeners() {
    // Project management
    document.getElementById('newProjectBtn').addEventListener('click', showProjectModal);
    document.getElementById('saveProjectBtn').addEventListener('click', handleSaveProject);
    document.getElementById('cancelProjectBtn').addEventListener('click', hideProjectModal);
    document.getElementById('renameProjectBtn').addEventListener('click', renameCurrentProject);
    document.getElementById('deleteProjectBtn').addEventListener('click', handleDeleteProject);

// Prompt management
    document.getElementById('newPromptBtn').addEventListener('click', createNewPrompt);
    document.getElementById('backToProjectBtn').addEventListener('click', backToProject);
    document.getElementById('deletePromptBtn').addEventListener('click', handleDeletePrompt);
    document.getElementById('promptTitle').addEventListener('input', handleUpdatePromptTitle);

    // Rich text editor
    document.querySelectorAll('.toolbar-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleToolbarClick(e));
    });

    document.getElementById('richTextEditor').addEventListener('input', handleSavePromptContent);

    // Image attachment
    document.getElementById('attachImageBtn').addEventListener('click', () => {
        document.getElementById('imageUploadInput').click();
    });
    document.getElementById('imageUploadInput').addEventListener('change', handleImageUpload);

    // Export
    document.getElementById('exportPromptBtn').addEventListener('click', exportPromptToClipboard);

    // Modal keyboard shortcuts
    document.getElementById('projectNameInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSaveProject();
        if (e.key === 'Escape') hideProjectModal();
    });

    // Close modal when clicking outside
    document.getElementById('projectModal').addEventListener('click', (e) => {
        if (e.target.id === 'projectModal') hideProjectModal();
    });
}

// Project Management
function showProjectModal(isRename = false) {
    const modal = document.getElementById('projectModal');
    const input = document.getElementById('projectNameInput');
    const title = document.getElementById('projectModalTitle');

    if (isRename && state.currentProjectId) {
        const project = state.projects.find(p => p.id === state.currentProjectId);
        title.textContent = 'Rename Project';
        input.value = project.name;
    } else {
        title.textContent = 'Create New Project';
        input.value = '';
    }

    modal.style.display = 'flex';
    input.focus();
}

function hideProjectModal() {
    document.getElementById('projectModal').style.display = 'none';
}

async function handleSaveProject() {
    const input = document.getElementById('projectNameInput');
    const name = input.value.trim();

    if (!name) {
        alert('Please enter a project name');
        return;
    }

    const title = document.getElementById('projectModalTitle').textContent;

    try {
        if (title === 'Rename Project' && state.currentProjectId) {
            // Rename existing project
            await updateProject(state.currentProjectId, { name });
            const project = state.projects.find(p => p.id === state.currentProjectId);
            project.name = name;
        } else {
            // Create new project
            const newProject = {
                id: Date.now().toString(),
                name: name,
                createdAt: new Date().toISOString()
            };

            await saveProject({
                id: newProject.id,
                name: newProject.name,
                createdAt: newProject.createdAt
            });

            newProject.prompts = [];
            state.projects.push(newProject);
            state.currentProjectId = newProject.id;
        }

        renderProjects();
        showEmptyStateOrProject();
        hideProjectModal();
    } catch (error) {
        alert('Failed to save project. Please try again.');
    }
}

function renameCurrentProject() {
    showProjectModal(true);
}

async function handleDeleteProject() {
    if (!state.currentProjectId) return;

    const project = state.projects.find(p => p.id === state.currentProjectId);
    if (!confirm(`Delete project "${project.name}" and all its prompts?`)) return;

    try {
        await deleteProject(state.currentProjectId);
        state.projects = state.projects.filter(p => p.id !== state.currentProjectId);
        state.currentProjectId = null;
        state.currentPromptId = null;

        renderProjects();
        showEmptyStateOrProject();
    } catch (error) {
        alert('Failed to delete project. Please try again.');
    }
}

function selectProject(projectId) {
    state.currentProjectId = projectId;
    state.currentPromptId = null;
    showEmptyStateOrProject();
}

// Prompt Management
async function createNewPrompt() {
    if (!state.currentProjectId) return;

    const project = state.projects.find(p => p.id === state.currentProjectId);
    const newPrompt = {
        id: Date.now().toString(),
        title: 'Untitled Prompt',
        content: '',
        images: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    try {
        await savePrompt({
            id: newPrompt.id,
            projectId: state.currentProjectId,
            title: newPrompt.title,
            content: newPrompt.content,
            createdAt: newPrompt.createdAt,
            updatedAt: newPrompt.updatedAt
        });

        project.prompts.push(newPrompt);
        state.currentPromptId = newPrompt.id;

        showPromptEditor();
    } catch (error) {
        alert('Failed to create prompt. Please try again.');
    }
}

function selectPrompt(promptId) {
    state.currentPromptId = promptId;
    showPromptEditor();
}

async function handleDeletePrompt() {
    if (!state.currentProjectId || !state.currentPromptId) return;

    const project = state.projects.find(p => p.id === state.currentProjectId);
    const prompt = project.prompts.find(p => p.id === state.currentPromptId);

    if (!confirm(`Delete prompt "${prompt.title}"?`)) return;

    try {
        await deletePrompt(state.currentPromptId);
        project.prompts = project.prompts.filter(p => p.id !== state.currentPromptId);
        state.currentPromptId = null;

        backToProject();
    } catch (error) {
        alert('Failed to delete prompt. Please try again.');
    }
}

async function handleUpdatePromptTitle() {
    if (!state.currentProjectId || !state.currentPromptId) return;

    const project = state.projects.find(p => p.id === state.currentProjectId);
    const prompt = project.prompts.find(p => p.id === state.currentPromptId);
    const newTitle = document.getElementById('promptTitle').value;
    const updatedAt = new Date().toISOString();

    prompt.title = newTitle;
    prompt.updatedAt = updatedAt;

    try {
        await updatePrompt(state.currentPromptId, {
            title: newTitle,
            content: prompt.content,
            updatedAt: updatedAt
        });
    } catch (error) {
        console.error('Failed to update prompt title:', error);
    }
}

async function handleSavePromptContent() {
    if (!state.currentProjectId || !state.currentPromptId) return;

    const project = state.projects.find(p => p.id === state.currentProjectId);
    const prompt = project.prompts.find(p => p.id === state.currentPromptId);
    const newContent = document.getElementById('richTextEditor').innerHTML;
    const updatedAt = new Date().toISOString();

    prompt.content = newContent;
    prompt.updatedAt = updatedAt;

    try {
        await updatePrompt(state.currentPromptId, {
            title: prompt.title,
            content: newContent,
            updatedAt: updatedAt
        });
    } catch (error) {
        console.error('Failed to save prompt content:', error);
    }
}

function backToProject() {
    state.currentPromptId = null;
    showEmptyStateOrProject();
}

// Rich Text Editor
function handleToolbarClick(e) {
    e.preventDefault();
    const command = e.target.dataset.command;
    const value = e.target.dataset.value;

    if (command === 'formatBlock') {
        document.execCommand(command, false, value);
    } else {
        document.execCommand(command, false, null);
    }

    document.getElementById('richTextEditor').focus();
}

// Image Management
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file || !state.currentProjectId || !state.currentPromptId) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        const project = state.projects.find(p => p.id === state.currentProjectId);
        const prompt = project.prompts.find(p => p.id === state.currentPromptId);

        const imageData = {
            id: Date.now().toString(),
            data: event.target.result,
            name: file.name
        };

        try {
            await saveImage({
                id: imageData.id,
                promptId: state.currentPromptId,
                name: imageData.name,
                data: imageData.data
            });

            prompt.images.push(imageData);
            prompt.updatedAt = new Date().toISOString();

            renderPromptImages();
        } catch (error) {
            alert('Failed to upload image. Please try again.');
        }
    };

    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
}

async function handleDeleteImage(imageId) {
    if (!state.currentProjectId || !state.currentPromptId) return;

    const project = state.projects.find(p => p.id === state.currentProjectId);
    const prompt = project.prompts.find(p => p.id === state.currentPromptId);

    try {
        await deleteImage(imageId);
        prompt.images = prompt.images.filter(img => img.id !== imageId);
        prompt.updatedAt = new Date().toISOString();

        renderPromptImages();
    } catch (error) {
        alert('Failed to delete image. Please try again.');
    }
}

function renderPromptImages() {
    const container = document.getElementById('editorImages');
    const project = state.projects.find(p => p.id === state.currentProjectId);
    const prompt = project.prompts.find(p => p.id === state.currentPromptId);

    if (prompt.images.length === 0) {
        container.innerHTML = '';
        container.style.display = 'none';
        return;
    }

    container.style.display = 'flex';
    container.innerHTML = prompt.images.map(img => `
        <div class="image-attachment">
            <img src="${img.data}" alt="${img.name}">
            <button class="image-delete-btn" onclick="handleDeleteImage('${img.id}')">×</button>
            <div class="image-name">${img.name}</div>
        </div>
    `).join('');
}

// Export to Clipboard
function exportPromptToClipboard() {
    if (!state.currentProjectId || !state.currentPromptId) return;

    const project = state.projects.find(p => p.id === state.currentProjectId);
    const prompt = project.prompts.find(p => p.id === state.currentPromptId);

    // Convert HTML to plain text optimized for Claude Code
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = prompt.content;

    // Convert HTML to plain text with proper formatting
    let text = convertHtmlToPlainText(tempDiv);

    navigator.clipboard.writeText(text).then(() => {
        // Visual feedback
        const btn = document.getElementById('exportPromptBtn');
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.style.backgroundColor = '#28a745';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
        }, 2000);
    }).catch(err => {
        alert('Failed to copy to clipboard: ' + err);
    });
}

function convertHtmlToPlainText(element) {
    let text = '';

    for (let node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();

            if (tagName === 'br') {
                text += '\n';
            } else if (tagName === 'p') {
                text += convertHtmlToPlainText(node) + '\n\n';
            } else if (tagName === 'h1') {
                text += '# ' + convertHtmlToPlainText(node) + '\n\n';
            } else if (tagName === 'h2') {
                text += '## ' + convertHtmlToPlainText(node) + '\n\n';
            } else if (tagName === 'h3') {
                text += '### ' + convertHtmlToPlainText(node) + '\n\n';
            } else if (tagName === 'ul') {
                const items = Array.from(node.children).map(li =>
                    '- ' + convertHtmlToPlainText(li)
                ).join('\n');
                text += items + '\n\n';
            } else if (tagName === 'ol') {
                const items = Array.from(node.children).map((li, i) =>
                    `${i + 1}. ` + convertHtmlToPlainText(li)
                ).join('\n');
                text += items + '\n\n';
            } else if (tagName === 'li') {
                text += convertHtmlToPlainText(node);
            } else if (tagName === 'strong' || tagName === 'b') {
                text += '**' + convertHtmlToPlainText(node) + '**';
            } else if (tagName === 'em' || tagName === 'i') {
                text += '*' + convertHtmlToPlainText(node) + '*';
            } else if (tagName === 'u') {
                text += convertHtmlToPlainText(node);
            } else if (tagName === 'div') {
                text += convertHtmlToPlainText(node) + '\n';
            } else {
                text += convertHtmlToPlainText(node);
            }
        }
    }

    return text;
}

// Rendering Functions
function renderProjects() {
    const container = document.getElementById('projectsList');

    if (state.projects.length === 0) {
        container.innerHTML = '<div class="empty-projects">No projects yet</div>';
        return;
    }

    container.innerHTML = state.projects.map(project => `
        <div class="project-item ${project.id === state.currentProjectId ? 'active' : ''}"
             onclick="selectProject('${project.id}')">
            <div class="project-name">${escapeHtml(project.name)}</div>
            <div class="project-count">${project.prompts.length} prompt${project.prompts.length !== 1 ? 's' : ''}</div>
        </div>
    `).join('');
}

function renderPrompts() {
    const container = document.getElementById('promptsGrid');
    const project = state.projects.find(p => p.id === state.currentProjectId);

    if (!project || project.prompts.length === 0) {
        container.innerHTML = '<div class="empty-prompts">No prompts yet. Click "New Prompt" to create one.</div>';
        return;
    }

    container.innerHTML = project.prompts.map(prompt => {
        const preview = getTextPreview(prompt.content);
        const date = new Date(prompt.updatedAt).toLocaleDateString();

        return `
            <div class="prompt-card" onclick="selectPrompt('${prompt.id}')">
                <h3>${escapeHtml(prompt.title)}</h3>
                <p class="prompt-preview">${preview}</p>
                <div class="prompt-meta">
                    <span>${date}</span>
                    ${prompt.images.length > 0 ? `<span>📎 ${prompt.images.length} image${prompt.images.length !== 1 ? 's' : ''}</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function getTextPreview(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.substring(0, 150) + (text.length > 150 ? '...' : '');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// View Management
function showEmptyStateOrProject() {
    const emptyState = document.getElementById('emptyState');
    const projectView = document.getElementById('projectView');
    const promptEditor = document.getElementById('promptEditor');

    if (!state.currentProjectId) {
        emptyState.style.display = 'flex';
        projectView.style.display = 'none';
        promptEditor.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        projectView.style.display = 'block';
        promptEditor.style.display = 'none';

        const project = state.projects.find(p => p.id === state.currentProjectId);
        document.getElementById('currentProjectName').textContent = project.name;
        renderPrompts();
    }

    renderProjects();
}

function showPromptEditor() {
    const emptyState = document.getElementById('emptyState');
    const projectView = document.getElementById('projectView');
    const promptEditor = document.getElementById('promptEditor');

    emptyState.style.display = 'none';
    projectView.style.display = 'none';
    promptEditor.style.display = 'block';

    const project = state.projects.find(p => p.id === state.currentProjectId);
    const prompt = project.prompts.find(p => p.id === state.currentPromptId);

    document.getElementById('promptTitle').value = prompt.title;
    document.getElementById('richTextEditor').innerHTML = prompt.content;
    renderPromptImages();
}
