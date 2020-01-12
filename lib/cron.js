'use strict';

const CronJob = require('cron').CronJob;
const { init } = require('../index'); 

console.log('Before job instantiation');
const job = new CronJob('0 */10 * * * *', function() {
    const d = new Date();
    init();
	console.log('Every Tenth Minute:', d);
});
console.log('After job instantiation');
job.start();