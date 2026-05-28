import { parse } from "@babel/parser";
import type {
  ArrowFunctionExpression,
  FunctionDeclaration,
  Identifier,
  JSXElement,
  JSXFragment,
  Node,
  ReturnStatement,
} from "@babel/types";
import {
  isArrowFunctionExpression,
  isExportDefaultDeclaration,
  isExportNamedDeclaration,
  isFunctionDeclaration,
  isIdentifier,
  isJSXElement,
  isJSXFragment,
  isReturnStatement,
  isVariableDeclaration,
} from "@babel/types";

import type { ParseResult } from "@/lib/ir/types";
import { detectArchetypes } from "./archetype-detector";
import { toRawNode } from "./raw-node";
import { classify } from "./semantic-classifier";
import { detectSiblingRepeat } from "./sibling-repeat";
import { detectTableGrid } from "./table-grid";

/**
 * Top-level entry point: parse a JSX/TSX source string into a ParseResult.
 * Orchestrates Babel parsing, AST→RawNode extraction, and semantic classification;
 * returns structured error objects rather than throwing.
 */
export function parseComponent(source: string): ParseResult {
  let ast;
  try {
    ast = parse(source, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
      errorRecovery: false,
    });
  } catch (e) {
    return {
      ok: false,
      error: {
        kind: "syntax-error",
        message: e instanceof Error ? e.message : String(e),
        loc: extractBabelLoc(e),
      },
    };
  }

  const found = findComponentReturn(ast.program.body);
  if (!found) {
    return {
      ok: false,
      error: {
        kind: "no-return",
        message:
          "Could not find a JSX return statement in any function component.",
      },
    };
  }

  const raw = toRawNode(found.jsx, false);
  if (!raw) {
    return {
      ok: false,
      error: {
        kind: "no-component",
        message: "Return statement does not contain a JSX element.",
      },
    };
  }

  const tree = classify(raw);
  if (!tree) {
    return {
      ok: false,
      error: {
        kind: "no-component",
        message: "Return statement does not contain a JSX element.",
      },
    };
  }
  detectArchetypes(tree);
  detectTableGrid(tree);
  detectSiblingRepeat(tree);
  return { ok: true, tree, componentName: found.name };
}

type ComponentMatch = { jsx: JSXElement | JSXFragment; name?: string };

/**
 * Walk top-level statements looking for the first function whose return
 * statement yields JSX. Handles function declarations, default/named exports,
 * and arrow-function variable declarations. Returns both the JSX node and the
 * component's declared name (if one can be determined).
 */
function findComponentReturn(body: Node[]): ComponentMatch | null {
  const nameOf = (id: Identifier | null | undefined) => id?.name;

  for (const node of body) {
    if (isExportDefaultDeclaration(node)) {
      const inner = node.declaration;
      if (isFunctionDeclaration(inner)) {
        const r = findReturnInFunction(inner);
        if (r) return { jsx: r, name: nameOf(inner.id) };
      } else if (isArrowFunctionExpression(inner)) {
        const r = findReturnInArrow(inner);
        if (r) return { jsx: r };
      }
      continue;
    }
    if (isExportNamedDeclaration(node) && node.declaration) {
      const inner = node.declaration;
      if (isFunctionDeclaration(inner)) {
        const r = findReturnInFunction(inner);
        if (r) return { jsx: r, name: nameOf(inner.id) };
      } else if (isVariableDeclaration(inner)) {
        for (const decl of inner.declarations) {
          if (decl.init && isArrowFunctionExpression(decl.init)) {
            const r = findReturnInArrow(decl.init);
            if (r) return { jsx: r, name: isIdentifier(decl.id) ? decl.id.name : undefined };
          }
        }
      }
      continue;
    }
    if (isFunctionDeclaration(node)) {
      const r = findReturnInFunction(node);
      if (r) return { jsx: r, name: nameOf(node.id) };
    }
    if (isVariableDeclaration(node)) {
      for (const decl of node.declarations) {
        if (decl.init && isArrowFunctionExpression(decl.init)) {
          const r = findReturnInArrow(decl.init);
          if (r) return { jsx: r, name: isIdentifier(decl.id) ? decl.id.name : undefined };
        }
      }
    }
  }
  return null;
}

/**
 * Scan a function declaration's body for the first return statement that
 * contains JSX. Non-JSX returns (e.g. `return null`) are skipped.
 */
function findReturnInFunction(
  fn: FunctionDeclaration,
): JSXElement | JSXFragment | null {
  for (const stmt of fn.body.body) {
    if (isReturnStatement(stmt)) return extractJSXFromReturn(stmt);
  }
  return null;
}

/**
 * Scan an arrow function for its JSX. Handles implicit-return form where
 * the body is the JSX itself, and block-body form with explicit return
 * statements.
 */
function findReturnInArrow(
  fn: ArrowFunctionExpression,
): JSXElement | JSXFragment | null {
  const body = fn.body;
  if (isJSXElement(body) || isJSXFragment(body)) return body;
  if (body.type === "BlockStatement") {
    for (const stmt of body.body) {
      if (isReturnStatement(stmt)) return extractJSXFromReturn(stmt);
    }
  }
  return null;
}

/**
 * Pull a `loc: { line, column }` out of a Babel SyntaxError, if present.
 * Babel attaches the error position as a non-typed property on the thrown
 * error; this guards the read so we never propagate a half-formed loc.
 */
function extractBabelLoc(
  e: unknown,
): { line: number; column: number } | undefined {
  if (!e || typeof e !== "object") return undefined;
  const loc = (e as { loc?: { line?: number; column?: number } }).loc;
  if (
    !loc ||
    typeof loc.line !== "number" ||
    typeof loc.column !== "number"
  ) {
    return undefined;
  }
  return { line: loc.line, column: loc.column };
}

/**
 * Pull the JSX out of a return statement's argument. Returns null when the
 * return value is not JSX (e.g. `return null` or `return someVar`), so
 * callers can safely skip non-JSX returns.
 */
function extractJSXFromReturn(
  stmt: ReturnStatement,
): JSXElement | JSXFragment | null {
  const arg = stmt.argument;
  if (!arg) return null;
  if (isJSXElement(arg) || isJSXFragment(arg)) return arg;
  return null;
}
