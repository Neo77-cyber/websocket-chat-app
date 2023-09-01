const express = require('express')
const path = require('path')
const app = express()
require('dotenv').config()
require('express-async-errors')



app.use(express.json())

const connectDB = require('./db/connect')
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')
const authroute = require('./routes/auth')


app.use(express.static(path.join(__dirname, 'public')))



app.use('/api/v1', authroute)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)




const PORT = process.env.PORT || 4000
const server = app.listen(PORT, () => console.log(`💬 server on port ${PORT}`))

const io = require('socket.io')(server)


const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
  } catch (error) {
    console.log(error);
  }
};

start();

 
let socketsConected = new Set()

io.on('connection', onConnected)

function onConnected(socket) {
  
  socketsConected.add(socket.id)
  io.emit('clients-total', socketsConected.size)

  socket.on('disconnect', () => {
    socketsConected.delete(socket.id)
    io.emit('clients-total', socketsConected.size)
  })

  socket.on('message', (data) => {
    socket.broadcast.emit('chat-message', data)
  })

  socket.on('feedback', (data) => {
    socket.broadcast.emit('feedback', data)
  })
}