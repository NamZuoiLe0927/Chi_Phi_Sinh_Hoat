import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";
const root = process.cwd();

function run(label, command, args) {
  console.log(`\n[setup] ${label}`);
  console.log(`[setup] > ${command} ${args.join(" ")}\n`);

  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: isWindows,
    env: process.env,
  });

  if (result.status !== 0) {
    console.error(`\n[setup] Bước "${label}" thất bại (exit code ${result.status}).`);
    process.exit(result.status ?? 1);
  }
}

function hasNodeModules() {
  return existsSync(join(root, "node_modules"));
}

console.log("[setup] Smart Living Cost Estimator - Local First Setup");
console.log(`[setup] Node.js: ${process.version}`);
console.log(`[setup] Platform: ${process.platform}`);

if (!hasNodeModules()) {
  run("Cài đặt thư viện", npmCommand, ["install"]);
} else {
  console.log("\n[setup] node_modules đã tồn tại, bỏ qua npm install.");
}

run("Sinh Prisma Client", npmCommand, ["run", "db:generate"]);
run("Khởi tạo database SQLite", npmCommand, ["run", "db:push"]);
run("Nạp dữ liệu mẫu", npmCommand, ["run", "db:seed"]);

console.log("\n[setup] Hoàn tất cấu hình.");
console.log("[setup] Đang mở server tại http://localhost:3000\n");

run("Khởi động Next.js", npmCommand, ["run", "dev"]);
