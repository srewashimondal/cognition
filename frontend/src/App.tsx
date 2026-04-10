// import { useState } from 'react'
import { useEffect } from 'react';
import { Toaster } from "react-hot-toast";
import { Routes, Route } from 'react-router-dom';
import './App.css';
import { getInterfacePrefs, applyInterfacePrefs } from './utils/interfacePrefs';
import HomePage from './pages/HomePage/HomePage.tsx';
import EmployeeDashBoard from './pages/EmployeeDashBoard/EmployeeDashBoard.tsx';
import EmployerDashBoard from './pages/EmployerDashBoard/EmployerDashBoard.tsx';
import Login from './pages/auth/Login/Login.tsx';
import Signup from './pages/auth/Signup/Signup.tsx';
import EmployerOnboarding from './pages/EmployerDashBoard/Onboarding/EmployerOnboarding.tsx';
import EmployeeOnboarding from './pages/EmployeeDashBoard/Onboarding/EmployeeOnboarding.tsx';

function App() {
  useEffect(() => {
    applyInterfacePrefs(getInterfacePrefs());
  }, []);

  return (
    <>
       <Toaster position="bottom-right" />
      <Routes>
        <Route path='/' element={<HomePage />}/>
        <Route path='/employer/*' element={<EmployerDashBoard/>}/>
        <Route path='/employee/*' element={<EmployeeDashBoard/>}/>
        <Route path='/login/*' element={<Login />}/>
        <Route path='/signup/*' element={<Signup role="employee"/>}/>
        <Route path='/signup/employee' element={<Signup role="employee"/>}/>
        <Route path='/signup/employer' element={<Signup role="employer"/>}/>
        <Route path='/join/employer' element={<EmployerOnboarding />} />
        <Route path='/join/employee' element={<EmployeeOnboarding />} />
      </Routes>
    </>
  )
}

export default App
