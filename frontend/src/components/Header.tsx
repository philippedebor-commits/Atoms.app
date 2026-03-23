import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/api";
import { User, LogOut, FolderOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await client.auth.me();
        if (res?.data) setUser(res.data);
      } catch {
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async () => {
    await client.auth.toLogin();
  };

  const handleLogout = async () => {
    await client.auth.logout();
    setUser(null);
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[#E5E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/assets/logo-bl.png"
              alt="Belgian Lodges"
              className="h-10 group-hover:scale-105 transition-transform"
            />
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10 bg-[#2D5016]/10 hover:bg-[#2D5016]/20"
                  >
                    <User className="h-5 w-5 text-[#2D5016]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/mes-dossiers")}>
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Mes dossiers
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={handleLogin}
                className="bg-[#2D5016] hover:bg-[#4A7C2E] text-white rounded-xl px-6"
              >
                Connexion
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}