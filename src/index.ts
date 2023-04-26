import * as csv from 'csv-parser';
import axios from 'axios';
import * as fs from 'fs';
const path = require('path');

export interface CoordFinderConfig {
    csvSourceFile: string // location of source file with addresses. E.g './source.csv'
    csvFormat: string; // Comma seperated string of your source file collumns. E.g 'address1,adress2,postcode,city,country'
    jsonOutputFile: string; // location where results should go
    geoJSON: boolean; // If output JSON should be in GEOJSON
    apiKey: string; // Position Stack API key https://positionstack.com/
}

export class CoordFinder {
    sourceFile: string
    csvFormat: string
    outputFile: string
    geoJSON: boolean;
    apiKey: string
    result: any

    constructor(config: CoordFinderConfig) {
        if (path.extname(config.csvSourceFile) != '.csv') {
            throw new Error('Source file must be of CSV format')
        }
        if (path.extname(config.jsonOutputFile) != '.json') {
            throw new Error('Output file must be of JSON format')
        }
        if (config.apiKey === '' || config.apiKey === null) {
            throw new Error("Please provide a PositionStack API key")
        }
        if (config.csvFormat === '' || config.csvFormat === null) {
            throw new Error("Please provide a CSV format of your source file collumns")
        }
        this.sourceFile = config.csvSourceFile;
        this.csvFormat = config.csvFormat;
        this.outputFile = config.jsonOutputFile;
        this.apiKey = config.apiKey;
        this.geoJSON = config.geoJSON;
        this.result = {};
    }

    private async parse_csv() {
        try {
            let rows: any[] = [];
            return new Promise((resolve, reject) => {
                fs.createReadStream(this.sourceFile)
                    .pipe(csv())
                    .on('data', (row) => rows.push(row))
                    .on('error', reject)
                    .on('end', async () => {
                        resolve(rows);
                    });
            });
        } catch (e: any) {
            throw new Error('Error parsing CSV input file: ' + e.message)
        }
    }

    private convert_address_to_string(address: any) {
        let sf = this.csvFormat.split(',')
        let a: string = ''
        sf.forEach((part, idx) => {
            if (idx == sf.length - 1) {
                a = a + address[part]
                return
            }
            a = a + address[part] + ', '
        })

        return a;
    }

    private async parse_addresses_geojson(addresses: any[]) {
        interface geoJSON {
            type: string
            features: feature[]
        }
        interface feature {
            type: string
            properties: object
            geometry: geometry
        }
        interface geometry {
            coordinates: [number, number],
            type: string
        }

        let temp: geoJSON = {
            type: "FeatureCollection",
            features: []
        }

        for (const address of addresses) {
            let a = this.convert_address_to_string(address)
            let result = await this.make_request(a)

            let f: feature = {
                type: "Feature",
                properties: {},
                geometry: {
                    coordinates: [
                        result.data['data'][0].latitude,
                        result.data['data'][0].longitude,
                    ],
                    type: "Point"
                },
            }
            temp.features.push(f)
        }

        this.result = temp;
    }

    private async parse_addresses(addresses: any[]) {
        interface ResultAddress {
            address: string
            latlng: any[]
        }
        let r = []
        try {
            for (const address of addresses) {
                let temp: ResultAddress = {
                    address: '',
                    latlng: [],
                };

                temp['address'] = this.convert_address_to_string(address)

                let result = await this.make_request(temp.address)

                temp['latlng'] = [
                    result.data['data'][0].latitude,
                    result.data['data'][0].longitude,
                ];

                r.push(temp);
            }
            this.result = r
        } catch (e: any) {
            throw new Error('Error parsing addresses from CSV file: ' + e.message)
        }
    }

    private async make_request(address: string) {
        try {
            const params = {
                access_key: this.apiKey,
                query: address,
            };
            return await axios.get('http://api.positionstack.com/v1/forward', { params })
        } catch (e: any) {
            throw new Error('Error making request to PositionStack API: ' + e.message)
        }
    }

    private write_results_to_file() {
        try {
            fs.writeFileSync(this.outputFile, JSON.stringify(this.result));
        } catch (e: any) {
            throw new Error('Error while writing result to file: ' + e.message)
        }
    }

    async find() {
        let addresses: any = await this.parse_csv();
        console.log("Fetching coordinates for provided addresses, this may take some time...");
        if (this.geoJSON) {
            await this.parse_addresses_geojson(addresses);
        } else {
            await this.parse_addresses(addresses);
        }
        this.write_results_to_file();
    }
}