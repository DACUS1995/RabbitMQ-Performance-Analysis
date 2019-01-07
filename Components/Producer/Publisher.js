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
		this._nPublisherStop = false;
	}

	/**
	 * @param {Object} objConfig 
	 */
	async start(objConfig = {})
	{
		let {
			strAddress,
			strQueueName = "q",
			nMessagesCount,
			nIntervalMiliSec = 1000
		} = objConfig;

		let objConnectionSettings = null;

		if(strAddress === undefined)
		{
			if(
				process.env.USERNAME_MQ
				|| process.env.PASS_MQ
				|| process.env.HOST_MQ
			)
			{
				objConnectionSettings = {
					protocol: 'amqp',
					hostname: process.env.HOST_MQ,
					port: 5672,
					username: process.env.USERNAME_MQ,
					password: process.env.PASS_MQ,     
					vhost: '/',
					authMechanism: ['PLAIN', 'AMQPLAIN', 'EXTERNAL']	
				};
			}
			else
			{
				strAddress = "amqp://localhost";
			}
		}
			
		const connectionHandler = await this._connect({
			type: strAddress === undefined ? Publisher.SETTINGS_BASED : Publisher.ADDRESS_BASED,
			strAddress,
			objConnectionSettings
		});
		this._channel = await connectionHandler.createChannel();

		const objQueueOptions = {
			durable: false
		};

		this._channel.assertQueue(strQueueName, objQueueOptions);
		this._arrQueues.push(strQueueName);
		console.log("Starting to publish");

		while(true)
		{
			// await new Promise((resolve, reject) => {
			// 	setTimeout(() => {
			// 		resolve();
			// 	}, nIntervalMiliSec);
			// })

			await this._addToQueue(Publisher.DUMMY_MESSAGE);

			if(nMessagesCount !== undefined && typeof nMessagesCount === "number")
			{
				nMessagesCount--;
				if(nMessagesCount === 0)
				{
					break;
				}
			}
		}
	}

	async _addToQueue(objMessage)
	{
		const {
			strQueueName,
			strSerializedMessageBody
		} = objMessage;

		try
		{
			const ok = this._channel.sendToQueue(strQueueName, Buffer.from(strSerializedMessageBody));
			console.log(ok);

			if(ok === false)
			{
				await new Promise((resolve, reject) => {
					this._channel.on("drain", resolve);
				});
			}
		}
		catch(error)
		{
			console.error(error);
		}

	}

	/**
	 * @param {Object} objConfig 
	 */
	async _connect(objConfig)
	{
		const {
			type,
			strAddress,
			objConnectionSettings
		} = objConfig;

		if(type === Publisher.ADDRESS_BASED)
		{
			strictEqual(typeof strAddress, "string", "The connection address should be passed as string.");

			if(strAddress === this._address)
			{
				if(this._connection === null)
				{
					throw new Error(`There should already be an existing connection to [${this._address}]`);
				}				
			}
			else
			{
				this._connection = await amqp.connect(strAddress);
				this._address = strAddress;
			}
		}
		
		if(type === Publisher.SETTINGS_BASED)
		{
			this._connection = await amqp.connect(objConnectionSettings);
			this._address = `amqp://${objConnectionSettings.hostname}`;
		}
				
		return this._connection
	}

	static get ADDRESS_BASED()
	{
		return "address_based";
	}

	static get SETTINGS_BASED()
	{
		return "settings_based";
	}

	static get DUMMY_MESSAGE()
	{
		return {
			strQueueName: "q",
			strSerializedMessageBody: "Message"
		};
	}
}

module.exports = Publisher;
