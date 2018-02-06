# describe-url
Retrieve the title, description and thumbnail of a given URL

## Overview
Some applications depend on users uploading links. Web apps like Facebook or Twitter take links and display a stylized component with the link's page title, description and thumbnail.

This package provides a simple funcion which takes a URL and returns a JSON object containing the title, description, and for some supported websites, a thumbnail image.


## Install
In order to install the package, run the following npm command:
`npm install describe-url`

Or, if you're using Yarn:
`yarn add describe-url`

## How to use it
First, import the function:

`const describeURL = require('describe-url').describeURL;`

The funciton `describeURL` receives a URL as a string, and it returns a promise:

```javascript

describeURL(url).then(data => {
	console.log(data); 
	/*
		{ url: 'https://www.amazon.com/Shadow-Colossus-PlayStation-4/dp/B0...',
		  title: 'Amazon.com: Shadow of the Colossus - PlayStation 4: Video Games',
		  description: 'Amazon.com: Shadow of the Colossus - PlayStation 4: Video Games" ',
		  img: 'https://images-na.ssl-images-amazon.com/images/I/514D6WO2gqL._SX215_.jpg' }

	*/
})

```

## Status
Currently, this plugin is under development. 

Since is difficult to retrieve an image that makes sense from any URL's page, this plugin right now supports returning good images from Amazon and Ebay. The rest of the URLs will return the first image that finds, which most of the cases is a bad choice and should be ignored.

Until I find a good way to identify good images from **any** page, I'm focusing on the most used websites, like online shops. Next phase will be social network posts. 
If you find a good use case that you want to support retrieving thumbnail images, please let me know to include it in the plugin.