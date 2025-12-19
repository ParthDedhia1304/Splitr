const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');
const { clerkClient } = require('@clerk/clerk-sdk-node'); // Import clerkClient explicitly

const verifyToken = ClerkExpressRequireAuth();

const syncUser = async (req, res, next) => {
  try {
    const { userId: clerkId } = req.auth;

    if (!clerkId) {
      return res.status(401).json({ msg: "Unauthorized: No Clerk ID found" });
    }

    // 1. Try to find user by Clerk ID
    let user = await User.findOne({ clerkId });

    // 2. If not found by Clerk ID, we need to check if they exist by EMAIL
    if (!user) {
      // Fetch user details from Clerk to get the email
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const email = clerkUser.emailAddresses[0].emailAddress;
      
      const name = clerkUser.firstName 
        ? `${clerkUser.firstName} ${clerkUser.lastName || ''}` 
        : email.split('@')[0];

      // Check if email already exists in MongoDB
      user = await User.findOne({ email });

      if (user) {
        // SCENARIO A: User exists (Old Account) -> Update them with Clerk ID
        console.log(`Migrating existing user: ${user.email}`);
        user.clerkId = clerkId;
        await user.save();
      } else {
        // SCENARIO B: Brand new user -> Create them
        console.log(`Creating new user: ${email}`);
        user = new User({
          clerkId,
          email,
          name: name.trim()
        });
        await user.save();
      }
    }

    req.user = user._id.toString(); 
    next();

  } catch (err) {
    console.error('Auth Sync Error:', err.message);
    // Don't crash the server, just send error
    if (!res.headersSent) {
      res.status(500).json({ msg: 'Server Error during Auth Sync' });
    }
  }
};

module.exports = [verifyToken, syncUser];