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

// ===== Login & Registration System =====
const loginBtn = document.querySelector('.btn-login');
const registerBtn = document.querySelector('.btn-register');
const closeBtn = document.querySelector('.close-btn');
const closeBtnRegister = document.querySelector('.close-btn-register');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const btnPrimary = document.querySelector('.btn-primary');
const loginForm = document.querySelector('#loginModal form');
const registerForm = document.querySelector('#registerForm');

// Benutzer-Datenbank (lokal gespeichert)
let users = JSON.parse(localStorage.getItem('users')) || [
    { name: 'Demo User', email: 'demo@example.com', password: 'password123' },
    { name: 'Test User', email: 'user@test.com', password: 'test123' }
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
    registerModal.classList.remove('active');
});

// Register-Button klicken
registerBtn.addEventListener('click', () => {
    registerModal.classList.add('active');
    loginModal.classList.remove('active');
});

// Close-Button Login klicken
closeBtn.addEventListener('click', () => {
    loginModal.classList.remove('active');
});

// Close-Button Register klicken
closeBtnRegister.addEventListener('click', () => {
    registerModal.classList.remove('active');
});

// Außerhalb des Modals klicken
window.addEventListener('click', (event) => {
    if (event.target === loginModal) {
        loginModal.classList.remove('active');
    }
    if (event.target === registerModal) {
        registerModal.classList.remove('active');
    }
});

// Toggle Links zwischen Login und Registrierung
document.querySelectorAll('.toggle-register').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.remove('active');
        registerModal.classList.add('active');
    });
});

document.querySelectorAll('.toggle-login').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.classList.remove('active');
        loginModal.classList.add('active');
    });
});

// "Jetzt Starten" Button - öffnet auch das Login-Modal
if (btnPrimary) {
    btnPrimary.addEventListener('click', () => {
        loginModal.classList.add('active');
    });
}

// Login Form Submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Prüfe Anmeldedaten
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Login erfolgreich
        localStorage.setItem('loggedInUser', user.name);
        alert('✅ Login erfolgreich! Willkommen ' + user.name);
        loginForm.reset();
        loginModal.classList.remove('active');
        updateUIForLoggedInUser(user.name);
    } else {
        alert('❌ Ungültige Anmeldedaten!\n\nDemo-Accounts:\n📧 demo@example.com\n🔑 password123\n\noder\n📧 user@test.com\n🔑 test123');
    }
});

// Registration Form Submission
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;
    
    // Validierung
    if (password !== passwordConfirm) {
        alert('❌ Passwörter stimmen nicht überein!');
        return;
    }
    
    if (password.length < 6) {
        alert('❌ Passwort muss mindestens 6 Zeichen lang sein!');
        return;
    }
    
    // Prüfe ob Email bereits existiert
    if (users.find(u => u.email === email)) {
        alert('❌ Diese Email ist bereits registriert!');
        return;
    }
    
    // Neuer Benutzer erstellen
    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('✅ Registrierung erfolgreich! Du kannst dich jetzt anmelden.');
    registerForm.reset();
    registerModal.classList.remove('active');
    loginModal.classList.add('active');
});

// UI aktualisieren wenn eingeloggt
function updateUIForLoggedInUser(userName) {
    const loginBtn = document.querySelector('.btn-login');
    const registerBtn = document.querySelector('.btn-register');
    
    loginBtn.textContent = '👤 ' + userName;
    loginBtn.style.background = '#10b981';
    loginBtn.style.color = 'white';
    registerBtn.style.display = 'none';
    
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
