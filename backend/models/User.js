const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compare password method
userSchema.methods.comparePassword = function(candidatePassword, callback) {
  console.log('Comparing passwords...');
  console.log('Candidate password length:', candidatePassword.length);
  console.log('Stored password hash:', this.password.substring(0, 20) + '...');
  
  // Check if password is plain text (not hashed)
  if (!this.password.startsWith('$2b$') && !this.password.startsWith('$2a$')) {
    console.log('Plain text password detected, comparing directly');
    const isMatch = candidatePassword === this.password;
    console.log('Plain text comparison result:', isMatch);
    return callback(null, isMatch);
  }
  
  // Hashed password comparison
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) {
      console.log('Compare error:', err);
      return callback(err);
    }
    console.log('Password comparison result:', isMatch);
    callback(null, isMatch);
  });
};

module.exports = mongoose.model('User', userSchema);
