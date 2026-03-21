let PERSONAL_URL = null;

let authForm = document.querySelector(".auth form")
let inpLogin = document.querySelector(".auth .login")
let inpPass = document.querySelector(".auth .password")
let authError = document.querySelector(".auth p")
let authScreen = document.querySelector(".auth")
let body = document.querySelector("body")

async function getPersonalUrl() {
	const response = await fetch('/api/getDataResurs');
	const data = await response.json();
	return data.targetData;
}

async function checkLoginWithAPI(login, password) {
	if (!PERSONAL_URL) {
		PERSONAL_URL = await getPersonalUrl();
	}

	try {
		const response = await fetch(PERSONAL_URL);
		const users = await response.json();
		const user = users.find(u => u.email === login && u.password === password);
		if (user) {
			localStorage.setItem("alina-site", JSON.stringify({ login, password }));
			return true;
		}
		return false;
	} catch (error) {
		console.error('Ошибка проверки:', error);
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

async function init() {
	PERSONAL_URL = await getPersonalUrl();
	await getUser();
}

init()