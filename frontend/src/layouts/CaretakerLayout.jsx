import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../modules/caretaker/components/Navbar';
import ScrollToTop from '../modules/caretaker/components/ScrollToTop';

const CaretakerLayout = () => {
  return (
    <div className="caretaker-layout">
      <ScrollToTop />
      <Navbar />
      <Outlet />
    </div>
  );
};

export default CaretakerLayout;
