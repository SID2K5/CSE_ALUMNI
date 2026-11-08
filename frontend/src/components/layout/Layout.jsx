import Navbar from "./Navbar";
import Topbar from "./Topbar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#B8FFFF] dark:bg-[#020617] overflow-x-hidden">

      {/* TOPBAR */}
      <Topbar />

      {/* MAIN WRAPPER */}
      <div className="flex w-full">

        {/* SIDEBAR SPACE */}
        <div className="hidden md:block w-[240px] shrink-0">
          <Navbar />
        </div>

        {/* MAIN CONTENT */}
        <main
          className="
            flex-1
            pt-20
            px-4
            md:px-6
            lg:px-8
            w-full
            overflow-x-hidden
          "
        >
          <div className="w-full max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
};

export default Layout;