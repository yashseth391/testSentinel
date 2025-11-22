import React from "react";

export type Primitive = string | number | boolean | null;
export type SampleCase = Record<
  string,
  Primitive | Primitive[] | Record<string, Primitive>
>;
export type ProblemExample = Record<
  string,
  Primitive | Primitive[] | Record<string, Primitive>
>;

export type Problem = {
  title: string;
  description?: string;
  sample_test_case?: SampleCase;
  hidden_test_cases?: SampleCase[];
  examples?: ProblemExample[];
  category?: string;
  functionName?: string;
};

interface ProblemViewerProps {
  problems: Problem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  loading: boolean;
  error: string | null;
  hideHiddenTests?: boolean;
}

const ProblemViewer: React.FC<ProblemViewerProps> = ({
  problems,
  activeIndex,
  onSelect,
  loading,
  error,
  hideHiddenTests,
}) => {
  const problem = problems[activeIndex];

  return (
    <div className="problem-pane">
      <aside className="problem-list" aria-label="Problems">
        {loading && <p className="problem-status">Loading problems…</p>}
        {error && (
          <p className="problem-status problem-status--error">{error}</p>
        )}
        {!loading && !error && problems.length === 0 && (
          <p className="problem-status">No questions available.</p>
        )}
        {problems.map((item, index) => (
          <button
            key={item.title + index}
            className={
              index === activeIndex
                ? "problem-list__item is-active"
                : "problem-list__item"
            }
            onClick={() => onSelect(index)}
          >
            <span className="problem-list__index">#{index + 1}</span>
            <span>{item.title}</span>
          </button>
        ))}
      </aside>

      <section className="problem-detail">
        {problem ? (
          <div>
            <h2 className="problem-title">{problem.title}</h2>
            {problem.description && (
              <p className="problem-description">{problem.description}</p>
            )}

            {problem.sample_test_case && (
              <div className="problem-section">
                <h3>Sample Test Case</h3>
                {renderKeyValues(problem.sample_test_case)}
              </div>
            )}

            {problem.examples && problem.examples.length > 0 && (
              <div className="problem-section">
                <h3>Examples</h3>
                {problem.examples.map((example, idx) => (
                  <div key={idx} className="problem-card">
                    <h4>Example {idx + 1}</h4>
                    {renderKeyValues(example)}
                  </div>
                ))}
              </div>
            )}

            {problem.hidden_test_cases &&
              problem.hidden_test_cases.length > 0 && (
                <div className="problem-section">
                  <h3>Hidden Test Cases</h3>
                  {hideHiddenTests ? (
                    <p className="problem-status problem-status--muted">
                      Hidden test cases are locked until you submit your
                      solution.
                    </p>
                  ) : (
                    problem.hidden_test_cases.map((testCase, idx) => (
                      <div key={idx} className="problem-card">
                        <h4>Case {idx + 1}</h4>
                        {renderKeyValues(testCase)}
                      </div>
                    ))
                  )}
                </div>
              )}
          </div>
        ) : (
          <div className="problem-empty">
            {loading
              ? "Loading problems…"
              : "Select a question to view details"}
          </div>
        )}
      </section>
    </div>
  );
};

function renderKeyValues(
  values: Record<string, Primitive | Primitive[] | Record<string, Primitive>>
) {
  return (
    <dl className="problem-dictionary">
      {Object.entries(values).map(([key, value]) => (
        <div key={key} className="problem-dictionary__row">
          <dt>{formatLabel(key)}</dt>
          <dd>{renderValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function renderValue(
  value: Primitive | Primitive[] | Record<string, Primitive>
) {
  if (Array.isArray(value)) {
    return (
      <div className="problem-value-group">
        {value.map((entry, index) => (
          <span key={index} className="problem-value problem-value--pill">
            {normalizePrimitive(entry)}
          </span>
        ))}
      </div>
    );
  }

  if (typeof value === "object" && value !== null) {
    return (
      <dl className="problem-dictionary problem-dictionary--nested">
        {Object.entries(value).map(([key, nested]) => (
          <div key={key} className="problem-dictionary__row">
            <dt>{formatLabel(key)}</dt>
            <dd>
              <span className="problem-value">
                {normalizePrimitive(nested)}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return <span className="problem-value">{normalizePrimitive(value)}</span>;
}

function formatLabel(label: string) {
  return label
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizePrimitive(value: Primitive) {
  if (value === null) {
    return "null";
  }

  return String(value);
}

export default ProblemViewer;
