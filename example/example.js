const { CoordFinder } = require("../build/index.js");
require('dotenv').config();

async function main() {
    const cf = new CoordFinder({
        csvSourceFile: './source.csv',
        jsonOutputFile: './results.json',
        apiKey: process.env.POSITION_STACK_API_KEY,
        csvFormat: 'address1,address2,city,postcode,country',
        geoJSON: false,
    })
    await cf.find();
}

main()