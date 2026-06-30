import { Link, useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const ADMIN_TOOLS = [
  {
    title: "Claim Review",
    path: "/admin/claims",
    desc: "Approve or reject incoming patch / wiki URL claims.",
    badge: "patch_claims",
  },
  {
    title: "Wiki Edit Review",
    path: "/admin/wiki",
    desc: "Publish or reject pending wiki article edits.",
    badge: "wiki_edits",
  },
  {
    title: "Users & Roles",
    path: "/admin/users",
    desc: "Toggle admin and trusted roles for any user.",
    badge: "user_roles",
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { loading, session, isAdmin } = useAdmin();

  useEffect(() => {
    if (!loading && (!session || !isAdmin)) {
      navigate("/admin/login", { replace: true });
    }
  }, [loading, session, isAdmin, navigate]);

  if (loading || (!isAdmin && session)) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto max-w-3xl px-4 py-12 mono text-sm text-muted-foreground">
          Checking access…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="flex items-center justify-between">
          <Link to="/" className="mono text-xs text-muted-foreground hover:text-foreground">
            &lt; soundemote
          </Link>
          <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
            Sign out
          </Button>
        </div>

        <h1 className="display mt-4 text-2xl">Admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          One landing page. Bookmark just <span className="mono">/admin</span>.
        </p>

        <div className="mt-8 grid gap-4">
          {ADMIN_TOOLS.map((tool) => (
            <Link
              key={tool.path}
              to={tool.path}
              className="group rounded border border-border p-4 transition hover:border-foreground/30 hover:bg-accent/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="mono text-lg group-hover:text-foreground">{tool.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{tool.desc}</p>
                </div>
                <span className="mono text-xs text-muted-foreground">{tool.badge}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-xs text-muted-foreground mono">
          <p>Direct links:</p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            <Link to="/admin/claims" className="hover:text-foreground">/admin/claims</Link>
            <Link to="/admin/wiki" className="hover:text-foreground">/admin/wiki</Link>
            <Link to="/admin/users" className="hover:text-foreground">/admin/users</Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;
