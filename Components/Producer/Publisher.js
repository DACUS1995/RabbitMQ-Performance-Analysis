//@ts-check

const amqp = require("amqplib");
const strictEqual = require("assert").strictEqual;

class Publisher
{
    constructor()
    {
        this._connection = null;
        this._arrChannels = [];
    }

    start()
    {

    }

    /**
     * @param {string} strAddress 
     */
    async _connect(strAddress)
    {
        strictEqual(typeof strAddress, "string", "The connection addres should be passed as string.");
        this._connection = await amqp.connect(strAddress);
        return this._connection
    }
}

module.exports = Publisher;
