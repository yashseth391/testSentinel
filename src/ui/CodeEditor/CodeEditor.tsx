import { useMemo, useState } from "react";
import { githubDark } from "@uiw/codemirror-theme-github";

import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Menu,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import CodeMirror from "@uiw/react-codemirror";
import { EXTENSIONS } from "./languages";
import type { Problem, SampleCase } from "../Questions/ProblemViewer";

interface CodeEditorProps {
  problem?: Problem;
  code: string;
  language: string;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: string) => void;
}

type EvaluationMode = "sample" | "hidden";

interface EvaluationResult {
  mode: EvaluationMode;
  passed: number;
  total: number;
  failedCases: FailureDetail[];
  message: string;
}

interface FailureDetail {
  label: string;
  expected?: string;
  received?: string;
  error?: string;
}

function CodeEditor({
  problem,
  code,
  language,
  onCodeChange,
  onLanguageChange,
}: CodeEditorProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const languageSupported =
    language === "javascript" || language === "typescript";

  const sampleCase = useMemo(() => problem?.sample_test_case, [problem]);
  const hiddenCases = useMemo(
    () => problem?.hidden_test_cases ?? [],
    [problem]
  );
  const hasHiddenCases = hiddenCases.length > 0;

  const submitDisabledReason = useMemo(() => {
    if (!problem) {
      return "Select a question to submit";
    }
    if (!hasHiddenCases) {
      return "No hidden tests available";
    }
    if (!languageSupported) {
      return "Only JavaScript / TypeScript submissions are supported";
    }
    return null;
  }, [problem, hasHiddenCases, languageSupported]);

  const handleRun = async () => {
    if (!problem || !sampleCase) {
      setResult({
        mode: "sample",
        passed: 0,
        total: 0,
        failedCases: [],
        message: "No sample test case available yet.",
      });
      return;
    }

    if (!languageSupported) {
      setResult({
        mode: "sample",
        passed: 0,
        total: 0,
        failedCases: [],
        message: "Sample runs currently support JavaScript/TypeScript only.",
      });
      return;
    }

    setIsRunning(true);
    const normalized = normalizeTestCases(sampleCase, "Sample Case");
    const evaluation = executeSuite(code, normalized, "sample");
    setResult(evaluation);
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    if (!problem || hiddenCases.length === 0) {
      setResult({
        mode: "hidden",
        passed: 0,
        total: 0,
        failedCases: [],
        message: "Hidden tests are not available for this question.",
      });
      return;
    }

    if (!languageSupported) {
      setResult({
        mode: "hidden",
        passed: 0,
        total: 0,
        failedCases: [],
        message: "Hidden runs currently support JavaScript/TypeScript only.",
      });
      return;
    }

    setIsSubmitting(true);
    const normalized = normalizeTestCases(hiddenCases, "Hidden Case");
    const evaluation = executeSuite(code, normalized, "hidden");
    setResult(evaluation);
    setIsSubmitting(false);
  };

  return (
    <Container height="100%" maxW="100%" padding={0}>
      <VStack
        boxShadow={"md"}
        p={4}
        borderStyle={"solid"}
        borderWidth={1}
        rounded={"lg"}
        height="100%"
        width="100%"
        flexGrow={1}
        align={"stretch"}
        gap={4}
      >
        <HStack justify="space-between" align="start" gap={4}>
          <div>
            <Heading size="md">Code Editor</Heading>
            {problem && (
              <Text fontSize="sm" color="gray.300">
                Solving: {problem.title}
              </Text>
            )}
          </div>

          <HStack gap={3}>
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button variant="outline" size="sm" colorScheme="blue">
                  {language || "Select Language"}
                </Button>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    {Object.keys(EXTENSIONS).map((lang) => (
                      <Menu.Item
                        key={lang}
                        value={lang}
                        onSelect={() => onLanguageChange(lang)}
                      >
                        {lang}
                      </Menu.Item>
                    ))}
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>

            <HStack gap={2}>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRun}
                loading={isRunning}
                disabled={!problem || !sampleCase}
              >
                Run Sample
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={handleSubmit}
                loading={isSubmitting}
                disabled={Boolean(submitDisabledReason)}
                title={submitDisabledReason ?? undefined}
              >
                Submit
              </Button>
            </HStack>
          </HStack>
        </HStack>

        {!languageSupported && (
          <Box
            borderRadius="md"
            border="1px solid rgba(250,204,21,0.4)"
            bg="rgba(251,191,36,0.1)"
            p={3}
          >
            <Text fontSize="sm" color="orange.200">
              Execution currently works only for JavaScript / TypeScript
              snippets.
            </Text>
          </Box>
        )}

        {result && (
          <ResultBanner
            result={result}
            showDetails={result.mode === "sample" || !hasHiddenCases}
          />
        )}

        <Box flex="1" minH={0}>
          <CodeMirror
            value={code}
            onChange={(newValue) => onCodeChange(newValue)}
            theme={githubDark}
            extensions={[EXTENSIONS[language]]}
            basicSetup={{ autocompletion: true }}
            height="100%"
            width="100%"
            minHeight="100%"
          />
        </Box>
      </VStack>
    </Container>
  );
}

function ResultBanner({
  result,
  showDetails,
}: {
  result: EvaluationResult;
  showDetails: boolean;
}) {
  const success = result.passed === result.total && result.total > 0;
  const summary = success
    ? `${result.total} / ${result.total} tests passed`
    : `${result.passed} / ${result.total} tests passed`;
  const borderColor = success ? "rgba(34,197,94,0.6)" : "rgba(248,113,113,0.7)";
  const bgColor = success ? "rgba(34,197,94,0.15)" : "rgba(248,113,113,0.15)";

  return (
    <Box
      border={`1px solid ${borderColor}`}
      borderRadius="md"
      bg={bgColor}
      p={3}
    >
      <Text fontWeight="semibold">{result.message}</Text>
      <Text fontSize="sm">{summary}</Text>
      {showDetails && result.failedCases.length > 0 && (
        <Box mt={2}>
          {result.failedCases.map((failure, index) => (
            <Box key={`${failure.label}-${index}`} mb={2}>
              <Text fontSize="sm" fontWeight="bold">
                {failure.label}
              </Text>
              {failure.error ? (
                <Text fontSize="sm" color="orange.200">
                  {failure.error}
                </Text>
              ) : (
                <>
                  <Text fontSize="sm">Expected: {failure.expected}</Text>
                  <Text fontSize="sm">Received: {failure.received}</Text>
                </>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

interface NormalizedTestCase {
  label: string;
  input: unknown[];
  expected?: unknown;
}

function normalizeTestCases(
  source: SampleCase | SampleCase[],
  labelPrefix: string
): NormalizedTestCase[] {
  const list = Array.isArray(source) ? source : [source];
  return list
    .map((item, index) =>
      normalizeSingleCase(
        item,
        `${labelPrefix}${list.length > 1 ? ` ${index + 1}` : ""}`
      )
    )
    .filter((caseItem): caseItem is NormalizedTestCase => Boolean(caseItem));
}

function normalizeSingleCase(
  sample: SampleCase,
  fallbackLabel: string
): NormalizedTestCase | null {
  if (!sample) {
    return null;
  }

  const labelCandidate = getField(sample, ["name", "label"]);
  const inputValue =
    getField(sample, ["input", "inputs", "case", "given"]) ??
    stripFields(sample, ["output", "expected", "answer"]);
  const expectedValue = getField(sample, ["output", "expected", "answer"]);

  const input = normalizeInputArray(inputValue);
  const expected = coerceValue(expectedValue);

  return {
    label: typeof labelCandidate === "string" ? labelCandidate : fallbackLabel,
    input,
    expected,
  };
}

function stripFields(sample: SampleCase, fields: string[]) {
  const clone: Record<string, unknown> = {};
  Object.entries(sample).forEach(([key, value]) => {
    if (!fields.includes(key)) {
      clone[key] = value;
    }
  });
  return clone;
}

function getField(sample: SampleCase, keys: string[]) {
  for (const key of keys) {
    if (key in sample) {
      return sample[key];
    }
  }
  return undefined;
}

function executeSuite(
  code: string,
  tests: NormalizedTestCase[],
  mode: EvaluationMode
): EvaluationResult {
  if (tests.length === 0) {
    return {
      mode,
      passed: 0,
      total: 0,
      failedCases: [],
      message: "No tests available for this action.",
    };
  }

  let passed = 0;
  const failures: FailureDetail[] = [];

  for (const test of tests) {
    try {
      const actual = executeJavaScript(code, test.input);
      if (test.expected === undefined) {
        passed += 1;
        continue;
      }

      if (compareValues(actual, test.expected)) {
        passed += 1;
      } else {
        failures.push({
          label: test.label,
          expected: serializeValue(test.expected),
          received: serializeValue(actual),
        });
      }
    } catch (error) {
      failures.push({
        label: test.label,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    mode,
    passed,
    total: tests.length,
    failedCases: failures,
    message:
      mode === "sample" ? "Sample run completed" : "Submission evaluated",
  };
}

function executeJavaScript(code: string, input: unknown[]) {
  const wrapped = `"use strict";\n${code}\nif (typeof solve !== "function") {\n  throw new Error("Please define a solve function");\n}\nreturn solve(...args);`;
  const runner = new Function("args", wrapped);
  return runner(input);
}

function compareValues(actual: unknown, expected: unknown) {
  return stableStringify(actual) === stableStringify(expected);
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }

  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortValue((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }

  return value;
}

function serializeValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function normalizeInputArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value.map((item) => coerceValue(item));
  }
  return [coerceValue(value)];
}

function coerceValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => coerceValue(entry));
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce(
      (acc, [key, entry]) => {
        acc[key] = coerceValue(entry);
        return acc;
      },
      {} as Record<string, unknown>
    );
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return value;
      }
    }
  }

  return value;
}

export default CodeEditor;
