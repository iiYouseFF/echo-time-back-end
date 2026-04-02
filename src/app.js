import express from "express";
import cors from 'cors';
import helmet from "helmet";
import { errorMiddleware } from './middlewares/error.middleware.js';

export class App {
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
            origin: [process.env.CLIENT_URL, 'http://localhost:5173', /vercel\.app$/].filter(Boolean),
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true}));
        // this.app.use(limiter);
    }

    initializeRoutes(routes){
        routes.forEach((route) => {
            this.app.use('/api', route.router);
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

