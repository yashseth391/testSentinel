import React from "react";
import "./App.css";
import type { AuthPayload } from "./Authentication/AuthScreen";

interface TeacherDashboardProps {
  auth: AuthPayload;
  onLogout: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  auth,
  onLogout,
}) => {
  return (
    <div className="teacher-dashboard">
      <div className="teacher-dashboard__header">
        <div>
          <p className="header-label">Teacher</p>
          <p className="header-value">{auth.userId}</p>
          <p className="header-label">Test ID: {auth.testId || "—"}</p>
        </div>
        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="teacher-dashboard__content">
        <div className="teacher-card">
          <h3>Create Test</h3>
          <p>Upload a new PDF and convert it into a student-friendly test.</p>
          <button className="teacher-card__action">Go to Creator</button>
        </div>

        <div className="teacher-card">
          <h3>Previous Marks</h3>
          <p>Review student submissions and export their marks.</p>
          <button className="teacher-card__action">View Marks</button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
