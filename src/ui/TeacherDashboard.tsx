import React, { useRef, useState } from "react";
import "./App.css";
import type { AuthPayload } from "./Authentication/AuthScreen";
import { createTest, getTestQuestions, uploadQuestions } from "./services/api";

interface TeacherDashboardProps {
  auth: AuthPayload;
  onLogout: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  auth,
  onLogout,
}) => {
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<
    "create" | "view" | "upload" | null
  >(null);
  const [viewTestId, setViewTestId] = useState("");
  const [questionsPreview, setQuestionsPreview] = useState<unknown>(null);
  const [latestTestId, setLatestTestId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCreateTest = async () => {
    if (!auth.password) {
      setActionMessage("Password required to create a test.");
      return;
    }

    setLoadingAction("create");
    setActionMessage(null);

    try {
      const response = await createTest(auth.userId, auth.password);
      setActionMessage(`New test created: ${response.testId}`);
      setLatestTestId(response.testId);
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : "Failed to create test"
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUploadQuestions = async () => {
    if (!latestTestId) {
      setActionMessage("Create a test before uploading questions.");
      return;
    }

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setActionMessage("Select a PDF to upload.");
      return;
    }

    setLoadingAction("upload");
    setActionMessage(null);

    try {
      const response = await uploadQuestions(latestTestId, file);
      setActionMessage(response.msg);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : "Failed to upload questions"
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleViewMarks = async () => {
    if (!viewTestId) {
      setActionMessage("Enter a test ID to view marks.");
      return;
    }

    setLoadingAction("view");
    setActionMessage(null);

    try {
      const questions = await getTestQuestions(viewTestId);
      setQuestionsPreview(questions);
      setActionMessage(`Loaded data for ${viewTestId}`);
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : "Unable to load test data"
      );
    } finally {
      setLoadingAction(null);
    }
  };

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
          <p>Generate a new test entry for your students.</p>
          <button
            className="teacher-card__action"
            onClick={handleCreateTest}
            disabled={loadingAction === "create"}
          >
            {loadingAction === "create" ? "Creating..." : "Create Test"}
          </button>

          {latestTestId && (
            <div className="teacher-upload">
              <p className="header-label">
                Upload questions for {latestTestId}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="teacher-card__input"
              />
              <button
                className="teacher-card__action"
                onClick={handleUploadQuestions}
                disabled={loadingAction === "upload"}
              >
                {loadingAction === "upload" ? "Uploading..." : "Upload PDF"}
              </button>
            </div>
          )}
        </div>

        <div className="teacher-card">
          <h3>Previous Marks</h3>
          <p>Load the JSON questions for any past test.</p>
          <input
            className="teacher-card__input"
            value={viewTestId}
            onChange={(event) => setViewTestId(event.target.value)}
            placeholder="Test ID"
          />
          <button
            className="teacher-card__action"
            onClick={handleViewMarks}
            disabled={loadingAction === "view"}
          >
            {loadingAction === "view" ? "Fetching..." : "View Marks"}
          </button>
        </div>
      </div>

      {actionMessage && (
        <p className="teacher-dashboard__status">{actionMessage}</p>
      )}

      {questionsPreview !== null && (
        <pre className="teacher-dashboard__preview">
          {JSON.stringify(questionsPreview, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default TeacherDashboard;
