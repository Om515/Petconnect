import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../modules/user/components/Navbar';
import ScrollToTop from '../modules/user/components/ScrollToTop';

const UserLayout = () => {
  return (
    <div className="user-layout">
      <ScrollToTop />
      <Navbar />
      <Outlet />
    </div>
  );
};

export default UserLayout;
