"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    console.error('Error', error);
    // MongoDB validation error
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map((err) => err.message);
        res.status(400).json({
            message: 'Validation Error',
            errors
        });
        return;
    }
    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        res.status(401).json({ message: 'Invalid token' });
        return;
    }
    if (error.name === 'TokenExpiredError') {
        res.status(401).json({ message: 'Token expired' });
        return;
    }
    // Default server error
    res.status(500).json({
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
};
exports.errorHandler = errorHandler;
