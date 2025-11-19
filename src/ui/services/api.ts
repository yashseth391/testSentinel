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

export async function createTest(teacherId: string, password: string) {
    const response = await fetch(`${API_BASE}/createTest`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ teacherId, password }),
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create test");
    }

    return (await response.json()) as CreateTestResponse;
}

export type GetTestResponse = unknown;

export async function getTestQuestions(testId: string) {
    const response = await fetch(`${API_BASE}/test/${encodeURIComponent(testId)}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Unable to fetch test questions");
    }

    return (await response.json()) as GetTestResponse;
}

export async function uploadQuestions(testId: string, file: File) {
    const form = new FormData();
    form.append("testId", testId);
    form.append("pdf", file);

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
