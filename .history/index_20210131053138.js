require('dotenv').config()

const express = require('express')
const Person = require('./models/person')

const morgan = require('morgan')
const cors = require('cors')

const app = express()

morgan.token('body', (request) => JSON.stringify(request.body))

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response, next) => {
	Person.find({})
		.then((persons) => {
			response.json(persons)
		})
		.catch((error) => next(error))
})

app.post('/api/persons', (request, response, next) => {
	const { body } = request

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

	person
		.save()
		.then((savedPerson) => {
			response.json(savedPerson.toJSON())
		})
		.catch((error) => {
			next(error)
		})
})

app.get('/api/persons/:id', (request, response, next) => {
	Person.findById(request.params.id)
		.then((person) => {
			if (person) {
				response.json(person)
			} else {
				response.status(404).end()
			}
		})
		.catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
	const { body } = request

	Person.findById(request.params.id).then((person) => {
		person.number = body.number

		person
			.save()
			.then((savedPerson) => {
				response.json(savedPerson.toJSON())
			})
			.catch((error) => next(error))
	})
})

app.delete('/api/persons/:id', (request, response, next) => {
	Person.findByIdAndRemove(request.params.id)
		.then(() => {
			response.status(204).end()
		})
		.catch((error) => next(error))
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

const errorHandler = (error, request, response, next) => {
	console.error(error.message)

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' })
	} else if (error.name === 'ValidationError') {
		return response.status(400).json({ error: error.message })
	}

	next(error)
}

app.use(errorHandler)

// eslint-disable-next-line no-undef
const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
