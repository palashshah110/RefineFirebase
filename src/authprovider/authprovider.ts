import { AuthProvider } from "@refinedev/core";
import { FirebaseAuth } from "./firebaseauth";

const firebaseAuth = new FirebaseAuth();

const authprovider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      await firebaseAuth.handleLogIn({ email, password, remember: true });
      const user = await firebaseAuth.getFirebaseUser();
      if (user) {
        return { success: true, redirectTo: "/todo" };
      } else {
        throw new Error("User is not found");
      }
    } catch (error: any) {
      return {
        success: false,
        error: { name: "Login Error", message: error.message },
      };
    }
  },
  register: async ({ email, password, displayName }) => {
    try {
      const userCredential = await firebaseAuth.handleRegister({ email, password, displayName });

      if (userCredential.user) {
        firebaseAuth.sendEmailVerification(userCredential.user);
        firebaseAuth.updateProfile(userCredential.user, { displayName }); 
        firebaseAuth.onRegister(userCredential.user); 

        return { success: true };
      } else {
        throw new Error('User credential not found after registration.');
      }
    } catch (error: any) {
      return {
        success: false,
        error: { name: "Registration Error", message: error.message },
      };
    }
  },
  check: async () => {
    try {
      await firebaseAuth.handleCheckAuth();
      const user = await firebaseAuth.getFirebaseUser();
      if (user) {
        return { authenticated: true };
      } else {
        return { authenticated: false };
      }
    } catch (error) {
      return { authenticated: false };
    }
  },
  logout: async () => {
    try {
      await firebaseAuth.handleLogOut();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        redirectTo:'/',
        error: { name: "Logout Error", message: error.message },
      };
    }
  },
  getIdentity: async () => {
    try {
      const user = await firebaseAuth.getUserIdentity();
      return { email: user.email }; // Return the email as identity
    } catch (error) {
      return { email: null }; // Return null if user not found
    }
  },
  onError: async () => {
    return {
      redirectTo: "/",
      logout: false,
      error: { name: "Error", message: "error", stack: "error" },
    };
  },
};


export default authprovider;