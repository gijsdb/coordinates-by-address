const csv = require('csv-parser');
const axios = require('axios');
const fs = require('fs');

let Shops = [];

const parseCsv = async () => {
    let rows = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream('liquorlands.csv')
            .pipe(csv())
            .on('data', (row) => rows.push(row))
            .on('error', reject)
            .on('end', async () => {
                resolve(rows);
            });
    });

}

const formatShops = async (shops) => {
    for (const shop of shops) {
        let temp = {
            Name: '',
            Address: '',
            LatLng: '',
        };
        temp['Name'] = shop['Store'];
        if (shop['Address2'] == '') {
            temp['Address'] = shop['Address1'] + ', ' + shop['City'] + ', ' + shop['Postcode'] + ', ' + 'New Zealand'
        } else if (shop['Address3'] == '') {
            temp['Address'] = shop['Address1'] + ', ' + shop['Address2'] + ', ' + shop['City'] + ', ' + shop['Postcode'] + ', ' + 'New Zealand'
        } else {
            temp['Address'] = shop['Address1'] + ', ' + shop['Address2'] + ', ' + shop['Address3'] + ', ' + shop['City'] + ', ' + shop['Postcode'] + ', ' + 'New Zealand'

        }

        const params = {
            access_key: API_KEY,
            query: temp.Address,
        };

        console.log("Retrieving positions data....")
        const positionData = await axios.get('http://api.positionstack.com/v1/forward', { params })
        temp['LatLng'] = [
            positionData.data['data'][0].latitude,
            positionData.data['data'][0].longitude,
        ];
        console.log("Pushing final shop", temp)
        Shops.push(temp);
    }

    return Shops
}

async function main() {
    const result = await parseCsv()
    const finalShops = await formatShops(result)
    fs.writeFileSync('resultJuly.json', JSON.stringify(finalShops));
}

main()
