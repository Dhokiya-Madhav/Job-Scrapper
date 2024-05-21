const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: false,
        });

        const page = await browser.newPage();
        await page.goto('https://remote.co/remote-jobs/');  
        console.log('Page loaded');

        const jobListings = await page.evaluate(() => {
            const jobs = [];
            const jobList = document.querySelectorAll('.row');
            jobList.forEach(jobList => {
                const jobTitle = jobList.querySelector('a')?.innerText.trim();
                const link = jobList.querySelector('a');
                const companyName = jobList.querySelector('.text-secondary')?.innerText.trim().split(' | ')[0]
                const jobLink = link?.getAttribute('href')
                
                if (jobTitle != '' && companyName != '') {
                    jobs.push({ jobTitle, companyName,jobLink });
                }
            });
            return jobs;
        })

        //console.log('Job Listings:', jobListings); 

        for (let job of jobListings) {
            const page = await browser.newPage();
            await page.goto('https://remote.co/job/'+job.jobLink, { waitUntil: 'domcontentloaded' })
            
            const jobDetails = await page.evaluate(() => {
                const jobLocation = document.querySelector('.location_sm')?.innerText.trim()
                const salary = document.querySelector('.salary_sm')?.innerText.trim()
                const jobDescription = document.querySelector('.job_description')?.innerText.trim()
                
                const companyLogo = document.querySelector('.job_company_logo')
                const CompanyLogo = companyLogo?.getAttribute('src')
                const companyLink = document.querySelector('.links_sm a')
                const webSiteLink = companyLink?.getAttribute('href')
                
                return { jobLocation, salary, jobDescription, CompanyLogo, webSiteLink }
            })
            job.jobDetails = jobDetails;
        }
        console.log(JSON.stringify(jobListings, null, 2));
        await page.close();
    } catch (error) {
        console.error('Error launching browser or navigating:', error);
    }
})();
