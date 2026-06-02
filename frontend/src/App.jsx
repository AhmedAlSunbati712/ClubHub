import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import ScrollToTop from './components/common/ScrollToTop.jsx';
import Toaster from './components/common/Toaster.jsx';

import Auth from './pages/Auth.jsx';
import Events from './pages/Events.jsx';
import Clubs from './pages/Clubs.jsx';
import ClubDetail from './pages/ClubDetail.jsx';
import ManageClub from './pages/ManageClub.jsx';
import Profile from './pages/Profile.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManageClubs from './pages/admin/ManageClubs.jsx';
import ManageLocations from './pages/admin/ManageLocations.jsx';

const STANDALONE = ['/login'];

export default function App() {
  const { pathname } = useLocation();
  const isStandalone = STANDALONE.includes(pathname);

  return (
    <div className="app">
      <ScrollToTop />
      {!isStandalone && <Navbar />}
      <main className="app-main">
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/" element={<Navigate to="/events" replace />} />
          <Route path="/events" element={<Events />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/clubs/:clubId" element={<ClubDetail />} />
          <Route path="/clubs/:clubId/manage" element={<ManageClub />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/clubs" element={<ManageClubs />} />
          <Route path="/admin/locations" element={<ManageLocations />} />
          <Route path="*" element={<Navigate to="/events" replace />} />
        </Routes>
      </main>
      {!isStandalone && <Footer />}
      <Toaster />
    </div>
  );
}
