import { MessageSquare, User } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const { authUser } = useAuthStore();
  const { selectedUser } = useChatStore();
  const location = useLocation();

  // Hide bottom nav if not logged in, or if we are actively in a chat on mobile
  if (!authUser || (selectedUser && location.pathname === '/')) return null;

  return (
    <div className="fixed bottom-0 w-full bg-cards border-t border-borders lg:hidden z-50 pb-safe">
      <div className="flex justify-around items-center h-16">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/' ? 'text-primary' : 'text-muted hover:text-text-secondary'}`}
        >
          <MessageSquare className="w-6 h-6" />
          <span className="text-xs font-medium">Chats</span>
        </Link>
        <Link 
          to="/profile" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/profile' ? 'text-primary' : 'text-muted hover:text-text-secondary'}`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNav;
