class ApiError extends Error {
    constructor (
        code,
        message = "Something went wrong, please try again later",
        errors = [],
    ) {
        super(message),
        this.message = message,
        this.code = code,
        this.errors = errors,
        this.data = null
        this.success = false
    }
}

export { ApiError }