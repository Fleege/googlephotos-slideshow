export default class CustomError extends Error {
    message: string

    constructor (message: string) {
        super()
        this.message = message
    }
}