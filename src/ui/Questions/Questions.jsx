import React from "react";

export default function Questions() {
  const [question, setQuestion] = React.useState(null);

  const url =
    "https://iggyzkolpagccknuwbhr.supabase.co/storage/v1/object/sign/Questions/question1.json?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yMGU4NzRmNS1hZmVkLTRjN2YtODgzZC03ZmU3Y2E3ZDA4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJRdWVzdGlvbnMvcXVlc3Rpb24xLmpzb24iLCJpYXQiOjE3NjMyMzk3NzEsImV4cCI6MTc5NDc3NTc3MX0.DQWB0dcurubPrgPWpDKHJZr6QObKMjCO0YbALzqOR74";

  React.useEffect(() => {
    async function loadQuestion() {
      const res = await fetch(url);
      const q = await res.json();
      console.log("LOADED QUESTION:", q);
      setQuestion(q);
    }
    loadQuestion();
  }, []); // 👈 runs only once

  // 🛑 Prevent crash while loading
  if (!question) {
    return (
      <div
        style={{
          height: "100%",
          borderRight: "1px solid #e2e8f0",
          overflow: "auto",
          padding: "1rem",
        }}
      >
        <h2>Loading question...</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        borderRight: "1px solid #e2e8f0",
        overflow: "auto",
        padding: "1rem",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ marginBottom: "1rem" }}>{question.title}</h2>

      <p style={{ lineHeight: "1.6", marginBottom: "1.5rem" }}>
        {question.description}
      </p>

      {/* Examples */}
      <h3 style={{ marginTop: "1rem" }}>Examples</h3>
      <div style={{ marginTop: "0.5rem" }}>
        {question.examples.map((ex, i) => (
          <div
            key={i}
            style={{
              background: "#f8fafc",
              padding: "10px",
              borderRadius: "6px",
              marginBottom: "10px",
              border: "1px solid #e2e8f0",
            }}
          >
            <strong>Example {i + 1}</strong>
            <pre
              style={{
                background: "#fff",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                marginTop: "8px",
              }}
            >
              {`Input:
${JSON.stringify(ex.input, null, 2)}

Output:
${JSON.stringify(ex.output, null, 2)}`}
            </pre>
          </div>
        ))}
      </div>

      {/* Test Cases */}
      <h3 style={{ marginTop: "1.5rem" }}>Additional Test Cases</h3>
      {question.test_cases.map((tc, i) => (
        <details
          key={i}
          style={{
            marginTop: "8px",
            padding: "8px",
            background: "#f1f5f9",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
          }}
        >
          <summary style={{ cursor: "pointer" }}>Test Case {i + 1}</summary>
          <pre
            style={{
              background: "#fff",
              padding: "10px",
              borderRadius: "6px",
              marginTop: "8px",
              border: "1px solid #e2e8f0",
            }}
          >
            {`Input:
${JSON.stringify({ nums: tc.nums, target: tc.target }, null, 2)}

Output:
${JSON.stringify(tc.output, null, 2)}`}
          </pre>
        </details>
      ))}
    </div>
  );
}
