import { useAuthContext } from '../context/authContext';

export const useAuth = () => {
  return useAuthContext();
};

export default useAuth;
