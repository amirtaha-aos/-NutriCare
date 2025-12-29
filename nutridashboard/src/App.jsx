import { Toaster } from 'react-hot-toast';
import NutriCareDashboard from './pages/NutriCareDashboard';

function App() {
  return (
    <>
      <NutriCareDashboard />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
          }
        }}
      />
    </>
  );
}

export default App;
