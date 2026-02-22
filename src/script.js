let authForm = document.querySelector(".auth form")
let inpLogin = document.querySelector(".auth .login")
let inpPass = document.querySelector(".auth .password")
let authError = document.querySelector(".auth p")
let authScreen = document.querySelector(".auth")
let body = document.querySelector("body")

let login = "alina"
let password = "s-dnyuxoy"

authForm.addEventListener("submit", (e) => {
	e.preventDefault()
	if (inpLogin.value === login && inpPass.value === password) {
		saveUser()
		authScreen.classList.add("hide")
		body.classList.remove("auth-block")
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
	localStorage.setItem("alina-site", JSON.stringify({ login, password }))
}

function getUser() {
	let data = JSON.parse(localStorage.getItem("alina-site"))

	if (data && data.login === login && data.password === password) {
		authScreen.classList.add("hide")
		body.classList.remove("auth-block")
	}
}

getUser()

