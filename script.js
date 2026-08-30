// ===== Upload System =====
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const uploadStatus = document.getElementById('uploadStatus');
const filesList = document.getElementById('filesList');
const filesUL = document.getElementById('filesUL');

// Simulierte Datei-Speicherung (in echtem System würde Vercel Blob verwendet)
let uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles')) || [];

// Upload-Box klick zum Datei-Auswahl öffnen
uploadBox.addEventListener('click', () => {
    fileInput.click();
});

// Drag & Drop Funktionalität
uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.style.background = '#f0f0ff';
    uploadBox.style.borderColor = '#764ba2';
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.style.background = 'white';
    uploadBox.style.borderColor = '#667eea';
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.style.background = 'white';
    uploadBox.style.borderColor = '#667eea';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileUpload(files[0]);
    }
});

// Datei-Input Change
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileUpload(e.target.files[0]);
    }
});

// Datei hochladen (simuliert)
function handleFileUpload(file) {
    const loggedInUser = localStorage.getItem('loggedInUser');
    
    if (!loggedInUser) {
        uploadStatus.className = 'upload-status error';
        uploadStatus.textContent = '❌ Du musst eingeloggt sein zum Hochladen!';
        return;
    }
    
    // Datei-Größe prüfen (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        uploadStatus.className = 'upload-status error';
        uploadStatus.textContent = '❌ Datei zu groß (max. 10MB)';
        return;
    }
    
    // Upload-Status anzeigen
    uploadStatus.className = 'upload-status loading';
    uploadStatus.textContent = '⏳ Datei wird hochgeladen...';
    
    // Simuliere Upload (in echtem System würde zu Vercel Blob hochgeladen)
    setTimeout(() => {
        const fileData = {
            name: file.name,
            size: (file.size / 1024).toFixed(2) + ' KB',
            uploadedAt: new Date().toLocaleString('de-DE'),
            uploadedBy: loggedInUser,
            url: URL.createObjectURL(file) // Demo-URL
        };
        
        uploadedFiles.push(fileData);
        localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
        
        uploadStatus.className = 'upload-status success';
        uploadStatus.textContent = '✅ Datei erfolgreich hochgeladen!';
        
        fileInput.value = '';
        displayUploadedFiles();
    }, 1000);
}

// Hochgeladene Dateien anzeigen
function displayUploadedFiles() {
    if (uploadedFiles.length === 0) {
        filesList.classList.remove('show');
        return;
    }
    
    filesList.classList.add('show');
    filesUL.innerHTML = '';
    
    uploadedFiles.forEach((file, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${file.name}</strong><br>
                <small>${file.size} • ${file.uploadedAt}</small>
            </div>
            <button onclick="deleteFile(${index})" class="btn-delete">🗑️ Löschen</button>
        `;
        filesUL.appendChild(li);
    });
}

// Datei löschen
function deleteFile(index) {
    if (confirm('Datei wirklich löschen?')) {
        uploadedFiles.splice(index, 1);
        localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
        displayUploadedFiles();
    }
}

// Dateien beim Laden anzeigen
document.addEventListener('DOMContentLoaded', () => {
    displayUploadedFiles();
});

// CSS für Delete-Button hinzufügen
const style = document.createElement('style');
style.textContent = `
    .btn-delete {
        background: #ef4444;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background 0.3s;
    }
    .btn-delete:hover {
        background: #dc2626;
    }
`;
document.head.appendChild(style);
const loginBtn = document.querySelector('.btn-login');
const closeBtn = document.querySelector('.close-btn');
const loginModal = document.getElementById('loginModal');
const btnPrimary = document.querySelector('.btn-primary');
const loginForm = document.querySelector('.modal-content form');
const navMenu = document.querySelector('.nav-menu');

// Benutzer-Datenbank (nur Demo - in Realität würde Backend-DB verwendet)
const users = [
    { email: 'demo@example.com', password: 'password123' },
    { email: 'user@test.com', password: 'test123' }
];

// Prüfe ob Nutzer eingeloggt ist beim Laden
document.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        updateUIForLoggedInUser(loggedInUser);
    }
});

// Login-Button klicken
loginBtn.addEventListener('click', () => {
    loginModal.classList.add('active');
});

// Close-Button klicken
closeBtn.addEventListener('click', () => {
    loginModal.classList.remove('active');
});

// Außerhalb des Modals klicken
window.addEventListener('click', (event) => {
    if (event.target === loginModal) {
        loginModal.classList.remove('active');
    }
});

// "Jetzt Starten" Button - öffnet auch das Login-Modal
if (btnPrimary) {
    btnPrimary.addEventListener('click', () => {
        loginModal.classList.add('active');
    });
}

// Form Submission - Login verarbeiten
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Prüfe Anmeldedaten
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Login erfolgreich
        localStorage.setItem('loggedInUser', email);
        alert('✅ Login erfolgreich! Willkommen ' + email);
        loginForm.reset();
        loginModal.classList.remove('active');
        updateUIForLoggedInUser(email);
    } else {
        alert('❌ Ungültige Anmeldedaten!\n\nDemo-Accounts:\n📧 demo@example.com\n🔑 password123\n\noder\n📧 user@test.com\n🔑 test123');
    }
});

// UI aktualisieren wenn eingeloggt
function updateUIForLoggedInUser(email) {
    const loginBtn = document.querySelector('.btn-login');
    loginBtn.textContent = '👤 ' + email;
    loginBtn.style.background = '#10b981';
    loginBtn.style.color = 'white';
    
    // Logout-Funktion hinzufügen
    loginBtn.onclick = () => {
        if (confirm('Wirklich ausloggen?')) {
            localStorage.removeItem('loggedInUser');
            location.reload();
        }
    };
}

// Mobile Menu Toggle
const navToggle = document.getElementById('nav-toggle');

// Menü schließen wenn ein Link geklickt wird
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.checked = false;
    });
});
