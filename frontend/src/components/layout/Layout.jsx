import Navbar from "./Navbar";
import Topbar from "./Topbar";
import MobileNav from "./MobileNav";

/* =====================================================
   APPLICATION SHELL
   Fixed dark sidebar (260px, desktop) + themed topbar +
   spacious content column. Mobile falls back to the
   bottom nav + drawer in MobileNav.
===================================================== */

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-bg text-ink overflow-x-hidden">
      {/* FIXED DARK SIDEBAR (desktop) */}
      <Navbar />

      {/* CONTENT COLUMN — offset by the sidebar on desktop */}
      <div className="md:pl-[260px]">
        <Topbar />

        <main
          className="
            w-full min-w-0
            pt-[72px]
            px-4 sm:px-6 lg:px-8
            pb-24 md:pb-10
          "
        >
          <div className="w-full max-w-shell mx-auto">{children}</div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <MobileNav />
    </div>
  );
};

export default Layout;
