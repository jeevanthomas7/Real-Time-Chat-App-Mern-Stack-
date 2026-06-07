import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { LogOut, MessageSquare, User } from 'lucide-react';

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header className="bg-cards border-b border-borders fixed w-full top-0 z-40 backdrop-blur-lg bg-cards/90 shadow-sm">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <h1 className="text-xl font-black uppercase tracking-[0.2em] text-primary drop-shadow-sm">CHATIFY</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {authUser && (
              <>
                <Link to="/profile" className="flex items-center gap-2 hover:bg-borders p-2 rounded-lg transition-colors text-muted hover:text-text-main">
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button className="flex gap-2 items-center hover:bg-borders p-2 rounded-lg transition-colors text-danger cursor-pointer" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
