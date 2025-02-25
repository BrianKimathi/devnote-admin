import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => (
  <div className="flex bg-gray-50 dark:bg-gray-800 min-h-screen">
    <Sidebar />
    <div className="flex-1">
      <Navbar />
      <main className="p-4">{children}</main>
    </div>
  </div>
);

export default Layout;
