import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index.tsx";
import LearningLab from "./pages/LearningLab.tsx";
import CircleTestPage from "./pages/CircleTestPage.tsx";
import OscilloscopePage from "./pages/OscilloscopePage.tsx";
import ScopeScratchPage from "./pages/ScopeScratchPage.tsx";
import GradientCurvePage from "./pages/GradientCurvePage.tsx";
import SandboxPage from "./pages/SandboxPage.tsx";
import PatchArticlePage from "./pages/PatchArticlePage.tsx";
import EmbedPage from "./pages/EmbedPage.tsx";
import AVWResearch from "./pages/AVWResearch.tsx";
import SupabaseTest from "./pages/SupabaseTest.tsx";
import SharePage from "./pages/SharePage.tsx";
import WikiPage from "./pages/WikiPage.tsx";
import WikiArticlePage from "./pages/WikiArticlePage.tsx";
import ChangelogPage from "./pages/ChangelogPage.tsx";
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

      {/* HashRouter is now in main.tsx */}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/learning-lab" element={<LearningLab />} />
        <Route path="/circle-test" element={<CircleTestPage />} />
        <Route path="/oscilloscope" element={<OscilloscopePage />} />
        <Route path="/scope-scratch" element={<ScopeScratchPage />} />
        <Route path="/gradient-curve" element={<GradientCurvePage />} />
        <Route path="/simd" element={<Index featuredSlug="simd" />} />
        <Route path="/soemdsp-simd" element={<Navigate to="/simd" replace />} />
        <Route path="/last-clock" element={<Index featuredSlug="last-clock" />} />
        <Route path="/lastclock" element={<Index featuredSlug="last-clock" />} />
        <Route path="/soemdsp-last-clock" element={<Navigate to="/last-clock" replace />} />
        <Route path="/sandbox" element={<SandboxPage />} />
        <Route path="/embed" element={<EmbedPage />} />

        {/* Patch routes: front page, hero sandbox loads the named patch. */}
        <Route path="/reverb" element={<Index patchSlug="reverb" />} />
        <Route path="/silentlydreaming" element={<Index patchSlug="silently-dreaming" />} />
        <Route path="/shootingstar" element={<Index patchSlug="shootingstar" />} />

        {/* Legacy patch-article slugs -> front page (wiki pages kept as
            unreachable code in PatchArticlePage for now). */}
        <Route path="/analogbox" element={<Index />} />
        <Route path="/aliasingwars" element={<Index />} />
        <Route path="/sinewave" element={<Index />} />
        <Route path="/dsf" element={<Index />} />
        <Route path="/polyblep" element={<Index />} />
        <Route path="/surgeoscillator" element={<Index />} />
        <Route path="/phosphillator" element={<Index />} />
        <Route path="/rhythmandpitchgenerator" element={<Index featuredSlug="rhythmandpitchgenerator" />} />
        <Route path="/flowerchildfilter" element={<Index />} />
        <Route path="/robinschmidt" element={<Index />} />
        <Route path="/rsmet" element={<Index />} />

        {/* Featured articles */}
        <Route path="/soemdsp-sandbox" element={<Navigate to="/analogbox" replace />} />
        <Route path="/phosphor" element={<Index featuredSlug="phosphor" gradientHero />} />
        <Route path="/aliasing-wars" element={<Index featuredSlug="aliasing-wars" />} />
        <Route path="/analog-filters" element={<Index featuredSlug="analog-filters" />} />
        <Route path="/analogfilters" element={<Navigate to="/analog-filters" replace />} />
        <Route path="/efficient-patch-system" element={<Index featuredSlug="efficient-patch-system" />} />
        <Route path="/efficientpatchsystem" element={<Navigate to="/efficient-patch-system" replace />} />
        <Route path="/white-wire" element={<Index featuredSlug="white-wire" />} />
        <Route path="/whitewire" element={<Navigate to="/white-wire" replace />} />
        <Route path="/rhythm-and-pitch-generator" element={<Index featuredSlug="rhythmandpitchgenerator" />} />
        <Route path="/vactrols" element={<Index featuredSlug="vactrols" />} />
        <Route path="/jerobeam-modules" element={<Index featuredSlug="jerobeam-modules" />} />
        <Route path="/jerobeammodules" element={<Navigate to="/jerobeam-modules" replace />} />
        <Route path="/combustion" element={<Index featuredSlug="combustion" />} />
        <Route path="/synthwave-orchestra" element={<Index featuredSlug="synthwave-orchestra" />} />
        <Route path="/synthwaveorchestra" element={<Navigate to="/synthwave-orchestra" replace />} />

        <Route path="/sandbox/:patch" element={<SandboxPage />} />
        <Route path="/sandbox/:user/:bank/:patch" element={<SandboxPage />} />
        <Route path="/avw-research" element={<AVWResearch />} />
        <Route path="/supabase-test" element={<SupabaseTest />} />
        <Route path="/share/:slug" element={<SharePage />} />
        <Route path="/wiki" element={<WikiPage />} />
        <Route path="/wiki/:slug" element={<WikiArticlePage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/claims" element={<AdminClaims />} />
        <Route path="/admin/wiki" element={<AdminWikiEdits />} />
        <Route path="/admin/users" element={<AdminUsers />} />

        <Route path="/files" element={<FilesPage />} />
        <Route path="/:handle/files" element={<FilesPage />} />
        <Route path="/:handle/:bank/:patch" element={<UserPage />} />
        <Route path="/:handle/:bank" element={<UserPage />} />
        <Route path="/:handle" element={<UserPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
