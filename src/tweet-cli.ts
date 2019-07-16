import Pino from 'pino';
import PinoCaller from 'pino-caller';

import * as twitter from './twitter'



const logger = PinoCaller(Pino({
    name: 'tweet',
    level: process.env.LOG_LEVEL || 'info',
    redact: ['resp.request', 'apiResponse.resp.request.headers.Authorization'],
    serializers: Pino.stdSerializers,
}));


async function main() {
    await twitter.tweetRandom(logger);
}


main()
    .then(() => logger.info('success'))
    .catch(err => logger.error({ err }, 'failure'))
    ;