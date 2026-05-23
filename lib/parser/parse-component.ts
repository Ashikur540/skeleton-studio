import { parse } from "@babel/parser";
import {
  isArrowFunctionExpression,
  isCallExpression,
  isExportDefaultDeclaration,
  isExportNamedDeclaration,
  isFunctionDeclaration,
  isIdentifier,
  isJSXAttribute,
  isJSXElement,
  isJSXExpressionContainer,
  isJSXFragment,
  isJSXIdentifier,
  isJSXMemberExpression,
  isJSXText,
  isMemberExpression,
  isReturnStatement,
  isStringLiteral,
  isVariableDeclaration,
} from "@babel/types";
import type {
  ArrowFunctionExpression,
  Expression,
  FunctionDeclaration,
  JSXElement,
  JSXEmptyExpression,
  JSXFragment,
  Node,
  ReturnStatement,
} from "@babel/types";

import { generateId } from "@/lib/ir/helpers";
import type {
  Confidence,
  ParseResult,
  SkeletonKind,
  SkeletonNode,
  StyleHints,
} from "@/lib/ir/types";
import {
  COMPONENT_TAG_HINTS,
  CONTAINER_TAGS,
  TAG_DEFAULTS,
} from "./tag-defaults";
import { readClasses } from "./tailwind-class-reader";

/**
 * Top-level entry point: parse a JSX/TSX source string into a ParseResult.
 * Wraps Babel parsing so syntax errors are caught and returned as structured
 * error objects rather than thrown exceptions.
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
      },
    };
  }

  const returnJsx = findComponentReturn(ast.program.body);
  if (!returnJsx) {
    return {
      ok: false,
      error: {
        kind: "no-return",
        message:
          "Could not find a JSX return statement in any function component.",
      },
    };
  }

  const tree = convertJSX(returnJsx, false);
  if (!tree) {
    return {
      ok: false,
      error: {
        kind: "no-component",
        message: "Return statement does not contain a JSX element.",
      },
    };
  }
  return { ok: true, tree };
}

/**
 * Walk top-level statements looking for the first function whose return
 * statement yields JSX. Handles function declarations, default/named exports,
 * and arrow-function variable declarations.
 */
function findComponentReturn(body: Node[]): JSXElement | JSXFragment | null {
  for (const node of body) {
    if (isExportDefaultDeclaration(node)) {
      const inner = node.declaration;
      if (isFunctionDeclaration(inner)) {
        const r = findReturnInFunction(inner);
        if (r) return r;
      } else if (isArrowFunctionExpression(inner)) {
        const r = findReturnInArrow(inner);
        if (r) return r;
      }
      continue;
    }
    if (isExportNamedDeclaration(node) && node.declaration) {
      const inner = node.declaration;
      if (isFunctionDeclaration(inner)) {
        const r = findReturnInFunction(inner);
        if (r) return r;
      } else if (isVariableDeclaration(inner)) {
        for (const decl of inner.declarations) {
          if (decl.init && isArrowFunctionExpression(decl.init)) {
            const r = findReturnInArrow(decl.init);
            if (r) return r;
          }
        }
      }
      continue;
    }
    if (isFunctionDeclaration(node)) {
      const r = findReturnInFunction(node);
      if (r) return r;
    }
    if (isVariableDeclaration(node)) {
      for (const decl of node.declarations) {
        if (decl.init && isArrowFunctionExpression(decl.init)) {
          const r = findReturnInArrow(decl.init);
          if (r) return r;
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

/**
 * Resolve a JSXElement's tag identifier to a plain string. For member
 * expressions like `<Foo.Bar />` the rightmost identifier wins. Returns null
 * for exotic forms (namespaced tags) that we cannot classify.
 */
function elementTagName(el: JSXElement): string | null {
  const name = el.openingElement.name;
  if (isJSXIdentifier(name)) return name.name;
  if (isJSXMemberExpression(name) && isJSXIdentifier(name.property)) {
    return name.property.name;
  }
  return null;
}

/**
 * Pull the static className or class attribute value off a JSX element.
 * Dynamic expressions are not evaluated — only plain string literals and
 * expression containers holding a string literal are read; others yield "".
 */
function getClassNameAttr(el: JSXElement): string {
  for (const a of el.openingElement.attributes) {
    if (!isJSXAttribute(a)) continue;
    if (!isJSXIdentifier(a.name)) continue;
    if (a.name.name !== "className" && a.name.name !== "class") continue;
    const v = a.value;
    if (v && isStringLiteral(v)) return v.value;
    if (
      v &&
      isJSXExpressionContainer(v) &&
      isStringLiteral(v.expression)
    ) {
      return v.expression.value;
    }
  }
  return "";
}

type Resolved = { kind: SkeletonKind; defaults: StyleHints };

/**
 * Map a JSX tag name to its skeleton kind and tag-level default style hints.
 * Checks explicit TAG_DEFAULTS first, then component-name hints, then the
 * CONTAINER_TAGS set; falls back to "container" for completely unknown tags.
 */
function resolveTag(tag: string): Resolved {
  if (TAG_DEFAULTS[tag]) return TAG_DEFAULTS[tag];
  if (COMPONENT_TAG_HINTS[tag]) {
    return { kind: COMPONENT_TAG_HINTS[tag], defaults: {} };
  }
  if (CONTAINER_TAGS.has(tag)) {
    return { kind: "container", defaults: {} };
  }
  return { kind: "container", defaults: {} };
}

/**
 * Derive a confidence rating for a skeleton node. `high` when Tailwind classes
 * pin both dimensions, `medium` for one dimension or for nodes synthesized from
 * a .map() callback, `fallback` when only tag defaults apply.
 */
function computeConfidence(
  classHints: Partial<StyleHints>,
  fromMap: boolean,
): Confidence {
  if (fromMap) return "medium";
  const hasW = classHints.width !== undefined;
  const hasH = classHints.height !== undefined;
  if (hasW && hasH) return "high";
  if (hasW || hasH) return "medium";
  return "fallback";
}

/**
 * Recursive heart of the parser. Converts a JSXElement or JSXFragment into a
 * SkeletonNode by merging tag defaults with Tailwind class hints. The `fromMap`
 * flag propagates so children of .map() callbacks receive `medium` confidence.
 */
function convertJSX(
  node: JSXElement | JSXFragment,
  fromMap: boolean,
): SkeletonNode | null {
  if (isJSXFragment(node)) {
    const children = collectChildren(node.children, fromMap);
    if (children.length === 0) return null;
    if (children.length === 1) return children[0];
    return {
      id: generateId(),
      kind: "container",
      confidence: "high",
      visible: true,
      layout: { direction: "col" },
      children,
    };
  }

  const tag = elementTagName(node);
  if (!tag) return null;
  const resolved = resolveTag(tag);
  const classHints = readClasses(getClassNameAttr(node));
  const hints: StyleHints = { ...resolved.defaults, ...classHints };

  const skeletonNode: SkeletonNode = {
    id: generateId(),
    kind: resolved.kind,
    sourceTag: tag,
    confidence: computeConfidence(classHints, fromMap),
    width: hints.width,
    height: hints.height,
    radius: hints.radius,
    visible: true,
  };

  if (resolved.kind === "paragraph") {
    skeletonNode.lineCount = 3;
  }

  if (hints.direction || hints.gap !== undefined) {
    skeletonNode.layout = {
      direction: hints.direction ?? "col",
      gap: hints.gap,
    };
  }

  const children = collectChildren(node.children, fromMap);
  if (children.length > 0) skeletonNode.children = children;

  return skeletonNode;
}

/**
 * Gather the SkeletonNode children of a JSX element's child list. JSX text
 * nodes (literal strings and whitespace) are dropped entirely; .map()
 * expression containers are handled via extractFromMap.
 */
function collectChildren(
  children: JSXElement["children"],
  fromMap: boolean,
): SkeletonNode[] {
  const out: SkeletonNode[] = [];
  for (const c of children) {
    if (isJSXText(c)) continue;
    if (isJSXElement(c) || isJSXFragment(c)) {
      const n = convertJSX(c, fromMap);
      if (n) out.push(n);
      continue;
    }
    if (isJSXExpressionContainer(c)) {
      const mapChild = extractFromMap(c.expression);
      if (mapChild) out.push(mapChild);
    }
  }
  return out;
}

/**
 * Detect a `.map()` call expression, extract the first JSX element returned
 * by its callback (arrow or function body), and convert it via `convertJSX`
 * with `fromMap = true` so the result is tagged with `medium` confidence.
 * Returns null for any non-map expression so ternaries, variables, etc. are
 * silently dropped.
 */
function extractFromMap(
  expr: Expression | JSXEmptyExpression,
): SkeletonNode | null {
  if (!isCallExpression(expr)) return null;
  if (!isMemberExpression(expr.callee)) return null;
  if (!isIdentifier(expr.callee.property)) return null;
  if (expr.callee.property.name !== "map") return null;

  const callback = expr.arguments[0];
  if (!callback) return null;
  if (
    callback.type !== "ArrowFunctionExpression" &&
    callback.type !== "FunctionExpression"
  ) {
    return null;
  }

  const body = callback.body;
  let returned: JSXElement | JSXFragment | null = null;
  if (isJSXElement(body) || isJSXFragment(body)) {
    returned = body;
  } else if (body.type === "BlockStatement") {
    for (const stmt of body.body) {
      if (isReturnStatement(stmt)) {
        const arg = stmt.argument;
        if (arg && (isJSXElement(arg) || isJSXFragment(arg))) {
          returned = arg;
          break;
        }
      }
    }
  }
  if (!returned) return null;
  return convertJSX(returned, true);
}
