const { CoordFinder } = require("../build/index.js");

// node ./bin/cli2.js -s ./source.csv -o ./output.json -k KEY -c address1,address2,city,postcode,country -g true

var argv = require('yargs/yargs')(process.argv.slice(2))
    .usage('Usage: $0 -w [num] -h [num]')
    .demandOption(['s', 'o', 'k', 'c', 'g'])
    .argv;

const cf = new CoordFinder({
    csvSourceFile: argv.s,
    jsonOutputFile: argv.o,
    apiKey: argv.k,
    csvFormat: argv.c,
    geoJSON: argv.g,
})
cf.find();