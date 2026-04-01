import 'dotenv/config';
import App from '../src/app.js';
import TaskRoutes from '../src/modules/tasks/task.route.js';
import UserRoutes from '../src/modules/user/user.routes.js';

console.info("Vercel Function starting: initializing App...");
const appInstance = new App([
    new TaskRoutes(),
    new UserRoutes()
]);

// Debug endpoint to verify server is alive independently of DB
appInstance.app.get('/api/debug', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        env: {
            NODE_ENV: process.env.NODE_ENV,
            HAS_SUPABASE_URL: !!process.env.SUPABASE_URL,
            HAS_SUPABASE_KEY: !!process.env.SUPABASE_KEY
        }
    });
});

console.info("App initialized, exporting handler.");
export default appInstance.app;
