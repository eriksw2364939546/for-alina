const URL = "https://662518f804457d4aaf9dd76e.mockapi.io/todo-List"

let inp = document.querySelector(".plans__inp")
let btn = document.querySelector("#add__plans")
let list = document.querySelector(".plans__list")
let counter = document.querySelector(".counter span")
let counterParagraph = document.querySelector(".counter") // Добавил для полного текста

let plansList = []
let plansComplete = []
let plansProcess = []

let modal = document.querySelector(".modal")
let modalSave = document.querySelector(".modal__save-btn")
let modalCancel = document.querySelector(".modal__cancel-btn")
let modalInp = document.querySelector(".modal input")
let select = document.querySelector("select")

// Функция для склонения слова "план" (ДОБАВЛЕНА)
function declinatePlans(count) {
	const lastDigit = count % 10;
	const lastTwoDigits = count % 100;

	if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
		return 'планов';
	}

	if (lastDigit === 1) {
		return 'план';
	}

	if (lastDigit >= 2 && lastDigit <= 4) {
		return 'плана';
	}

	return 'планов';
}

// Функция для обновления счетчика с правильным склонением (ДОБАВЛЕНА)
function updateCounterWithDeclination(count) {
	if (counter && counterParagraph) {
		counter.innerHTML = count;
		const planWord = declinatePlans(count);
		counterParagraph.innerHTML = `У вас есть <span>${count}</span> ${planWord}!`;
	}
}

modalCancel.addEventListener("click", closeModal)

select.addEventListener("change", renderWithFilter)

function renderWithFilter() {
	if (select.value == "all-todos") {
		renderPlans(plansList)
		return
	}

	if (select.value == "complete") {
		plansComplete = plansList.filter(e => e.complete)
		renderPlans(plansComplete)
		return
	}

	if (select.value == "process") {
		plansProcess = plansList.filter(e => !e.complete)
		renderPlans(plansProcess)
		return
	}
}


list.addEventListener("click", (event) => {
	let cardId = event.target.closest(".card").dataset.id
	let index = plansList.findIndex(e => e.id == cardId)
	let textInField = plansList[index].text

	if (event.target.closest(".delete")) {
		deleteTodo(cardId).then(data => {
			if (data.text) {
				plansList.splice(index, 1)
				renderWithFilter()
				// Обновляем счетчик после удаления
				updateCounterWithDeclination(plansList.length)
			}
		})
	}

	if (event.target.closest(".edit")) {
		modal.classList.add("active-modal")
		modalInp.placeholder = plansList[index].text

		modalSave.addEventListener("click", changeWithPlan)

		function changeWithPlan() {
			if (modalInp.value == "") {
				modalInp.style.background = "red"
				modalInp.placeholder = "Please enter text"
			} else {
				modalInp.style.background = "white"
				modalInp.placeholder = ""
				updateTodo(cardId, { text: modalInp.value }).then(data => {
					plansList[index] = data
					renderWithFilter()
				})
				closeModal()
				modalSave.removeEventListener("click", changeWithPlan)
			}
		}
		modalInp.value = ""
	}

	if (event.target.closest(".shaire")) {
		let link = encodeURIComponent("*One of my plans!*")
		let text = encodeURIComponent(textInField)
		let url = `https://wa.me/?text=${link}%20${text}`
		window.open(url)
	}

	if (event.target.closest(".download")) {
		let blob = new Blob([textInField], { type: "text/plain;charset=utf-8" });
		saveAs(blob, `my-note-${index}.doc`);
	}

	if (event.target.closest("p")) {
		plansList[index].complete = !plansList[index].complete
		updateTodo(cardId, plansList[index])
		renderWithFilter()
	}
})

modalInp.addEventListener("input", () => {
	modalInp.placeholder = ""
	modalInp.style.background = "white"
})

document.addEventListener("DOMContentLoaded", function () {
	btn.addEventListener("click", (e) => {
		e.preventDefault()

		if (inp.value == "") {
			inp.style.border = "2px solid red"
			inp.placeholder = "Enter text!"
		} else {
			let plansObject = {
				text: inp.value,
				complete: false
			}
			addTodo(plansObject).then(data => {
				if (data.text) {
					plansList.unshift(data)
					renderPlans(plansList)
					// Обновляем счетчик после добавления
					updateCounterWithDeclination(plansList.length)
				}
			})
			inp.style.border = "1px solid black"
			inp.placeholder = ""
			inp.value = ""
		}
	})
});

function renderPlans(array) {
	list.innerHTML = ""

	// Обновляем счетчик с правильным склонением
	updateCounterWithDeclination(array.length)

	array.forEach(element => {
		let escapedValue = document.createElement('p')
		escapedValue.innerText = element.text;

		list.innerHTML += `
        <div class="card" data-id="${element.id}">
        <p class="${element.complete ? "complete-plan" : ""}">${escapedValue.innerHTML}</p> 
            <div class="row">
                <button class="download"></button>
                <button class="shaire"></button>
                <button class="edit"></button>
                <button class="delete"></button>
            </div>
        </div>
        `
	})
}


async function getTodoList() {
	try {
		let res = await fetch(URL)
		let data = await res.json()
		return data
	} catch (error) {
		return error
	}
}

async function addTodo(newTask) {
	try {
		let res = await fetch(URL, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(newTask)
		})

		let data = res.json()
		return data
	} catch (error) {
		return error
	}
}

async function deleteTodo(id) {
	try {
		let url = `${URL}/${id}`
		let res = await fetch(url, {
			method: 'DELETE',
		})
		let data = await res.json()
		return data
	} catch (error) {
		return error
	}
}

async function updateTodo(id, updateInfo) {
	try {
		let url = `${URL}/${id}`
		let res = await fetch(url, {
			method: 'PUT',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(updateInfo)
		})
		let data = await res.json()
		return data
	} catch (error) {
		return error
	}
}

getTodoList().then(data => {
	if (data && data.length > 0) {
		plansList = data.sort((a, b) => +b.id - +a.id)
		renderPlans(plansList)
		// Обновляем счетчик при загрузке
		updateCounterWithDeclination(plansList.length)
	}
})

function closeModal() {
	modal.classList.remove("active-modal")
}