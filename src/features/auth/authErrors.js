const MESSAGES = {
  "auth/invalid-credential": "Wrong email or password. Try again or reset your password.",
  "auth/wrong-password": "Wrong email or password. Try again or reset your password.",
  "auth/user-not-found": "No account with that email. Register first.",
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/email-already-in-use": "An account with that email already exists. Log in instead.",
  "auth/weak-password": "Password needs at least 6 characters.",
  "auth/missing-password": "Enter your password.",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes or reset your password.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
};

export function authErrorMessage(ex, fallback) {
  return MESSAGES[ex?.code] || fallback;
}
