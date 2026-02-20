import mongoose from "mongoose"

const connectDB = async () => {
    try {
        const connection_instance = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`\n MongoDB connected !! DB HOST: ${connection_instance.connection.host}`)
    } catch (error) {
        console.log(`Error in database connection: ${error}`)
        throw error
    }
}

export { connectDB }