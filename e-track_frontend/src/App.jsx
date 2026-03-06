import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import LandingPage from './pages/LandingPage'
import SignInPage from './pages/SignIn'
import SignUpPage from './pages/SignUp'
import DashboardPage from './pages/Dashboard';
import AuthWrapper from './pages/AuthWrapper';
import AdminPortal from './pages/AdminPortal';

const App = () => {
  return (
    <Routes>
      {/* Public routes accessible to everyone */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login/*" element={<SignInPage />} />
      <Route path="/signup/*" element={<SignUpPage />} />

      {/* Protected routes accessible only to signed-in users */}
      <Route
        path="/dashboard"
        element={
          <>
            <SignedIn>
              <DashboardPage />
            </SignedIn>
            <SignedOut>
              <Navigate to="/login" replace />
            </SignedOut>
          </>
        }
      />
      <Route
        path="/auth-callback"
        element={<SignedIn><AuthWrapper /></SignedIn>}
      />
      <Route
        path="/admin-portal"
        element={
          <>
            <SignedIn>
              <AdminPortal />
            </SignedIn>
            <SignedOut>
              <Navigate to="/login" replace />
            </SignedOut>
          </>
        }
      />
    </Routes>
  )
}

export default App
