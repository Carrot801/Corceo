# Corceo

Corceo is a web application for creating interactive data visualizations and data-driven stories from CSV and XLSX files.

The application allows users to import tabular data, edit datasets, configure interactive charts, organize projects, create presentation-style stories, add annotations, export charts as PNG images, and publish charts or stories through public links.

## Main Features

- User registration and authentication
- JWT-based authorization
- CSV import
- XLSX import
- Editable datasets
- Automatic field type detection
- Multiple chart types
- Data aggregation
- Sorting and filtering
- Ranking and Top N
- Date grouping and date hierarchy
- Number formatting
- Conditional formatting
- Chart appearance customization
- Project management
- Folder management
- Story builder
- Multiple slides
- Slide annotations
- Chart positioning and resizing
- Public chart publishing
- Public story publishing
- PNG export
- Undo and redo for visualization changes

## Supported Visualizations

Corceo supports several visualization types, including:

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

### Backend

- Node.js
- Express.js

### Database

- PostgreSQL
- JSONB for flexible dataset storage

### Authentication

- JSON Web Tokens (JWT)
- bcrypt password hashing

## System Architecture

Corceo uses a client-server architecture.

```text
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