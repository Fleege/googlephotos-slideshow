# googlephotos-slideshow
This App will generate a slideshow from a google photos album using a share link.

To generate the link follow these steps:
 - Go to https://photos.google.com and select the album that you want to share.
 - Click in the share button, click in the Create link button and copy the the url.
 - Set the URL as Environment Variable `SLIDESHOW_SOURCE_URL`

## Environment Variables for configuration

 - `SLIDESHOW_SOURCE_URL`: The URL to the shared Google Photos Gallery
 - `SLIDESHOW_HTTP_PORT`: Can be used to configure the listening port for the Webserver / Defaults to 80
 - `SLIDESHOW_LOG_LEVEL`: The log level of the winston logger, defaults to info - Can be one of error , warn, info, verbose, debug, silly
 - `SLIDESHOW_PATH_PREFIX`: If given this prefix will be added to all Paths you can call (eg. /image-next will then be /myprefix/image-next)


### Credits
This Tool is inspired by the Ideas of this Repo [text](https://github.com/balena-io-experimental/photo-gallery)