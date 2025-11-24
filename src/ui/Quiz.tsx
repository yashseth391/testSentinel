import React from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import styles from "./styles.module.css";

interface QuizQuestion {
  title: string;
  options: { label: string; text: string }[];
  answer: string;
}

interface QuizProps {
  questions: QuizQuestion[];
  answers: string[];
  currentQuestionIndex: number;
  onQuestionChange: (index: number) => void;
  onAnswerChange: (index: number, answer: string) => void;
  submitted: boolean;
  score: number;
}

const Quiz: React.FC<QuizProps> = ({
  questions,
  answers,
  currentQuestionIndex,
  onQuestionChange,
  onAnswerChange,
  submitted,
  score,
}) => {
  const currentQuestion = questions[currentQuestionIndex];

  if (!questions || questions.length === 0) {
    return <div style={{ padding: "20px" }}>Loading quiz...</div>;
  }

  return (
    <>
      <PanelGroup direction="horizontal" className="app-panels">
        {/* Question List Panel */}
        <Panel defaultSize={20} minSize={15} className="panel-shell">
          <div style={{ padding: "10px", height: "100%", overflowY: "auto" }}>
            <h3>Questions</h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => onQuestionChange(idx)}
                  style={{
                    padding: "8px",
                    textAlign: "left",
                    backgroundColor:
                      currentQuestionIndex === idx
                        ? "#0056b3"
                        : answers[idx]
                        ? "#28a745"
                        : "#007bff",
                    color: "white",
                    border: "1px solid #777",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {idx + 1}. {answers[idx] ? "✓" : ""}
                </button>
              ))}
            </div>
          </div>
        </Panel>
        <PanelResizeHandle className={styles.verticalHandle}>
          <div className={styles.handleGrip} />
        </PanelResizeHandle>

        {/* Question Details Panel */}
        <Panel defaultSize={50} minSize={30} className="panel-shell">
          <div style={{ padding: "20px", height: "100%", overflowY: "auto" }}>
            {currentQuestion && (
              <div>
                <h2>Question {currentQuestionIndex + 1}</h2>
                <p style={{ fontSize: "18px", margin: "20px 0" }}>
                  {currentQuestion.title}
                </p>
              </div>
            )}
          </div>
        </Panel>
        <PanelResizeHandle className={styles.verticalHandle}>
          <div className={styles.handleGrip} />
        </PanelResizeHandle>

        {/* Options Panel */}
        <Panel defaultSize={30} minSize={20} className="panel-shell">
          <div style={{ padding: "20px", height: "100%", overflowY: "auto" }}>
            <h3>Options</h3>
            {currentQuestion &&
              currentQuestion.options.map((opt) => (
                <label
                  key={opt.label}
                  style={{
                    display: "block",
                    margin: "10px 0",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name={`q${currentQuestionIndex}`}
                    value={opt.label}
                    checked={answers[currentQuestionIndex] === opt.label}
                    onChange={() =>
                      onAnswerChange(currentQuestionIndex, opt.label)
                    }
                    disabled={submitted}
                    style={{ marginRight: "10px" }}
                  />
                  <strong>{opt.label}.</strong> {opt.text}
                </label>
              ))}
          </div>
        </Panel>
      </PanelGroup>

      {submitted && (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            backgroundColor: "#f0f0f0",
          }}
        >
          <h2>
            Your Score: {score} / {questions.length}
          </h2>
          <p>Quiz submitted successfully!</p>
        </div>
      )}
    </>
  );
};

export default Quiz;
