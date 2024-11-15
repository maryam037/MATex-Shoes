// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ShoeStore from './components/ShoeStore';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ShoeStore />} />
      </Routes>
    </Router>
  );
}

export default App;