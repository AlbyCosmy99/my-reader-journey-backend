import express from 'express';
import userRouter from '../userRouter/userRouter.js'
import cors from 'cors'

const apiRouter = express.Router();

apiRouter.use(cors())

apiRouter.use('/users',userRouter)

apiRouter.get('/', (req, res) => {
  if(req.query.name) {
    res.status(200).json({'name':req.query.name});
  }
  else {
    res.status(400).json({'error': 'query needed.'})
  }
  
});

export default apiRouter;
