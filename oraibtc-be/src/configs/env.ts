import Joi from "joi";
import "dotenv/config";

const envVarsSchema = Joi.object()
	.keys({
		NODE_ENV: Joi.string()
			.valid("production", "development", "test")
			.required(),
		PORT: Joi.number().default(8000),
	})
	.unknown();

const { value: envVars, error } = envVarsSchema
	.prefs({ errors: { label: "key" } })
	.validate(process.env);

if (error) {
	throw new Error(`Config validation error: ${error.message}`);
}

export default {
	env: envVars.NODE_ENV,
	port: envVars.PORT,
	mongoUrl: envVars.MONGO_URL,
	chain: envVars.CHAIN,
	jwt: envVars.JWT,
	redis: {
		host: envVars.REDIS_HOST,
		port: envVars.REDIS_PORT,
		password: envVars.REDIS_PASSWORD,
	},
	sui: {
		mnemonic: envVars.SUI_MNEMONIC,
		address: envVars.SUI_ADDRESS,
		privateKey: envVars.SUI_PRIVATE_KEY,
	},
	twitter: {
		bearer: envVars.BEARER_TOKEN,
	},
};
