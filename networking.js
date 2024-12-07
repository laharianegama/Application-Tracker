// Database configuration
const dbName = 'networkingDB';
const dbVersion = 1;

// Initialize the database
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create contacts store
            if (!db.objectStoreNames.contains('contacts')) {
                const contactsStore = db.createObjectStore('contacts', { keyPath: 'id', autoIncrement: true });
                contactsStore.createIndex('name', 'name');
                contactsStore.createIndex('company', 'company');
            }

            // Create templates store
            if (!db.objectStoreNames.contains('templates')) {
                const templatesStore = db.createObjectStore('templates', { keyPath: 'id', autoIncrement: true });
                templatesStore.createIndex('name', 'name');
                templatesStore.createIndex('type', 'type');
            }
        };
    });
}

// Database operations
const dbOperations = {
    // Contacts operations
    async addContact(contact) {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['contacts'], 'readwrite');
            const store = transaction.objectStore('contacts');
            const request = store.add({
                ...contact,
                dateAdded: new Date().toISOString()
            });
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async updateTemplate(id, updatedTemplate) {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['templates'], 'readwrite');
            const store = transaction.objectStore('templates');
            
            // First, get the existing template
            const getRequest = store.get(id);
            
            getRequest.onsuccess = () => {
                if (!getRequest.result) {
                    reject(new Error('Template not found'));
                    return;
                }
                
                // Update the template while preserving its ID
                const request = store.put({
                    ...getRequest.result,  // Keep existing properties
                    ...updatedTemplate,    // Override with updates
                    id: id                 // Ensure ID remains the same
                });
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            };
            
            getRequest.onerror = () => reject(getRequest.error);
        });
    },
    async getAllContacts() {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['contacts'], 'readonly');
            const store = transaction.objectStore('contacts');
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async deleteContact(id) {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['contacts'], 'readwrite');
            const store = transaction.objectStore('contacts');
            const request = store.delete(id);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    // Templates operations
    async addTemplate(template) {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['templates'], 'readwrite');
            const store = transaction.objectStore('templates');
            const request = store.add({
                ...template,
                dateAdded: new Date().toISOString()
            });
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async getAllTemplates() {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['templates'], 'readonly');
            const store = transaction.objectStore('templates');
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async deleteTemplate(id) {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['templates'], 'readwrite');
            const store = transaction.objectStore('templates');
            const request = store.delete(id);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
};

// UI Helper Functions
function createContactCard(contact) {
    const card = document.createElement('div');
    card.className = 'contact-card';
    card.innerHTML = `
        <div class="card-content">
            <div class="card-left">
                <div class="card-title">${contact.name}</div>
                <div class="card-details">
                    ${contact.company ? `<span class="card-company">${contact.company}</span>` : ''}
                    ${contact.role ? `<span class="card-role">${contact.role}</span>` : ''}
                </div>
                ${contact.notes ? `<div class="card-notes">${contact.notes}</div>` : ''}
            </div>
            <div class="card-actions">
                ${contact.email ? 
                    `<button class="card-action-btn email-btn" title="Copy Email">
                        <span class="icon">📧</span>
                    </button>` : ''
                }
                ${contact.linkedIn ? 
                    `<button class="card-action-btn linkedin-btn" title="Copy LinkedIn Connection Request">
                        <span class="icon">👥</span>
                    </button>` : ''
                }
                <button class="card-action-btn delete-btn" title="Delete Contact">
                    <span class="icon">🗑️</span>
                </button>
            </div>
        </div>
    `;

    // Add event listeners
    if (contact.email) {
        card.querySelector('.email-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(contact.email);
            showToast('Email copied to clipboard!');
        });
    }

    if (contact.linkedIn) {
        card.querySelector('.linkedin-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(contact.linkedIn);
            showToast('LinkedIn URL copied to clipboard!');
        });
    }

    card.querySelector('.delete-btn').addEventListener('click', () => {
        showDeleteConfirmation(contact, 'contact');
    });

    return card;
}

function createTemplateCard(template) {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.innerHTML = `
        <div class="card-header">
            <div class="card-title">${template.name}</div>
            <div class="card-actions">
                <button class="card-action-btn edit-template" title="Edit Template">✏️</button>
                <button class="card-action-btn copy-template" title="Copy Template">📋</button>
                <button class="card-action-btn delete-template" title="Delete">🗑️</button>
            </div>
        </div>
        <div class="card-type">${template.type}</div>
        <div class="card-preview" title="${template.content}">${template.content.substring(0, 100)}${template.content.length > 100 ? '...' : ''}</div>
    `;

    // Edit button
    card.querySelector('.edit-template').addEventListener('click', () => {
        const addTemplateForm = document.getElementById('addTemplateForm');
        const templateForm = document.getElementById('templateForm');
        const templateName = document.getElementById('templateName');
        const templateType = document.getElementById('templateType');
        const templateContent = document.getElementById('templateContent');
        const submitBtn = templateForm.querySelector('button[type="submit"]');
        
        // Set editing state
        window.editingTemplateId = template.id;
        
        // Pre-populate form
        templateName.value = template.name;
        templateType.value = template.type;
        templateContent.value = template.content;
        
        // Change button text
        submitBtn.textContent = 'Update Template';
        
        // Show form
        addTemplateForm.style.display = 'block';
    });

    // Copy button
    card.querySelector('.copy-template').addEventListener('click', () => {
        navigator.clipboard.writeText(template.content);
        showToast('Template copied to clipboard!');
    });

    // Delete button
    card.querySelector('.delete-template').addEventListener('click', () => {
        showDeleteConfirmation(template, 'template');
    });

    return card;
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Delete confirmation modal functionality
const deleteConfirmModal = document.getElementById('deleteConfirmModal');
const deleteConfirmText = document.getElementById('deleteConfirmText');
const confirmDeleteBtn = document.getElementById('confirmDelete');
const cancelDeleteBtn = document.getElementById('cancelDelete');

let itemToDelete = null;
let deleteType = null;

function showDeleteConfirmation(item, type) {
    itemToDelete = item;
    deleteType = type;
    deleteConfirmText.textContent = `Are you sure you want to delete this ${type}?`;
    deleteConfirmModal.style.display = 'block';
}

function hideDeleteConfirmation() {
    deleteConfirmModal.style.display = 'none';
    itemToDelete = null;
    deleteType = null;
}

// Refresh UI Functions
async function refreshContactsList() {
    const contactsList = document.getElementById('contactsList');
    const contacts = await dbOperations.getAllContacts();
    contactsList.innerHTML = '';
    contacts.forEach(contact => {
        contactsList.appendChild(createContactCard(contact));
    });
}

async function refreshTemplatesList() {
    const templatesList = document.getElementById('templatesList');
    const templates = await dbOperations.getAllTemplates();
    templatesList.innerHTML = '';
    templates.forEach(template => {
        templatesList.appendChild(createTemplateCard(template));
    });
}

// Event Handlers
document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI
    refreshContactsList();
    refreshTemplatesList();

    // Tab Switching Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default action
            e.stopPropagation(); // Stop event propagation
            
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Show corresponding content
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Add Contact Form Handlers
    const addContactBtn = document.getElementById('addContactBtn');
    const addContactForm = document.getElementById('addContactForm');
    const contactForm = document.getElementById('contactForm');
    const cancelContactBtn = document.getElementById('cancelContact');
    
    addContactBtn.addEventListener('click', () => {
        addContactForm.style.display = 'block';
    });

    cancelContactBtn.addEventListener('click', () => {
        addContactForm.style.display = 'none';
        contactForm.reset();
    });

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const contact = {
            name: document.getElementById('contactName').value,
            company: document.getElementById('contactCompany').value,
            role: document.getElementById('contactRole').value,
            email: document.getElementById('contactEmail').value,
            linkedIn: document.getElementById('contactLinkedIn').value,
            notes: document.getElementById('contactNotes').value
        };

        try {
            await dbOperations.addContact(contact);
            showToast('Contact added successfully!');
            addContactForm.style.display = 'none';
            contactForm.reset();
            refreshContactsList();
        } catch (error) {
            showToast('Error adding contact: ' + error.message);
        }
    });

    // Add Template Form Handlers
    const addTemplateBtn = document.getElementById('addTemplateBtn');
    const addTemplateForm = document.getElementById('addTemplateForm');
    const templateForm = document.getElementById('templateForm');
    const cancelTemplateBtn = document.getElementById('cancelTemplate');
    let editingTemplateId = null; // Track if we're editing a template

    addTemplateBtn.addEventListener('click', () => {
        editingTemplateId = null; // Reset editing state
        templateForm.querySelector('button[type="submit"]').textContent = 'Add Template';
        addTemplateForm.style.display = 'block';
    });

    cancelTemplateBtn.addEventListener('click', () => {
        editingTemplateId = null; // Reset editing state
        addTemplateForm.style.display = 'none';
        templateForm.reset();
        templateForm.querySelector('button[type="submit"]').textContent = 'Add Template';
    });

    templateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const template = {
            name: document.getElementById('templateName').value,
            type: document.getElementById('templateType').value,
            content: document.getElementById('templateContent').value
        };
    
        try {
            if (window.editingTemplateId) {
                // Update existing template
                await dbOperations.updateTemplate(window.editingTemplateId, template);
                showToast('Template updated successfully!');
            } else {
                // Add new template
                await dbOperations.addTemplate(template);
                showToast('Template added successfully!');
            }
            addTemplateForm.style.display = 'none';
            templateForm.reset();
            templateForm.querySelector('button[type="submit"]').textContent = 'Add Template';
            window.editingTemplateId = null; // Reset editing state
            refreshTemplatesList();
        } catch (error) {
            showToast('Error: ' + error.message);
            console.error('Template operation error:', error);
        }
    });

    // Delete confirmation modal event listeners
    confirmDeleteBtn.addEventListener('click', async () => {
        if (deleteType === 'contact') {
            await dbOperations.deleteContact(itemToDelete.id);
            await refreshContactsList();
        } else if (deleteType === 'template') {
            await dbOperations.deleteTemplate(itemToDelete.id);
            await refreshTemplatesList();
        }
        hideDeleteConfirmation();
    });

    cancelDeleteBtn.addEventListener('click', hideDeleteConfirmation);

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === deleteConfirmModal) {
            hideDeleteConfirmation();
        }
    });
});

// Export functions for use in popup.js
window.networkingManager = {
    dbOperations,
    refreshContactsList,
    refreshTemplatesList,
    createContactCard,
    createTemplateCard,
    showToast
};