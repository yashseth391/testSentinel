export { };

declare global {
    interface Window {
        api: {
            getQuestion: (url: string) => Promise<unknown>;
        };
    }
}
