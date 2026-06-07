import { useChatStore } from '../store/useChatStore';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import ChatArea from '../components/chat/ChatArea';
import NoChatSelected from '../components/chat/NoChatSelected';

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className={`${selectedUser ? 'h-[100dvh]' : 'h-[calc(100dvh-4rem)]'} lg:h-[100dvh] bg-background flex flex-col pt-16`}>
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <div className={`h-full w-full lg:w-80 ${selectedUser ? 'hidden lg:block' : 'block'}`}>
          <Sidebar />
        </div>
        
        <main className={`flex-1 h-full w-full flex-col overflow-hidden relative ${!selectedUser ? 'hidden lg:flex' : 'flex'}`}>
          {!selectedUser ? <NoChatSelected /> : <ChatArea />}
        </main>
      </div>
    </div>
  );
};

export default HomePage;
