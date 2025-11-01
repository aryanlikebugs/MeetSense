import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MeetingProvider } from './context/MeetingContext';
import { UIProvider } from './context/UIContext';
import { SocketProvider } from './context/SocketContext';
import { router } from './router';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MeetingProvider>
          <UIProvider>
            <RouterProvider router={router} />
          </UIProvider>
        </MeetingProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
