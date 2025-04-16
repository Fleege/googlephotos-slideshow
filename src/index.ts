

import expressHandler from "./expressHandler";
import googlephotos from "./googlephotos";

//initially load the Photos from google
const url = process.env.SLIDESHOW_SOURCE_URL || ''
if(url === '') {
    throw "The Environment Variable SLIDESHOW_SOURCE_URL is not set but it is required"
}
const photos = new googlephotos(url)
photos.fetchImages()

// Define the Express Handler
const port : number = parseInt(process.env.SLIDESHOW_HTTP_PORT || '') || 80
console.log(`Starting Express Webserver on Port ${port}`)
expressHandler.defineExpress(port)

// Handle the index page
expressHandler.registerMethod('get','/',(_req,res) => {
    console.log(`Received Request on /`)
    if(photos.hasImages()) {
        let tosend = "hallo, ich habe folgende Bild-URLs:";
        photos.photoUrls.forEach(p => tosend += `\r\n${p}`)
        res.send(tosend)
    } else {
        res.status(500).send("No images found yet. Maybe the reading is not completed or an error occured. See app log for more information.")
    }
    
})

// Handle a request for an image
expressHandler.registerMethod('get','/image/:id',(req,res) => {
    const imageid = parseInt(req.params.id)
    if(Number.isNaN(imageid)) {
        res.status(400).send('ImageId is no valid number')
    }
    console.log(`Received Request on /image for imageid ${imageid}`)
    res.send("this is an image")
})