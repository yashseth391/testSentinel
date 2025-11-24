const API_BASE = "http://localhost:8082/api";
//const API_BASE_PROD="https://testsentinel-backend-production.up.railway.app/api"
export type UserTypeResponse = {
    role?: "teacher" | "student";
    error?: string;
};

export async function checkUser(userId: string, password: string) {
    const url = new URL(`${API_BASE}/userType`);
    url.searchParams.set("userId", userId);
    url.searchParams.set("password", password);

    const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as UserTypeResponse;
        throw new Error(body.error || "Unable to determine role");
    }

    return (await response.json()) as UserTypeResponse;
}

export type CreateTestResponse = {
    testId: string;
    teacherId: string;
};

export async function createTest(teacherId: string, password: string, testType: string = "quiz") {
    const response = await fetch(`${API_BASE}/createTest`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ teacherId, password, testType }),
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create test");
    }

    return (await response.json()) as CreateTestResponse;
}

export type TestData = {
    testType: "quiz" | "lab";
    questions: QuizQuestion[] | Problem[];
};

export async function getTestQuestions(testId: string): Promise<TestData> {
    const response = await fetch(`${API_BASE}/test/${testId}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Unable to fetch test questions");
    }

    return (await response.json()) as TestData;
}

export async function uploadQuestions(testId: string, file: File, testType: string = "quiz") {
    const form = new FormData();
    form.append("testId", testId);
    form.append("pdf", file);
    form.append("testType", testType);

    const response = await fetch(`${API_BASE}/uploadQuestions`, {
        method: "POST",
        body: form,
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Failed to upload questions");
    }

    return (await response.json()) as { msg: string; testId: string };
}

export type SubmitTestResponse = {
    msg: string;
    userId: string;
    testId: string;
    testType: string;
    passed: number;
    totalQuestions: number;
};

export async function submitTest(userId: string, testId: string, testType: string, passed: number, totalQuestions: number) {
    const response = await fetch(`${API_BASE}/submitResult`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ userId, testId, testType, passed, totalQuestions }),
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const msg = body.error || "Failed to submit test";
        const details = body.details ? `\nDetails: ${body.details}` : "";
        throw new Error(msg + details);
    }

    return (await response.json()) as SubmitTestResponse;
}

export type TeacherTest = {
    id: string;
    testId: string;
    teacherId: string;
    created_at: string;
    questions?: unknown;
};

export type GetTeacherTestsResponse = {
    tests: TeacherTest[];
    count: number;
};

export async function getTeacherTests(teacherId: string) {
    const response = await fetch(`${API_BASE}/teacher/${teacherId}/tests`, {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Failed to fetch teacher tests");
    }

    return (await response.json()) as GetTeacherTestsResponse;
}
