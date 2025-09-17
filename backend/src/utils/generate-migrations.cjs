const { readdirSync } = require("fs");
const { join } = require("path");
const { execSync } = require("child_process");

// Путь к папке с моделями
const modelsPath = join(__dirname, "..", "models");

// Путь к папке миграций
const migrationsPath = join(__dirname, "..", "migrations"); // Убедитесь, что папка migrations существует

// Читаем все файлы моделей в указанной папке
const modelFiles = readdirSync(modelsPath).filter((file) =>
    file.endsWith(".cjs")
);

// Для каждого файла создаем миграцию
modelFiles.forEach((modelFile) => {
    const modelName = modelFile.replace(".js", "");

    // Запускаем команду для генерации миграции с указанием пути к миграциям
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