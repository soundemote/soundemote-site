import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Helmet>
        <title>Page not found — Soundemote</title>
        <meta name="description" content="This Soundemote page doesn't exist. Head back to the home page to explore our audio-visual DSP projects, patches, and articles." />
        <link rel="canonical" href={`https://soundemote.io${location.pathname}`} />
        <meta name="robots" content="noindex, follow" />
        <meta property="og:title" content="Page not found — Soundemote" />
        <meta property="og:description" content="This Soundemote page doesn't exist." />
        <meta property="og:url" content={`https://soundemote.io${location.pathname}`} />
        <meta name="twitter:title" content="Page not found — Soundemote" />
        <meta name="twitter:description" content="This Soundemote page doesn't exist." />
      </Helmet>
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
