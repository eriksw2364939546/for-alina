let FULL_URL = null;
let currentUserId = null;

async function getPersonalUrl() {
    const response = await fetch('/api/getDataResurs');
    const data = await response.json();
    return data.targetData;
}

async function fetchUserData() {
    if (!FULL_URL) {
        FULL_URL = await getPersonalUrl();
    }

    try {
        const response = await fetch(FULL_URL);
        const users = await response.json();
        let user = users.find(u => u.email === 'alina');
        if (!user && users.length > 0) user = users[0];
        if (user) {
            currentUserId = user.id;
            return user;
        }
        return await createDefaultUser();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        return null;
    }
}

async function createDefaultUser() {
    try {
        const response = await fetch(FULL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'alina', password: 's-dnyuxoy' })
        });
        const newUser = await response.json();
        currentUserId = newUser.id;
        return newUser;
    } catch (error) {
        console.error('Ошибка создания пользователя:', error);
        return null;
    }
}

async function updateUserData(email, password) {
    if (!currentUserId) await fetchUserData();
    try {
        const response = await fetch(`${FULL_URL}/${currentUserId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) throw new Error('Ошибка обновления');
        const updatedUser = await response.json();
        window.updateCredentials?.(email, password);
        return { success: true, data: updatedUser };
    } catch (error) {
        console.error('Ошибка обновления:', error);
        return { success: false, error: error.message };
    }
}

async function checkLogin(email, password) {
    try {
        const user = await fetchUserData();
        return user && user.email === email && user.password === password;
    } catch (error) {
        return false;
    }
}

function updateLocalCredentials(email, password) {
    localStorage.setItem("alina-site", JSON.stringify({ login: email, password: password }));
}

window.updateCredentials = updateLocalCredentials;
window.checkLogin = checkLogin;

function createPasswordToggle(inputElement) {
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'password-toggle';
    toggleBtn.innerHTML = `<svg class="eye-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
    let isPasswordVisible = false;
    toggleBtn.addEventListener('click', () => {
        isPasswordVisible = !isPasswordVisible;
        inputElement.type = isPasswordVisible ? 'text' : 'password';
        toggleBtn.innerHTML = isPasswordVisible ? `<svg class="eye-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>` : `<svg class="eye-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
    });
    return toggleBtn;
}

function createProfileButton() {
    const btn = document.createElement('button');
    btn.className = 'profile-btn';
    btn.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
    document.body.appendChild(btn);
    return btn;
}

function createProfileModal() {
    const modal = document.createElement('div');
    modal.className = 'profile-modal';
    modal.innerHTML = `
        <div class="profile-modal__window">
            <h3>Редактировать профиль</h3>
            <div class="profile-modal__message"></div>
            <div class="profile-modal__group">
                <label>Email / Логин</label>
                <input type="text" id="profile-email" placeholder="Введите новый email">
            </div>
            <div class="profile-modal__group">
                <label>Пароль</label>
                <input type="password" id="profile-password" placeholder="Введите новый пароль">
            </div>
            <div class="profile-modal__buttons">
                <button class="profile-modal__save">Сохранить</button>
                <button class="profile-modal__cancel">Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

async function loadCurrentUserData() {
    const user = await fetchUserData();
    if (user) {
        const emailInput = document.getElementById('profile-email');
        const passwordInput = document.getElementById('profile-password');
        if (emailInput) emailInput.value = user.email;
        if (passwordInput) passwordInput.value = '';
    }
}

async function initProfile() {
    FULL_URL = await getPersonalUrl();
    await fetchUserData();

    const profileBtn = createProfileButton();
    const profileModal = createProfileModal();
    const messageDiv = profileModal.querySelector('.profile-modal__message');
    const saveBtn = profileModal.querySelector('.profile-modal__save');
    const cancelBtn = profileModal.querySelector('.profile-modal__cancel');
    const emailInput = document.getElementById('profile-email');
    const passwordInput = document.getElementById('profile-password');

    const passwordGroup = passwordInput.closest('.profile-modal__group');
    const passwordToggle = createPasswordToggle(passwordInput);
    passwordGroup.appendChild(passwordToggle);

    profileBtn.addEventListener('click', async () => {
        await loadCurrentUserData();
        profileModal.classList.add('active');
        messageDiv.className = 'profile-modal__message';
        messageDiv.style.display = 'none';
        passwordInput.type = 'password';
        passwordToggle.innerHTML = `<svg class="eye-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
    });

    function closeModal() { profileModal.classList.remove('active'); }
    cancelBtn.addEventListener('click', closeModal);
    profileModal.addEventListener('click', (e) => { if (e.target === profileModal) closeModal(); });

    saveBtn.addEventListener('click', async () => {
        const newEmail = emailInput.value.trim();
        const newPassword = passwordInput.value.trim();
        if (!newEmail || !newPassword) {
            messageDiv.className = 'profile-modal__message error';
            messageDiv.textContent = 'Пожалуйста, заполните оба поля!';
            messageDiv.style.display = 'block';
            return;
        }
        saveBtn.textContent = 'Сохранение...';
        saveBtn.disabled = true;
        const result = await updateUserData(newEmail, newPassword);
        if (result.success) {
            messageDiv.className = 'profile-modal__message success';
            messageDiv.textContent = 'Данные успешно обновлены!';
            messageDiv.style.display = 'block';
            setTimeout(() => closeModal(), 1500);
        } else {
            messageDiv.className = 'profile-modal__message error';
            messageDiv.textContent = 'Ошибка при сохранении. Попробуйте еще раз.';
            messageDiv.style.display = 'block';
        }
        saveBtn.textContent = 'Сохранить';
        saveBtn.disabled = false;
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfile);
} else {
    initProfile();
}