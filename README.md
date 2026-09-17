# Corceo

Corceo is a web application for creating interactive data visualizations and data-driven stories from CSV and XLSX files.

The application allows users to import and edit tabular data, create configurable visualizations, filter and group data, organize projects, build presentation-style data stories, add annotations, export charts as PNG images, and publish charts or stories through public links.

## Running the Application

### Database

1. Open PostgreSQL in pgAdmin.
2. Create a database named `corceo_db`.
3. Select `corceo_db` and open Query Tool.
4. Open `database/schema.sql` and execute it.

### Backend

3. Open a terminal in the `backend` folder and run:

    npm install
    npm run dev

### Frontend

1. Open a second terminal in the `frontend/corceo` folder and run:

    npm install
    npm run dev

### Application

Open:

    http://localhost:5173


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