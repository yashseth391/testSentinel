import { useEffect, useState } from "react";
import "./App.css";
import AuthScreen from "./Authentication/AuthScreen";
import type { AuthPayload } from "./Authentication/AuthScreen";
import CodeEditor from "./CodeEditor/CodeEditor";
import Questions from "./Questions/Questions";
import TeacherDashboard from "./TeacherDashboard";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import styles from "./styles.module.css";

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

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <p className="header-label">Logged in as</p>
          <p className="header-value">{auth.userId}</p>
          <p className="header-label">Test ID: {auth.testId}</p>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <section className="app-split">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={35} minSize={15} maxSize={70}>
            <Questions />
          </Panel>

          <PanelResizeHandle className={styles.verticalHandle}>
            <div className={styles.verticalLine}></div>
          </PanelResizeHandle>

          <Panel minSize={30}>
            <CodeEditor />
          </Panel>
        </PanelGroup>
      </section>
    </div>
  );
}

export default App;
