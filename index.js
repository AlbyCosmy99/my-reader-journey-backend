import express from 'express'
import mongoose from 'mongoose'
import apiRouter from './src/routers/apiRouter/apiRouter.js'
import cors from 'cors'

const mongoUri = 'mongodb+srv://AlbyCosmy99:lwMIgCVsMklxwEdC@cluster0.6fepqnw.mongodb.net/myDatabase?retryWrites=true&w=majority&ssl=true'

const server = express()

const port = process.env.PORT || 3030

server.use(express.json())
server.use('/api', apiRouter)

server.use(cors())

mongoose.connect(mongoUri)
.then(() => {
    server.listen(port, () => {
        console.log(`Server running on localhost:${port}`)
    })
})
.catch(err => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
});

