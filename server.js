if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}


const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
