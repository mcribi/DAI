import mongoose from "mongoose"; // Usamos import para ES Modules
import bcrypt from "bcrypt";
import connectDB from "./model/db.js";  //conecta a la base de datos

// MongoDB connection URI
const mongoURI = 'mongodb://localhost:27017/db/myProject/usuarios';

// Mongoose User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String, // Plain-text passwords stored (to be hashed)
});

const User = mongoose.model('User', userSchema);

(async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB.');

    // Fetch all users
    const users = await User.find({});
    console.log(`Found ${users.length} users.`);

    // Process each user
    for (let user of users) {
      if (user.password && !user.password.startsWith('$2b$')) { // Ensure not already hashed
        // Hash the password
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Update the user's password in the database
        user.password = hashedPassword;
        await user.save();
        console.log(`Password updated for user: ${user.username}`);
      } else {
        console.log(`Password already hashed for user: ${user.username}`);
      }
    }

    console.log('All user passwords processed.');
  } catch (error) {
    console.error('Error processing user passwords:', error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
})();

