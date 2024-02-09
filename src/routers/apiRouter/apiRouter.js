import express from 'express';
import userRouter from '../userRouter/userRouter.js'
import cors from 'cors'

const apiRouter = express.Router();

apiRouter.use(cors())

apiRouter.use('/users',userRouter)

apiRouter.get('/', (req, res) => {
  res.status(200).json({'message':'ok'});
});

export default apiRouter;
