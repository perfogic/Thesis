import Joi from "joi";
import "dotenv/config";

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("production", "development", "test")
      .required(),
    PORT: Joi.number().default(8000),
    REDIS_HOST: Joi.string().required().description("Redis Host"),
    REDIS_PORT: Joi.string().required().description("Redis Port"),
    REDIS_PASSWORD: Joi.string().required().description("Redis Password"),
    RELAYER_URL: Joi.string().required().description("Relayer Url"),
    LCD_URL: Joi.string().required().description("Lcd Url"),
    POLLING_INTERVAL: Joi.number().required().description("Polling Interval"),
    FIRST_CHECKPOINT_INDEX: Joi.number()
      .required()
      .description("First Checkpoint Index"),
    FIRST_BLOCK_HEIGHT: Joi.number()
      .required()
      .description("First Block Height"),
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
  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    password: envVars.REDIS_PASSWORD,
  },
  oraibtc: {
    relayer: envVars.RELAYER_URL,
    lcd: envVars.LCD_URL,
  },
  checkpoint: {
    pollingInterval: envVars.POLLING_INTERVAL,
    firstCheckpointIndex: envVars.FIRST_CHECKPOINT_INDEX,
  },
  block: {
    pollingInterval: envVars.POLLING_INTERVAL * 10,
    firstBlockHeight: envVars.FIRST_BLOCK_HEIGHT,
  },
};
