const Realm = require("realm");
const fs = require("fs");

async function main(platform) {
  console.log("Starting Realm converter...")
  /// nice ansi art with pretty colors
  console.log(",------.                                          ,--.                ");
  console.log("|  .--. ',--.--. ,---.  ,---. ,---.  ,---.  ,---. `--',--,--,  ,---.  ");
  console.log("|  '--' ||  .--'| .-. || .--'| .-. :(  .-' (  .-' ,--.|      \| .-. | ");
  console.log("|  | --' |  |   ' '-' '\ `--.\   --..-'  `).-'  `)|  ||  ||  |' '-' ' ");
  console.log("`--'     `--'    `---'  `---' `----'`----' `----' `--'`--''--'.`-  /  ");
  console.log(",------. ,------.  ,---.  ,--.   ,--.   ,--.                  `---'   ");
  console.log("|  .--. '|  .---' /  O  \ |  |   |   `.'   |                          ");
  console.log("|  '--'.'|  `--, |  .-.  ||  |   |  |'.'|  |                          ");
  console.log("|  |\  \ |  `---.|  | |  ||  '--.|  |   |  |.--..--..--.              ");
  console.log("`--' '--'`------'`--' `--'`-----'`--'   `--''--''--''--'              ");
                                                                      
  if (process.argv.length != 5) {
    console.log("Usage: npm run start-ios/android <realm-file> <output-dir>");
    return;
  }

  // Load the appropriate schema based on the platform
  let dbm;
  if (platform === "ios") {
    dbm = require("./ios_realm_schema");
  } else if (platform === "android") {
    dbm = require("./android_realm_schema");
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  const outputDir = process.argv[4];
  // ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Determine the schema version based on the platform
  const schemaVersion = platform === "ios" ? 219 : 5;

  // Open the Realm file with the specified schema
  let realm = await Realm.open({
    path: process.argv[3],
    schema: Object.values(dbm), // Use the schema from the imported dbm
    schemaVersion: schemaVersion,
  });

  // Convert each model in the schema to JSON
  for (const model of Object.values(dbm)) {
    console.log(model.name);
    const objects = realm.objects(model.name);
    const totalObjects = objects.length;
    const chunkSize = 100000;

    for (let i = 0; i < totalObjects; i += chunkSize) {
      const chunk = objects.slice(i, i + chunkSize);
      await fs.promises.writeFile(
        `${outputDir}/${model.name}_${i / chunkSize + 1}.json`,
        JSON.stringify(chunk)
      );
    };
  }
}

// Call main with the platform argument (ios or android)
main(process.argv[2]);
