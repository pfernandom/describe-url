const expect = require('chai').expect;
const describeURL = require('./index').describeURL;

describe('describe-url module', function() {
	it('gets an Amazon description', async function() {
		const url =
      'https://www.amazon.com/Shadow-Colossus-PlayStation-4/dp/B071WPKD5P?pd_rd_wg=EYKPl&pd_rd_r=cd7be339-6296-4409-9cef-965aae7ba000&pd_rd_w=fnsNV&ref_=pd_gw_simh&pf_rd_r=YST8VFSS052Y2ARBVQMK&pf_rd_p=142c5909-6dce-5566-b92f-682609c771e8';
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
