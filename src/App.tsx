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
import FeaturedArticlePage from "./pages/FeaturedArticlePage.tsx";
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
        <Route path="/simd" element={<FeaturedArticlePage slug="simd" />} />
        <Route path="/soemdsp-simd" element={<Navigate to="/simd" replace />} />
        <Route path="/last-clock" element={<FeaturedArticlePage slug="last-clock" />} />
        <Route path="/lastclock" element={<Navigate to="/last-clock" replace />} />
        <Route path="/soemdsp-last-clock" element={<Navigate to="/last-clock" replace />} />
        <Route path="/sandbox" element={<SandboxPage />} />
        <Route path="/embed" element={<EmbedPage />} />
        <Route path="/reverb" element={<SandboxPage staticPatchUrl="/patches/silently-dreaming.json" autostart />} />
        <Route
          path="/silentlydreaming"
          element={<SandboxPage staticPatchUrl="/patches/silently-dreaming.json" autostart />}
        />
        <Route
          path="/shootingstar-live"
          element={<SandboxPage staticPatchUrl="/patches/shootingstar.json" autostart />}
        />

        {/* Wiki-style patch articles */}
        <Route path="/analogbox" element={<PatchArticlePage slug="analogbox" />} />
        <Route path="/aliasingwars" element={<PatchArticlePage slug="aliasingwars" />} />
        <Route path="/shootingstar" element={<PatchArticlePage slug="shootingstar" />} />
        <Route path="/sinewave" element={<PatchArticlePage slug="sinewave" />} />
        <Route path="/dsf" element={<PatchArticlePage slug="dsf" />} />
        <Route path="/polyblep" element={<PatchArticlePage slug="polyblep" />} />
        <Route path="/surgeoscillator" element={<PatchArticlePage slug="surgeoscillator" />} />
        <Route path="/phosphillator" element={<PatchArticlePage slug="phosphillator" />} />
        <Route path="/rhythmandpitchgenerator" element={<PatchArticlePage slug="rhythmandpitchgenerator" />} />
        <Route path="/flowerchildfilter" element={<PatchArticlePage slug="flowerchildfilter" />} />
        <Route path="/robinschmidt" element={<PatchArticlePage slug="robinschmidt" />} />
        <Route path="/rsmet" element={<PatchArticlePage slug="robinschmidt" />} />

        {/* Featured articles */}
        <Route path="/soemdsp-sandbox" element={<Navigate to="/analogbox" replace />} />
        <Route path="/phosphor" element={<FeaturedArticlePage slug="phosphor" />} />
        <Route path="/aliasing-wars" element={<FeaturedArticlePage slug="aliasing-wars" />} />
        <Route path="/analog-filters" element={<FeaturedArticlePage slug="analog-filters" />} />
        <Route path="/analogfilters" element={<Navigate to="/analog-filters" replace />} />
        <Route path="/efficient-patch-system" element={<FeaturedArticlePage slug="efficient-patch-system" />} />
        <Route path="/efficientpatchsystem" element={<Navigate to="/efficient-patch-system" replace />} />
        <Route path="/white-wire" element={<FeaturedArticlePage slug="white-wire" />} />
        <Route path="/whitewire" element={<Navigate to="/white-wire" replace />} />
        <Route path="/rhythm-and-pitch-generator" element={<FeaturedArticlePage slug="rhythmandpitchgenerator" />} />
        <Route path="/vactrols" element={<FeaturedArticlePage slug="vactrols" />} />
        <Route path="/jerobeam-modules" element={<FeaturedArticlePage slug="jerobeam-modules" />} />
        <Route path="/jerobeammodules" element={<Navigate to="/jerobeam-modules" replace />} />
        <Route path="/combustion" element={<FeaturedArticlePage slug="combustion" />} />
        <Route path="/synthwave-orchestra" element={<FeaturedArticlePage slug="synthwave-orchestra" />} />
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
