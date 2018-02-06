var fetch = require('node-fetch');

const AMAZON_REGEX = /^https:\/\/[www.]*amazon.com/;
const EBAY_REGEX = /^https:\/\/[www.]*ebay.com/;

function encodeURL(url) {
	var [u1, u2] = url.split('?');
	return u2 ? `${u1}?${encodeURIComponent(u2)}` : u1;
}

function to(promise) {
	return promise
		.then(data => {
			return [null, data];
		})
		.catch(err => [err]);
}

function getAmazon(res) {
	const imgTagReg = /<.*id="(?:landingImage|ebooksImgBlkFront)"[^>]*>/;
	const srcReg = /src="(http[^"]*)"/;
	const dataOldHiresReg = /data-old-hires="(http[^"]+)"/;
	// const dynamicImgReg = /data-a-dynamic-image="([^"]*)"/;

	var [imgTag] = res.match(imgTagReg) || [];
	var [, src] = imgTag.match(srcReg) || [];
	var [, oldHires] = imgTag.match(dataOldHiresReg) || [];
	const img = src || oldHires;
	return {img};
}

function getEbay(res) {
	var [imgTag] = res.match(/<.*itemprop="image"[^>]*>/) || [];
	var [, img] = imgTag.match(/src="(http[^"]*)"/) || [];
	return {img};
}

async function describeURL(reqUrl) {
	const TITLE_REG = /<title>(.*?)<\/title>/;
	const META_DESC_REG = /<meta name="description".+content="?(.*?)"?\/?>/;

	const url = encodeURL(reqUrl);
	const [err, response] = await to(fetch(url));

	if (response) {
		const res = await response.text();
		var [, title] = res.match(TITLE_REG);
		var [, description] = res.match(META_DESC_REG) || [];
		let attrs = {};
		if (AMAZON_REGEX.test(url)) {
			attrs = getAmazon(res);
		} else if (EBAY_REGEX.test(url)) {
			attrs = getEbay(res);
		}

		return {url, title, description, ...attrs};
	} else {
		return {error: 'Request failed', stack: err};
	}
}

exports.describeURL = describeURL;
