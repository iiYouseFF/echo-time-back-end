let app;

try {
    // Dynamic import to catch any initialization errors
    const dotenv = await import('dotenv/config');
    const { default: App } = await import('../src/app.js');
    const { default: TaskRoutes } = await import('../src/modules/tasks/task.route.js');
    const { default: UserRoutes } = await import('../src/modules/user/user.routes.js');

    console.info("All modules imported successfully");

    const appInstance = new App([
        new TaskRoutes(),
        new UserRoutes()
    ]);

    app = appInstance.app;

    // Debug endpoint
    app.get('/api/debug', (req, res) => {
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

    console.info("App initialized successfully");
} catch (error) {
    // If initialization fails, create a minimal express app that shows the error
    const express = (await import('express')).default;
    app = express();
    
    const errorMessage = error.stack || error.message || String(error);
    console.error("FATAL INITIALIZATION ERROR:", errorMessage);
    
    app.use((req, res) => {
        res.status(500).json({
            fatal: true,
            message: "Server failed to initialize",
            error: errorMessage
        });
    });
}

export default app;
