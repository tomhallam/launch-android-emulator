const arg = require("arg");
const hasbin = require("hasbin");
const cp = require("child_process");

const ANDROID_SDK_EMULATOR_BINARY = "emulator";

const args = arg({
  "--name": String,
});

function handleCommandError({ stdout, stderr }) {
  const outString = stdout ? stdout.toString() : null;
  const errString = stderr ? stderr.toString() : null;

  if (errString) {
    console.error(errString);
    process.exit(1);
  }

  if (outString && outString.includes("ERROR")) {
    console.error(outString);
    process.exit(1);
  }
}

function spawnEmulator(name) {
  const specifiedEmulatorSpawn = cp.spawnSync(ANDROID_SDK_EMULATOR_BINARY, [
    "-avd",
    name,
  ]);

  return handleCommandError(specifiedEmulatorSpawn);
}

function detectEmulator() {
  const { stdout, stderr } = cp.spawnSync(ANDROID_SDK_EMULATOR_BINARY, [
    "-list-avds",
  ]);

  handleCommandError({ stderr });

  const emulators = (stdout ? stdout.toString() : "").split("\n");

  if (emulators.length === 0) {
    console.error(
      "No emulators configured. Open the AVD manager from Android Studio to configure one."
    );
    process.exit(0);
  }

  // Return the first emulator we find
  return emulators[0].trim();
}

if (!hasbin.sync(ANDROID_SDK_EMULATOR_BINARY)) {
  console.error(
    "`emulator` executable not found. Make sure the Android SDK is installed and available on your PATH."
  );
  process.exit(1);
}

// Allow the user to specify an emulator name
if (args["--name"]) {
  return spawnEmulator(name);
} else {
  const detectedEmulatorName = detectEmulator();
  return spawnEmulator(detectedEmulatorName);
}
