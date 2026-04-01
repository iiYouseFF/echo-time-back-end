export const errorMiddleware = (error, req, res, next) => {
    try {
        const status = error.status || 500;
        const message = error.message || 'Something went wrong';

        console.error(`[Error] ${req.method} ${req.path} >> Status: ${status}, Message: ${message}`);

        res.status(status).json({
            success: false,
            status,
            message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : {}
        })
    } catch (err) {
        next(err);
    }
}