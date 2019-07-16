import 'source-map-support/register'
//import * as fs from 'fs';
//import Twit from 'twit';
const Twit = require('twit');
import Pino from 'pino';
import axios from 'axios';

async function tweetRandom(logger:Pino.Logger) {

    const logoResponse = await axios.get('https://api.vectorlogo.zone/api/random.json');
    logger.debug({ resp: logoResponse }, 'logo response');

    logger.info({ url: logoResponse.data}, 'logo');
    const logoHandle = logoResponse.data.logohandle;
    const logoName = logoResponse.data.name || logoHandle;
    const imageUrl = `https://svg2raster.fileformat.info/vlz.jsp?svg=/logos/${logoHandle}/${logoHandle}-ar21.svg&width=1024`;

    const imgResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer'
    });

    logger.debug({ resp: imgResponse }, 'img response');

    if (!process.env.TWITTER_CONSUMER_KEY || !process.env.TWITTER_CONSUMER_SECRET) {
        throw new Error('you must set TWITTER_CONSUMER_KEY and TWITTER_CONSUMER_SECRET');
    }   

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
        alt_text: { text: `PNG Preview of the SVG logo for ${logoName}` } 
    });
    logger.debug({ apiResponse: metadataResponse }, 'metadata/create response');

    // post the tweet
    const postResult = await twitterClient.post('statuses/update', { 
        status: `${logoName} vector (SVG) logos.\nCheck them out at https://www.vectorlogo.zone/logos/${logoHandle}/index.html`, 
        media_ids: [mediaIdStr] 
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
    tweetRandom
}
