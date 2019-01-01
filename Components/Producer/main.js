"use strict"
//@ts-check

require('dotenv').config()
const Publisher = require("./Publisher");

class Main
{
	constructor()
	{}

	static async run()
	{
		const publisher = new Publisher();
		await publisher.start();
	}
}

process.on(
	"unhandledRejection",
	(reason, promise) => {
		console.log("-> unhandledRejection");
		console.log(`Promise: ${promise}, Reason: ${reason.stack}`);

		process.exit(1);
	}
);

process.on(
	"uncaughtException", 
	(error) => {
		console.log("uncaughtException");
		console.error(error);
		
		process.exit(1);
	}
)

Main.run()
	.catch(console.error)

