# Kanban Board Backend

RESTful API backend for the Kanban board application built with Express and TypeScript.

## Features

- User authentication with JWT
- Board management
- Column CRUD operations
- Card CRUD operations with position tracking
- MongoDB integration
- Error handling middleware
- Input validation

## Tech Stack

- Node.js
- Express
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- Express Validator

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in .env:
```
PORT=5000
MONGODB_URL=mongodb://localhost:27017/kanban
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/profile` - Get user profile

### Board
- GET `/api/boards` - Get user's board
- POST `/api/boards` - Update board name

### Columns
- POST `/api/columns` - Create new column
- PUT `/api/columns/:id` - Update column
- DELETE `/api/columns/:id` - Delete column

### Cards
- POST `/api/cards` - Create new card
- PUT `/api/cards/:id` - Update card
- DELETE `/api/cards/:id` - Delete card
- PUT `/api/cards/:id/move` - Move card position

## Project Structure

```
src/
├── config/      # Configuration files
├── middleware/  # Express middleware
├── models/      # Mongoose models
├── routes/      # API routes
└── utils/       # Utility functions
```

## Error Handling

The application includes centralized error handling for:
- Validation errors
- JWT authentication errors
- MongoDB errors
- Generic server errors

## Testing

The project uses Jest and Supertest for API testing. Tests cover all major endpoints and functionalities including authentication, board management, and card operations.

### Test Structure

```
__tests__/
├── auth.test.ts     # Authentication endpoints tests
├── board.test.ts    # Board management tests
├── card.test.ts     # Card operations tests
├── setup.ts         # Test environment setup
├── setupEnv.ts      # Environment variables for testing
└── testUtils.ts     # Shared testing utilities
```

### Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate test coverage report:
```bash
npm run test:coverage
```

### Test Coverage

Tests cover the following areas:
- User registration and authentication
- Board creation and retrieval
- Column management
- Card operations
- Error handling and validation
- Authorization middleware

### Writing Tests

Example of writing a test:
```typescript
describe('Feature', () => {
  it('should perform specific action', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .set('Authorization', `Bearer ${token}`)
      .send(data);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('expectedProperty');
  });
});
```

### Environment Setup

Tests use:
- MongoDB Memory Server for database testing
- JWT for authentication
- Supertest for HTTP assertions



## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Open a Pull Request
