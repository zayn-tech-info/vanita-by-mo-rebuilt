/**
 * Run Stripe CLI from WinGet install location (Windows).
 * Use: node scripts/stripe-cli.cjs <stripe-args...>
 * Example: node scripts/stripe-cli.cjs listen --forward-to https://fleet-wombat-210.convex.site/stripe
 */
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const base = process.env.LOCALAPPDATA || "";
const packagesPath = path.join(base, "Microsoft", "WinGet", "Packages");

if (!fs.existsSync(packagesPath)) {
  console.error("Stripe CLI: WinGet Packages folder not found. Install with: winget install Stripe.StripeCLi");
  process.exit(1);
}

const dirs = fs.readdirSync(packagesPath);
const stripeDir = dirs.find((d) => d.startsWith("Stripe.StripeCli"));
if (!stripeDir) {
  console.error("Stripe CLI: Not found under WinGet Packages. Install with: winget install Stripe.StripeCLi");
  process.exit(1);
}

const stripeExe = path.join(packagesPath, stripeDir, "stripe.exe");
if (!fs.existsSync(stripeExe)) {
  console.error("Stripe CLI: stripe.exe not found at", stripeExe);
  process.exit(1)
}

const args = process.argv.slice(2);
const child = spawn(stripeExe, args, { stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 0));
