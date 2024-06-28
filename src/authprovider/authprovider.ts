import { AuthProvider } from "@refinedev/core";
import { FirebaseAuth } from "./FirebaseAuth";

const firebaseAuth = new FirebaseAuth();

const authProvider: AuthProvider = {
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
      const userCredential = await firebaseAuth.handleRegister({
        email,
        password,
        displayName,
      });

      if (userCredential.user) {
        firebaseAuth.sendEmailVerification(userCredential.user);
        firebaseAuth.updateProfile(userCredential.user, { displayName });
        firebaseAuth.onRegister(userCredential.user);

        return { success: true };
      } else {
        throw new Error("User credential not found after registration.");
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
        redirectTo: "/",
        error: { name: "Logout Error", message: error.message },
      };
    }
  },
  forgotPassword: async ({ email }) => {
    try {
      const response: any = await firebaseAuth.handleForgotPassword(email);
      if (response.success) {
        return { success: true };
      } else {
        throw new Error(response.error.message);
      }
    } catch (error: any) {
      return {
        success: false,
        error: { name: "Forgot Password Error", message: error.message },
      };
    }
  },
  updatePassword: async ({ newPassword }) => {
    try {
      const response: any = await firebaseAuth.handleUpdatePassword(
        newPassword
      );
      if (response.success) {
        return { success: true };
      } else {
        throw new Error(response.error.message);
      }
    } catch (error: any) {
      return {
        success: false,
        error: { name: "Update Password Error", message: error.message },
      };
    }
  },
  getIdentity: async () => {
    try {
      const user = await firebaseAuth.getUserIdentity();
      return { email: user.email }; 
    } catch (error) {
      return { email: null }; 
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

export default authProvider;
