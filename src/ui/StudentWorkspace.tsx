import { useCallback, useEffect, useMemo, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import CodeEditor from "./CodeEditor/CodeEditor";
import ProblemViewer, {
  type Primitive,
  type Problem,
} from "./Questions/ProblemViewer";
import styles from "./styles.module.css";
import { getTestQuestions, submitTest } from "./services/api";
import type { AuthPayload } from "./Authentication/AuthScreen";

interface StudentWorkspaceProps {
  auth: AuthPayload;
  onLogout: () => void;
}

type EditorState = {
  code: string;
  language: string;
};

function generateDefaultSnippet(problem?: Problem): string {
  const fnName = problem?.functionName ?? "solve";

  // Generate example based on sample test case structure
  let exampleComment = "  // Extract your inputs from args\n";
  if (problem?.sample_test_case) {
    const sampleInput = problem.sample_test_case.input;
    if (Array.isArray(sampleInput)) {
      sampleInput.forEach((_, idx) => {
        exampleComment += `  // const arg${idx + 1} = args[${idx}];\n`;
      });
    } else {
      exampleComment += "  // const input = args[0];\n";
    }
  } else {
    exampleComment += "  // Example: const arg1 = args[0];\n";
    exampleComment += "  //          const arg2 = args[1];\n";
  }

  return `function ${fnName}(...args) {
${exampleComment}  
  // Your solution here
  return null;
}`;
}

const EXAM_DURATION_MS = 60 * 60 * 1000; // 60 minutes

const StudentWorkspace = ({ auth, onLogout }: StudentWorkspaceProps) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [editorStates, setEditorStates] = useState<Map<number, EditorState>>(
    new Map()
  );
  const [timeRemaining, setTimeRemaining] = useState<number>(EXAM_DURATION_MS);
  const [examLocked, setExamLocked] = useState(false);
  const currentProblem = problems[activeIndex];

  const currentEditorState = useMemo(() => {
    const existing = editorStates.get(activeIndex);
    if (existing) return existing;
    return {
      code: generateDefaultSnippet(currentProblem),
      language: "javascript",
    };
  }, [editorStates, activeIndex, currentProblem]);

  const handleCodeChange = (code: string) => {
    setEditorStates((prev) => {
      const next = new Map(prev);
      next.set(activeIndex, { ...currentEditorState, code });
      return next;
    });
  };

  const handleLanguageChange = (language: string) => {
    setEditorStates((prev) => {
      const next = new Map(prev);
      next.set(activeIndex, { ...currentEditorState, language });
      return next;
    });
  };

  useEffect(() => {
    let isMounted = true;

    async function loadQuestions() {
      if (!auth.testId) {
        setError("Missing test id. Please reach out to your instructor.");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getTestQuestions(auth.testId);
        const allProblems = normalizeProblems(response);

        // Filter by userId parity: odd userId → odd category, even userId → even category
        const userIdNum = parseInt(auth.userId, 10);
        const userCategory = isNaN(userIdNum)
          ? "all"
          : userIdNum % 2 === 1
          ? "odd"
          : "even";
        const filteredProblems = allProblems.filter((p) => {
          if (!p.category || userCategory === "all") return true;
          return p.category === userCategory;
        });

        if (isMounted) {
          setProblems(filteredProblems);
          setActiveIndex(0);
          if (filteredProblems.length === 0) {
            setError("No questions found for this test.");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Unable to load questions."
          );
          setProblems([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadQuestions();

    return () => {
      isMounted = false;
    };
  }, [auth.testId, auth.userId]);

  // Helper function to execute JavaScript code (same as in CodeEditor)
  const executeJavaScript = (
    code: string,
    input: unknown,
    functionName?: string
  ): unknown => {
    const fnName = functionName || "solve";
    const inputArray = Array.isArray(input) ? input : [input];
    const wrappedCode = `
      ${code}
      return ${fnName}(...args);
    `;
    const fn = new Function("args", wrappedCode);
    return fn(inputArray);
  };

  const handleAutoSubmit = useCallback(async () => {
    if (examLocked) return;
    setExamLocked(true);

    try {
      let totalPassed = 0;

      // Run all questions against hidden tests
      for (let i = 0; i < problems.length; i++) {
        const problem = problems[i];
        const state = editorStates.get(i);
        if (!problem || !state) continue;

        // Execute code against hidden test cases
        const hiddenTests = problem.hidden_test_cases || [];
        for (const testCase of hiddenTests) {
          try {
            const result = executeJavaScript(
              state.code,
              testCase.input,
              problem.functionName
            );
            if (JSON.stringify(result) === JSON.stringify(testCase.expected)) {
              totalPassed++;
            }
          } catch {
            // Test failed
          }
        }
      }

      // Submit results to backend
      await submitTest(auth.userId ?? "", auth.testId ?? "", totalPassed);
      alert(
        `Exam submitted! You passed ${totalPassed} test cases. The window will now close.`
      );

      // Optionally close the window or redirect
      window.close();
    } catch (err) {
      alert(
        "Failed to submit exam results: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  }, [examLocked, problems, editorStates, auth.userId, auth.testId]);

  // Timer countdown
  useEffect(() => {
    if (examLocked || problems.length === 0) return;

    const intervalId = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1000) {
          clearInterval(intervalId);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [
    examLocked,
    problems.length,
    editorStates,
    auth.userId,
    auth.testId,
    handleAutoSubmit,
  ]);

  const statusText = useMemo(() => {
    if (loading) return "Fetching questions";
    if (error) return "Issue loading questions";
    if (problems.length === 0) return "Waiting for instructor";
    return `${problems.length} question${
      problems.length > 1 ? "s" : ""
    } loaded`;
  }, [loading, error, problems.length]);

  const timerDisplay = useMemo(() => {
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  }, [timeRemaining]);

  const timerWarning = timeRemaining < 300000; // Less than 5 minutes

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>Test Sentinel</h1>
          <p className="app-subtitle">
            Test ID: <strong>{auth.testId ?? "N/A"}</strong> · {statusText}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: examLocked ? "#888" : timerWarning ? "#ff4444" : "#4CAF50",
            }}
          >
            {examLocked ? "Submitted" : `⏱️ ${timerDisplay}`}
          </div>
          <button
            className="logout-button"
            onClick={handleAutoSubmit}
            disabled={examLocked || problems.length === 0}
            style={{
              backgroundColor: examLocked ? "#ccc" : "#2196F3",
              cursor:
                examLocked || problems.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            {examLocked ? "Submitted" : "Submit Test"}
          </button>
          <button className="logout-button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <PanelGroup direction="horizontal" className="app-panels">
        <Panel defaultSize={45} minSize={30} className="panel-shell">
          <ProblemViewer
            problems={problems}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
            loading={loading}
            error={error}
            hideHiddenTests
          />
        </Panel>
        <PanelResizeHandle className={styles.verticalHandle}>
          <div className={styles.handleGrip} />
        </PanelResizeHandle>
        <Panel defaultSize={55} minSize={40} className="panel-shell">
          <CodeEditor
            problem={currentProblem}
            code={currentEditorState.code}
            language={currentEditorState.language}
            onCodeChange={handleCodeChange}
            onLanguageChange={handleLanguageChange}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
};

function normalizeProblems(payload: unknown): Problem[] {
  const rawList = extractProblemList(payload);

  return rawList
    .map((entry, index) => buildProblem(entry, index))
    .filter((item): item is Problem => Boolean(item));
}

function extractProblemList(payload: unknown): unknown[] {
  if (payload === null || payload === undefined) {
    return [];
  }

  let parsed: unknown = payload;
  if (typeof payload === "string") {
    try {
      parsed = JSON.parse(payload);
    } catch {
      return [];
    }
  }

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (typeof parsed === "object" && parsed !== null) {
    const container = parsed as Record<string, unknown>;
    const arrayKeys = ["questions", "problems", "data", "items"] as const;
    for (const key of arrayKeys) {
      if (Array.isArray(container[key])) {
        return container[key] as unknown[];
      }
    }

    if (
      "title" in container ||
      "description" in container ||
      "prompt" in container
    ) {
      return [container];
    }
  }

  return [];
}

type MutableProblem = Record<string, unknown>;
type Dictionary = NonNullable<Problem["sample_test_case"]>;

function buildProblem(raw: unknown, index: number): Problem | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as MutableProblem;
  const title =
    typeof record.title === "string" && record.title.trim().length > 0
      ? record.title
      : `Question ${index + 1}`;

  const description = pickString(record, [
    "description",
    "prompt",
    "details",
    "body",
  ]);

  const sampleCase = toDictionary(
    pickValue(record, ["sample_test_case", "sampleTestCase", "sample"])
  );

  const hiddenCases = toDictionaryArray(
    pickValue(record, ["hidden_test_cases", "hiddenTestCases"])
  );

  const examples = toDictionaryArray(pickValue(record, ["examples"]));
  const category = pickString(record, ["category"]);
  const functionName = pickString(record, ["functionName", "function_name"]);

  return {
    title,
    description,
    sample_test_case: sampleCase,
    hidden_test_cases: hiddenCases.length ? hiddenCases : undefined,
    examples: examples.length ? examples : undefined,
    category,
    functionName,
  };
}

function pickValue(record: MutableProblem, keys: string[]) {
  for (const key of keys) {
    if (record[key] !== undefined) {
      return record[key];
    }
  }
  return undefined;
}

function pickString(record: MutableProblem, keys: string[]) {
  const value = pickValue(record, keys);
  return typeof value === "string" ? value : undefined;
}

function toDictionaryArray(value: unknown): Dictionary[] {
  return toArray(value)
    .map((item) => toDictionary(item))
    .filter((item): item is Dictionary => Boolean(item));
}

function toArray(value: unknown): unknown[] {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function toDictionary(value: unknown): Dictionary | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value !== "object") {
    return { value: toPrimitive(value) };
  }

  if (Array.isArray(value)) {
    return { value: value.map((item) => toPrimitive(item)) };
  }

  return Object.entries(value as Record<string, unknown>).reduce<Dictionary>(
    (acc, [key, nestedValue]) => {
      acc[key] = toValue(nestedValue);
      return acc;
    },
    {}
  );
}

function toValue(
  value: unknown
): Primitive | Primitive[] | Record<string, Primitive> {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => toPrimitive(item));
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce<
      Record<string, Primitive>
    >((acc, [key, nested]) => {
      acc[key] = toPrimitive(nested);
      return acc;
    }, {});
  }

  return toPrimitive(value);
}

function toPrimitive(value: unknown): Primitive {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export default StudentWorkspace;
