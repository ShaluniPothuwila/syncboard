import User from "./schemas/userSchema.js";

export async function findUserByEmail(email) {

  return User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
}

export async function findUserById(id) {
  return User.findById(id);
}

export async function createUser({ name, email, password }) {
  try {
   
    const user = new User({ name, email, passwordHash: password });
    await user.save();
    return user;
  } catch (err) {
    if (err.code === 11000) {
      
      const dupErr = new Error("An account with this email already exists");
      dupErr.status = 409;
      throw dupErr;
    }
    throw err;
  }
}

export async function verifyPassword(user, password) {
  return user.comparePassword(password);
}


export function toPublicUser(user) {
  return { id: user._id.toString(), name: user.name, email: user.email };
}