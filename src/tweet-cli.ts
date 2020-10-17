import moment from 'moment';
import Pino from 'pino';
import PinoCaller from 'pino-caller';

import * as twitter from './twitter'

const logger = PinoCaller(Pino({
    name: 'vlz-bot-tweet-cli',
    level: process.env.LOG_LEVEL || 'info',
    redact: ['resp.request', 'apiResponse.resp.request.headers.Authorization'],
    serializers: Pino.stdSerializers,
}));

async function checkElapsed(logger:any):Promise<void> {

    const lastTweet = await twitter.getLastTimestamp(logger);
    const earliestNextTweetTime = lastTweet.clone().add(16, 'hours');
    const now = moment();
    if (earliestNextTweetTime.isAfter(now)) {
        logger.error( { earliestNextTweetTime, lastTweet, now }, 'Trying to tweet too soon!');
        process.exit(1);
    }
}

async function main():Promise<twitter.Logo> {
    await checkElapsed(logger);
    const recent = await twitter.getRecent(logger);
    const logo = await twitter.findRandomNotRecent(logger, recent);
    await twitter.tweet(logger, logo);

    return logo;
}

main()
    .then((logo) => logger.info({ logo }, 'success'))
    .catch(err => {
        logger.error({ err }, 'failure');
        process.exit(1);
    });
