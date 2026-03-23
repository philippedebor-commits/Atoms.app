import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import AuthCallback from './pages/AuthCallback';
import AuthError from './pages/AuthError';
import Questionnaire from './pages/Questionnaire';
import PaymentSuccess from './pages/PaymentSuccess';
import MyDossiers from './pages/MyDossiers';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/error" element={<AuthError />} />
          <Route path="/questionnaire" element={<Questionnaire />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/mes-dossiers" element={<MyDossiers />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;