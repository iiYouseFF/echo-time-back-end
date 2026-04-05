import express from "express";
import cors from 'cors';
import helmet from "helmet";
import { errorMiddleware } from './middlewares/error.middleware.js';

export class App {
    constructor(routes){
        this.expressApp = express();
        this.port = process.env.PORT || 5000;

        // Trust Railway's load balancer
        this.expressApp.set('trust proxy', 1);

        this.initializeMiddlewares();
        this.initializeRoutes(routes);
        this.initializeErrorHandling();
    }

    initializeMiddlewares() {
        this.expressApp.use(helmet());
        
        const corsOptions = {
            origin: (origin, callback) => {
                const whitelist = [
                    process.env.CLIENT_URL,
                    'https://echo-time-1.vercel.app',
                    'http://localhost:5173',
                    'http://localhost:3000'
                ].filter(Boolean);

                // Allow if in whitelist or if it's a vercel/railway preview URL
                if (!origin || whitelist.includes(origin) || /vercel\.app$/.test(origin) || /railway\.app$/.test(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        };

        this.expressApp.use(cors(corsOptions));
        this.expressApp.use(express.json());
        this.expressApp.use(express.urlencoded({ extended: true}));
        // this.expressApp.use(limiter);
    }

    initializeRoutes(routes){
        this.expressApp.get('/', (req, res) => {
            res.status(200).json({
                status: 'online',
                timestamp: new Date().toISOString(),
                node_env: process.env.NODE_ENV
            });
        });

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

