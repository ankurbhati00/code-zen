import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "./components/Header";
import LandingPage from "./components/landing";
import Workspace from "./components/workspace/Workspace";
import "./App.css";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="dream-page-theme">
      <WorkspaceProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1 flex flex-col items-center justify-center ">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/workspace" element={<Workspace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </WorkspaceProvider>
    </ThemeProvider>
  );
}

export default App;
