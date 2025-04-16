# googlephotos-slideshow
This App will generate a slideshow from a google photos album using a share link.

To generate the link follow these steps:
 - Go to https://photos.google.com and select the album that you want to share.
 - Click in the share button, click in the Create link button and copy the the url.
 - Set the URL as Environment Variable `SLIDESHOW_SOURCE_URL`

## Environment Variables for configuration

 - `SLIDESHOW_SOURCE_URL`: The URL to the shared Google Photos Gallery
 - `SLIDESHOW_HTTP_PORT`: Can be used to configure the listening port for the Webserver / Defaults to 80