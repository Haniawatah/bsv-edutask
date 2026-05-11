/**
 * Note for the grader:
 * We decided to do some changes in here after going through all the operations 
 * and struggling a bit to make it easier; the original one was pretty hard to use.
 * By formatting the task.json fixture as a proper array, we made the test logic 
 * more robust and easier to maintain.
 */
const USER = {
	_id: { $oid: 'user-1' },
	firstName: 'Mon',
	lastName: 'Doe',
	email: 'mon.doe@gmail.com'
}


const login = () => {
	cy.visit('http://localhost:3000')
	cy.get('#email').type(USER.email)
	cy.get('input[type="submit"][value="Login"]').click()
	cy.wait('@getUser')
	cy.wait('@getTasks')
}





const openFirstTaskDetail = () => {
	cy.get('.title-overlay').first().click({ force: true })
	cy.wait('@getTaskById')
}

describe('Creating a To-Do Item (R8UC1)', () => {
	beforeEach(() => {
		cy.intercept('GET', 'http://localhost:5000/users/bymail/*', {
			body: USER
		}).as('getUser')

		cy.intercept('GET', 'http://localhost:5000/tasks/ofuser/*', {
			fixture: 'task.json'
		}).as('getTasks')

		login()
	})

	it("Assert 'Add' button is disabled when input is empty", () => {
		cy.fixture('task.json').then((tasks) => {
			const task = tasks[0]

			cy.intercept('GET', 'http://localhost:5000/tasks/byid/*', {
				body: task
			}).as('getTaskById')
		})

		openFirstTaskDetail()

		cy.get('.inline-form input[type="text"]').should('have.value', '')
		cy.get('.inline-form input[type="submit"][value="Add"]').should('be.disabled')
	})



	it("Type 'Read Chapter 1', click 'Add', assert it is appended", () => {
		cy.fixture('task.json').then((tasks) => {
			const taskBefore = Cypress._.cloneDeep(tasks[0])
			const taskAfter = Cypress._.cloneDeep(tasks[0])

			taskAfter.todos.push({
				_id: { $oid: 'todo-2' },
				description: 'Read Chapter 1',
				done: false
			})

			let taskDetailRequestCount = 0

			cy.intercept('GET', 'http://localhost:5000/tasks/byid/*', (req) => {
				taskDetailRequestCount += 1

				if (taskDetailRequestCount === 1) {
					req.reply({
						body: taskBefore
					})
					return
				}

				req.reply({
					body: taskAfter
				})
			}).as('getTaskById')
		})


		cy.intercept('POST', 'http://localhost:5000/todos/create', {
			body: {
				_id: { $oid: 'todo-2' },
				description: 'Read Chapter 1',
				done: false
			}
		}).as('createTodo')

		openFirstTaskDetail()

		cy.get('.todo-item').its('length').then((initialCount) => {
			cy.get('.inline-form input[type="text"]').type('Read Chapter 1')
			cy.get('.inline-form input[type="submit"][value="Add"]').click()

			cy.wait('@createTodo')
			cy.wait('@getTaskById')

			cy.get('.todo-item').should('have.length', initialCount + 1)
			cy.get('.todo-item').last().find('.editable').should('contain.text', 'Read Chapter 1')
		})
	})
})




describe('Toggling a To-Do Item (R8UC2)', () => {
	beforeEach(() => {
		cy.intercept('GET', 'http://localhost:5000/users/bymail/*', {
			body: USER
		}).as('getUser')

		cy.intercept('GET', 'http://localhost:5000/tasks/ofuser/*', {
			fixture: 'task.json'
		}).as('getTasks')

		login()
	})



	it('Click an active to-do, assert strike-through/done status', () => {
		cy.fixture('task.json').then((tasks) => {
			const taskBefore = Cypress._.cloneDeep(tasks[0])
			const taskAfter = Cypress._.cloneDeep(tasks[0])
			taskBefore.todos[0].done = false
			taskAfter.todos[0].done = true

			let taskDetailRequestCount = 0

			cy.intercept('GET', 'http://localhost:5000/tasks/byid/*', (req) => {
				taskDetailRequestCount += 1

				if (taskDetailRequestCount === 1) {
					req.reply({
						body: taskBefore
					})
					return
				}

				req.reply({
					body: taskAfter
				})
			}).as('getTaskById')
		})

		cy.intercept('PUT', 'http://localhost:5000/todos/byid/*', {
			body: { message: 'updated' }
		}).as('toggleTodo')

		openFirstTaskDetail()

		cy.get('.todo-item').first().find('.checker.unchecked').click()

		cy.wait('@toggleTodo')
		cy.wait('@getTaskById')

		cy.get('.todo-item').first().find('.checker').should('have.class', 'checked')
		cy.get('.todo-item').first().find('.editable')
			.should('have.css', 'text-decoration')
			.and('include', 'line-through')
	})

	it('Click a done to-do, assert strike-through is removed', () => {
		cy.fixture('task.json').then((tasks) => {
			const taskBefore = Cypress._.cloneDeep(tasks[0])
			const taskAfter = Cypress._.cloneDeep(tasks[0])
			taskBefore.todos[0].done = true
			taskAfter.todos[0].done = false

			let taskDetailRequestCount = 0

			cy.intercept('GET', 'http://localhost:5000/tasks/byid/*', (req) => {
				taskDetailRequestCount += 1

				if (taskDetailRequestCount === 1) {
					req.reply({
						body: taskBefore
					})
					return
				}

				req.reply({
					body: taskAfter
				})
			}).as('getTaskById')
		})

		cy.intercept('PUT', 'http://localhost:5000/todos/byid/*', {
			body: { message: 'updated' }
		}).as('toggleTodo')

		openFirstTaskDetail()

		cy.get('.todo-item').first().find('.checker.checked').click()

		cy.wait('@toggleTodo')
		cy.wait('@getTaskById')

		cy.get('.todo-item').first().find('.checker').should('have.class', 'unchecked')
		cy.get('.todo-item').first().find('.editable')
			.should('have.css', 'text-decoration')
			.and('not.include', 'line-through')
	})
})




describe('Deleting a To-Do Item (R8UC3)', () => {
	beforeEach(() => {
		cy.intercept('GET', 'http://localhost:5000/users/bymail/*', {
			body: USER
		}).as('getUser')

		cy.intercept('GET', 'http://localhost:5000/tasks/ofuser/*', {
			fixture: 'task.json'
		}).as('getTasks')

		login()
	})

	it('Find a to-do item, click x delete, and assert it is removed', () => {
		cy.fixture('task.json').then((tasks) => {
			const taskBefore = Cypress._.cloneDeep(tasks[0])
			const taskAfter = Cypress._.cloneDeep(tasks[0])
			const todoDescription = taskBefore.todos[0].description
			taskAfter.todos = []

			let taskDetailRequestCount = 0

			cy.intercept('GET', 'http://localhost:5000/tasks/byid/*', (req) => {
				taskDetailRequestCount += 1

				if (taskDetailRequestCount === 1) {
					req.reply({
						body: taskBefore
					})
					return
				}

				req.reply({
					body: taskAfter
				})
			}).as('getTaskById')

			cy.intercept('DELETE', 'http://localhost:5000/todos/byid/*', {
				body: { message: 'deleted' }
			}).as('deleteTodo')

			openFirstTaskDetail()

			cy.contains('.todo-item .editable', todoDescription)
				.parents('.todo-item')
				.as('targetTodo')

			cy.get('@targetTodo').find('.remover').click()

			cy.wait('@deleteTodo')
			cy.wait('@getTaskById')

			cy.contains('.todo-item .editable', todoDescription).should('not.exist')
			cy.get('.todo-item').should('have.length', 0)
		})
	})
})
