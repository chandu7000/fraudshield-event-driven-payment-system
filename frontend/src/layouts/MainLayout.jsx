import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function MainLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="hidden lg:block fixed left-0 top-0 h-screen w-72">
        <Sidebar />
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="absolute left-0 top-0 h-full w-72 bg-slate-950 flex flex-col">
            <div className="flex justify-end p-3 shrink-0">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-white bg-slate-800 p-2 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen lg:ml-72">
        <div className="sticky top-0 z-40">
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="bg-slate-900 text-white p-2 rounded-xl"
            >
              <Menu size={22} />
            </button>

            <h1 className="font-bold text-slate-900">FraudShield</h1>
          </div>

          <Navbar />
        </div>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;