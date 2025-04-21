import axios, { AxiosResponse } from 'axios'
import CustomError from './CustomError'
import { URL } from 'url'
import winston from 'winston'

export default class googlephotos {
    albumUrl: string
    photoUrls: string[] = []
    lastImageUrl: number = -1
    targetWidth: number
    requestTimeout: number
    static readonly imageUrlRegex = /\["(https:\/\/[^.]+.googleusercontent\.com\/[^"]+)",([0-9]+),([0-9]+)[,\]]/;

    constructor(albumUrl: string, config: {targetWidth: number, requestTimeout: number} = {targetWidth: 1000, requestTimeout: 10000}) {
        this.albumUrl = albumUrl
        this.targetWidth = config.targetWidth
        this.requestTimeout = config.requestTimeout
    }

    async fetchImages() {
        winston.info("googlephotos - Searching images...")
           
        //Request the Album Website
        try {
            winston.debug(`Now fetching images from google`)
            const googleResponse = await axios.request({method: 'Get',url: this.albumUrl, timeout: this.requestTimeout})
            winston.debug(`Now parsing google response`)
            const allPhotoUrls = googleResponse.data
                  .match(new RegExp(googlephotos.imageUrlRegex, "g"))
                  .map((m:string) => m.match(googlephotos.imageUrlRegex))
                  .map((p:string) => {
                    // The width and height in the captured url are stored in match 2 (width) and 3 (height), the url itself is 1
                    return `${p[1]}`;
                  });
            this.photoUrls = [...new Set<string>(allPhotoUrls)] //Some photos may be found multiple times
            winston.info(`Found ${this.photoUrls.length} photos`)
            winston.silly(`URLs JSON: ${JSON.stringify(this.photoUrls)}`)

        //TODO: Any better idea than ignoring eslint here?
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch(e: any) {
            if(e.response) {
                winston.error(`ERROR: Fetching images failed with error status ${e.response.status}${e.response.statusMessage ? ` (${e.response.statusMessage})` : ''}${e.response.data ? ` (Data: ${JSON.stringify(e.response.data, null, 2)})` : ''} - Using known images or empty if none where found yet`)
            } else {
                winston.error(`ERROR: Fetching images failed with error ${e.code}${e.message?` (${e.message})`:''} - Using known images or empty if none where found yet`)
            }
        }
    }

    getImageUrl(imageid: number, targetWidth: number = this.targetWidth) : URL {
        if(Number.isNaN(imageid)) {
            throw new CustomError(`The ImageId is no valid number`)
        }
        if(imageid < 0 || imageid >= this.photoUrls.length) {
            throw new CustomError(`The given ImageId does not exist`)
        }
        if(Number.isNaN(targetWidth) || targetWidth < 50 || targetWidth > 10000) {
            throw new CustomError(`The targetWidth is not valid`)
        }
        return new URL(`${this.photoUrls[imageid]}=w${targetWidth}`)
    }

    getNextImageId(): number {
        if(!this.hasImages()) {
            throw new CustomError(`No images fetched from google yet`)
        }
        this.lastImageUrl = this.lastImageUrl < this.photoUrls.length-1 ? this.lastImageUrl + 1 : 0
        return this.lastImageUrl
    }

    hasImages() {
        return this.photoUrls.length != 0
    }

}