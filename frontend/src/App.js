import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import EvaluationPage from './pages/EvaluationPage';

const App = () => (
  <Router>
    <Navbar />
    <Routes>
      <Route path="/" element={<Navigate to="/tools/evaluation" replace />} />
      <Route path="/tools/evaluation" element={<EvaluationPage />} />
      <Route path="/contacts" element={<Navigate to="/tools/evaluation" replace />} />
    </Routes>
  </Router>
);

export default App;
