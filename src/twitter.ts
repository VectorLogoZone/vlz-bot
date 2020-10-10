import 'source-map-support/register'
//import * as fs from 'fs';
import Twit from 'twit';
//const Twit = require('twit');
import Pino from 'pino';
import axios from 'axios';
import moment from 'moment';

export type Logo = {
    handle: string,
    name: string
};

async function getClient(logger:Pino.Logger):Promise<any> {
    const twitterClient = new Twit({
        consumer_key: process.env.TWITTER_CONSUMER_KEY || '',
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET || '',
        access_token: process.env.TWITTER_ACCESS_TOKEN,
        access_token_secret: process.env.TWITTER_ACCESS_SECRET,
        timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
        strictSSL: true,     // optional - requires SSL certificates to be valid.
    });

    const user = await twitterClient.get('account/verify_credentials')
    logger.debug({ apiResponse: user }, "verify_credentials result");

    return twitterClient;
}

const urlRegex = RegExp('^.*/logos/([^/]+)/.*$', 'g');

async function getLastTimestamp(logger:Pino.Logger): Promise<moment.Moment> {
    const twitterClient = await getClient(logger);
    const timelineResponse = await twitterClient.get('statuses/user_timeline', {
        count: 10,
        exclude_replies: true,
        screen_name: "VectorLogoZone",
        trim_user: true,
        tweet_mode: 'extended'
    });

    if (!timelineResponse.data || timelineResponse.data.length === 0) {
        const err = new Error('No tweets in timeline');
        logger.error( { apiResponse: timelineResponse, err }, "Unable to get most recent tweet");
        throw err;
    }

    logger.debug({ tweet: timelineResponse.data[0] }, 'most recent tweet');

    const timestamp = moment(timelineResponse.data[0].created_at, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en');

    return timestamp;
}

async function getRecent(logger:Pino.Logger): Promise<string[]> {
    const retVal:string[] = [];
    const twitterClient = await getClient(logger);
    const timelineResponse = await twitterClient.get('statuses/user_timeline', {
            count: 25,
            exclude_replies: true,
            screen_name: "VectorLogoZone",
            trim_user: true,
            tweet_mode: 'extended'
        });


    logger.debug({ apiResponse: timelineResponse }, 'timeline response');

    for (const tweet of timelineResponse.data) {
        logger.debug({ created: tweet.created_at }, 'created');
        for (const url of tweet.entities.urls) {
            const matches = urlRegex.exec(url.expanded_url);
            //logger.debug({ url: url.expanded_url, matches }, "A Tweet!");
            if (matches != null && matches.length >= 2) {
                retVal.push( matches[1] );
            }
        }
    }
    logger.debug( { handles: retVal }, "recently tweeted logos")

    return retVal;
}

async function findRandomNotRecent(logger:Pino.Logger): Promise<Logo> {

    const logoResponse = await axios.get('https://tools.vectorlogo.zone/api/random.json');
    logger.debug({ resp: logoResponse }, 'logo response');

    return {
        handle: logoResponse.data.logohandle,
        name: logoResponse.data.name
    }
}

async function tweet(logger:Pino.Logger, logo:Logo) {

    const imageUrl = `https://svg2raster.fileformat.info/vlz.jsp?svg=/logos/${logo.handle}/${logo.handle}-ar21.svg&width=1024`;

    const imgResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer'
        });

    logger.debug({ resp: imgResponse }, 'img response');

    if (!process.env.TWITTER_CONSUMER_KEY || !process.env.TWITTER_CONSUMER_SECRET) {
        throw new Error('you must set TWITTER_CONSUMER_KEY and TWITTER_CONSUMER_SECRET');
    }

    const twitterClient = await getClient(logger);

    /*
     * plain tweet
    const tweetResponse = twitterClient.post('statuses/update', {
        status: 'hello world again!',
        //source: '<a href="https://github.com/VectorLogoZone/vlz-bot">VLZ Bot</a>',
    });
    logger.debug({ apiResponse: tweetResponse }, 'simple tweet response');
    */

    // pick a random logo
    // LATER: confirm it isn't in the last N tweets (articleTweetExists in https://github.com/danielelkington/twitter-vue-dev/blob/master/AutoTweetDevArticles/tweet.ts)
    // download svg
    // convert to png

    //var b64content = fs.readFileSync('./test.png', { encoding: 'base64' })
    var b64content = Buffer.from(imgResponse.data, 'binary').toString('base64');



    // post the media to Twitter
    const uploadResponse = await twitterClient.post('media/upload', {
        media_data: b64content
    });
    logger.debug({ apiResponse: uploadResponse }, 'upload response');

    // update its metadata
    const mediaIdStr = uploadResponse.data.media_id_string;
    const metadataResponse = await twitterClient.post('media/metadata/create', {
        media_id: uploadResponse.data.media_id_string,
        alt_text: { text: `PNG Preview of the SVG logo for ${logo.name}` }
    });
    logger.debug({ apiResponse: metadataResponse }, 'metadata/create response');

    // post the tweet
    const postResult = await twitterClient.post('statuses/update', {
        status: `${logo.name} vector (SVG) logos.  Check them out at https://vlz.one/${logo.handle}`,
        media_ids: [mediaIdStr],
        source: 'vlz-bot',
        trim_user: true
    });
    logger.debug({ apiResponse: postResult }, 'update response');
/*
    // delete the tweet
    const deleteResult = twitterClient.post('statuses/destroy/:id', {
        id: postResult.id_str
    });
    logger.debug({ apiResponse: deleteResult }, 'destroy response');
*/
}

export {
    findRandomNotRecent,
    getLastTimestamp,
    getRecent,
    tweet
}
