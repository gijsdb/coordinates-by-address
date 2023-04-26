const yargs = require('yargs/yargs')
const { CoordFinder } = require("../build/index.js");
console.log("YARGS", yargs)
yargs.command(
    'coordfinder <arg1> <arg2> <arg3>',
    'Description of my command',
    (yargs) => {
        yargs.positional('arg1', {
            describe: 'source file',
            type: 'string',
        });
        yargs.positional('arg2', {
            describe: 'result file',
            type: 'string',
        });
        yargs.positional('arg3', {
            describe: 'positionstack API key',
            type: 'string',
        });
    },
    async (argv) => {
        const cf = new CoordFinder({
            sourceFile: argv.arg1,
            outputFile: argv.arg2,
            apiKey: argv.arg3
        })
        await cf.find();
    }
);

yargs.parse();

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

if (argv.ships > 3 && argv.distance < 53.5) {
    console.log('Plunder more riffiwobbles!')
} else {
    console.log('Retreat from the xupptumblers!')
}