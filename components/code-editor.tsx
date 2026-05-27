"use client";
import { javascript } from "@codemirror/lang-javascript";
import { linter, lintGutter, type Diagnostic } from "@codemirror/lint";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror, { EditorView, type Extension } from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
import { useMemo } from "react";

type EditorError = {
  message: string;
  loc?: { line: number; column: number };
};

type Props = {
  value: string;
  onChange: (next: string) => void;
  error?: EditorError | null;
  placeholder?: string;
  className?: string;
};

/**
 * JSX code editor backed by CodeMirror 6. Provides line numbers, JSX syntax
 * highlight, theme-aware styling via next-themes, and an error decoration at
 * the parser-reported line:column. Designed as a drop-in replacement for the
 * raw textarea used previously in the paste pane.
 */
export function CodeEditor({
  value,
  onChange,
  error,
  placeholder,
  className,
}: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const extensions = useMemo<Extension[]>(() => {
    const exts: Extension[] = [
      javascript({ jsx: true, typescript: true }),
      EditorView.lineWrapping,
      lintGutter(),
      linter(() => diagnosticsFor(error, value)),
    ];
    return exts;
  }, [error, value]);

  return (
    <div
      className={
        "h-full overflow-hidden rounded-none border border-none bg-input/30 " +
        "focus-within:ring-2 focus-within:ring-ring/40 " +
        (className ?? "")
      }
    >
      <CodeMirror
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        theme={isDark ? githubDark : githubLight}
        height="100%"
        extensions={extensions}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          foldGutter: true,
          autocompletion: false,
          searchKeymap: true,
          bracketMatching: true,
          closeBrackets: true,
          indentOnInput: true,
        }}
        style={{ height: "100%", fontSize: "13px" }}
      />
    </div>
  );
}

/**
 * Convert a single ParseError into a CodeMirror Diagnostic at the offending
 * line. Spans from the reported column to end-of-line so the underline is
 * actually visible (a 0-width range renders as nothing). Empty when no error.
 */
function diagnosticsFor(
  error: EditorError | null | undefined,
  source: string,
): Diagnostic[] {
  if (!error?.loc) return [];
  const { line, column } = error.loc;
  const offset = lineColumnToOffset(source, line, column);
  if (offset === null) return [];
  const lineEnd = source.indexOf("\n", offset);
  const to = lineEnd === -1 ? source.length : lineEnd;
  return [
    {
      from: offset,
      to: Math.max(to, offset + 1),
      severity: "error",
      message: error.message,
    },
  ];
}

/**
 * Translate a 1-based line + 0-based column pair (Babel convention) into a
 * 0-based character offset within the source. Returns null when the pair
 * falls outside the document so we never produce an out-of-range diagnostic.
 */
function lineColumnToOffset(
  source: string,
  line: number,
  column: number,
): number | null {
  let lineStart = 0;
  let current = 1;
  while (current < line) {
    const nl = source.indexOf("\n", lineStart);
    if (nl === -1) return null;
    lineStart = nl + 1;
    current += 1;
  }
  const offset = lineStart + column;
  if (offset > source.length) return null;
  return offset;
}
