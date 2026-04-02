import express from "express";
import cors from 'cors';
import helmet from "helmet";
import { errorMiddleware } from './middlewares/error.middleware.js';

export class App {
    constructor(routes){
        this.expressApp = express();
        this.port = process.env.PORT || 5000;

        this.initializeMiddlewares();
        this.initializeRoutes(routes);
        this.initializeErrorHandling();
    }

    initializeMiddlewares() {
        this.expressApp.use(helmet());
        this.expressApp.use(cors({
            origin: [process.env.CLIENT_URL, 'http://localhost:5173', /vercel\.app$/].filter(Boolean),
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));
        this.expressApp.use(express.json());
        this.expressApp.use(express.urlencoded({ extended: true}));
        // this.expressApp.use(limiter);
    }

    initializeRoutes(routes){
        routes.forEach((route) => {
            this.expressApp.use('/api', route.router);
        });
    }

    initializeErrorHandling() {
        this.expressApp.use(errorMiddleware);
    }

    listen(){
        this.expressApp.listen(this.port, () => {
            console.log(`Echo Time Server running on port ${this.port}`);
        });
    }
}

