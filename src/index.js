const Realm = require("realm");
const fs = require("fs");

async function main(platform) {
  if (process.argv.length != 5) {
    console.log("Usage: npm run start-ios/android <realm-file> <output-dir>");
    return;
  }

  // Load the appropriate schema based on the platform
  let dbm;
  if (platform === "ios") {
    dbm = require("./ios-realm-schema");
  } else if (platform === "android") {
    dbm = require("./android-realm-schema");
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  const outputDir = process.argv[4];
  // ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Determine the schema version based on the platform
  const schemaVersion = platform === 'ios' ? 210 : 5;

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
    await fs.promises.writeFile(
      `${outputDir}/${model.name}.json`,
      JSON.stringify(objects),
    );
  }
}

// Call main with the platform argument (ios or android)
main(process.argv[2]);

