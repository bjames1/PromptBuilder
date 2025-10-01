// State management
let state = {
    projects: [],
    currentProjectId: null,
    currentPromptId: null,
    currentCategoryFilter: null
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
        state.projects = data.projects.map(project => ({
            ...project,
            categories: project.categories || [],
            prompts: project.prompts.map(prompt => ({
                ...prompt,
                followUpPrompts: prompt.followUpPrompts || []
            }))
        }));
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

async function updateImage(imageId, data) {
    try {
        const response = await fetch(`${API_BASE}/images/${imageId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating image:', error);
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

async function saveCategory(categoryData) {
    try {
        const response = await fetch(`${API_BASE}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error saving category:', error);
        throw error;
    }
}

async function updateCategory(categoryId, data) {
    try {
        const response = await fetch(`${API_BASE}/categories/${categoryId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
}

async function deleteCategory(categoryId) {
    try {
        const response = await fetch(`${API_BASE}/categories/${categoryId}`, {
            method: 'DELETE'
        });
        return await response.json();
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
}

async function saveFollowUp(followUpData) {
    try {
        const response = await fetch(`${API_BASE}/follow-ups`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(followUpData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error saving follow-up:', error);
        throw error;
    }
}

async function updateFollowUp(followUpId, data) {
    try {
        const response = await fetch(`${API_BASE}/follow-ups/${followUpId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating follow-up:', error);
        throw error;
    }
}

async function deleteFollowUp(followUpId) {
    try {
        const response = await fetch(`${API_BASE}/follow-ups/${followUpId}`, {
            method: 'DELETE'
        });
        return await response.json();
    } catch (error) {
        console.error('Error deleting follow-up:', error);
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
    document.getElementById('savePromptBtn').addEventListener('click', handleManualSave);
    document.getElementById('promptTitle').addEventListener('input', handleUpdatePromptTitle);
    document.getElementById('promptCategorySelect').addEventListener('change', handleCategoryChange);

    // Category management
    document.getElementById('manageCategoriesBtn').addEventListener('click', showCategoriesModal);
    document.getElementById('closeCategoriesBtn').addEventListener('click', hideCategoriesModal);
    document.getElementById('addCategoryBtn').addEventListener('click', handleAddCategory);

    // Rich text editor
    document.querySelectorAll('.toolbar-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleToolbarClick(e));
    });

    document.getElementById('richTextEditor').addEventListener('input', handleSavePromptContent);

    // Model response
    document.getElementById('modelResponse').addEventListener('input', handleSaveModelResponse);
    document.getElementById('modelResponse').addEventListener('input', toggleCopyResponseButton);
    document.getElementById('copyResponseBtn').addEventListener('click', copyModelResponse);

    // Include images checkbox
    document.getElementById('includeImagesCheckbox').addEventListener('change', handleIncludeImagesChange);

    // Follow-up prompts
    document.getElementById('addFollowUpBtn').addEventListener('click', handleAddFollowUp);

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
        categoryId: null,
        title: 'Untitled Prompt',
        content: '',
        images: [],
        modelResponse: '',
        includeImagesInExport: true,
        followUpPrompts: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    try {
        await savePrompt({
            id: newPrompt.id,
            projectId: state.currentProjectId,
            categoryId: newPrompt.categoryId,
            title: newPrompt.title,
            content: newPrompt.content,
            createdAt: newPrompt.createdAt,
            updatedAt: newPrompt.updatedAt,
            modelResponse: newPrompt.modelResponse,
            includeImagesInExport: newPrompt.includeImagesInExport
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
            categoryId: prompt.categoryId,
            title: newTitle,
            content: prompt.content,
            updatedAt: updatedAt,
            modelResponse: prompt.modelResponse,
            includeImagesInExport: prompt.includeImagesInExport
        });
    } catch (error) {
        console.error('Failed to update prompt title:', error);
    }
}

async function handleSaveModelResponse() {
    if (!state.currentProjectId || !state.currentPromptId) return;

    const project = state.projects.find(p => p.id === state.currentProjectId);
    const prompt = project.prompts.find(p => p.id === state.currentPromptId);
    const newResponse = document.getElementById('modelResponse').value;
    const updatedAt = new Date().toISOString();

    prompt.modelResponse = newResponse;
    prompt.updatedAt = updatedAt;

    try {
        await updatePrompt(state.currentPromptId, {
            categoryId: prompt.categoryId,
            title: prompt.title,
            content: prompt.content,
            updatedAt: updatedAt,
            modelResponse: newResponse,
            includeImagesInExport: prompt.includeImagesInExport
        });
    } catch (error) {
        console.error('Failed to save model response:', error);
    }
}

function copyModelResponse() {
    const responseText = document.getElementById('modelResponse').value;

    if (!responseText) {
        return;
    }

    navigator.clipboard.writeText(responseText).then(() => {
        const btn = document.getElementById('copyResponseBtn');
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

function toggleCopyResponseButton() {
    const responseText = document.getElementById('modelResponse').value;
    const btn = document.getElementById('copyResponseBtn');

    if (responseText && responseText.trim().length > 0) {
        btn.style.display = 'block';
    } else {
        btn.style.display = 'none';
    }
}

async function handleIncludeImagesChange() {
    if (!state.currentProjectId || !state.currentPromptId) return;

    const project = state.projects.find(p => p.id === state.currentProjectId);
    const prompt = project.prompts.find(p => p.id === state.currentPromptId);
    const includeImages = document.getElementById('includeImagesCheckbox').checked;
    const updatedAt = new Date().toISOString();

    prompt.includeImagesInExport = includeImages;
    prompt.updatedAt = updatedAt;

    try {
        await updatePrompt(state.currentPromptId, {
            categoryId: prompt.categoryId,
            title: prompt.title,
            content: prompt.content,
            updatedAt: updatedAt,
            modelResponse: prompt.modelResponse,
            includeImagesInExport: includeImages
        });
    } catch (error) {
        console.error('Failed to update include images setting:', error);
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
            categoryId: prompt.categoryId,
            title: prompt.title,
            content: newContent,
            updatedAt: updatedAt,
            modelResponse: prompt.modelResponse,
            includeImagesInExport: prompt.includeImagesInExport
        });
    } catch (error) {
        console.error('Failed to save prompt content:', error);
    }
}

function backToProject() {
    state.currentPromptId = null;
    showEmptyStateOrProject();
}

async function handleManualSave() {
    if (!state.currentProjectId || !state.currentPromptId) return;

    const project = state.projects.find(p => p.id === state.currentProjectId);
    const prompt = project.prompts.find(p => p.id === state.currentPromptId);

    const title = document.getElementById('promptTitle').value;
    const content = document.getElementById('richTextEditor').innerHTML;
    const modelResponse = document.getElementById('modelResponse').value;
    const categoryId = document.getElementById('promptCategorySelect').value || null;
    const includeImagesInExport = document.getElementById('includeImagesCheckbox').checked;
    const updatedAt = new Date().toISOString();

    // Update local state
    prompt.title = title;
    prompt.content = content;
    prompt.modelResponse = modelResponse;
    prompt.categoryId = categoryId;
    prompt.includeImagesInExport = includeImagesInExport;
    prompt.updatedAt = updatedAt;

    const saveBtn = document.getElementById('savePromptBtn');
    const originalText = saveBtn.textContent;

    try {
        await updatePrompt(state.currentPromptId, {
            categoryId: categoryId,
            title: title,
            content: content,
            updatedAt: updatedAt,
            modelResponse: modelResponse,
            includeImagesInExport: includeImagesInExport
        });

        // Visual feedback
        saveBtn.textContent = '✓ Saved!';
        saveBtn.style.backgroundColor = '#28a745';
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.backgroundColor = '';
        }, 2000);
    } catch (error) {
        console.error('Failed to save prompt:', error);
        alert('Failed to save prompt. Please try again.');
    }
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
    const files = Array.from(e.target.files);
    if (files.length === 0 || !state.currentProjectId || !state.currentPromptId) return;

    const project = state.projects.find(p => p.id === state.currentProjectId);
    const prompt = project.prompts.find(p => p.id === state.currentPromptId);

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const imageData = {
                id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
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
    });

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
            <img src="${img.data}" alt="${escapeHtml(img.name)}">
            <button class="image-delete-btn" onclick="handleDeleteImage('${img.id}')">×</button>
            <button class="image-download-btn" onclick="handleDownloadImage('${img.id}')" title="Download">⬇</button>
            <div class="image-name" ondblclick="handleRenameImage('${img.id}')" title="Double-click to rename">${escapeHtml(img.name)}</div>
        </div>
    `).join('');
}

function handleDownloadImage(imageId) {
    if (!state.currentProjectId || !state.currentPromptId) return;

    const project = state.projects.find(p => p.id === state.currentProjectId);
    const prompt = project.prompts.find(p => p.id === state.currentPromptId);
    const image = prompt.images.find(img => img.id === imageId);

    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = image.data;
    link.download = image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function handleRenameImage(imageId) {
    if (!state.currentProjectId || !state.currentPromptId) return;

    const project = state.projects.find(p => p.id === state.currentProjectId);
    const prompt = project.prompts.find(p => p.id === state.currentPromptId);
    const image = prompt.images.find(img => img.id === imageId);

    const newName = window.prompt('Enter new image name:', image.name);
    if (!newName || newName === image.name) return;

    try {
        await updateImage(imageId, { name: newName });
        image.name = newName;
        renderPromptImages();
    } catch (error) {
        alert('Failed to rename image. Please try again.');
    }
}

// Export to Clipboard
async function exportPromptToClipboard() {
    if (!state.currentProjectId || !state.currentPromptId) return;

    const project = state.projects.find(p => p.id === state.currentProjectId);
    const prompt = project.prompts.find(p => p.id === state.currentPromptId);

    // Convert HTML to plain text optimized for Claude Code
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = prompt.content;

    // Convert HTML to plain text with proper formatting
    let text = convertHtmlToPlainText(tempDiv);

    // Check if we should include images
    const includeImages = document.getElementById('includeImagesCheckbox').checked;

    const btn = document.getElementById('exportPromptBtn');
    const originalText = btn.textContent;

    try {
        // If we have images and should include them, use rich clipboard format
        if (includeImages && prompt.images && prompt.images.length > 0) {
            // Convert base64 images to blobs
            const imageBlobs = await Promise.all(
                prompt.images.map(async (img) => {
                    const response = await fetch(img.data);
                    const blob = await response.blob();
                    return blob;
                })
            );

            // Create HTML content with images embedded
            let htmlContent = prompt.content;

            // Add images at the end
            htmlContent += '<div style="margin-top: 20px;">';
            prompt.images.forEach((img, index) => {
                htmlContent += `<div style="margin: 10px 0;"><img src="${img.data}" alt="${img.name}" style="max-width: 100%;"/></div>`;
            });
            htmlContent += '</div>';

            // Create clipboard items with both HTML and plain text
            const clipboardItem = new ClipboardItem({
                'text/html': new Blob([htmlContent], { type: 'text/html' }),
                'text/plain': new Blob([text], { type: 'text/plain' })
            });

            await navigator.clipboard.write([clipboardItem]);
        } else {
            // Just copy text if no images
            await navigator.clipboard.writeText(text);
        }

        // Visual feedback
        btn.textContent = '✓ Copied!';
        btn.style.backgroundColor = '#28a745';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
        }, 2000);
    } catch (err) {
        console.error('Clipboard error:', err);
        alert('Failed to copy to clipboard: ' + err.message);
    }
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

    // Filter prompts based on current category filter
    let filteredPrompts = project.prompts;
    if (state.currentCategoryFilter) {
        if (state.currentCategoryFilter === 'uncategorized') {
            filteredPrompts = project.prompts.filter(p => !p.categoryId);
        } else {
            filteredPrompts = project.prompts.filter(p => p.categoryId === state.currentCategoryFilter);
        }
    }

    if (filteredPrompts.length === 0) {
        container.innerHTML = '<div class="empty-prompts">No prompts in this category.</div>';
        return;
    }

    // Group prompts by category when no filter is active
    if (!state.currentCategoryFilter) {
        const grouped = {
            uncategorized: filteredPrompts.filter(p => !p.categoryId),
            categories: {}
        };

        project.categories.forEach(cat => {
            grouped.categories[cat.id] = {
                category: cat,
                prompts: filteredPrompts.filter(p => p.categoryId === cat.id)
            };
        });

        let html = '';

        // Render uncategorized prompts first
        if (grouped.uncategorized.length > 0) {
            html += `
                <div class="category-group">
                    <div class="category-group-header">
                        <h3 class="category-group-title">Uncategorized</h3>
                        <span class="category-group-count">${grouped.uncategorized.length} prompt${grouped.uncategorized.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="prompts-grid">
                        ${renderPromptCards(grouped.uncategorized)}
                    </div>
                </div>
            `;
        }

        // Render categorized prompts
        project.categories.forEach(cat => {
            const categoryPrompts = grouped.categories[cat.id].prompts;
            if (categoryPrompts.length > 0) {
                html += `
                    <div class="category-group">
                        <div class="category-group-header">
                            <div class="category-color-box" style="background-color: ${cat.color}; width: 8px; height: 24px; border-radius: 2px;"></div>
                            <h3 class="category-group-title">${escapeHtml(cat.name)}</h3>
                            <span class="category-group-count">${categoryPrompts.length} prompt${categoryPrompts.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div class="prompts-grid">
                            ${renderPromptCards(categoryPrompts, cat)}
                        </div>
                    </div>
                `;
            }
        });

        container.innerHTML = html;
    } else {
        // When filtering, show flat list
        container.innerHTML = `<div class="prompts-grid">${renderPromptCards(filteredPrompts)}</div>`;
    }
}

function renderPromptCards(prompts, category = null) {
    return prompts.map(prompt => {
        const preview = getTextPreview(prompt.content);
        const createdDate = new Date(prompt.createdAt);
        const dateStr = createdDate.toLocaleDateString();
        const timeStr = createdDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

        let categoryTag = '';
        if (category) {
            categoryTag = `<span class="prompt-category-tag" style="background-color: ${category.color}">${escapeHtml(category.name)}</span>`;
        } else if (prompt.categoryId) {
            const project = state.projects.find(p => p.id === state.currentProjectId);
            const promptCategory = project.categories.find(c => c.id === prompt.categoryId);
            if (promptCategory) {
                categoryTag = `<span class="prompt-category-tag" style="background-color: ${promptCategory.color}">${escapeHtml(promptCategory.name)}</span>`;
            }
        }

        return `
            <div class="prompt-card" onclick="selectPrompt('${prompt.id}')">
                <h3>${escapeHtml(prompt.title)}${categoryTag}</h3>
                <p class="prompt-preview">${preview}</p>
                <div class="prompt-meta">
                    <span>${dateStr} at ${timeStr}</span>
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
        renderCategoriesBar();
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
    document.getElementById('modelResponse').value = prompt.modelResponse || '';
    document.getElementById('includeImagesCheckbox').checked = prompt.includeImagesInExport !== false;

    // Populate category select
    const categorySelect = document.getElementById('promptCategorySelect');
    categorySelect.innerHTML = '<option value="">No Category</option>';
    project.categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        if (prompt.categoryId === cat.id) {
            option.selected = true;
        }
        categorySelect.appendChild(option);
    });

    // Show/hide copy button based on model response content
    toggleCopyResponseButton();

    renderPromptImages();
    renderFollowUps();
}

// Category Management Functions

function showCategoriesModal() {
    document.getElementById('categoriesModal').style.display = 'flex';
    renderCategoriesList();
}

function hideCategoriesModal() {
    document.getElementById('categoriesModal').style.display = 'none';
    document.getElementById('newCategoryName').value = '';
    document.getElementById('newCategoryColor').value = '#3498db';
}

function renderCategoriesList() {
    if (!state.currentProjectId) return;

    const project = state.projects.find(p => p.id === state.currentProjectId);
    const container = document.getElementById('categoriesList');

    if (project.categories.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #95a5a6; padding: 20px;">No categories yet. Create one below!</p>';
        return;
    }

    container.innerHTML = project.categories.map(cat => `
        <div class="category-item">
            <div class="category-color-box" style="background-color: ${cat.color}"></div>
            <div class="category-item-name">${escapeHtml(cat.name)}</div>
            <div class="category-item-actions">
                <button class="btn btn-icon btn-danger" onclick="handleDeleteCategory('${cat.id}')" title="Delete">🗑️</button>
            </div>
        </div>
    `).join('');
}

async function handleAddCategory() {
    if (!state.currentProjectId) return;

    const nameInput = document.getElementById('newCategoryName');
    const colorInput = document.getElementById('newCategoryColor');
    const name = nameInput.value.trim();
    const color = colorInput.value;

    if (!name) {
        alert('Please enter a category name');
        return;
    }

    const project = state.projects.find(p => p.id === state.currentProjectId);
    const newCategory = {
        id: Date.now().toString(),
        name: name,
        color: color,
        createdAt: new Date().toISOString()
    };

    try {
        await saveCategory({
            id: newCategory.id,
            projectId: state.currentProjectId,
            name: newCategory.name,
            color: newCategory.color,
            createdAt: newCategory.createdAt
        });

        project.categories.push(newCategory);
        nameInput.value = '';
        colorInput.value = '#3498db';
        renderCategoriesList();
        renderCategoriesBar();
    } catch (error) {
        alert('Failed to create category. Please try again.');
    }
}

async function handleDeleteCategory(categoryId) {
    if (!state.currentProjectId) return;

    const project = state.projects.find(p => p.id === state.currentProjectId);
    const category = project.categories.find(c => c.id === categoryId);

    if (!confirm(`Delete category "${category.name}"? Prompts in this category will be uncategorized.`)) return;

    try {
        await deleteCategory(categoryId);
        project.categories = project.categories.filter(c => c.id !== categoryId);

        // Update prompts that had this category
        project.prompts.forEach(prompt => {
            if (prompt.categoryId === categoryId) {
                prompt.categoryId = null;
            }
        });

        if (state.currentCategoryFilter === categoryId) {
            state.currentCategoryFilter = null;
        }

        renderCategoriesList();
        renderCategoriesBar();
        renderPrompts();
    } catch (error) {
        alert('Failed to delete category. Please try again.');
    }
}

async function handleCategoryChange() {
    if (!state.currentProjectId || !state.currentPromptId) return;

    const project = state.projects.find(p => p.id === state.currentProjectId);
    const prompt = project.prompts.find(p => p.id === state.currentPromptId);
    const categoryId = document.getElementById('promptCategorySelect').value || null;
    const updatedAt = new Date().toISOString();

    prompt.categoryId = categoryId;
    prompt.updatedAt = updatedAt;

    try {
        await updatePrompt(state.currentPromptId, {
            categoryId: categoryId,
            title: prompt.title,
            content: prompt.content,
            updatedAt: updatedAt,
            modelResponse: prompt.modelResponse,
            includeImagesInExport: prompt.includeImagesInExport
        });
    } catch (error) {
        console.error('Failed to update prompt category:', error);
    }
}

function renderCategoriesBar() {
    if (!state.currentProjectId) return;

    const project = state.projects.find(p => p.id === state.currentProjectId);
    const container = document.getElementById('categoriesBar');

    if (project.categories.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'flex';
    container.innerHTML = `
        <button class="category-filter-btn ${state.currentCategoryFilter === null ? 'active' : ''}"
                onclick="filterByCategory(null)"
                style="border-color: #95a5a6;">
            All
        </button>
        <button class="category-filter-btn ${state.currentCategoryFilter === 'uncategorized' ? 'active' : ''}"
                onclick="filterByCategory('uncategorized')"
                style="border-color: #bdc3c7;">
            Uncategorized
        </button>
        ${project.categories.map(cat => `
            <button class="category-filter-btn ${state.currentCategoryFilter === cat.id ? 'active' : ''}"
                    onclick="filterByCategory('${cat.id}')"
                    style="border-color: ${cat.color}; ${state.currentCategoryFilter === cat.id ? `background-color: ${cat.color}; color: white;` : ''}">
                ${escapeHtml(cat.name)}
            </button>
        `).join('')}
    `;
}

function filterByCategory(categoryId) {
    state.currentCategoryFilter = categoryId;
    renderCategoriesBar();
    renderPrompts();
}

// Follow-up Prompts Functions

async function handleAddFollowUp() {
    if (!state.currentProjectId || !state.currentPromptId) return;

    const project = state.projects.find(p => p.id === state.currentProjectId);
    const prompt = project.prompts.find(p => p.id === state.currentPromptId);

    const newFollowUp = {
        id: Date.now().toString(),
        content: '',
        modelResponse: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    try {
        await saveFollowUp({
            id: newFollowUp.id,
            parentPromptId: state.currentPromptId,
            content: newFollowUp.content,
            modelResponse: newFollowUp.modelResponse,
            createdAt: newFollowUp.createdAt,
            updatedAt: newFollowUp.updatedAt
        });

        prompt.followUpPrompts.push(newFollowUp);
        renderFollowUps();
    } catch (error) {
        alert('Failed to create follow-up prompt. Please try again.');
    }
}

async function handleUpdateFollowUp(followUpId) {
    if (!state.currentProjectId || !state.currentPromptId) return;

    const project = state.projects.find(p => p.id === state.currentProjectId);
    const prompt = project.prompts.find(p => p.id === state.currentPromptId);
    const followUp = prompt.followUpPrompts.find(f => f.id === followUpId);

    const contentTextarea = document.getElementById(`followup-content-${followUpId}`);
    const responseTextarea = document.getElementById(`followup-response-${followUpId}`);

    const content = contentTextarea.value;
    const modelResponse = responseTextarea.value;
    const updatedAt = new Date().toISOString();

    followUp.content = content;
    followUp.modelResponse = modelResponse;
    followUp.updatedAt = updatedAt;

    try {
        await updateFollowUp(followUpId, {
            content: content,
            modelResponse: modelResponse,
            updatedAt: updatedAt
        });
    } catch (error) {
        console.error('Failed to update follow-up:', error);
    }
}

async function handleDeleteFollowUp(followUpId) {
    if (!state.currentProjectId || !state.currentPromptId) return;

    const project = state.projects.find(p => p.id === state.currentProjectId);
    const prompt = project.prompts.find(p => p.id === state.currentPromptId);

    if (!confirm('Delete this follow-up prompt?')) return;

    try {
        await deleteFollowUp(followUpId);
        prompt.followUpPrompts = prompt.followUpPrompts.filter(f => f.id !== followUpId);
        renderFollowUps();
    } catch (error) {
        alert('Failed to delete follow-up. Please try again.');
    }
}

function renderFollowUps() {
    if (!state.currentProjectId || !state.currentPromptId) return;

    const project = state.projects.find(p => p.id === state.currentProjectId);
    const prompt = project.prompts.find(p => p.id === state.currentPromptId);
    const container = document.getElementById('followUpsList');

    if (prompt.followUpPrompts.length === 0) {
        container.innerHTML = '<div class="empty-follow-ups">No follow-up prompts yet. Click "Add Follow-up" to create one.</div>';
        return;
    }

    container.innerHTML = prompt.followUpPrompts.map((followUp, index) => `
        <div class="follow-up-item">
            <div class="follow-up-header">
                <span class="follow-up-number">Follow-up #${index + 1}</span>
                <div class="follow-up-actions">
                    <button class="btn btn-icon btn-danger" onclick="handleDeleteFollowUp('${followUp.id}')" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="follow-up-content">
                <textarea
                    id="followup-content-${followUp.id}"
                    class="follow-up-textarea"
                    placeholder="Enter follow-up prompt..."
                    oninput="handleUpdateFollowUp('${followUp.id}')"
                >${escapeHtml(followUp.content)}</textarea>
            </div>
            <div class="follow-up-response">
                <label class="follow-up-response-label">Model Response:</label>
                <textarea
                    id="followup-response-${followUp.id}"
                    class="follow-up-textarea"
                    placeholder="Paste the model's response here..."
                    oninput="handleUpdateFollowUp('${followUp.id}')"
                >${escapeHtml(followUp.modelResponse)}</textarea>
            </div>
        </div>
    `).join('');
}
