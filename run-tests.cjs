#!/usr/bin/env node

// Script para ejecutar todos los tests ignorando los argumentos de lint-staged
const { execSync } = require("child_process");

const targetModule = process.argv[2]; // 'backend' o 'frontend'

if (!targetModule) {
	console.error("Debe especificar el módulo (backend o frontend)");
	process.exit(1);
}

try {
	if (targetModule === "backend") {
		console.log("🧪 Ejecutando todos los tests del backend...");
		execSync("pnpm --dir backend test", { stdio: "inherit" });
	} else if (targetModule === "frontend") {
		console.log("🧪 Ejecutando todos los tests del frontend...");
		execSync("pnpm --dir frontend test -- --watchAll=false", {
			stdio: "inherit",
		});
	}
} catch (error) {
	console.error(
		`❌ Los tests del ${targetModule} fallaron:`,
		error.message
	);
	process.exit(1);
}
