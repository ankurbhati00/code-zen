import React from "react";
import { useTheme } from "@/components/theme-provider";
import { Moon, Rocket, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  return (
    <header className="border-b border-border bg-background">
      <div className=" px-4 h-14 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <Rocket className="h-5 w-5 text-primary" />
          <span className="text-lg font-medium text-foreground">
            Code Zen
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className=" p-3 rounded-xl  transition-all duration-300 group bg-card border-0 outline-0"
          >
            {theme === "dark" ? (
              <Sun className="w-6 h-6  text-muted-foreground fill-muted-foreground transform group-hover:rotate-180 transition-transform duration-500" />
            ) : (
              <Moon className="w-6 h-6  text-muted-foreground fill-muted-foreground transform group-hover:rotate-180 transition-transform duration-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
