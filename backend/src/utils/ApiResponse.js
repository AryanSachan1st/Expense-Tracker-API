class ApiResponse {
    constructor (
        code,
        data = {},
        message
    ) {
        this.code = code
        this.data = data
        this.message = message
        this.success = code < 400
    }
}

export { ApiResponse }