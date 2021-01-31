require('dotenv').config()

const express = require('express')
const Person = require('./models/person')

const morgan = require('morgan')
const cors = require('cors')

const app = express()

morgan.token('body', (req, res) => JSON.stringify(req.body))

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/', (request, response) => {
	response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
	Person.find({}).then((persons) => {
		response.json(persons)
	})
})

app.post('/api/persons', (request, response) => {
	const { body } = request

	console.log(body)

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

	const person = new Person({
		name: body.name,
		number: body.number,
	})

	person.save().then((savedPerson) => {
		response.json(savedPerson.toJSON())
	})
})

app.get('/api/persons/:id', (request, response) => {
	Person.findById(request.params.id).then((person) => {
		response.json(person)
	})
})

app.delete('/api/persons/:id', (request, response) => {
	Person.findByIdAndRemove(request.params.id).then((result) => {
		response.status(204).end()
	})
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

const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
