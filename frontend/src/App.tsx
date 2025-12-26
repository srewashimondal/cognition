// import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage/HomePage.tsx';
import EmployeeDashBoard from './pages/EmployeeDashBoard/EmployeeDashBoard.tsx';
import EmployerDashBoard from './pages/EmployerDashBoard/EmployerDashBoard.tsx';

function App() {
  return (
    <Routes>
      <Route path='/' element={<HomePage />}/>
      <Route path='/EmployerDashBoard' element={<EmployerDashBoard/>}/>
      <Route path='/EmployeeDashBoard' element={<EmployeeDashBoard/>}/>
    </Routes>
  )
}

export default App
