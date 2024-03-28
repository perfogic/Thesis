/* eslint-disable import/no-anonymous-default-export */
import Loader from 'components/Loader';
import NotFound from 'pages/NotFound';
import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import BitcoinDashboard from 'pages/BitcoinDashboard';
import Balance from 'pages/Balance';

export default () => (
  <Suspense
    fallback={
      <div
        style={{
          height: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Loader />
      </div>
    }
  >
    <Routes>
      <Route path="/bridge" element={<Balance/>} />
      <Route path="/bitcoin-dashboard" element={<BitcoinDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);
