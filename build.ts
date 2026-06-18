import { $ } from "bun";

console.log("Cleaning build directory './dist'...");
await $`rm -rf ./dist`;

console.log("Compiling TypeScript files...");
await $`tsc`;

console.log("Build completed successfully!");
