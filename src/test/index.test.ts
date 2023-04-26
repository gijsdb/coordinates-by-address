import { describe, expect, test } from '@jest/globals';
const { CoordFinder } = require("../index.ts");


describe('Tests for CoordFinder methods', () => {
    test('CoordFinder parameters are validated', () => {
        let t = () => {
            const cf = new CoordFinder({
                csvSourceFile: './source.json',
                jsonOutputFile: './results.json',
                apiKey: '1234',
                csvFormat: 'address1,address2,city,postcode,country'
            })
        };
        expect(t).toThrow(Error);
        t = () => {
            const cf = new CoordFinder({
                csvSourceFile: './source.csv',
                jsonOutputFile: './results.csv',
                apiKey: '1234',
                csvFormat: 'address1,address2,city,postcode,country'
            })
        };
        expect(t).toThrow(Error);
        t = () => {
            const cf = new CoordFinder({
                csvSourceFile: './source.csv',
                jsonOutputFile: './results.json',
                apiKey: '',
                csvFormat: 'address1,address2,city,postcode,country'
            })
        };
        expect(t).toThrow(Error);
    });

    test('Address object converts to string based on csvFormat', () => {
        let a = [{
            address1: '346 Dominion Road',
            address2: 'Mt Eden',
            city: 'Auckland',
            postcode: '1024',
            country: 'New Zealand'
        },
        {
            address1: '480 Broadway Newmarket',
            city: 'Auckland',
            postcode: '1023',
            country: 'New Zealand'
        }]

        let cf = new CoordFinder({
            csvSourceFile: './source.csv',
            jsonOutputFile: './results.json',
            apiKey: '1234',
            csvFormat: 'address1,address2,city,postcode,country'
        })

        let expected = '346 Dominion Road, Mt Eden, Auckland, 1024, New Zealand'
        let actual = cf.convert_address_to_string(a[0])
        expect(actual).toEqual(expected)

        cf = new CoordFinder({
            csvSourceFile: './source.csv',
            jsonOutputFile: './results.json',
            apiKey: '1234',
            csvFormat: 'address1,city,postcode,country'
        })
        expected = '480 Broadway Newmarket, Auckland, 1023, New Zealand'
        actual = cf.convert_address_to_string(a[1])
        expect(actual).toEqual(expected)
    });
}); 