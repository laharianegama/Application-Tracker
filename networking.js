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
        <div class="card-header">
            <div class="card-title">${contact.name}</div>
            <div class="card-actions">
                <button class="card-action copy-email" title="Copy Email">📧</button>
                <button class="card-action copy-linkedin" title="Copy LinkedIn">👥</button>
                <button class="card-action delete-contact" title="Delete">🗑️</button>
            </div>
        </div>
        <div class="card-company">${contact.company}</div>
        ${contact.role ? `<div class="card-role">${contact.role}</div>` : ''}
        ${contact.notes ? `<div class="card-notes">${contact.notes}</div>` : ''}
    `;

    // Add event listeners
    card.querySelector('.copy-email').addEventListener('click', () => {
        if (contact.email) {
            navigator.clipboard.writeText(contact.email);
            showToast('Email copied to clipboard!');
        }
    });

    card.querySelector('.copy-linkedin').addEventListener('click', () => {
        if (contact.linkedin) {
            navigator.clipboard.writeText(contact.linkedin);
            showToast('LinkedIn URL copied to clipboard!');
        }
    });

    card.querySelector('.delete-contact').addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this contact?')) {
            await dbOperations.deleteContact(contact.id);
            await refreshContactsList();
        }
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
                <button class="card-action copy-template" title="Copy Template">📋</button>
                <button class="card-action delete-template" title="Delete">🗑️</button>
            </div>
        </div>
        <div class="card-type">${template.type}</div>
        <div class="card-preview">${template.content.substring(0, 100)}...</div>
    `;

    // Add event listeners
    card.querySelector('.copy-template').addEventListener('click', () => {
        navigator.clipboard.writeText(template.content);
        showToast('Template copied to clipboard!');
    });

    card.querySelector('.delete-template').addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this template?')) {
            await dbOperations.deleteTemplate(template.id);
            await refreshTemplatesList();
        }
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

    addTemplateBtn.addEventListener('click', () => {
        addTemplateForm.style.display = 'block';
    });

    cancelTemplateBtn.addEventListener('click', () => {
        addTemplateForm.style.display = 'none';
        templateForm.reset();
    });

    templateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const template = {
            name: document.getElementById('templateName').value,
            type: document.getElementById('templateType').value,
            content: document.getElementById('templateContent').value
        };

        try {
            await dbOperations.addTemplate(template);
            showToast('Template added successfully!');
            addTemplateForm.style.display = 'none';
            templateForm.reset();
            refreshTemplatesList();
        } catch (error) {
            showToast('Error adding template: ' + error.message);
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