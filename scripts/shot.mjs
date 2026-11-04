// Turns a saved test run into a PNG for pull requests.
// Usage: node scripts/shot.mjs <output.txt> <image.png> "<the command that was run>"
import { readFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const [, , input, output, command = ""] = process.argv;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const text = readFileSync(input, "utf8").replace(/\x1b\[[0-9;]*m/g, "").trimEnd();
const lines = esc(text)
  .split("\n")
  .map((l) => (/✘|failed|Error/.test(l) ? `<span class="bad">${l}</span>` : /✓|passed/.test(l) ? `<span class="good">${l}</span>` : l))
  .join("\n");

const html = `<body style="margin:0;background:#0b0c0e">
<style>pre{margin:0;padding:20px 24px;font:13px/1.55 ui-monospace,Menlo,monospace;color:#d7dae0;white-space:pre-wrap;width:900px}
.cmd{color:#8b93a1}.bad{color:#ff6b6b}.good{color:#c6f432}</style>
<pre><span class="cmd">$ ${esc(command)}</span>\n${lines}</pre></body>`;

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });
await page.setContent(html);
await page.locator("pre").screenshot({ path: output });
await browser.close();
