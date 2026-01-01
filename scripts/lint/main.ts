import usercssMeta from "usercss-meta";
import { ensureDir } from "@std/fs";
import { calcStyleDigest } from "https://github.com/openstyles/stylus/raw/8fe35a4b90d85fb911bd7aa1deab4e4733c31150/src/js/sections-util.js";
import { getUserstylesFiles } from "@/utils.ts";

// Recommended settings for the export.
const settings = {
  updateInterval: 24,
  updateOnlyEnabled: true,
  patchCsp: true,
  "editor.linter": "",
};

// UPDATED: Use the standard Stylus backup object structure
const data = {
  settings,
  styles: [] as Record<string, unknown>[],
};

for (const file of getUserstylesFiles()) {
  const content = await Deno.readTextFile(file);
  const { metadata } = usercssMeta.parse(content);

  const userstyle = {
    enabled: true,
    name: metadata.name,
    description: metadata.description,
    author: metadata.author,
    url: metadata.url,
    updateUrl: metadata.updateURL,
    usercssData: metadata,
    sourceCode: content,
    // Stylus needs a modification timestamp or ID sometimes to trigger an import
    modified: Date.now(), 
  } as Record<string, unknown>;

  userstyle.originalDigest = await calcStyleDigest(userstyle);

  data.styles.push(userstyle);
}

await ensureDir("dist");
// This will now output a file that Stylus recognizes as a valid backup
await Deno.writeTextFile("dist/import.json", JSON.stringify(data, null, 2));
