import React, { useState } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Text,
  Container,
} from "@chakra-ui/react";

export type AuthPayload = {
  userId: string;
  testId: string;
  role: "teacher" | "student";
};

interface AuthScreenProps {
  onLogin: (payload: AuthPayload) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [userId, setUserId] = useState("");
  const [testId, setTestId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !password) {
      setError("User ID and password are required.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8082/api/userType?userId=${encodeURIComponent(
          userId
        )}&password=${encodeURIComponent(password)}`
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Unable to login. Please try again.");
      }

      const data = (await response.json()) as { role?: string };
      const role = data.role === "teacher" ? "teacher" : "student";
      onLogin({ userId, testId, role });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      bg="gray.900"
      w="100vw"
      h="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="white"
    >
      <Container
        maxW="md"
        bg="gray.800"
        p={8}
        borderRadius="xl"
        boxShadow="2xl"
      >
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <VStack gap={6} align="stretch">
            <VStack gap={2} textAlign="center">
              <Heading size="xl">Sentinel Access</Heading>
              <Text color="gray.400">Enter your credentials to continue</Text>
            </VStack>

            {error && (
              <Box
                py={3}
                px={4}
                bg="red.900"
                borderRadius="lg"
                color="red.100"
                textAlign="center"
              >
                {error}
              </Box>
            )}

            <VStack gap={4}>
              <Field label="User ID">
                <Input
                  type="text"
                  placeholder="Enter your User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  bg="gray.700"
                  border="none"
                  _focus={{ ring: 2, ringColor: "blue.500" }}
                />
              </Field>

              <Field label="Test ID">
                <Input
                  type="text"
                  placeholder="Enter Test ID (optional)"
                  value={testId}
                  onChange={(e) => setTestId(e.target.value)}
                  bg="gray.700"
                  border="none"
                  _focus={{ ring: 2, ringColor: "blue.500" }}
                />
              </Field>

              <Field label="Password">
                <Input
                  type="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  bg="gray.700"
                  border="none"
                  _focus={{ ring: 2, ringColor: "blue.500" }}
                />
              </Field>
            </VStack>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              w="100%"
              loading={loading}
              loadingText="Authenticating"
            >
              Log in
            </Button>
          </VStack>
        </form>
      </Container>
    </Box>
  );
};

const Field: React.FC<
  React.PropsWithChildren<{
    label: string;
  }>
> = ({ label, children }) => (
  <Box w="100%">
    <Text mb={2} fontWeight="bold" color="gray.100">
      {label}
    </Text>
    {children}
  </Box>
);

export default AuthScreen;
