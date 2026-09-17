# Corceo

Corceo is a web application for creating interactive data visualizations and data-driven stories from CSV and XLSX files.

The application allows users to import and edit tabular data, create configurable visualizations, filter and group data, organize projects, build presentation-style data stories, add annotations, export charts as PNG images, and publish charts or stories through public links.

## Running the Application

### Requirements

- Node.js
- npm
- PostgreSQL

### Database

1. Create a PostgreSQL database named corceo_db.
2. Run the `database/schema.sql` file to create the required tables.

### Backend

1. Open the backend folder.
2. Install dependencies:

    npm install

3. Create a .env file in the backend folder with the following content:

    PORT=5000
    NODE_ENV=development
    DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/corceo_db
    JWT_SECRET=YOUR_JWT_SECRET
    CLIENT_URL=http://localhost:5173

5. Start the backend:

    npm run dev

### Frontend

1. Open a second terminal and go to the frontend folder:

    cd frontend/corceo

2. Install dependencies:

    npm install

3. Create a .env file in the frontend/corceo folder with:

    VITE_API_URL=http://localhost:5000

4. Start the frontend:
    npm run dev

### Open the Application

Open http://localhost:5173 in a web browser.

The backend and frontend must be running at the same time.

## Main Features

- User registration and authentication
- JWT-based authorization
- CSV and XLSX import
- Editable datasets
- Automatic field type detection
- Multiple chart types
- Data aggregation
- Sorting and filtering
- Date range filtering
- Time grouping by day, week, month, quarter, or year
- Ranking by highest or lowest values
- Number formatting
- Conditional formatting
- Chart appearance customization
- Project management
- Folder management
- Presentation builder
- Slide annotations
- Chart positioning and resizing
- Publishing charts and stories through public links
- PNG chart export
- PDF presentation export
- Undo and redo for visualization changes

## Supported Visualizations

Corceo supports the following visualization types:

- Bar chart
- Line chart
- Area chart
- Pie chart
- Donut chart
- Scatter plot
- Radar chart
- Heatmap
- Treemap
- Waterfall chart
- Composed chart

## Technologies

### Frontend

- React
- Vite
- JavaScript
- Tailwind CSS
- Recharts
- html-to-image
- html2canvas
- jsPDF

### Backend

- Node.js
- Express.js

### Database

- PostgreSQL
- JSONB for flexible storage of dataset rows and visualization configuration

### Authentication

- JSON Web Tokens (JWT)
- bcrypt password hashing

## System Architecture

Corceo uses a client-server architecture.

User
  |
  v
React Frontend
  |
  | REST API
  v
Node.js / Express Backend
  |
  | SQL
  v
PostgreSQL Database