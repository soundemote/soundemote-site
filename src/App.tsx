import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import LearningLab from "./pages/LearningLab.tsx";
import CircleTestPage from "./pages/CircleTestPage.tsx";
import OscilloscopePage from "./pages/OscilloscopePage.tsx";
import ScopeScratchPage from "./pages/ScopeScratchPage.tsx";
import SandboxPage from "./pages/SandboxPage.tsx";
import AVWResearch from "./pages/AVWResearch.tsx";
import SupabaseTest from "./pages/SupabaseTest.tsx";
import SharePage from "./pages/SharePage.tsx";
import WikiPage from "./pages/WikiPage.tsx";
import WikiArticlePage from "./pages/WikiArticlePage.tsx";
import UserPage from "./pages/UserPage.tsx";
import FilesPage from "./pages/FilesPage.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import AdminClaims from "./pages/AdminClaims.tsx";
import AdminWikiEdits from "./pages/AdminWikiEdits.tsx";
import AdminUsers from "./pages/AdminUsers.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/learning-lab" element={<LearningLab />} />
          <Route path="/circle-test" element={<CircleTestPage />} />
          <Route path="/oscilloscope" element={<OscilloscopePage />} />
          <Route path="/scope-scratch" element={<ScopeScratchPage />} />
          <Route path="/sandbox" element={<SandboxPage />} />
          <Route path="/reverb" element={<SandboxPage staticPatchUrl="/patches/reverb.json" />} />
          <Route path="/shootingstar" element={<SandboxPage staticPatchUrl="/patches/shootingstar.json" />} />
          <Route path="/tweet" element={<SandboxPage staticPatchUrl="/patches/tweet.json" />} />
          <Route path="/sandbox/:patch" element={<SandboxPage />} />
          <Route path="/sandbox/:user/:bank/:patch" element={<SandboxPage />} />
          <Route path="/avw-research" element={<AVWResearch />} />
          <Route path="/supabase-test" element={<SupabaseTest />} />
          <Route path="/share/:slug" element={<SharePage />} />
          <Route path="/wiki" element={<WikiPage />} />
          <Route path="/wiki/:slug" element={<WikiArticlePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/claims" element={<AdminClaims />} />
          <Route path="/admin/wiki" element={<AdminWikiEdits />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          {/* @user space: profile/bank/patch pages */}
          <Route path="/files" element={<FilesPage />} />
          <Route path="/:handle/files" element={<FilesPage />} />
          <Route path="/:handle/:bank/:patch" element={<UserPage />} />
          <Route path="/:handle/:bank" element={<UserPage />} />
          <Route path="/:handle" element={<UserPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
