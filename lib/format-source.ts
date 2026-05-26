import { format } from "prettier/standalone";
import * as prettierBabel from "prettier/plugins/babel";
import * as prettierEstree from "prettier/plugins/estree";

/**
 * Format JSX/TSX source using Prettier's standalone browser build.
 * Returns the formatted string, or the original source if formatting fails.
 */
export async function formatSource(source: string): Promise<string> {
  try {
    return await format(source, {
      parser: "babel",
      plugins: [prettierBabel, prettierEstree],
      semi: true,
      singleQuote: false,
      trailingComma: "all",
      printWidth: 80,
      tabWidth: 2,
    });
  } catch {
    return source;
  }
}
