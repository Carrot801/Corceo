# Corceo

Corceo is a web application for creating interactive data visualizations and data-driven stories from CSV and XLSX files.

The application allows users to import and edit tabular data, create configurable visualizations, filter and group data, organize projects, build presentation-style data stories, add annotations, export charts as PNG images, and publish charts or stories through public links.

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
- Publisshing charts and stories through public links
- Public presentation publishing
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
- Funnel chart
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