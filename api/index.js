// api/index.js
import 'dotenv/config';
import express from 'express';
import { App } from '../src/app.js';

import TaskRoutes from '../src/modules/tasks/task.route.js';
import UserRoutes from '../src/modules/user/user.routes.js';
import ChatRoutes from '../src/modules/chat/chat.routes.js';

let serverInstance;

const initializeApp = () => {
    try {
        const appModule = new App([
            new TaskRoutes(),
            new UserRoutes(),
            new ChatRoutes()
        ]);

        const app = appModule.expressApp; 

        app.get('/api/health', (req, res) => {
            res.json({
                status: 'online',
                platform: 'Vercel Serverless',
                timestamp: new Date().toISOString(),
                node_env: process.env.NODE_ENV
            });
        });

        return app;
    } catch (error) {
        console.error('❌ Fatal Initialization Error:', error);
        
        const fallbackApp = express();
        fallbackApp.use((req, res) => {
            res.status(500).json({
                error: 'Server failed to start',
                details: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
            });
        });
        return fallbackApp;
    }
};

if (!serverInstance) {
    serverInstance = initializeApp();
}

export default serverInstance;