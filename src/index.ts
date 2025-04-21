

import expressHandler from "./expressHandler";
import googlephotos from "./googlephotos";
import { createProxyMiddleware } from 'http-proxy-middleware';
import {Request, Response} from "express"
import winston from "winston";


//Setup logging
winston.level = process.env.SLIDESHOW_LOG_LEVEL || 'info'
winston.add(new winston.transports.Console({
    format: winston.format.printf(info => `${new Date().toISOString()}-${info.level}: ${JSON.stringify(info.message, null, 4)}`)
}))
winston.info(`Logging is configured with level ${winston.level}`)

//Build googlephotos api and search for images
const url = process.env.SLIDESHOW_SOURCE_URL || ''
if(url === '') {
    throw "The Environment Variable SLIDESHOW_SOURCE_URL is not set but it is required"
}
const photos = new googlephotos(url)
photos.fetchImages()

// Define the Express Handler
const port : number = parseInt(process.env.SLIDESHOW_HTTP_PORT || '') || 80
winston.info(`Starting Express Webserver on Port ${port}`)
expressHandler.defineExpress(port)

// Handle the index page
let pathPrefix = process.env.SLIDESHOW_PATH_PREFIX?.replace(/^\/+|\/+$/g, '') || "";
if(pathPrefix)
    pathPrefix = "/" + pathPrefix
expressHandler.registerMethod('get',`${pathPrefix}/`,(_req,res) => {
    winston.debug(`Received Request on /`)
    if(photos.hasImages()) {
        res.send(`Found ${photos.photoUrls.length} Photos`)
    } else {
        res.status(500).send("No images found yet. Maybe the reading is not completed or an error occured. See app log for more information.")
    }
    
})

// handle image request as proxy
// TODO: It would be better to only download the image once from google and cache it somewhere (this could also happen in the googlephotos class)
const proxyWithId = createProxyMiddleware<Request,Response>({
    changeOrigin: true,
    pathRewrite: (_path,req) : string => {
        //TODO: Handle Error? - Currently the Error is returned 1:1 with Stacktrace to the client
        winston.debug(`Running pathRewrite in ProxyMiddleware`)
        const imageid = parseInt(req.params.id)
        const width = req.query.width && !isNaN(parseInt(req.query.width as string)) ? parseInt(req.query.width as string) : 1000
        const url = photos.getImageUrl(imageid, width)
        winston.debug(`Replacing path to ${url.pathname}${url.search}`)
        return `${url.pathname}${url.search}`
    },
    router: (req) => {
        //TODO: Handle Error? - Currently the Error is returned 1:1 with Stacktrace to the client
        winston.debug(`Running router in ProxyMiddleware`)
        const imageid = parseInt(req.params.id)
        const url = photos.getImageUrl(imageid)
        winston.debug(`Replacing Host in router to ${url.protocol}//${url.host}`)
        return `${url.protocol}//${url.host}`
    }
})
expressHandler.app.use(`${pathPrefix}/image/:id`,proxyWithId)

expressHandler.app.use(`${pathPrefix}/image-next`,(req,res) => {
    let redirectTo = `${pathPrefix}/image/${photos.getNextImageId()}`
    if(req.query.width) {
        redirectTo += `?width=${req.query.width}`
    }
    winston.debug(`Now redirecting to ${redirectTo}`)
    res.redirect(redirectTo)
})