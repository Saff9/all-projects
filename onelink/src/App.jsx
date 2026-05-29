import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ClerkWrapper } from './contexts/ClerkProvider';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CheckEmail from './pages/CheckEmail';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Analytics from './pages/Analytics';
import Templates from './pages/Templates';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Privacy from './pages/Privacy';
import About from './pages/About';
import Terms from './pages/Terms';
import Contact from './pages/Contact';

// Components
import PrivateRoute from './components/router/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ClerkWrapper>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <Router>
            <Routes>
               {/* Public Routes */}
               <Route path="/" element={<Home />} />
               <Route path="/login/*" element={<Login />} />
               <Route path="/register/*" element={<Register />} />
               <Route path="/check-email" element={<CheckEmail />} />
               <Route path="/verify-email" element={<VerifyEmail />} />
               <Route path="/forgot-password" element={<ForgotPassword />} />
               <Route path="/privacy" element={<Privacy />} />
               <Route path="/about" element={<About />} />
               <Route path="/terms" element={<Terms />} />
               <Route path="/contact" element={<Contact />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard/*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/editor/*" element={<PrivateRoute><Editor /></PrivateRoute>} />
              <Route path="/analytics/*" element={<PrivateRoute><Analytics /></PrivateRoute>} />
              <Route path="/templates/*" element={<PrivateRoute><Templates /></PrivateRoute>} />
              <Route path="/settings/*" element={<PrivateRoute><Settings /></PrivateRoute>} />
              
              {/* Profile Routes */}
              <Route path="/u/:username" element={<Profile />} />
              <Route path="/@:username" element={<Profile />} />
              <Route path="/:username" element={<Profile />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </ErrorBoundary>
      </QueryClientProvider>
    </ClerkWrapper>
  );
}

export default App;

