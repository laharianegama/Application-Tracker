// Database configuration
const dbName = "networkingDB";
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
      if (!db.objectStoreNames.contains("contacts")) {
        const contactsStore = db.createObjectStore("contacts", {
          keyPath: "id",
          autoIncrement: true,
        });
        contactsStore.createIndex("name", "name");
        contactsStore.createIndex("company", "company");
      }

      // Create templates store
      if (!db.objectStoreNames.contains("templates")) {
        const templatesStore = db.createObjectStore("templates", {
          keyPath: "id",
          autoIncrement: true,
        });
        templatesStore.createIndex("name", "name");
        templatesStore.createIndex("type", "type");
      }
    };
  });
}

// Database operations
const dbOperations = {
  // Contacts operations
  async addContact(contact) {
    // Validate notes length before adding to database
    if (contact.notes) {
      const wordCount = countWords(contact.notes);
      if (wordCount > 25) {
        throw new Error("Notes cannot exceed 25 words.");
      }
    }

    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["contacts"], "readwrite");
      const store = transaction.objectStore("contacts");
      const request = store.add(contact);

      request.onsuccess = () => resolve(contact);
      request.onerror = () => reject(request.error);
    });
  },

  async updateTemplate(id, updatedTemplate) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["templates"], "readwrite");
      const store = transaction.objectStore("templates");

      // First, get the existing template
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        if (!getRequest.result) {
          reject(new Error("Template not found"));
          return;
        }

        // Update the template while preserving its ID
        const request = store.put({
          ...getRequest.result, // Keep existing properties
          ...updatedTemplate, // Override with updates
          id: id, // Ensure ID remains the same
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
      const transaction = db.transaction(["contacts"], "readonly");
      const store = transaction.objectStore("contacts");
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async deleteContact(id) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["contacts"], "readwrite");
      const store = transaction.objectStore("contacts");
      const request = store.delete(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Templates operations
  async addTemplate(template) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["templates"], "readwrite");
      const store = transaction.objectStore("templates");
      const request = store.add(template);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getAllTemplates() {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["templates"], "readonly");
      const store = transaction.objectStore("templates");
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async deleteTemplate(id) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["templates"], "readwrite");
      const store = transaction.objectStore("templates");
      const request = store.delete(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
};

// Helper function to count words
function countWords(text) {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

// Helper function to truncate text to a specified number of words
function truncateToWords(str, numWords) {
  if (!str) return "";
  const words = str.trim().split(/\s+/);
  if (words.length <= numWords) return str;
  return words.slice(0, numWords).join(" ") + "...";
}

// UI Helper Functions
function createContactCard(contact) {
  const card = document.createElement("div");
  card.className = "contact-card";

  // Truncate notes to 25 words if they exist
  const truncatedNotes = contact.notes
    ? truncateToWords(contact.notes, 25)
    : "";

  card.innerHTML = `
        <div class="card-content">
            <div class="card-main">
                <div class="card-left">
                    <div class="card-header">
                        <span class="card-title">${contact.name}</span>
                        ${
                          contact.role
                            ? `<span class="card-role">${contact.role}</span>`
                            : ""
                        }
                    </div>
                    <div class="card-details">
                        ${
                          contact.company
                            ? `<span class="card-company">${contact.company}</span>`
                            : ""
                        }
                    </div>
                </div>
                <div class="card-actions">
                    ${
                      contact.email
                        ? `<button class="card-action-btn email-btn" title="Copy Email">
                            <span class="icon">📧</span>
                        </button>`
                        : ""
                    }
                    ${
                      contact.linkedIn
                        ? `<button class="card-action-btn linkedin-btn" title="Copy LinkedIn Connection Request">
                            <span class="icon">👥</span>
                        </button>`
                        : ""
                    }
                    <button class="card-action-btn delete-btn" title="Delete Contact">
                        <span class="icon">🗑️</span>
                    </button>
                </div>
            </div>
            ${
              truncatedNotes
                ? `<div class="card-notes" title="${contact.notes}">${truncatedNotes}</div>`
                : ""
            }
        </div>
    `;

  // Add event listeners
  if (contact.email) {
    card.querySelector(".email-btn").addEventListener("click", () => {
      navigator.clipboard.writeText(contact.email);
      showToast("Email copied to clipboard!");
    });
  }

  if (contact.linkedIn) {
    card.querySelector(".linkedin-btn").addEventListener("click", () => {
      navigator.clipboard.writeText(contact.linkedIn);
      showToast("LinkedIn URL copied to clipboard!");
    });
  }

  card.querySelector(".delete-btn").addEventListener("click", () => {
    showDeleteConfirmation(contact, "contact");
  });

  return card;
}

function createTemplateCard(template) {
  const card = document.createElement("div");
  card.className = "template-card";
  card.innerHTML = `
        <div class="card-header">
            <div class="card-title">${template.name}</div>
        </div>
        <div class="card-preview" title="${
          template.content
        }">${template.content.substring(0, 100)}${
    template.content.length > 100 ? "..." : ""
  }</div>
        <div class="card-actions">
                <button class="card-action-btn edit-template" title="Edit Template">✏️</button>
                <button class="card-action-btn copy-template" title="Copy Template">📋</button>
                <button class="card-action-btn delete-template" title="Delete">🗑️</button>
        </div>
    `;

  // Edit button
  card.querySelector(".edit-template").addEventListener("click", () => {
    const addTemplateForm = document.getElementById("addTemplateForm");
    const templateForm = document.getElementById("templateForm");
    const templateName = document.getElementById("templateName");
    const templateContent = document.getElementById("templateContent");
    const submitBtn = templateForm.querySelector('button[type="submit"]');

    // Set editing state
    window.editingTemplateId = template.id;

    // Pre-populate form
    templateName.value = template.name;
    templateContent.value = template.content;

    // Change button text
    submitBtn.textContent = "Update Template";

    // Show form
    addTemplateForm.style.display = "block";
  });

  // Copy button
  card.querySelector(".copy-template").addEventListener("click", () => {
    navigator.clipboard.writeText(template.content);
    showToast("Template copied to clipboard!");
  });

  // Delete button
  card.querySelector(".delete-template").addEventListener("click", () => {
    showDeleteConfirmation(template, "template");
  });

  return card;
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Delete confirmation modal functionality
const deleteConfirmModal = document.getElementById("deleteConfirmModal");
const deleteConfirmText = document.getElementById("deleteConfirmText");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const cancelDeleteBtn = document.getElementById("cancelDelete");

let itemToDelete = null;
let deleteType = null;

function showDeleteConfirmation(item, type) {
  itemToDelete = item;
  deleteType = type;
  deleteConfirmText.textContent = `Are you sure you want to delete this ${type}?`;
  deleteConfirmModal.style.display = "block";
}

function hideDeleteConfirmation() {
  deleteConfirmModal.style.display = "none";
  itemToDelete = null;
  deleteType = null;
}

// Refresh UI Functions
async function refreshContactsList() {
  const contactsList = document.getElementById("contactsList");
  const contacts = await dbOperations.getAllContacts();
  contactsList.innerHTML = "";
  contacts.forEach((contact) => {
    contactsList.appendChild(createContactCard(contact));
  });
}

async function refreshTemplatesList() {
  const templatesList = document.getElementById("templatesList");
  const templates = await dbOperations.getAllTemplates();
  templatesList.innerHTML = "";
  templates.forEach((template) => {
    templatesList.appendChild(createTemplateCard(template));
  });
}

// Event Handlers
document.addEventListener("DOMContentLoaded", () => {
  // Initialize UI
  refreshContactsList();
  refreshTemplatesList();

  const contactForm = document.getElementById("contactForm");
  if (!contactForm) return;

  const notesInput = document.getElementById("contactNotes");
  if (!notesInput) return;

  // Create word count display element
  const wordCountDisplay = document.createElement("div");
  wordCountDisplay.className = "word-count-display";
  wordCountDisplay.style.fontSize = "12px";
  wordCountDisplay.style.color = "#666";
  wordCountDisplay.style.marginTop = "4px";
  wordCountDisplay.textContent = "25 words remaining";

  // Add word count display after the notes input
  if (notesInput.parentNode) {
    notesInput.parentNode.insertBefore(
      wordCountDisplay,
      notesInput.nextSibling
    );
  }

  // Function to handle input and enforce word limit
  function handleNotesInput(e) {
    const words = notesInput.value.trim().split(/\s+/);
    const wordCount = words.length;

    if (wordCount > 25) {
      // Keep only the first 25 words
      notesInput.value = words.slice(0, 25).join(" ");
      wordCountDisplay.textContent = "0 words remaining";
      wordCountDisplay.style.color = "#f44336";
      showToast("Maximum word limit (25 words) reached");
    } else {
      const remaining = 25 - wordCount;
      wordCountDisplay.textContent = `${remaining} words remaining`;
      wordCountDisplay.style.color = "#666";
    }
  }

  // Add input event listener
  notesInput.addEventListener("input", handleNotesInput);

  // Add paste event listener to handle pasted content
  notesInput.addEventListener("paste", (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const words = pastedText.trim().split(/\s+/);

    if (words.length > 25) {
      // If pasting would exceed limit, only paste first 25 words
      notesInput.value = words.slice(0, 25).join(" ");
      showToast("Pasted text truncated to 25 words");
    } else {
      notesInput.value = pastedText;
    }
    handleNotesInput();
  });

  // Handle form submission
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const contact = {
      name: document.getElementById("contactName").value,
      company: document.getElementById("contactCompany").value,
      role: document.getElementById("contactRole").value,
      email: document.getElementById("contactEmail").value,
      linkedIn: document.getElementById("contactLinkedIn").value,
      notes: notesInput.value.trim(),
    };

    try {
      await dbOperations.addContact(contact);
      showToast("Contact added successfully!");
      addContactForm.style.display = "none";
      contactForm.reset();
      wordCountDisplay.textContent = "25 words remaining";
      wordCountDisplay.style.color = "#666";
      refreshContactsList();
    } catch (error) {
      showToast("Error adding contact: " + error.message);
    }
  });

  // Tab Switching Logic
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault(); // Prevent default action
      e.stopPropagation(); // Stop event propagation

      // Remove active class from all buttons and contents
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked button
      btn.classList.add("active");

      // Show corresponding content
      const tabId = btn.getAttribute("data-tab");
      document.getElementById(`${tabId}-tab`).classList.add("active");
    });
  });

  // Add Contact Form Handlers
  const addContactBtn = document.getElementById("addContactBtn");
  const addContactForm = document.getElementById("addContactForm");
  const cancelContactBtn = document.getElementById("cancelContact");

  addContactBtn.addEventListener("click", () => {
    addContactForm.style.display = "block";
  });

  cancelContactBtn.addEventListener("click", () => {
    addContactForm.style.display = "none";
    contactForm.reset();
  });

  // Add Template Form Handlers
  const addTemplateBtn = document.getElementById("addTemplateBtn");
  const addTemplateForm = document.getElementById("addTemplateForm");
  const templateForm = document.getElementById("templateForm");
  const cancelTemplateBtn = document.getElementById("cancelTemplate");
  let editingTemplateId = null; // Track if we're editing a template

  addTemplateBtn.addEventListener("click", () => {
    editingTemplateId = null; // Reset editing state
    templateForm.querySelector('button[type="submit"]').textContent =
      "Add Template";
    addTemplateForm.style.display = "block";
  });

  cancelTemplateBtn.addEventListener("click", () => {
    editingTemplateId = null; // Reset editing state
    addTemplateForm.style.display = "none";
    templateForm.reset();
    templateForm.querySelector('button[type="submit"]').textContent =
      "Add Template";
  });

  templateForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const template = {
      name: document.getElementById("templateName").value,
      content: document.getElementById("templateContent").value,
    };

    try {
      if (window.editingTemplateId) {
        // Update existing template
        await dbOperations.updateTemplate(window.editingTemplateId, template);
        showToast("Template updated successfully!");
      } else {
        // Add new template
        await dbOperations.addTemplate(template);
        showToast("Template added successfully!");
      }
      addTemplateForm.style.display = "none";
      templateForm.reset();
      templateForm.querySelector('button[type="submit"]').textContent =
        "Add Template";
      window.editingTemplateId = null; // Reset editing state
      refreshTemplatesList();
    } catch (error) {
      showToast("Error: " + error.message);
      console.error("Template operation error:", error);
    }
  });

  // Delete confirmation modal event listeners
  confirmDeleteBtn.addEventListener("click", async () => {
    if (deleteType === "contact") {
      await dbOperations.deleteContact(itemToDelete.id);
      await refreshContactsList();
    } else if (deleteType === "template") {
      await dbOperations.deleteTemplate(itemToDelete.id);
      await refreshTemplatesList();
    }
    hideDeleteConfirmation();
  });

  cancelDeleteBtn.addEventListener("click", hideDeleteConfirmation);

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
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
  showToast,
};
