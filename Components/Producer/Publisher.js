//@ts-check

const amqp = require("amqplib");
const strictEqual = require("assert").strictEqual;

class Publisher
{
    constructor()
    {
        this._connection = null;
        this._address = null;
        this._channel = null;
        this._arrQueues = [];
    }

    /**
     * @param {Object} objConfig 
     */
    async start(objConfig = {})
    {
        const {
            strAddress = `amqp://${process.env.host}` || "amqp://localhost",
            strQueueName = "q",
        } = objConfig;

        const connectionHandler = await this._connect(strAddress);
        this._channel = await connectionHandler.createChannel();

        this._channel.assertQueue(strQueueName);
        this._arrQueues.push(strQueueName);
    }

    async _addToQueue(objMessage)
    {
        const {
            strQueueName,
            strSerializedMessageBody
        } = objMessage;

        try
        {
            await this._channel.sendToQueue(strQueueName, Buffer.from(strSerializedMessageBody));
        }
        catch(error)
        {
            console.error(error);
        }

    }

    /**
     * @param {string} strAddress 
     */
    async _connect(strAddress)
    {
        strictEqual(typeof strAddress, "string", "The connection addres should be passed as string.");

        if(strAddress === this._address)
        {
            if(this._connection === null)
            {
                throw new Error(`There should already be an existing connection to [${this._address}]`);
            }

            return this._connection;
        }

        this._connection = await amqp.connect(strAddress);
        this._address = strAddress;
        
        return this._connection
    }
}

module.exports = Publisher;
