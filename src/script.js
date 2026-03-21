// подключение к personal-data делаем здесь
let authForm = document.querySelector(".auth form")
let inpLogin = document.querySelector(".auth .login")
let inpPass = document.querySelector(".auth .password")
let authError = document.querySelector(".auth p")
let authScreen = document.querySelector(".auth")
let body = document.querySelector("body")

// Функция для проверки логина через MockAPI
async function checkLoginWithAPI(login, password) {
	try {
		const response = await fetch('https://662518f804457d4aaf9dd76e.mockapi.io/personal-data');
		const users = await response.json();

		// Ищем пользователя с таким email и паролем
		const user = users.find(u => u.email === login && u.password === password);

		if (user) {
			// Сохраняем в localStorage
			localStorage.setItem("alina-site", JSON.stringify({ login, password }));
			return true;
		}
		return false;
	} catch (error) {
		console.error('Ошибка проверки:', error);
		// Если ошибка API, пробуем старую логику
		const oldLogin = "alina";
		const oldPassword = "s-dnyuxoy";
		if (login === oldLogin && password === oldPassword) {
			localStorage.setItem("alina-site", JSON.stringify({ login, password }));
			return true;
		}
		return false;
	}
}

authForm.addEventListener("submit", async (e) => {
	e.preventDefault()

	const isLoggedIn = await checkLoginWithAPI(inpLogin.value, inpPass.value)

	if (isLoggedIn) {
		authScreen.classList.add("hide")
		body.classList.remove("auth-block")
		// Обновляем глобальные переменные для совместимости
		window.login = inpLogin.value
		window.password = inpPass.value
	} else {
		authError.innerHTML = "Wrong password or login!"
		setTimeout(() => {
			inpLogin.value = ""
			inpPass.value = ""
			authError.innerHTML = ""
		}, 3000)
	}
})

function saveUser() {
	// Функция оставлена для совместимости, но теперь используем API
}

async function getUser() {
	let data = JSON.parse(localStorage.getItem("alina-site"))

	if (data && data.login && data.password) {
		const isValid = await checkLoginWithAPI(data.login, data.password)
		if (isValid) {
			authScreen.classList.add("hide")
			body.classList.remove("auth-block")
			window.login = data.login
			window.password = data.password
		}
	}
}

getUser()