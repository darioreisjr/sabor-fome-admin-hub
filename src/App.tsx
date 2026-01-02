import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import ProductForm from "@/pages/ProductForm";
import Categories from "@/pages/Categories";
import TagsPage from "@/pages/TagsPage";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/produtos" element={<Products />} />
                <Route path="/produtos/:id" element={<ProductForm />} />
                <Route path="/categorias" element={<Categories />} />
                <Route path="/tags" element={<TagsPage />} />
                <Route path="/configuracoes" element={<Settings />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
