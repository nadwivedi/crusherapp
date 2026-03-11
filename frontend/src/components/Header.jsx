import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user?.name
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-4 pt-16 md:px-8 md:py-4 md:pt-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Crusher</h2>
          <p className="text-gray-600 text-sm">Welcome back!</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-gray-800 font-medium">{user?.name}</p>
            <p className="text-gray-600 text-sm">
              {user?.district}, {user?.state}
            </p>
          </div>

          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
            {initials || 'U'}
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
