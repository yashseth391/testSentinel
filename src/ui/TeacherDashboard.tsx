import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import type { AuthPayload } from "./Authentication/AuthScreen";
import {
  createTest,
  getTestQuestions,
  uploadQuestions,
  getTeacherTests,
  type TeacherTest,
} from "./services/api";

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
  const [allTests, setAllTests] = useState<TeacherTest[]>([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch all tests for this teacher on mount
  useEffect(() => {
    const fetchTests = async () => {
      setLoadingTests(true);
      try {
        const response = await getTeacherTests(auth.userId);
        setAllTests(response.tests);
        // Set the latest test as the default
        if (response.tests.length > 0) {
          setLatestTestId(response.tests[0].testId);
        }
      } catch (err) {
        console.error("Failed to fetch tests:", err);
      } finally {
        setLoadingTests(false);
      }
    };

    fetchTests();
  }, [auth.userId]);

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
      // Refresh the tests list
      const testsResponse = await getTeacherTests(auth.userId);
      setAllTests(testsResponse.tests);
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
      {/* Header */}
      <div className="teacher-dashboard__header">
        <div className="teacher-dashboard__header-left">
          <div className="teacher-dashboard__icon">👨‍🏫</div>
          <div>
            <p className="header-label">Teacher Portal</p>
            <p className="header-value">
              <span
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "#ffffff",
                }}
              >
                {auth.userId}
              </span>
            </p>
          </div>
        </div>
        <button className="logout-button" onClick={onLogout}>
          <span>🚪</span> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="teacher-dashboard__main">
        {/* Stats Cards */}
        <div className="teacher-dashboard__stats">
          <div className="teacher-stat-card">
            <div className="teacher-stat-card__icon">📝</div>
            <div className="teacher-stat-card__content">
              <p className="teacher-stat-card__label">Total Tests</p>
              <p className="teacher-stat-card__value">
                {loadingTests ? "..." : allTests.length}
              </p>
            </div>
          </div>
          <div className="teacher-stat-card">
            <div className="teacher-stat-card__icon">🎯</div>
            <div className="teacher-stat-card__content">
              <p className="teacher-stat-card__label">Latest Test ID</p>
              <p className="teacher-stat-card__value">
                {latestTestId || "N/A"}
              </p>
            </div>
          </div>
          <div className="teacher-stat-card">
            <div className="teacher-stat-card__icon">👥</div>
            <div className="teacher-stat-card__content">
              <p className="teacher-stat-card__label">Student Access</p>
              <p className="teacher-stat-card__value">
                {latestTestId ? "Ready" : "Pending"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="teacher-dashboard__content">
          {/* Create Test Card */}
          <div className="teacher-card teacher-card--primary">
            <div className="teacher-card__header">
              <div className="teacher-card__icon">✨</div>
              <div>
                <h3 className="teacher-card__title">Create New Test</h3>
                <p className="teacher-card__description">
                  Generate a new test entry for your students
                </p>
              </div>
            </div>
            <button
              className="teacher-card__action teacher-card__action--primary"
              onClick={handleCreateTest}
              disabled={loadingAction === "create"}
            >
              {loadingAction === "create" ? (
                <>
                  <span className="spinner">⏳</span> Creating...
                </>
              ) : (
                <>
                  <span>➕</span> Create Test
                </>
              )}
            </button>

            {latestTestId && (
              <div className="teacher-upload">
                <div className="teacher-upload__header">
                  <span className="teacher-upload__icon">📄</span>
                  <p className="teacher-upload__label">
                    Upload Questions for <strong>{latestTestId}</strong>
                  </p>
                </div>
                <div className="teacher-upload__input-wrapper">
                  <label
                    htmlFor="pdf-upload"
                    className="teacher-upload__file-label"
                  >
                    <span className="teacher-upload__file-icon">📎</span>
                    <span className="teacher-upload__file-text">
                      {fileInputRef.current?.files?.[0]?.name ||
                        "Choose PDF file..."}
                    </span>
                  </label>
                  <input
                    id="pdf-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="teacher-upload__input"
                  />
                </div>
                <button
                  className="teacher-card__action teacher-card__action--secondary"
                  onClick={handleUploadQuestions}
                  disabled={loadingAction === "upload"}
                >
                  {loadingAction === "upload" ? (
                    <>
                      <span className="spinner">⏳</span> Uploading...
                    </>
                  ) : (
                    <>
                      <span>📤</span> Upload Questions
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* View Marks Card */}
          <div className="teacher-card teacher-card--secondary">
            <div className="teacher-card__header">
              <div className="teacher-card__icon teacher-card__icon--secondary">
                📊
              </div>
              <div>
                <h3 className="teacher-card__title">View Test Results</h3>
                <p className="teacher-card__description">
                  Review questions and marks for any test
                </p>
              </div>
            </div>
            <div className="teacher-card__form">
              <label htmlFor="test-id-input" className="teacher-card__label">
                <span>🔍</span> Test ID
              </label>
              <input
                id="test-id-input"
                className="teacher-card__input"
                value={viewTestId}
                onChange={(event) => setViewTestId(event.target.value)}
                placeholder="Enter test ID..."
              />
            </div>
            <button
              className="teacher-card__action teacher-card__action--secondary"
              onClick={handleViewMarks}
              disabled={loadingAction === "view"}
            >
              {loadingAction === "view" ? (
                <>
                  <span className="spinner">⏳</span> Fetching...
                </>
              ) : (
                <>
                  <span>👁️</span> View Results
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Message */}
        {actionMessage && (
          <div
            className={`teacher-dashboard__notification ${
              actionMessage.includes("Failed") ||
              actionMessage.includes("Unable") ||
              actionMessage.includes("required")
                ? "teacher-dashboard__notification--error"
                : "teacher-dashboard__notification--success"
            }`}
          >
            <span className="teacher-dashboard__notification-icon">
              {actionMessage.includes("Failed") ||
              actionMessage.includes("Unable") ||
              actionMessage.includes("required")
                ? "⚠️"
                : "✅"}
            </span>
            <span>{actionMessage}</span>
          </div>
        )}

        {/* All Tests List */}
        {allTests.length > 0 && (
          <div className="teacher-tests-section">
            <h3 className="teacher-tests-section__title">
              📚 Your Tests ({allTests.length})
            </h3>
            <div className="teacher-tests-grid">
              {allTests.map((test) => (
                <div key={test.id} className="teacher-test-item">
                  <div className="teacher-test-item__header">
                    <span className="teacher-test-item__badge">Test ID</span>
                    <span className="teacher-test-item__id">{test.testId}</span>
                  </div>
                  <div className="teacher-test-item__details">
                    <div className="teacher-test-item__detail">
                      <span className="teacher-test-item__detail-label">
                        📅 Created
                      </span>
                      <span className="teacher-test-item__detail-value">
                        {new Date(test.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="teacher-test-item__detail">
                      <span className="teacher-test-item__detail-label">
                        👤 Teacher
                      </span>
                      <span className="teacher-test-item__detail-value">
                        {test.teacherId}
                      </span>
                    </div>
                  </div>
                  <div className="teacher-test-item__actions">
                    <button
                      className="teacher-test-item__action"
                      onClick={() => {
                        setViewTestId(test.testId);
                        handleViewMarks();
                      }}
                    >
                      <span>👁️</span> View Details
                    </button>
                    <label
                      htmlFor={`file-upload-${test.testId}`}
                      className="teacher-test-item__action teacher-test-item__action--secondary"
                      style={{ cursor: "pointer" }}
                    >
                      <span>📤</span> Upload Questions
                      <input
                        id={`file-upload-${test.testId}`}
                        type="file"
                        accept="application/pdf"
                        style={{ display: "none" }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          setLoadingAction("upload");
                          setActionMessage(null);

                          try {
                            const response = await uploadQuestions(
                              test.testId,
                              file
                            );
                            setActionMessage(response.msg);
                            e.target.value = "";
                          } catch (err) {
                            setActionMessage(
                              err instanceof Error
                                ? err.message
                                : "Failed to upload questions"
                            );
                          } finally {
                            setLoadingAction(null);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions Preview */}
        {questionsPreview !== null && (
          <div className="teacher-dashboard__preview-wrapper">
            <div className="teacher-dashboard__preview-header">
              <h4>📋 Test Data Preview</h4>
              <button
                className="teacher-dashboard__preview-close"
                onClick={() => setQuestionsPreview(null)}
              >
                ✕
              </button>
            </div>
            <pre className="teacher-dashboard__preview">
              {JSON.stringify(questionsPreview, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
