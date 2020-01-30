import Koa = require('koa');
import KoaPinoLogger from 'koa-pino-logger';
import KoaRouter from 'koa-router';
import KoaStatic from 'koa-static';
import * as os from 'os';
import * as twitter from './twitter';
import Pino from 'pino';
import PinoCaller from 'pino-caller';
import moment from 'moment';

const app = new Koa();
app.proxy = true;

const logger = PinoCaller(Pino({
    name: 'vlz-bot',
    level: process.env.LOG_LEVEL || 'info',
    redact: ['resp.request', 'apiResponse.resp.request.headers.Authorization'],
    serializers: Pino.stdSerializers,
}));

app.use(KoaPinoLogger({ logger: logger }));

app.use(async(ctx, next) => {
    try {
        await next();
        const status = ctx.status || 404;
        if (status === 404) {
            ctx.log.warn( { url: ctx.request.url }, 'File not found');
            ctx.status = 404;
            ctx.body = { success: false, code: 404, message: 'File not found', url: ctx.request.url };
        }
    } catch (err) {
        ctx.log.error( { err, url: ctx.request.url }, 'Server Error');
        ctx.body = { success: false, code: 500, message: err.message };
    }
});

app.use(KoaStatic("static", { maxage: 24 * 60 * 60 * 1000 }));

const rootRouter = new KoaRouter();

rootRouter.get('/', async (ctx) => {
    ctx.redirect("https://github.com/VectorLogoZone/vlz-bot");
});

rootRouter.get('/tweet.json', async (ctx) => {
    try {
        const lastTweet = await twitter.getLastTimestamp(logger);
        const nextTweetTime = moment().subtract(16, 'hours');
        if (lastTweet.isAfter(nextTweetTime)) {
            ctx.body = { 
                success: false, 
                message: 'Too soon!', 
                currentTime: moment().toISOString(), 
                lastTweet: lastTweet.toISOString(),
                wait: moment.duration(nextTweetTime.diff(lastTweet)).humanize()
            };
            return;
        }
        var logo = await twitter.findRandomNotRecent(logger);
        await twitter.tweet(logger, logo);
        ctx.body = { success: true, message: 'Success', logo };
    } catch (err) {
        logger.error( { err }, 'tweeting failed');
        ctx.body = { success: false, message: err.message };
    }
});

rootRouter.get('/index.html', async (ctx) => {
    await ctx.redirect('/');
});

rootRouter.get('/status.json', (ctx) => {
    const retVal: {[key:string]: any } = {};

    retVal["success"] = true;
    retVal["message"] = "OK";
    retVal["timestamp"] = new Date().toISOString();
    retVal["lastmod"] = process.env['LASTMOD'] || null;
    retVal["commit"] = process.env['COMMIT'] || null;
    retVal["tech"] = "NodeJS " + process.version;
    retVal["__dirname"] = __dirname;
    retVal["__filename"] = __filename;
    retVal["os.hostname"] = os.hostname();
    retVal["os.type"] = os.type();
    retVal["os.platform"] = os.platform();
    retVal["os.arch"] = os.arch();
    retVal["os.release"] = os.release();
    retVal["os.uptime"] = os.uptime();
    retVal["os.loadavg"] = os.loadavg();
    retVal["os.totalmem"] = os.totalmem();
    retVal["os.freemem"] = os.freemem();
    retVal["os.cpus.length"] = os.cpus().length;
    // too much junk: retVal["os.networkInterfaces"] = os.networkInterfaces();

    retVal["process.arch"] = process.arch;
    retVal["process.cwd"] = process.cwd();
    retVal["process.execPath"] = process.execPath;
    retVal["process.memoryUsage"] = process.memoryUsage();
    retVal["process.platform"] = process.platform;
    retVal["process.release"] = process.release;
    retVal["process.title"] = process.title;
    retVal["process.uptime"] = process.uptime();
    retVal["process.version"] = process.version;
    retVal["process.versions"] = process.versions;

    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Methods', 'POST, GET');
    ctx.set('Access-Control-Max-Age', '604800');

    const callback = ctx.request.query['callback'];
    if (callback && callback.match(/^[$A-Za-z_][0-9A-Za-z_$]*$/) != null) {
        ctx.type = 'text/javascript';
        ctx.body = callback + '(' + JSON.stringify(retVal) + ');';
    } else {
        ctx.type = 'application/json';
        ctx.body = JSON.stringify(retVal);
    }
});

app.use(rootRouter.routes());

async function main() {

    const listener = app.listen(process.env.PORT || "4000", function () {
        logger.info( { address: listener.address() }, 'Running');
    });
}

main();
