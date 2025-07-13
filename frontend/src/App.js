import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import EvaluationPage from './pages/EvaluationPage';
import ContactsPage from './pages/ContactsPage';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* По умолчанию перенаправляем на страницу оценки строений */}
        <Route path="/" element={<Navigate to="/tools/evaluation" />} />
        <Route path="/tools/evaluation" element={<EvaluationPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
