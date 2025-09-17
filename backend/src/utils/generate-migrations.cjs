import { readdirSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
const modelsPath = join(__dirname, "..", "models");
const migrationsPath = join(__dirname, "..", "migrations");

const modelFiles = readdirSync(modelsPath).filter((file) =>
  file.endsWith(".ts")
);

modelFiles.forEach((modelFile) => {
  const modelName = modelFile.replace(".ts", "");
  try {
    execSync(
      `npx sequelize-cli migration:generate --name create-${modelName} --migrations-path ${migrationsPath}`,
      { stdio: "inherit" }
    );
  } catch (error) {
    console.error(`Error generating migration for model ${modelName}:`, error);
  }
});

console.log("Migrations generated for all models.");
