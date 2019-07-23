import Pino from 'pino';
import PinoCaller from 'pino-caller';
import axios from 'axios';

//import * as twitter from './twitter'



const logger = PinoCaller(Pino({
    name: 'facebook',
    level: process.env.LOG_LEVEL || 'info',
    redact: ['resp.request', 'apiResponse.resp.request.headers.Authorization'],
    serializers: Pino.stdSerializers,
}));


async function main() {

    try {
        const postResponse = await axios.post(`https://graph.facebook.com/v3.3/${process.env.FACEBOOK_PAGE_ID}/feed`, {
            access_token: process.env.FACEBOOK_ACCESS_TOKEN,
            message: 'Hello World!'
        });
        logger.info( { apiResponse: postResponse }, 'page post response');
    } catch (err) {
        if (err.response) {
            /*
             * The request was made and the server responded with a
             * status code that falls out of the range of 2xx
             */
            logger.error( { data: err.response.data, status: err.response.status, headers: err.response.headers }, 'request failed');
        } else {
            // Something happened in setting up the request and triggered an Error
            logger.error( { err }, 'unknown error');
        }
    }
}


main()
    .then(() => logger.info('success'))
    .catch(err => logger.error({ err }, 'failure'))
    ;