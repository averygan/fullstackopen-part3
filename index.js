require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/phonebook')

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(morgan('tiny'))

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello Phonebook!</h1>')
  })
  
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
      response.json(persons)
    })
  })

app.get('/info', (request, response) => {
    const count = persons.length
    let currTime = Date()
    response.send(`<p>Phonebook has info for ${count} people</p>
        <p>${currTime}</p>`)
})

// app.get('/api/persons/:id', (request, response) => {
//     const id = request.params.id
//     const person = persons.find(person => person.id === id)
//     if (person) {
//         response.send(person)
//     } else {
//         response.status(404).end()
//     }
// })

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

const generateId = () => {
  return String(Math.floor(Math.random() * 10000))
}

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postrequest'))

app.post('/api/persons', (request, response) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name and/or number missing'
    })
  }

  morgan.token('postrequest', function (request, response) 
  {return JSON.stringify(request.body)})

  if (persons.some(p => p.name === body.name)) {
    return response.status(409).json({
      error: 'name must be unique'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
    id: generateId()
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`)
})