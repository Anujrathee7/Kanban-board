"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationError = void 0;
const express_validator_1 = require("express-validator");
const handleValidationError = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            message: "Validation errors",
            errors: errors.array()
        });
        return;
    }
    next();
};
exports.handleValidationError = handleValidationError;
