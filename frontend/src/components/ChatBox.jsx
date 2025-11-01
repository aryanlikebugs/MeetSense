import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X } from 'lucide-react';
import { useMeeting } from '../hooks/useMeeting';
import { formatTime } from '../utils/formatDate';

const ChatBox = ({ isOpen, onClose }) => {
  const { chatMessages, sendMessage } = useMeeting();
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-40 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-primary">
            <h3 className="text-lg font-bold text-white">Meeting Chat</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p>No messages yet</p>
                <p className="text-sm mt-1">Start the conversation!</p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${
                    msg.senderId === 'current-user' ? 'ml-auto' : ''
                  } max-w-[80%]`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      msg.senderId === 'current-user'
                        ? 'bg-gradient-primary text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-xs font-medium mb-1 opacity-80">
                      {msg.senderName}
                    </p>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 px-2">
                    {formatTime(msg.timestamp)}
                  </p>
                </motion.div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="p-3 btn-gradient rounded-xl disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatBox;
