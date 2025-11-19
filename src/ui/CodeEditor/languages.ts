import { LanguageSupport } from '@codemirror/language';
import { markdown } from "@codemirror/lang-markdown";
import { javascript } from "@codemirror/lang-javascript";
import { cpp } from "@codemirror/lang-cpp";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";

export const EXTENSIONS: { [key: string]: LanguageSupport[] } = {
    markdown: [markdown()],
    python: [python()],
    javascript: [javascript()],
    typescript: [javascript()],
    cpp: [cpp()],
    // 'c++': [cpp()],
    html: [html()],
    json: [json()],
    java: [java()],
};
