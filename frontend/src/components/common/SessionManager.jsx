import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import useInactivityTimeout from '../../hooks/useInactivityTimeout';

const SessionManager = () => {
  const { user, logout } = useContext(AuthContext);

  // 30 minutes in milliseconds
  const INACTIVITY_LIMIT = 30 * 60 * 1000;

  useInactivityTimeout(
    INACTIVITY_LIMIT,
    () => {
      if (user) {
        console.log('User inactive for 30 minutes. Logging out...');
        logout();
        window.location.href = '/login?reason=inactivity';
      }
    }
  );

  return null; // This component doesn't render anything UI-wise
};

export default SessionManager;
