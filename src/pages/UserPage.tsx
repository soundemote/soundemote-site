import { Link, Navigate, useParams } from "react-router-dom";

type UserPageParams = {
  handle?: string;
  bank?: string;
  patch?: string;
};

const UserPage = () => {
  const { handle = "", bank, patch } = useParams<UserPageParams>();

  // User space is reserved for @-prefixed handles only.
  if (!handle.startsWith("@")) {
    return <Navigate to="/" replace />;
  }

  const username = handle.slice(1);
  const label = patch
    ? `${handle} / ${bank} / ${patch}`
    : bank
      ? `${handle} / ${bank}`
      : handle;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Link to="/" className="mono text-xs text-muted-foreground hover:text-foreground">
          &lt; soundemote
        </Link>
        <h1 className="display mt-4 text-2xl">{label}</h1>
        <p className="mono mt-6 text-sm text-muted-foreground">
          {patch
            ? `Patch pages for @${username} are coming soon.`
            : bank
              ? `Bank pages for @${username} are coming soon.`
              : `Profile pages for @${username} are coming soon.`}
        </p>
      </div>
    </main>
  );
};

export default UserPage;