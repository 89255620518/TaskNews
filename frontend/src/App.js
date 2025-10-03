import './App.css';
import { AuthProvider } from './useContext/AuthContext';
import { AppContent } from './component/AppComponent/AppContent';

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;