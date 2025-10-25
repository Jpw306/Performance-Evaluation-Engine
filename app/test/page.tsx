import React, { JSX } from "react";

// /Users/ryangarfinkel/Documents/Programming/Performance-Evaluation-Engine/app/test/page.tsx

export default function TestPage(): JSX.Element {
    return (
        <main
            style={{
                display: "flex",
                minHeight: "100vh",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
            }}
        >
            <h1>Hello World</h1>
        </main>
    );
}