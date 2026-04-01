import express from "express";
import cors from 'cors';
import helmet from "helmet";
import { errormiddleware } from './middlewares/error.middleware.js';

class App {
    constructor(routes){
        this.app = express();
        this.port = process.env.PORT || 5000;

        this.initializeMiddlewares();
        this.initializeRoutes(routes);
        this.initializeErrorHandling();
    }

    initializeMiddlewares() {
        this.app.use(helmet());
        this.app.use(cors({
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true}));
        this.app.use(limiter);
    }

    initializeRoutes(routes){
        routes.forEach((route) => {
            this.app.use('/apu', route.router);
        });
    }

    initializeErrorHandling() {
        this.app.use(errorMiddleware);
    }

    listen(){
        this.app.listen(this.port, () => {
            console.log(`Echo Time Server running on port ${this.port}`);
        });
    }
}

export default App;