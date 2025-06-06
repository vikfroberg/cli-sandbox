import { glob } from "glob";
import path from "path";
import * as esbuild from "esbuild";
import fs from "fs";
import os from "os";

// Bundle state - use OS temp directory for CLI tools
let bundleCounter = 0;

const tempDir = path.join(
  os.tmpdir(),
  "cli-sandbox-bundles",
  `session-${Date.now()}-${process.pid}`,
);

function ensureTempDir() {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
}

async function bundleSandbox(filePath) {
  try {
    ensureTempDir();
    const bundleId = ++bundleCounter;
    const outputPath = path.join(tempDir, `bundle-${bundleId}.mjs`);

    // Bundle the file and all its dependencies
    const result = await esbuild.build({
      entryPoints: [filePath],
      bundle: true,
      format: "esm",
      platform: "node",
      target: "node18",
      outfile: outputPath,
      write: true,
      metafile: true,
      sourcemap: false,
      minify: false,
      keepNames: true,
    });

    // Extract all dependencies from metafile for watching
    const dependencies = [];
    if (result.metafile) {
      for (const inputPath of Object.keys(result.metafile.inputs)) {
        const resolvedPath = path.resolve(inputPath);
        if (!resolvedPath.includes("node_modules")) {
          dependencies.push(resolvedPath);
        }
      }
    }

    return { outputPath, dependencies };
  } catch (error) {
    console.error(`ESBuild bundling failed for ${filePath}:`, error);
    throw error;
  }
}

export async function loadSandbox(file) {
  try {
    const fullPath = path.resolve(file);
    const relativePath = path.relative(process.cwd(), fullPath);

    // Bundle the sandbox file
    const bundleResult = await bundleSandbox(fullPath);

    // Import the bundled version
    const moduleUrl = `file://${bundleResult.outputPath}`;
    const module = await import(moduleUrl);
    const examples = module.default || module || []; // Support both ESM and CommonJS

    return {
      absolutePath: fullPath,
      path: relativePath,
      examples,
      bundlePath: bundleResult.outputPath,
      dependencies: bundleResult.dependencies, // Include dependencies for watching
    };
  } catch (error) {
    console.error(`Failed to load ${file}:`, error.message);
    return {
      path: path.relative(process.cwd(), path.resolve(file)),
      examples: [],
      bundlePath: null,
      dependencies: [],
    };
  }
}

export function cleanupBundles() {
  // Clean up old bundle files
  try {
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        fs.unlinkSync(path.join(tempDir, file));
      }
    }
  } catch (error) {
    console.warn("Failed to cleanup temp files:", error.message);
  }
}

export async function loadSandboxes(pattern) {
  const files = await glob(pattern, {
    cwd: process.cwd(),
    ignore: ["**/node_modules/**", "**/.*/**"], // Exclude node_modules and hidden directories
  });
  const sandboxes = [];

  for (const file of files) {
    const sandbox = await loadSandbox(file);
    sandboxes.push(sandbox);
  }

  return sandboxes;
}
