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
import { checkUser } from "../services/api";

export type AuthPayload = {
  userId: string;
  testId?: string;
  password?: string;
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId || !password) {
      setError("User ID and password are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await checkUser(userId, password);
      if (!data.role) {
        throw new Error("Unable to determine role");
      }
      const role = data.role === "teacher" ? "teacher" : "student";
      onLogin({ userId, testId, password, role });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      w="100vw"
      h="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="white"
      position="relative"
      overflow="hidden"
    >
      {/* Background Image with gradient fallback */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        backgroundImage="url('../../../Icons/background.webp')"
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
        filter="brightness(1)"
        zIndex={0}
      />

      {/* Overlay for better contrast */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.600"
        zIndex={1}
      />

      <Container
        maxW="md"
        bg="blackAlpha.800"
        backdropFilter="blur(10px)"
        p={8}
        borderRadius="xl"
        boxShadow="2xl"
        position="relative"
        zIndex={2}
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
                  bg="gray.200"
                  border="none"
                  _focus={{ ring: 2, ringColor: "blue.500" }}
                  color={"black"}
                />
              </Field>

              <Field label="Test ID">
                <Input
                  type="text"
                  placeholder="Enter Test ID (optional)"
                  value={testId}
                  onChange={(e) => setTestId(e.target.value)}
                  bg="gray.200"
                  border="none"
                  _focus={{ ring: 2, ringColor: "blue.500" }}
                  color={"black"}
                />
              </Field>

              <Field label="Password">
                <Input
                  type="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  bg="gray.200"
                  border="none"
                  _focus={{ ring: 2, ringColor: "blue.500" }}
                  color={"black"}
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

const Field: React.FC<React.PropsWithChildren<{ label: string }>> = ({
  label,
  children,
}) => (
  <Box w="100%">
    <Text mb={2} fontWeight="bold" color="gray.100">
      {label}
    </Text>
    {children}
  </Box>
);

export default AuthScreen;
