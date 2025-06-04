import Authservices from '../../services/Authservices';
// ...existing code...

// Replace all usages of old aliases with canonical names
// Example:
await Authservices.signUp(/* ... */);
await Authservices.signInWithPassword(/* ... */);
await Authservices.sendPasswordResetEmail(/* ... */);
// ...existing code...
