import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectMongoDB } from './db/connectMongoDB.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { logger } from './middleware/logger.js';
import notesRouter from './routes/notesRoutes.js';
import authRouter from './routes/authRoutes.js'
import userRouter from './routes/userRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { errors } from 'celebrate';
import cookieParser from 'cookie-parser';


export const app = express();
export const PORT = process.env.PORT || 3000;

app.use(logger)
app.use(express.json())
app.use(cors())
app.use(cookieParser())

app.use(authRouter)
app.use(notesRouter)
app.use(userRouter)

app.use(notFoundHandler);
app.use(errors());
app.use(errorHandler)

await connectMongoDB()

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
