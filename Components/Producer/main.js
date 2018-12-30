"use strict"
//@ts-check

class Main
{
    constructor()
    {}

    static async run()
    {

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

