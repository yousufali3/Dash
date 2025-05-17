import React, { useContext } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import { AuthContext } from '../AuthContext';
import Tournaments from './components/Tournaments';
import Payment from './components/Payment';

const App = () => {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <Router>
      {isLoggedIn && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? <Navigate to="/dashboard/tournaments" /> : <Login />
          }
        />
        <Route
          path="/dashboard/tournaments"
          element={isLoggedIn ? <Tournaments /> : <Navigate to="/" />}
        />
        <Route
          path="/dashboard/payment"
          element={isLoggedIn ? <Payment /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
