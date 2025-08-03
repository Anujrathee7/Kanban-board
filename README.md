# Kanban Board Application
**By: Anuj Rathee (001715080)**

*Note: AI systems like ChatGPT and Claude were used for improving documentation flow and formatting, working with tailwind css, and helping with writing test cases for routes using jest. All code was written by  me and No AI-generated code has been presented as my own work.*

## Tech Stack
- **Frontend**: React with Tailwind CSS for responsive, utility-first styling
- **Backend**: Node.js & Express.js for lightweight API development
- **Database**: MongoDB for flexible, schema-less data storage
- **Auth**: JWT-based stateless authentication

## Installation Guide

### 1. Clone Repository
```bash
git clone <repository-url>
cd Project_Advanced_Web
```

### 2. Backend Setup
```bash
cd kanban-board-backend
cp .env.example .env  # Update with your values
npm install
npm start
```

### 3. Frontend Setup
```bash
cd kanban-board
npm install
npm run dev
```

### 4. Access
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## User Manual

### Authentication
- Register with name, email, and password
- Login using email and password

### Dashboard Features
- Manage columns (add/rename/delete)
- Create and manage cards
- Drag-and-drop card organization
- Secure logout

## Key Features

1. **Core Functionality**
- Full Kanban board implementation with React
- Drag-and-drop card reordering
- Double-click editing for board/card titles

2. **Enhanced User Experience**
- Card sorting and filtering
- Timestamps for card creation/updates
- Card descriptions with markdown support
- Framer Motion animations

3. **Technical Implementation**
- Express validator for request validation
- Centralized error handling
- Protected routes with JWT
- API service abstraction
- React Context for auth management

## Accessibility Testing

### Keyboard Navigation
- Tab, Enter, and Arrow key support
- Visible focus indicators
- *Current limitation*: Not fully mouse-independent

### Screen Reader Support
- Tested with Windows Narrator
- Readable labels and ARIA roles
- Basic navigation support

### Voice Commands
- Not currently implemented

## Environment Configuration
```env
PORT=5000
MONGODB_URL=mongodb://localhost:27017/kanban
JWT_SECRET=your_secret_key
NODE_ENV=development

I have added the env file to github. *Note: Never commit .env files in production environments*
```

** For detailed informatin refer to readme in the respective folder for front-end and back-end**

## Implemented Features

| Feature | Points |
|---------|---------|
| Basic features with well-written documentation | 25 |
| Utilization of React for front-end | 3 |
| Cards can be reordered with drag drop across columns and within same column | 4 |
| User can double click to edit board title, and task card title and description | 3 |
| User can sort task cards based on different sorting options | 4 |
| User can filter card based on the keyword they have searched | 3 |
| Test software for accessibility; keyboard/voice command and screen reader compatibility | 3 |
| Cards have visible timestamps for creation and updates	 | 3 |
| Middlware for Express validator for request validation, centralized error handling, and JWT authentication | 2 |
| API service abstraction in frontend (apiService.ts) | 1 |
| React Context Provider for global auth/token handling (authContext.tsx) | 1 |
| Framer motion for animations | 1 |
| Unit testing for routes using Jest (10 Test case) | 6 |
| **Total Points** | **59** |
