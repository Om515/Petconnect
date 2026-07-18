import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarAdmin from '../modules/admin/components/Navbar';

const AdminLayout = () => {
  return (
    <div className="admin-layout min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50">
      <NavbarAdmin />
      <Outlet />
    </div>
  );
};

export default AdminLayout;
