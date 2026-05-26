import type {
  Expression,
  JSXElement,
  JSXEmptyExpression,
  JSXFragment,
} from "@babel/types";
import {
  isCallExpression,
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
} from "@babel/types";

/**
 * Structural snapshot of a JSX element with no semantic guesses applied yet.
 * Produced by the AST walker and consumed by the semantic classifier; the
 * split keeps shape-extraction and intent-inference independently testable.
 */
export type RawNode =
  | {
      kind: "element";
      tag: string;
      className: string;
      props: Record<string, string | true>;
      children: RawNode[];
      fromMap: boolean;
      hasTextContent: boolean;
      textContent: string;
    }
  | { kind: "fragment"; children: RawNode[]; fromMap: boolean };

/**
 * Convert a JSXElement or JSXFragment into a RawNode tree. Returns null when
 * the element uses an exotic tag form (e.g. namespaced JSX) that cannot be
 * represented. The `fromMap` flag is propagated to descendants for confidence.
 */
export function toRawNode(
  node: JSXElement | JSXFragment,
  fromMap: boolean,
): RawNode | null {
  if (isJSXFragment(node)) {
    return {
      kind: "fragment",
      children: collectChildren(node.children, fromMap),
      fromMap,
    };
  }
  const tag = elementTagName(node);
  if (!tag) return null;
  const textContent = concatTextChildren(node.children);
  return {
    kind: "element",
    tag,
    className: getClassNameAttr(node),
    props: getStaticProps(node),
    children: collectChildren(node.children, fromMap),
    fromMap,
    hasTextContent: textContent.length > 0,
    textContent,
  };
}

/**
 * Concatenate all literal JSX text children into a single trimmed string.
 * Used by the classifier to size paragraph blocks against the actual content
 * length so `<p>New</p>` renders as one bar and lorem ipsum renders as many.
 */
function concatTextChildren(children: JSXElement["children"]): string {
  const parts: string[] = [];
  for (const c of children) {
    if (isJSXText(c) && c.value.trim().length > 0) {
      parts.push(c.value.trim());
    }
  }
  return parts.join(" ").trim();
}

/**
 * Resolve a JSXElement's tag to a plain identifier. For member expressions
 * like `<Foo.Bar />` the rightmost identifier wins; namespaced tags yield null.
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
 * Read the static className/class attribute as a plain string. Dynamic
 * expressions are ignored; only string literals and expression containers
 * holding a string literal are returned.
 */
function getClassNameAttr(el: JSXElement): string {
  for (const a of el.openingElement.attributes) {
    if (!isJSXAttribute(a)) continue;
    if (!isJSXIdentifier(a.name)) continue;
    if (a.name.name !== "className" && a.name.name !== "class") continue;
    const v = a.value;
    if (v && isStringLiteral(v)) return v.value;
    if (v && isJSXExpressionContainer(v) && isStringLiteral(v.expression)) {
      return v.expression.value;
    }
  }
  return "";
}

/**
 * Collect static props (string literals + boolean flags) into a flat map.
 * className is omitted since it has its own dedicated extractor. Dynamic
 * expression props are silently skipped — only literal values survive.
 */
function getStaticProps(el: JSXElement): Record<string, string | true> {
  const props: Record<string, string | true> = {};
  for (const a of el.openingElement.attributes) {
    if (!isJSXAttribute(a)) continue;
    if (!isJSXIdentifier(a.name)) continue;
    const name = a.name.name;
    if (name === "className" || name === "class") continue;
    const v = a.value;
    if (v === null || v === undefined) {
      props[name] = true;
      continue;
    }
    if (isStringLiteral(v)) {
      props[name] = v.value;
      continue;
    }
    if (isJSXExpressionContainer(v) && isStringLiteral(v.expression)) {
      props[name] = v.expression.value;
    }
  }
  return props;
}

/**
 * Recursively walk a JSX child list into RawNodes. JSX text and whitespace are
 * dropped; `.map()` expression containers are resolved to a single representative
 * child; ternaries, variables, and other expressions are silently ignored.
 */
function collectChildren(
  children: JSXElement["children"],
  fromMap: boolean,
): RawNode[] {
  const out: RawNode[] = [];
  for (const c of children) {
    if (isJSXText(c)) continue;
    if (isJSXElement(c) || isJSXFragment(c)) {
      const n = toRawNode(c, fromMap);
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
 * Detect a `.map()` call expression and return the first JSX element produced
 * by its callback (arrow or function body) wrapped as a RawNode with
 * fromMap=true. Non-map expressions yield null.
 */
function extractFromMap(
  expr: Expression | JSXEmptyExpression,
): RawNode | null {
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
  return toRawNode(returned, true);
}
