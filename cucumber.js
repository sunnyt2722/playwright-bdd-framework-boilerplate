const tagExpression = process.env.TAG || '';
const tagOption = tagExpression ? `--tags "${tagExpression}"` : '';

module.exports = {
    default: `--require step-definitions --format json:./reports/cucumber_report.json --format html:./reports/cucumber_report.html --format progress --parallel 1 ${tagOption}`,
    devChrome: `--require step-definitions --format json:./reports/cucumber_report_dev.json --format html:./reports/cucumber_report_dev.html --format progress --parallel 1 ${tagOption}`,
    devFirefox: `--require step-definitions --format json:./reports/cucumber_report_dev.json --format html:./reports/cucumber_report_dev.html --format progress --parallel 1 ${tagOption}`,
    devWebkit: `--require step-definitions --format json:./reports/cucumber_report_dev.json --format html:./reports/cucumber_report_dev.html --format progress --parallel 1 ${tagOption}`,
    testChrome: `--require step-definitions --format json:./reports/cucumber_report_test.json --format html:./reports/cucumber_report_test.html --format progress --parallel 1 ${tagOption}`,
    testFirefox: `--require step-definitions --format json:./reports/cucumber_report_test.json --format html:./reports/cucumber_report_test.html --format progress --parallel 1 ${tagOption}`,
    testWebkit: `--require step-definitions --format json:./reports/cucumber_report_test.json --format html:./reports/cucumber_report_test.html --format progress --parallel 1 ${tagOption}`,
    prodChrome: `--require step-definitions --format json:./reports/cucumber_report_prod.json --format html:./reports/cucumber_report_prod.html --format progress --parallel 1 ${tagOption}`,
    prodFirefox: `--require step-definitions --format json:./reports/cucumber_report_prod.json --format html:./reports/cucumber_report_prod.html --format progress --parallel 1 ${tagOption}`,
    prodWebkit: `--require step-definitions --format json:./reports/cucumber_report_prod.json --format html:./reports/cucumber_report_prod.html --format progress --parallel 1 ${tagOption}`
};
