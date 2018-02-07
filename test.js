/*global document */

const fs = require('fs');
const expect = require('chai').expect;
const describeURL = require('./index').describeURL;
const puppeteer = require('puppeteer');
const randomWords = require('random-words');

describe('describe-url module', function() {

	it('gets an Amazon description', async function() {
		const url =
      'https://www.amazon.com/OWN-LLC-Watch/dp/B077V4H3VJ/ref=sr_1_1?ie=UTF8&qid=1517963849&sr=8-1&keywords=own';
		const result = await describeURL(url);
		expect(result).to.exist;
		expect(result).to.have.property('url');
		expect(result).to.have.property('title');
		expect(result).to.have.property('img');
		expect(result).to.have.property('description');
	});

	it('gets an Amazon Video description', async function() {
		const url =
      'https://www.amazon.com/The-New-World/dp/B00RSI4WY2/ref=sr_1_3?ie=UTF8&qid=1517965273&sr=8-3&keywords=man';
		const result = await describeURL(url);
		expect(result).to.exist;
		expect(result).to.have.property('url');
		expect(result).to.have.property('title');
		expect(result).to.have.property('img');
		expect(result).to.have.property('description');
	});

	it('gets an Ebay description', async function() {
		const url =
      'https://www.ebay.com/itm/ROGER-WATERS-THE-WALL-NEW-BLU-RAY/381642029447?epid=218421157&hash=item58dba33987:m:mPI5QUfOHzRISTUqBO9Bd0A';
		const result = await describeURL(url);
		expect(result).to.exist;
		expect(result).to.have.property('url');
		expect(result).to.have.property('title');
		expect(result).to.have.property('img');
		expect(result).to.have.property('description');
	});

	it('returns error when URL does not exist', async function() {
		const url = 'https://pfernandom.githubio';
		const result = await describeURL(url);
		expect(result).to.have.property('error');
		expect(result).to.have.property('stack');
	});

	it('encodes the URL', async function() {
		const url =
      'https://pfernandom.github.io?something=guest<script>alert("attacked")</script>';
		const result = await describeURL(url);
		expect(result.url).to.not.match(/[<>'"]/);
		expect(result).to.not.have.property('img');
	});
});


describe('training describe-url module', function() {
	let browser;
	let page;

	before(async function() {
		browser = await puppeteer.launch({
			// headless: false,
			// slowMo: 250
		});
		page = await browser.newPage();
	});

	after(async function() {
		await browser.close();
	});

	it('tests with random Amazon URLs', async function() {
		try {
			const term = randomWords();
			console.log(`Search Amazon links for the term '${term}'`);
			const links = await amazonLinks(term, page);
			const results = [];
			for (let i = 0; i < links.length; i++){
				console.log('Describe the url:', links[i]);
				results.push(await describeURL(links[i]));
			}
			results.forEach(async function(result){
				expect(result).to.exist;
				expect(result).to.have.property('url');
				expect(result).to.have.property('title');
				expect(result).to.have.property('img');
				expect(result).to.have.property('description');
				return result;
			});

			toHTML(results);

		} catch (err){
			console.error('Failed test', err);
		}
	}).timeout(30000);

	xit('tests with random Google URLs', async function() {
		const links = await googleLinks('GTX 1060', page);
		links.forEach(async function(link){
			const result = await describeURL(link);
			expect(result).to.exist;
			expect(result).to.have.property('url');
			expect(result).to.have.property('title');
			expect(result).to.have.property('img');
			expect(result).to.have.property('description');
		});
	}).timeout(30000);
});


async function googleLinks(term, page){
	console.log('Opening page');
	await page.goto('https://google.com', { waitUntil: 'networkidle0' });
	console.log('type');
	await page.type('input[name=q]', term, {delay: 10});
	await page.click('input[type="submit"]');
	await page.waitForSelector('h3 a');
	const links = await page.evaluate(() => {
		const links = document.querySelectorAll('h3 a');
		console.log('links', links);
		return Array.from(links).map(a => {
			return a.href;
		});
	});
	return links;
}

async function amazonLinks(term, page){
	await page.setViewport({ width: 1280, height: 800 });
	await page.goto('https://www.amazon.com', { waitUntil: 'networkidle0' });
	await page.type('#twotabsearchtextbox', term);
	await page.click('input.nav-input');
	await page.waitForSelector('.s-access-detail-page');
	return await page.evaluate(() => {
		const links = document.querySelectorAll('a.a-link-normal.a-text-normal.s-access-detail-page');
		return Array.from(links)
			.map(a => a.href)
			.filter(a => a.indexOf('redirect') < 0);
	});
}

function toHTML(json){
	const pageHTML = `<style> 
		body {
		  font-family: 'Avenir', Helvetica, Arial, sans-serif;
		}

		.preview {
			margin: 20px;
		    border-style: solid;
		    border-width: 1px;
		    border-color: #dadada;
		    padding: 10px;
		    border-radius: 2px;
		}

		.preview img{ 
			width: 15%;
		    display: inline-block;
		} 

		.preview p{ 
			max-height: 100px;
		    display: inline-block;
		    width: 80%;
		} 

		</style> `;

	const html = json.map(thumb => `
			<div class="preview">
				<div><a href="${thumb.url}">${thumb.title}</a></div>
				<img src="${thumb.img}" alt="thumbnail" />
				<p>${thumb.description}</p>
			</div>
		`)
		.reduce((acc, curr) => `${acc} <br/> ${curr}`, pageHTML);
	fs.writeFile('amazon.html', html, (err) => {
		if (err) throw err;
		console.log('The file amazon.html has been saved!');
	});

	fs.writeFile('amazon.json', JSON.stringify(json, null, '\t'), (err) => {
		if (err) throw err;
		console.log('The file amazon.json has been saved!');
	});
}
