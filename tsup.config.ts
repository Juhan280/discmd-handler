import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	target: "node16",
	outDir: "lib",
	format: ["cjs"],
	dts: true,
});
