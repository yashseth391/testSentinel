import { useState } from "react";
// import { Center, Heading, VStack } from "@chakra-ui/react";
// import { Heading, Stack } from "@chakra-ui/react";
import { githubDark } from "@uiw/codemirror-theme-github";

import {
  Container,
  Heading,
  HStack,
  Menu,
  VStack,
  Portal,
  Button,
} from "@chakra-ui/react";
import CodeMirror from "@uiw/react-codemirror";
import { EXTENSIONS } from "./languages";
function CodeEditor() {
  const [text, setText] = useState("python");
  const [language, setLanguage] = useState("python");

  return (
    <Container>
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
      >
        <HStack justify={"space-between"}>
          <Heading>Code Editor</Heading>

          {/* Select Language */}
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button variant="outline" size="sm" style={{ color: "Red" }}>
                {language || "Select Language"}
              </Button>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  {Object.keys(EXTENSIONS).map((lang) => {
                    return (
                      <Menu.Item
                        value={lang}
                        onSelect={() => setLanguage(lang)}
                      >
                        {lang}
                      </Menu.Item>
                    );
                  })}
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </HStack>

        {/* <Divider/> */}
        <div style={{ flexGrow: 1, width: "100%" }}>
          <CodeMirror
            value={text}
            onChange={(newValue) => setText(newValue)}
            theme={githubDark}
            extensions={[EXTENSIONS[language]]}
            basicSetup={{ autocompletion: true }}
            height="100%"
            width="100%"
            minHeight="100%"
          />
        </div>
      </VStack>
    </Container>
  );
}
export default CodeEditor;
