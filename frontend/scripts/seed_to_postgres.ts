import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const sqlFile = path.resolve(
  __dirname,
  "../../backend/src/main/resources/db/migration/V70__seed_reading_exercise_cards.sql"
);

if (!fs.existsSync(sqlFile)) {
  console.error("❌ File not found:", sqlFile);
  process.exit(1);
}

console.log("🌱 Seeding reading exercise cards into PostgreSQL (container: toeic-postgres)...");

const proc = spawn(
  "docker",
  [
    "exec",
    "-i",
    "toeic-postgres",
    "psql",
    "-U",
    "postgres",
    "-d",
    "toeic_ai_learning",
  ],
  {
    stdio: ["pipe", "inherit", "inherit"],
  }
);

const readStream = fs.createReadStream(sqlFile, { encoding: "utf-8" });
readStream.pipe(proc.stdin);

proc.on("close", (code) => {
  if (code === 0) {
    console.log("✅ Seeding completed successfully! All reading cards are now in PostgreSQL.");
  } else {
    console.error(`❌ Seeding failed with exit code ${code}`);
  }
});
