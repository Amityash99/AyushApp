import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Login from './components/pages/Login';
import Dashboard from './components/pages/Dashboard';
import Construction from './components/pages/Construction';
import HR from './components/pages/HR';
import Attendance from './components/pages/Attendance';
import Movement from './components/pages/Movement';
import HerbalGarden from './components/pages/HerbalGarden';
import HerbalGardenMaintenance from './components/pages/HerbalGardenMaintenance';
import Programme from './components/pages/Programme';
import YogaInstructor from './components/pages/YogaInstructor';
import YogaSession from './components/pages/YogaSession';
import NAMReporting from './components/pages/NAMReporting';
import IECBranding from './components/pages/IECBranding';
import NCDSurvey from './components/pages/NCDSurvey';
import Inspection from './components/pages/Inspection';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
                <Header />
                <div className="d-flex flex-grow-1">
                  <div className="sidebar" style={{ width: '250px' }}>
                    <Sidebar />
                  </div>
                  <main className="flex-grow-1 p-4">
                    <Container fluid>
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/construction" element={<Construction />} />
                        <Route path="/hr" element={<HR />} />
                        <Route path="/attendance" element={<Attendance />} />
                        <Route path="/movement" element={<Movement />} />
                        <Route path="/garden" element={<HerbalGarden />} />
                        <Route path="/garden-maintenance" element={<HerbalGardenMaintenance />} />
                        <Route path="/programme" element={<Programme />} />
                        <Route path="/yoga-instructor" element={<YogaInstructor />} />
                        <Route path="/yoga-session" element={<YogaSession />} />
                        <Route path="/reporting" element={<NAMReporting />} />
                        <Route path="/iec" element={<IECBranding />} />
                        <Route path="/ncd" element={<NCDSurvey />} />
                        <Route path="/inspection" element={<Inspection />} />
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                      </Routes>
                    </Container>
                  </main>
                </div>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

