import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../services/axios';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  typingUsers: [],

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get('/messages/users');
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching users');
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
      // After getting messages, mark them as read if they were sent by the other user
      get().markMessagesAsRead(userId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching messages');
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  markMessagesAsRead: async (userId) => {
    try {
      await axiosInstance.put(`/messages/read/${userId}`);
      // Update local messages state
      const { messages } = get();
      const updatedMessages = messages.map(msg => 
        msg.senderId === userId && !msg.read ? { ...msg, read: true } : msg
      );
      set({ messages: updatedMessages });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error sending message');
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on('newMessage', (newMessage) => {
      // only add message if it belongs to the current chat
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (isMessageSentFromSelectedUser) {
        set({ messages: [...get().messages, newMessage] });
        // Mark the new message as read if we are currently looking at the chat
        get().markMessagesAsRead(selectedUser._id);
      } else {
        // Here we could update the unread count in the sidebar
        get().getUsers(); // Refresh users list to get updated unread counts
      }
    });

    socket.on('messagesRead', ({ receiverId }) => {
      // If the other user read our messages, update them locally
      const { selectedUser, messages } = get();
      if (selectedUser && selectedUser._id === receiverId) {
        const updatedMessages = messages.map(msg => 
          msg.senderId === useAuthStore.getState().authUser._id && !msg.read ? { ...msg, read: true } : msg
        );
        set({ messages: updatedMessages });
      }
    });
  },

  subscribeToTypingEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on('userTyping', ({ senderId }) => {
      set(state => ({ typingUsers: [...new Set([...state.typingUsers, senderId])] }));
    });

    socket.on('userStoppedTyping', ({ senderId }) => {
      set(state => ({ typingUsers: state.typingUsers.filter(id => id !== senderId) }));
    });
  },

  unsubscribeFromTypingEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off('userTyping');
    socket.off('userStoppedTyping');
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    
    socket.off('newMessage');
    socket.off('messagesRead');
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
