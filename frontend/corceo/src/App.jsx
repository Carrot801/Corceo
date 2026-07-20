import { useState } from "react";
import Legend from "./custom/Legend";
import BasePage from "./components/BasePage";
import Projects from "./components/Projects";
import NewVisualization from "./pages/NewVisualization";
import PublishedChart from "./pages/PublishedChart";
import NewStory from "./pages/NewStory";
import PublishedStory from "./pages/PublishedStory";
import Register from "./pages/Register";
import AccountSettings from "./pages/AccountSettings";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";


import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

function ChartsPage() {
  const navigate = useNavigate();

  return (
    <div>
      <BasePage />  
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChartsPage />} />
        <Route path="/base" element={<BasePage/>} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account" 
        element={
            <ProtectedRoute>
              <AccountSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/new/:id"
          element={
            <ProtectedRoute>
              <NewVisualization />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stories/new/:storyId"
          element={
            <ProtectedRoute>
              <NewStory />
            </ProtectedRoute>
          }
        />        
        <Route path="/publishedStory/:storyId" element={<PublishedStory />} />
        <Route path="/NewVisualization/:id" element={<NewVisualization/>} />
        <Route path="/published/:chartId" element={<PublishedChart/>} />
        <Route path="/newStory/:storyId" element={<NewStory />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;