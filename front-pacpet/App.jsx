import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FeedingsDashboard from "./pages/FeedingsDashboard";
import Register from "./pages/Register";

function App() {
  const [user, setUser] = useState(null);

  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login onLogin={(user) => setUser(user)} />}
        />

        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/feedings"
          element={
            isAuthenticated ? (
              <FeedingsDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route 
          path="/register" 
          element={
          <Register />
          } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
