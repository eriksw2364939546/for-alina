// MockAPI настройки
const API_BASE_URL = 'https://662518f804457d4aaf9dd76e.mockapi.io';
const RESOURCE_NAME = 'personal-data';

// Глобальная переменная для хранения ID текущего пользователя в MockAPI
let currentUserId = null;

// Функция для получения данных пользователя из MockAPI
async function fetchUserData() {
    try {
        const response = await fetch(`${API_BASE_URL}/${RESOURCE_NAME}`);
        const users = await response.json();

        // Ищем пользователя с логином alina (или берем первого)
        let user = users.find(u => u.email === 'alina');
        if (!user && users.length > 0) {
            user = users[0];
        }

        if (user) {
            currentUserId = user.id;
            return user;
        }

        // Если пользователя нет, создаем
        return await createDefaultUser();

    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        return null;
    }
}

// Функция для создания пользователя по умолчанию
async function createDefaultUser() {
    try {
        const response = await fetch(`${API_BASE_URL}/${RESOURCE_NAME}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'alina',
                password: 's-dnyuxoy'
            })
        });
        const newUser = await response.json();
        currentUserId = newUser.id;
        return newUser;
    } catch (error) {
        console.error('Ошибка создания пользователя:', error);
        return null;
    }
}

// Функция обновления данных пользователя
async function updateUserData(email, password) {
    if (!currentUserId) {
        await fetchUserData();
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${RESOURCE_NAME}/${currentUserId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (!response.ok) {
            throw new Error('Ошибка обновления');
        }

        const updatedUser = await response.json();

        // Обновляем локальные переменные в script.js
        window.updateCredentials?.(email, password);

        return { success: true, data: updatedUser };

    } catch (error) {
        console.error('Ошибка обновления:', error);
        return { success: false, error: error.message };
    }
}

// Функция проверки логина (переопределяем существующую логику)
async function checkLogin(email, password) {
    try {
        const user = await fetchUserData();
        if (user && user.email === email && user.password === password) {
            return true;
        }
        return false;
    } catch (error) {
        console.error('Ошибка проверки логина:', error);
        return false;
    }
}

// Функция для обновления данных в localStorage (чтобы после смены пароля можно было войти)
function updateLocalCredentials(email, password) {
    localStorage.setItem("alina-site", JSON.stringify({ login: email, password: password }));
}

// Экспортируем функции для использования в script.js
window.updateCredentials = updateLocalCredentials;
window.checkLogin = checkLogin;

// Функция для создания кнопки показа/скрытия пароля
function createPasswordToggle(inputElement) {
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'password-toggle';
    toggleBtn.innerHTML = `
        <svg class="eye-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
        </svg>
    `;

    let isPasswordVisible = false;

    toggleBtn.addEventListener('click', () => {
        isPasswordVisible = !isPasswordVisible;
        inputElement.type = isPasswordVisible ? 'text' : 'password';

        // Меняем иконку
        toggleBtn.innerHTML = isPasswordVisible ? `
            <svg class="eye-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
            </svg>
        ` : `
            <svg class="eye-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
        `;
    });

    return toggleBtn;
}

// Создаем кнопку профиля
function createProfileButton() {
    const btn = document.createElement('button');
    btn.className = 'profile-btn';
    btn.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
    `;
    document.body.appendChild(btn);
    return btn;
}

// Создаем модальное окно
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

// Загрузка текущих данных пользователя в форму
async function loadCurrentUserData() {
    const user = await fetchUserData();
    if (user) {
        const emailInput = document.getElementById('profile-email');
        const passwordInput = document.getElementById('profile-password');
        if (emailInput) emailInput.value = user.email;
        if (passwordInput) passwordInput.value = '';
        // Не показываем старый пароль, пусть вводит новый
    }
}

// Инициализация профиля
async function initProfile() {
    // Загружаем данные пользователя при старте
    await fetchUserData();

    // Создаем элементы
    const profileBtn = createProfileButton();
    const profileModal = createProfileModal();

    const modalWindow = profileModal.querySelector('.profile-modal__window');
    const messageDiv = profileModal.querySelector('.profile-modal__message');
    const saveBtn = profileModal.querySelector('.profile-modal__save');
    const cancelBtn = profileModal.querySelector('.profile-modal__cancel');
    const emailInput = document.getElementById('profile-email');
    const passwordInput = document.getElementById('profile-password');

    // Добавляем кнопку показа/скрытия пароля
    const passwordGroup = passwordInput.closest('.profile-modal__group');
    const passwordToggle = createPasswordToggle(passwordInput);
    passwordGroup.appendChild(passwordToggle);

    // Открытие модалки
    profileBtn.addEventListener('click', async () => {
        await loadCurrentUserData();
        profileModal.classList.add('active');
        messageDiv.className = 'profile-modal__message';
        messageDiv.style.display = 'none';
        // Сбрасываем тип пароля на password при открытии
        passwordInput.type = 'password';
        // Обновляем иконку глаза
        const eyeIcon = passwordToggle.querySelector('svg');
        if (eyeIcon) {
            passwordToggle.innerHTML = `
                <svg class="eye-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
            `;
        }
    });

    // Закрытие модалки
    function closeModal() {
        profileModal.classList.remove('active');
    }

    cancelBtn.addEventListener('click', closeModal);

    // Клик вне окна
    profileModal.addEventListener('click', (e) => {
        if (e.target === profileModal) {
            closeModal();
        }
    });

    // Сохранение данных
    saveBtn.addEventListener('click', async () => {
        const newEmail = emailInput.value.trim();
        const newPassword = passwordInput.value.trim();

        if (!newEmail || !newPassword) {
            messageDiv.className = 'profile-modal__message error';
            messageDiv.textContent = 'Пожалуйста, заполните оба поля!';
            messageDiv.style.display = 'block';
            return;
        }

        // Показываем загрузку
        saveBtn.textContent = 'Сохранение...';
        saveBtn.disabled = true;

        const result = await updateUserData(newEmail, newPassword);

        if (result.success) {
            messageDiv.className = 'profile-modal__message success';
            messageDiv.textContent = 'Данные успешно обновлены!';
            messageDiv.style.display = 'block';

            // Закрываем модалку через 1.5 секунды
            setTimeout(() => {
                closeModal();
            }, 1500);
        } else {
            messageDiv.className = 'profile-modal__message error';
            messageDiv.textContent = 'Ошибка при сохранении. Попробуйте еще раз.';
            messageDiv.style.display = 'block';
        }

        saveBtn.textContent = 'Сохранить';
        saveBtn.disabled = false;
    });
}

// Ждем загрузки страницы и инициализируем
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfile);
} else {
    initProfile();
}