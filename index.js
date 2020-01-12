'use strict';
const Nightmare = require('nightmare');
const cheerio = require('cheerio');
const { promisify } = require('util');
const fs = require('fs');
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const { join } = require('path');
// const Joi = require('@hapi/joi');

const nightmare = Nightmare(/* { show: true } */);

const internals = {};
// internals.companyDataSchema = Joi.array();
// Joi.array().items(Joi.object({ 
//     seq: Joi.number().integer().min(0).required(),
//     companyName: Joi.string().required(),
//     companyShort: Joi.string().required(),
//     mCap: Joi.number().min(0).required(),
//     closePrice: Joi.number().min(0).required(),
//     techRating: Joi.number().integer().min(0).max(99).required(),
//     fundaRating: Joi.number().integer().min(0).max(99).required(),
//     growthRating: Joi.number().integer().min(0).max(99).required(),
//     qualityRating: Joi.number().integer().min(0).max(99).required(),
//     finalRating: Joi.number().integer().min(0).max(99).required(),
//     longTrend: Joi.valid('DOWN', 'UP').required()
// }));

internals.init = async function(){
    try {
        const htmlData = await nightmare
        .goto('https://stockaxis.com/Rating-Checkup.aspx')
        .wait('#ctl00_Content_divCompanies')
        // m cap 1,2,3,4
        .select('div > #ctl00_Content_ddMCap', 3)
        // TechRating
        .select('div > #ctl00_Content_ddTechRating', 3)
        .wait('div > #ctl00_Content_txtTechRatingBetween1')
        .type('div > #ctl00_Content_txtTechRatingBetween1', 40)
        .type('div > #ctl00_Content_txtTechRatingBetween2', 90)
        // FundaRating
        .select('div > #ctl00_Content_ddFundaRating', 3)
        .wait('div > #ctl00_Content_txtFundaRatingBetween1')
        .type('div > #ctl00_Content_txtFundaRatingBetween1', 40)
        .type('div > #ctl00_Content_txtFundaRatingBetween2', 90)
        // Growth Rating
        .select('div > #ctl00_Content_ddGrowthRating', 3)
        .wait('div > #ctl00_Content_txtGrowthRatingBetween1')
        .type('div > #ctl00_Content_txtGrowthRatingBetween1', 40)
        .type('div > #ctl00_Content_txtGrowthRatingBetween2', 90)
        // Final Rating
        .select('div > #ctl00_Content_ddFinalRating', 3)
        .wait('div > #ctl00_Content_txtFinalRatingBetween1')
        .type('div > #ctl00_Content_txtFinalRatingBetween1', 40)
        .type('div > #ctl00_Content_txtFinalRatingBetween2', 90)
        // Trend 1,2
        .select('div > #ctl00_Content_ddTrendRating', 1)
        .wait('div > #ctl00_Content_ddTrendRating')
        .click('div > #ctl00_Content_ddTrendRating')
        .wait(10000)
        .evaluate(() => document.querySelector('#ctl00_Content_divCompanies').innerHTML)
        .end()

        const $ = cheerio.load(htmlData);

        const report = [];
        $('table tbody').children().each(function(i, elementI){
            // tr
            let singleObj = {};
            $(elementI).children().each(function(j, elementJ){
                // td
                switch(j){
                    case 0: 
                        singleObj.seq = $('span', elementJ).text().trim();
                        break;
                    case 1: 
                        singleObj.companyName =  $(':nth-child(1)', elementJ).text().trim();
                        singleObj.companyShort = $(':nth-child(2)', elementJ).text().trim();
                        break;
                    case 2: 
                        singleObj.mCap = $('span', elementJ).text().trim();
                        break;
                    case 3:
                        singleObj.closePrice = $('span', elementJ).text().trim();
                        break;
                    case 4:
                        singleObj.techRating = $('.tooltip-ratl > span', elementJ).text().trim();
                        break;
                    case 5:
                        singleObj.fundaRating = $('.tooltip-ratl > span', elementJ).text().trim();
                        break;
                    case 6:
                        singleObj.growthRating = $('.tooltip-ratl > span', elementJ).text().trim();
                        break;
                    case 7:
                        singleObj.qualityRating = $('.tooltip-ratl > span', elementJ).text().trim();
                        break;
                    case 8:
                        singleObj.finalRating = $('.tooltip-ratl > span', elementJ).text().trim();
                        break;
                    case 9: 
                        singleObj.longTrend = $('span', elementJ).text().trim();
                        break;
                }
            })
            report.push(singleObj);
        });

        // Validate
        // internals.companyDataSchema.validate(report);

        await writeFile(join(__dirname, 'store', `${internals.getToday()}.json`), JSON.stringify(report, null, 4));

    } catch (err){
        console.log(err.message);
    }
}
internals.getToday = function(){
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!

    let yyyy = today.getFullYear();
    if (dd < 10) {
    dd = '0' + dd;
    } 
    if (mm < 10) {
    mm = '0' + mm;
    } 
    return `${yyyy}-${mm}-${dd}`;
}
internals.pullData = function(request, h){
    const { date } = request.params;
    return readFile(join(__dirname, 'store', `${date}.json`));
}

module.exports = function(server){
    server.route({
        method: 'GET',
        path: '/ping',
        handler: (request, h) => {

            return 'pong!!';
        }
    });
    server.route({
        method: 'GET',
        path: '/dig',
        handler: (request, h) => {
            internals.init();
            return 'Digging is in progress, call /pull after 30 sec!';
        }
    });
    server.route({
        method: 'GET',
        path: '/pull/{date}',
        handler: internals.pullData
    });
    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {

            return 'Hey, I am dggr!';
        }
    });
}