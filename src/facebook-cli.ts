import Pino from 'pino';
import PinoCaller from 'pino-caller';
import axios from 'axios';
//import * as fs from 'fs';
import FormData from 'form-data';

//import * as twitter from './twitter'



const logger = PinoCaller(Pino({
    name: 'facebook',
    level: process.env.LOG_LEVEL || 'info',
    redact: ['resp.request', 'apiResponse.resp.request.headers.Authorization'],
    serializers: Pino.stdSerializers,
}));


async function main() {

    try {
        /*
        const postResponse = await axios.post(`https://graph.facebook.com/v3.3/${process.env.FACEBOOK_PAGE_ID}/feed`, {
            access_token: process.env.FACEBOOK_ACCESS_TOKEN,
            message: 'Hello World!'
        });
        */
        const logo = { handle: 'redirect2me' };
        const imageUrl = `https://svg2raster.fileformat.info/vlz.jsp?svg=/logos/${logo.handle}/${logo.handle}-ar21.svg&width=1024`;

        const formData = new FormData();
        //const buf = fs.readFileSync('/home/amarcuse/Downloads/vlz1024.png');
        formData.append("source", imageUrl);
        formData.append("access_token", process.env.FACEBOOK_ACCESS_TOKEN);
        formData.append("published", "false");

        const postResponse = await axios.post(`https://graph.facebook.com/v3.3/${process.env.FACEBOOK_PAGE_ID}/photos`, 
        formData,
        {
            headers: {
                //"Content-Type": "multipart/form-data",
                ...formData.getHeaders(),
                "Content-Length": formData.getLengthSync()
            }
        });
        logger.info( { apiResponse: postResponse }, 'page post response');
        logger.info({ data: postResponse.data }, 'page post data');
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