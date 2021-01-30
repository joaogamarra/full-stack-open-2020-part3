const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

morgan.token('body', (req, res) => JSON.stringify(req.body))

app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
	{
		id: 1,
		name: 'Arto Hellas',
		number: '040-123456',
	},
	{
		id: 2,
		name: 'Ada Lovelace',
		number: '040-123456',
	},
	{
		id: 3,
		name: 'Dan Abramov',
		number: '040-123456',
	},
]

app.get('/', (request, response) => {
	response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
	response.json(persons)
})

app.post('/api/persons', (request, response) => {
	const body = request.body

	if (!body.name) {
		return response.status(400).json({
			error: 'name is required',
		})
	}
	if (!body.number) {
		return response.status(400).json({
			error: 'number is required',
		})
	}
	if (persons.filter((person) => person.name === body.name).length > 0) {
		return response.status(400).json({
			error: 'name must be unique',
		})
	}
	const person = {
		id: Math.floor(Math.random() * 100000) + 1,
		name: body.name,
		number: body.number,
	}

	persons = persons.concat(person)

	response.json(person)
})

app.get('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	const person = persons.find((person) => person.id === id)

	if (person) {
		response.json(person)
	} else {
		response.status(404).end()
	}
})

app.delete('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	persons = persons.filter((note) => note.id !== id)

	response.status(204).end()
})

app.get('/info', (request, response) => {
	const date = new Date()
	response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${date}</p>`)
})

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
