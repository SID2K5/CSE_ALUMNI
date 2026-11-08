import Navbar from "./Navbar";
import Topbar from "./Topbar";
import MobileNav from "./MobileNav";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-bg text-ink overflow-x-hidden">

      {/* TOP BAR */}
      <Topbar />

      {/* MAIN WRAPPER */}
      <div className="mx-auto flex w-full max-w-shell">

        {/* DESKTOP SIDEBAR (reserves space; nav itself is sticky) */}
        <aside className="hidden md:block w-[240px] shrink-0">
          <Navbar />
        </aside>

        {/* MAIN CONTENT */}
        <main
          className="
            flex-1
            w-full
            min-w-0
            pt-[72px] md:pt-20
            px-4 sm:px-6 lg:px-8
            pb-24 md:pb-10
          "
        >
          <div className="w-full mx-auto">
            {children}
          </div>
        </main>

      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <MobileNav />

    </div>
  );
};

export default Layout;
