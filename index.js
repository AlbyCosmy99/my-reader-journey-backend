import express from 'express'
import mongoose from 'mongoose'
import apiRouter from './src/routers/apiRouter/apiRouter.js'
import cors from 'cors'

const username = encodeURIComponent("AlbyCosmy99");
const password = encodeURIComponent("onJ20KTO7cfg6GzO");

const mongoUri = `mongodb+srv://${username}:${password}@cluster0.6fepqnw.mongodb.net/myDatabase?retryWrites=true&w=majority&ssl=true`

const server = express()

const port = process.env.PORT || 3030

server.use(express.json())
server.use('/api', apiRouter)

server.use(cors())

server.get('/', (req,res) => {
    const words = ['spray', 'elite', 'exuberant', 'destruction', 'present','Daniel', 'Andrei'];
    res.json({
        elements: words,
        ciao: 'cose belle'
    })
})

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

