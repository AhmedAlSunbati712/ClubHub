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
import AppLayout from '../../components/layout/AppLayout.jsx';
import { ROUTES } from '../../constants/routes.js';

export default function App() {
  return (
    <div className="app">
      <ToastContainer />
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Auth />} />
        <Route path={ROUTES.HOME} element={<AppLayout />}>
          <Route index element={<Navigate to={ROUTES.EVENTS} replace />} />
          <Route path={ROUTES.EVENTS} element={<Events />} />
          <Route path={ROUTES.CLUBS} element={<Clubs />} />
          <Route path={ROUTES.CLUB_DETAIL} element={<ClubDetail />} />
          <Route path={ROUTES.MANAGE_CLUB} element={<ManageClub />} />
          <Route path={ROUTES.PROFILE} element={<Profile />} />
          <Route path={ROUTES.ADMIN} element={<AdminDashboard />} />
          <Route path={ROUTES.ADMIN_CLUBS} element={<ManageClubs />} />
          <Route path={ROUTES.ADMIN_LOCATIONS} element={<ManageLocations />} />
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.EVENTS} replace />} />
      </Routes>
    </div>
  );
}
