import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUp, Menu, X } from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import westinLogo from "../assets/images/westin-logo.avif";
import { useAuth } from "../contexts/AuthContext";
import { getFixturePage, publicPageCopy } from "./content";
import { PUBLIC_CONTENT_MODE } from "./usePublicContent";
import "./skybook.css";

const navigation = [
  ["About", "/about"],
  ["Programs", "/programs"],
  ["Campus life", "/campus"],
  ["Placements", "/placements"],
  ["Contact", "/contact"],
];
const footerGroups = [
  {
    title: "The college",
    links: [
      ["About Westin", "/about"],
      ["Mission & vision", "/about/mission-vision"],
      ["Our management", "/about/management"],
      ["Why Westin", "/why-westin"],
      ["Partnerships", "/partners/bineid"],
    ],
  },
  {
    title: "Your possibilities",
    links: [
      ["Business management", "/programs/bba"],
      ["Hotel management", "/programs/hotel-management"],
      ["Intermediate", "/programs/intermediate"],
      ["Placements", "/placements"],
      ["Career planner", "/career-planner"],
    ],
  },
  {
    title: "The everyday",
    links: [
      ["Campus life", "/campus"],
      ["News & events", "/news"],
      ["Gallery", "/gallery"],
      ["Magazine", "/magazine"],
      ["Stories & voices", "/testimonials"],
      ["Contact & visits", "/contact"],
    ],
  },
];

export function PublicLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menu = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const page = getFixturePage(location.pathname);
  const home = location.pathname === "/";
  const title = home
    ? "Westin College, Vijayawada — Big dreams. Bright beginnings."
    : (page?.program?.title ??
        (page ? publicPageCopy[page.kind].title : "Page not found")) +
      " · Westin College";
  const description = home
    ? "Discover business, hospitality and a campus full of possibility. Explore Westin College, Vijayawada, and start your next chapter."
    : page
      ? publicPageCopy[page.kind].summary
      : "Explore Westin College, Vijayawada.";
  const canonicalOrigin = (
    import.meta.env.VITE_PUBLIC_SITE_ORIGIN ?? "https://www.westincolleges.com"
  ).replace(/\/+$/, "");
  const destination = isAuthenticated ? "/dashboard" : "/login";
  const loginLabel = isAuthenticated ? "Dashboard" : "Student login";

  useEffect(() => {
    // Keep the portal's static metadata for private routes, without duplicate
    // descriptions while the public layout supplies route-specific metadata.
    const fallback = document.getElementById("portal-default-description");
    fallback?.remove();
    return () => {
      if (fallback) document.head.prepend(fallback);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
    if (location.hash) {
      const frame = requestAnimationFrame(() =>
        document.getElementById(location.hash.slice(1))?.scrollIntoView(),
      );
      return () => cancelAnimationFrame(frame);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const dialog = menu.current;
    if (!dialog) return;
    if (!open) {
      if (dialog.open) dialog.close();
      return;
    }
    const previousOverflow = document.body.style.overflow;
    const returnFocus = trigger.current;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const controls = [
        ...dialog.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),[tabindex="0"]',
        ),
      ];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    dialog.addEventListener("keydown", trapFocus);
    const desktop = window.matchMedia("(min-width: 1200px)");
    const onDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", onDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      desktop.removeEventListener("change", onDesktop);
      dialog.removeEventListener("keydown", trapFocus);
      if (dialog.open) dialog.close();
      returnFocus?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <div className="skybook-site" id="page-top">
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <link
        rel="canonical"
        href={
          canonicalOrigin + (home ? "/" : location.pathname.replace(/\/+$/, ""))
        }
      />
      {PUBLIC_CONTENT_MODE === "fixture" && (
        <meta name="robots" content="noindex,nofollow" />
      )}
      <a className="sk-skip" href="#public-content">
        Skip to content
      </a>
      <header className="sk-header" data-scrolled={scrolled}>
        <div className="sk-container sk-header-inner">
          <Link to="/" className="sk-brand" aria-label="Westin College home">
            <img
              src={westinLogo}
              width="575"
              height="294"
              alt="Westin College"
            />
            <span>
              Vijayawada campus<span>Learn. Grow. Belong.</span>
            </span>
          </Link>
          <nav className="sk-desktop-nav" aria-label="Public website">
            {navigation.map(([label, to]) => (
              <NavLink key={to} to={to}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="sk-header-actions">
            <Link className="sk-login-link" to={destination}>
              {loginLabel}
            </Link>
            <Link className="sk-button sk-header-enquire" to="/contact">
              Enquire <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <button
            className="sk-menu-trigger"
            type="button"
            ref={trigger}
            aria-label="Open website menu"
            aria-expanded={open}
            aria-controls="public-mobile-menu"
            onClick={() => setOpen(true)}
          >
            <Menu size={24} aria-hidden="true" />
          </button>
        </div>
      </header>
      <dialog
        className="sk-menu"
        id="public-mobile-menu"
        ref={menu}
        aria-labelledby="mobile-menu-title"
        onCancel={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
      >
        <div className="sk-menu-panel">
          <div className="sk-menu-top">
            <span id="mobile-menu-title">Explore Westin</span>
            <button
              type="button"
              className="sk-menu-close"
              aria-label="Close website menu"
              onClick={() => setOpen(false)}
            >
              <X size={24} aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Mobile public website">
            {navigation.map(([label, to], index) => (
              <NavLink key={to} to={to} onClick={() => setOpen(false)}>
                <span>0{index + 1}</span>
                {label}
                <ArrowRight size={20} aria-hidden="true" />
              </NavLink>
            ))}
          </nav>
          <div className="sk-actions">
            <Link
              className="sk-button sk-button-outline"
              to={destination}
              onClick={() => setOpen(false)}
            >
              {loginLabel}
            </Link>
            <Link
              className="sk-button"
              to="/contact"
              onClick={() => setOpen(false)}
            >
              Enquire <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <p className="sk-menu-signature">Your next chapter starts here.</p>
        </div>
      </dialog>
      <main id="public-content" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="sk-footer">
        <div className="sk-container">
          <div className="sk-footer-top">
            <p>
              Good people.
              <br />
              <span>Bright possibilities.</span>
            </p>
            <a
              className="sk-back-top"
              href="#page-top"
              onClick={(event) => {
                event.preventDefault();
                window.scrollTo({
                  top: 0,
                  behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)",
                  ).matches
                    ? "instant"
                    : "smooth",
                });
                document
                  .getElementById("public-content")
                  ?.focus({ preventScroll: true });
              }}
            >
              Back to top <ArrowUp size={18} aria-hidden="true" />
            </a>
          </div>
          <div className="sk-footer-grid">
            <div className="sk-footer-brand">
              <Link to="/" aria-label="Westin College home">
                <img
                  src={westinLogo}
                  width="575"
                  height="294"
                  alt="Westin College"
                />
              </Link>
              <p>
                A little curiosity.
                <br />A whole world of possibility.
              </p>
              <span>Vijayawada, Andhra Pradesh</span>
              <Link to={destination} className="sk-text-link">
                {loginLabel} <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            {footerGroups.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2>{group.title}</h2>
                {group.links.map(([label, to]) => (
                  <Link key={to} to={to}>
                    {label}
                  </Link>
                ))}
              </nav>
            ))}
          </div>
          <div className="sk-footer-skyline" aria-hidden="true">
            <svg viewBox="0 0 1200 110" fill="none">
              <path
                d="M0 105h1200M100 104V61h100v43m-82-29h12v15h-12zm45 0h12v15h-12zM210 104V43h180v61M202 43l97-29 99 29H202Zm33 16h12v24h-12zm44 0h12v24h-12zm44 0h12v24h-12zm40 0h12v24h-12zM445 104V60h104v44m-115-44 64-34 63 34H434ZM490 104V78h16v26M670 104V39h160v65M660 39l90-32 90 32H660Zm30 17h14v30h-14zm41 0h14v30h-14zm40 0h14v30h-14zm40 0h14v30h-14zM905 104V57h119v47m-103-32h12v18h-12zm38 0h12v18h-12zm38 0h12v18h-12zM58 104V56m-1 21C10 77 34 26 57 36c21-25 54 35 0 41ZM604 104V58m0 19c-40 4-38-43-16-38 10-27 58 22 16 38ZM1083 104V52m0 27c-44 0-39-40-15-39 10-30 60 28 15 39Z"
                stroke="currentColor"
                strokeWidth="1.1"
              />
            </svg>
          </div>
          <div className="sk-footer-bottom">
            <span>
              © {new Date().getFullYear()} Westin College · Vijayawada
            </span>
            <span>Made for your next chapter.</span>
          </div>
          <p className="sk-art-disclosure">
            AI-generated scenes are illustrative, not photographs of Westin’s
            campus, students or facilities.
          </p>
          {PUBLIC_CONTENT_MODE === "fixture" && (
            <p className="sk-preview-note" role="note">
              <span aria-hidden="true" />
              Design preview · Local content and illustrative imagery · College
              approval required before publication.
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
