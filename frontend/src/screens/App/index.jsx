/**
 * App/index.jsx    Ahmed Al Sunbati
 * CS61       Spring 26
 * Description: Defines application routes and matches them to the corresponding screens using react router.
 * 
 * 
 * AI-Usage citation: We used figma make to design the UI layouts and then we used figma mcp to implement the interface
 *                    but not the wiring for the backend data. That was implemented separately.
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import Auth from '../Auth/index.jsx';
import Events from '../Events/index.jsx';
import Clubs from '../Clubs/index.jsx';
import ClubDetail from '../ClubDetail/index.jsx';
import ManageClub from '../ManageClub/index.jsx';
import Profile from '../Profile/index.jsx';
import AdminDashboard from '../AdminDashboard/index.jsx';
import ManageClubs from '../ManageClubs/index.jsx';
import ManageLocations from '../ManageLocations/index.jsx';
import ManageStudents from '../ManageStudents/index.jsx';
import AppLayout from '../../components/layout/AppLayout.jsx';
import RequireAuth from '../../components/auth/RequireAuth.jsx';
import RequireAdmin from '../../components/auth/RequireAdmin.jsx';
import { ROUTES } from '../../constants/routes.js';

export default function App() {
  return (
    <div className="app">
      <ToastContainer />
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Auth />} />
        <Route element={<RequireAuth />}>
          <Route path={ROUTES.HOME} element={<AppLayout />}>
            <Route index element={<Navigate to={ROUTES.EVENTS} replace />} />
            <Route path={ROUTES.EVENTS} element={<Events />} />
            <Route path={ROUTES.CLUBS} element={<Clubs />} />
            <Route path={ROUTES.CLUB_DETAIL} element={<ClubDetail />} />
            <Route path={ROUTES.MANAGE_CLUB} element={<ManageClub />} />
            <Route path={ROUTES.PROFILE} element={<Profile />} />
            <Route element={<RequireAdmin />}>
              <Route path={ROUTES.ADMIN} element={<AdminDashboard />} />
              <Route path={ROUTES.ADMIN_CLUBS} element={<ManageClubs />} />
              <Route path={ROUTES.ADMIN_LOCATIONS} element={<ManageLocations />} />
              <Route path={ROUTES.ADMIN_STUDENTS} element={<ManageStudents />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </div>
  );
}
