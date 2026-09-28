import { Helmet } from "react-helmet-async";

/**
 * soundemote.com home: one big logo, padding, nothing else.
 * Logo stays on the current host; it never links off the .com splash page.
 */
const LogoSplashPage = () => (
  <>
    <Helmet>
      <title>Soundemote</title>
      <meta name="description" content="Soundemote" />
      <link rel="icon" type="image/svg+xml" href="/favicon-com.svg?v=e97e76105648" />
      <link rel="apple-touch-icon" href="/favicon-com.svg?v=e97e76105648" />
      <link rel="shortcut icon" type="image/svg+xml" href="/favicon-com.svg?v=e97e76105648" />
      <meta name="theme-color" content="#000000" />
      <link rel="canonical" href="https://soundemote.com/" />
      <meta property="og:url" content="https://soundemote.com/" />
      <meta property="og:title" content="Soundemote" />
      <meta property="og:description" content="Soundemote" />
      <meta property="og:image" content="https://soundemote.com/favicon-com.svg" />
      <meta name="twitter:title" content="Soundemote" />
      <meta name="twitter:description" content="Soundemote" />
      <meta name="twitter:image" content="https://soundemote.com/favicon-com.svg" />
    </Helmet>
    <main
      className="box-border grid h-full w-full place-items-center bg-black p-[8vmin] sm:p-[10vmin]"
      style={{ height: "100dvh", minHeight: "100dvh", overflow: "hidden" }}
    >
      <a
        href="/"
        aria-label="Soundemote home"
        className="block h-[80vmin] w-[80vmin] max-h-full max-w-full outline-none focus-visible:ring-2 focus-visible:ring-[#9697ff]/70"
      >
        <img
          src="/soundemote-logo.svg"
          alt="Soundemote"
          className="h-full w-full object-contain select-none"
          draggable={false}
        />
      </a>
    </main>
  </>
);

export default LogoSplashPage;