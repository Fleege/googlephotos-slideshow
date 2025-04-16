import express, { Express, Request, Response } from "express";
import http from "http";

type typeHttpHandler = (req: Request, res: Response) => void;

export default class expressHandler {
    static app: Express;

    static registerMethod(method: string, url: string, func: typeHttpHandler, authenticationRequired: boolean = true) {
        if(!['get','post','put','delete'].includes(method)) throw new Error(`Method ${method} is not supported`)
        //@ts-expect-error We use a string to call a method, this is not expected in Typescript
        expressHandler.app[method](url, async (req : Request, res: Response) => {
            //@ts-expect-error authenticated is no property of default session object
            if (authenticationRequired && !req.session.authenticated) {
                res.sendStatus(401);
                return;
            }
    
            try {
                await func(req, res);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (e:any) {
                if ("code" in e && "data" in e) {
                    res.status(e.code).send(e.data);
                    return;
                }
    
                res.status(500).send({
                    "status": "error",
                    "message": e.toString()
                });
            }
        });
    }

    static async defineExpress(port: number) {

        expressHandler.app = express();
    
        expressHandler.app.use(express.json({limit: "100mb"}));
        expressHandler.app.use(express.urlencoded({extended: true}));
        
        //SAML Setup

        // disable caching for all requests
        expressHandler.app.use((_req, res, next) => {
            res.set('Cache-Control', 'no-store')
            next()
        })
             
        //Build the httpServer listening on the given port
        const httpServer = http.createServer(expressHandler.app);
        httpServer.listen(port);
    };


}