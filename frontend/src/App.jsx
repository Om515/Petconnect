import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes';
import { AuthData } from './context/AuthContext';

const App = () => {
  const { fetchCurrentUser } = AuthData();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <AppRoutes />
    </div>
  );
};

export default App;