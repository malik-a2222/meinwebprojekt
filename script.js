// ===== Login & Registration System =====
const loginBtn = document.querySelector('.btn-login');
const registerBtn = document.querySelector('.btn-register');
const closeBtn = document.querySelector('.close-btn');
const closeBtnRegister = document.querySelector('.close-btn-register');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const verifyModal = document.getElementById('verifyModal');
const btnPrimary = document.querySelector('.btn-primary');
const loginForm = document.querySelector('#loginModal form');
const registerForm = document.querySelector('#registerForm');
const verifyForm = document.querySelector('#verifyForm');

// Benutzer-Datenbank (lokal gespeichert)
let users = JSON.parse(localStorage.getItem('users')) || [
    { name: 'Demo User', email: 'demo@example.com', password: 'password123', verified: true },
    { name: 'Test User', email: 'user@test.com', password: 'test123', verified: true }
];

let pendingVerification = JSON.parse(localStorage.getItem('pendingVerification')) || {};

// Verifikationscode generieren
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

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
    verifyModal.classList.remove('active');
});

// Register-Button klicken
registerBtn.addEventListener('click', () => {
    registerModal.classList.add('active');
    loginModal.classList.remove('active');
    verifyModal.classList.remove('active');
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
    if (event.target === verifyModal) {
        // Verifymodal nicht schließen, wenn man draußen klickt
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
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        } else {
            // Nicht eingeloggt - Login-Modal öffnen
            loginModal.classList.add('active');
        }
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
        if (!user.verified) {
            alert('❌ Bitte bestätige zuerst deine E-Mail!');
            return;
        }
        // Login erfolgreich
        localStorage.setItem('loggedInUser', user.name);
        alert('✅ Login erfolgreich! Willkommen ' + user.name);
        loginForm.reset();
        loginModal.classList.remove('active');
        updateUIForLoggedInUser(user.name);
    } else {
        alert('❌ Ungültige Anmeldedaten!');
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
    
    // Generiere Verifizierungscode
    const verificationCode = generateVerificationCode();
    
    // Speichere Benutzer als "nicht verifiziert"
    const newUser = { name, email, password, verified: false };
    
    // Speichere als ausstehend
    pendingVerification[email] = {
        user: newUser,
        code: verificationCode,
        attempts: 0
    };
    localStorage.setItem('pendingVerification', JSON.stringify(pendingVerification));
    
    // Zeige Verifikationsbildschirm
    document.getElementById('verifyEmail').textContent = email;
    document.getElementById('verifyCode').value = '';
    
    registerModal.classList.remove('active');
    verifyModal.classList.add('active');
    
    // Zeige den Code in der Demo (in echter App würde das per Email gehen)
    alert(`✅ Registrierung fast fertig!\n\n📧 Bestätigungscode für ${email}:\n\n🔐 ${verificationCode}\n\nBitte gib diesen Code im Fenster ein.`);
});

// Verification Form Submission
verifyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const verifyCode = document.getElementById('verifyCode').value;
    const email = document.getElementById('verifyEmail').textContent;
    
    if (!pendingVerification[email]) {
        alert('❌ Fehler: E-Mail nicht gefunden!');
        return;
    }
    
    const pending = pendingVerification[email];
    
    if (verifyCode === pending.code) {
        // Code korrekt!
        const newUser = pending.user;
        newUser.verified = true;
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Lösche ausstehende Verifikation
        delete pendingVerification[email];
        localStorage.setItem('pendingVerification', JSON.stringify(pendingVerification));
        
        alert('✅ E-Mail bestätigt! Du kannst dich jetzt einloggen.');
        verifyForm.reset();
        verifyModal.classList.remove('active');
        loginModal.classList.add('active');
    } else {
        pending.attempts++;
        if (pending.attempts >= 3) {
            alert('❌ Zu viele Versuche! Bitte registriere dich erneut.');
            delete pendingVerification[email];
            localStorage.setItem('pendingVerification', JSON.stringify(pendingVerification));
            verifyModal.classList.remove('active');
            registerModal.classList.add('active');
        } else {
            alert(`❌ Falscher Code! ${3 - pending.attempts} Versuche verbleibend.`);
        }
        localStorage.setItem('pendingVerification', JSON.stringify(pendingVerification));
    }
});

// Resend Code
document.getElementById('resendCode').addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('verifyEmail').textContent;
    
    if (pendingVerification[email]) {
        const code = pendingVerification[email].code;
        alert(`📧 Neuer Code für ${email}:\n\n🔐 ${code}`);
    }
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
