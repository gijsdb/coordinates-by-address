const { CoordFinder } = require("../build/index.js");

async function main() {
    const cf = new CoordFinder({
        sourceFile: './source.csv',
        outputFile: './results.json',
        apiKey: API_KEY
    })
    await cf.find();
}

main()