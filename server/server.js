const app = require('./app');
const connectToDB = require('./config/db');
const { seedHotelsIfEmpty } = require('./modules/hotel/hotel.seed');

async function startServer() {
    await connectToDB();
    await seedHotelsIfEmpty();

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server is running at ${port}`);
    });
}

startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});