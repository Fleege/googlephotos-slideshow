import axios from 'axios'

export default class googlephotos {
    albumUrl:string
    photoUrls:string[] = []

    constructor(albumUrl: string) {
        this.albumUrl = albumUrl
    }

    async fetchImages() {
        console.log("googlephotos - Fetching images...");
           
        //Request the Album Website
        try {
            console.log(`Now fetching images from google`)
            const googleResponse = await axios.request({method: 'Get',url: this.albumUrl, timeout: 10000}) //TODO: Timeout as parameter?
            
            const rx = /\["(https:\/\/[^.]+.googleusercontent\.com\/[^"]+)",([0-9]+),([0-9]+)[,\]]/;
            this.photoUrls = googleResponse.data
                  .match(new RegExp(rx, "g"))
                  .map((m:string) => m.match(rx))
                  .map((p:string) => {
                    const width = +p[2];
                    const height = +p[3];
                    const _url = `${p[1]}=w${width}-h${height}-no`;
                    return `${p[1]}=w1000`; //TODO: w als Parameter definieren
                  });
            console.log(`Found ${this.photoUrls.length} photos`)
        //TODO: Irgendeine bessere Idee als ignorieren es any hier?
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch(e: any) {
            if(e.response) {
                console.log(`ERROR: Fetching images failed with error status ${e.response.status}${e.response.statusMessage ? ` (${e.response.statusMessage})` : ''}${e.response.data ? ` (Data: ${JSON.stringify(e.response.data, null, 2)})` : ''} - Using known images or empty if none where found yet`)
            } else {
                console.log(`ERROR: Fetching images failed with error ${e.code}${e.message?` (${e.message})`:''} - Using known images or empty if none where found yet`)
            }
        }
    }

    hasImages() {
        return this.photoUrls.length != 0
    }

}