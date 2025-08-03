"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("./src/config/database");
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const morgan = require("morgan");
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./src/routes/auth"));
const board_1 = __importDefault(require("./src/routes/board"));
const column_1 = __importDefault(require("./src/routes/column"));
const card_1 = __importDefault(require("./src/routes/card"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
(0, database_1.connectDB)();
//Middleware
app.use(morgan('dev'));
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
//FOR PRODUCTION SPECIFY ALLOWED ORGINS
app.use((0, cors_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
//Routes
app.use('/api/auth', auth_1.default);
app.use('/api/boards', board_1.default);
app.use('/api/columns', column_1.default);
app.use('/api/cards', card_1.default);
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
exports.default = app;
