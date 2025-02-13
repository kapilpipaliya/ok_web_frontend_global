import * as parserBabel from "prettier/plugins/babel";
import * as parserEstree from "prettier/plugins/estree";
import * as prettier from "prettier/standalone";

export async function formatJavaScriptCode(code: string): Promise<string> {
  try {
    return await prettier.format(code, {
      // bracketSpacing: true,
      // printWidth: 80,
      // semi: true,
      // singleQuote: false,
      // tabWidth: 2,
      // trailingComma: "all",
      // useTabs: false,
      parser: "babel",
      plugins: [parserBabel, parserEstree],
    });
  } catch (err) {
    console.error("Formatting failed:", err);
    throw err;
  }
}
