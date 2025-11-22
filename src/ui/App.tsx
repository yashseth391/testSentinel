import { useEffect, useState } from "react";
import "./App.css";
import AuthScreen from "./Authentication/AuthScreen";
import type { AuthPayload } from "./Authentication/AuthScreen";
import TeacherDashboard from "./TeacherDashboard";
import StudentWorkspace from "./StudentWorkspace";

const STORAGE_KEY = "testSentinelAuth";

const getStoredAuth = (): AuthPayload | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthPayload) : null;
  } catch (error) {
    console.error("Unable to read auth storage", error);
    return null;
  }
};

function App() {
  const [auth, setAuth] = useState<AuthPayload | null>(() => getStoredAuth());

  useEffect(() => {
    if (auth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [auth]);

  const handleLogin = (payload: AuthPayload) => {
    setAuth(payload);
  };

  const handleLogout = () => {
    setAuth(null);
  };

  if (!auth) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  if (auth.role === "teacher") {
    return <TeacherDashboard auth={auth} onLogout={handleLogout} />;
  }

  return <StudentWorkspace auth={auth} onLogout={handleLogout} />;
}

export default App;
