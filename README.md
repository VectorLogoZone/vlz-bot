# VectorLogoZone Bot [<img alt="VectorLogoZone Logo" src="https://tools.vectorlogo.zone/favicon.svg" height="90" align="right" />](https://www.vectorlogo.zone/)

Bot to automate posting to social media for VectorLogoZone

## Settings

All settings are stored in environment variables.  The deploy and run scripts get them from a `.env` file.

| name | description
|------|----------------
| TWITTER_BEARER_TOKEN | token for the Twitter API. Check [twitter_get_token.sh](bin/twitter_get_token.sh) to see how I got mine.
| USERNAME | (not currently used) the username to enter in the basic-auth dialog (default=`admin`)
| PASSWORD | (not currently used) the password to enter in the basic-auth dialog (default=`password`)

## Contributing

Contributions are welcome!  Please follow the standard Github [Fork & Pull Request Workflow](https://gist.github.com/Chaser324/ce0505fbed06b947d962)

## License

[GNU Affero General Public License v3.0](LICENSE.txt)

## Credits

Website:

[![Cloudflare](https://www.vectorlogo.zone/logos/cloudflare/cloudflare-ar21.svg)](https://www.cloudflare.com/ "CDN")
[![Git](https://www.vectorlogo.zone/logos/git-scm/git-scm-ar21.svg)](https://git-scm.com/ "Version control")
[![Github](https://www.vectorlogo.zone/logos/github/github-ar21.svg)](https://github.com/ "Code hosting")
[![Handlebars](https://www.vectorlogo.zone/logos/handlebarsjs/handlebarsjs-ar21.svg)](http://handlebarsjs.com/ "Templating")
[![Koa](https://www.vectorlogo.zone/logos/koajs/koajs-ar21.svg)](https://koajs.com/ "Web framework")
[![Node.js](https://www.vectorlogo.zone/logos/nodejs/nodejs-ar21.svg)](https://nodejs.org/ "Application Server")
[![yarn](https://www.vectorlogo.zone/logos/yarnpkg/yarnpkg-ar21.svg)](https://www.yarnpkg.com/ "JS Package Management")
[![pino](https://www.vectorlogo.zone/logos/getpinoio/getpinoio-ar21.svg)](https://www.getpino.io/ "Logging")
[![Twitter](https://www.vectorlogo.zone/logos/twitter/twitter-ar21.svg)](https://twitter.com/ "Twitter profile image (raster)")
[![TypeScript](https://www.vectorlogo.zone/logos/typescriptlang/typescriptlang-ar21.svg)](https://www.typescriptlang.org/ "Programming Language")
[![Google Cloud Run](https://www.vectorlogo.zone/logos/google/google-ar21.svg)](https://cloud.google.com/run/ "Hosting")

* [Google Cloud Scheduler](https://cloud.google.com/scheduler/)
* [nodemon](https://nodemon.io/)
