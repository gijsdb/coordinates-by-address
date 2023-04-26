import * as csv from 'csv-parser';
import axios from 'axios';
import * as fs from 'fs';

export interface CoordFinderConfig {
    sourceFile: string // location of source file with addresses
    outputFile: string; // location where results should go
    apiKey: string; // Position Stack API key https://positionstack.com/
}

interface ResultAddress {
    address: string
    latlng: any[]
}

export class CoordFinder {
    sourceFile: string
    outputFile: string
    apiKey: string
    result: any[]

    constructor(config: CoordFinderConfig) {
        this.sourceFile = config.sourceFile;
        this.outputFile = config.outputFile;
        this.apiKey = config.apiKey;
        if (this.apiKey === '' || this.apiKey === null) {
            throw new Error("Please provide a PositionStack API key")
        }
        this.result = [];
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

    private async parse_addresses(addresses: any[]) {
        try {
            for (const address of addresses) {
                let temp: ResultAddress = {
                    address: '',
                    latlng: [],
                };

                temp['address'] = address['Address 1'] + ', ' + address['Address 2'] + ', ' + address['City'] + ', ' + address['Post code'] + ', ' + address['Country']

                let result = await this.make_request(temp.address)

                temp['latlng'] = [
                    result.data['data'][0].latitude,
                    result.data['data'][0].longitude,
                ];

                this.result.push(temp);
            }
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

            const positionData = await axios.get('http://api.positionstack.com/v1/forward', { params })

            return positionData
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
        console.log("Fetching coordinates for provided addresses, this may take some time...")
        await this.parse_addresses(addresses);
        this.write_results_to_file();
    }
}