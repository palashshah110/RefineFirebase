import { Auth, browserLocalPersistence, browserSessionPersistence, createUserWithEmailAndPassword, getAuth, getIdTokenResult, ParsedToken, RecaptchaParameters, RecaptchaVerifier, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateEmail, updatePassword, updateProfile, User as FirebaseUser } from "firebase/auth";
import { AuthProvider } from "@refinedev/core";
import { FirebaseApp } from "firebase/app";
import { AuthActionResponse, CheckResponse } from "@refinedev/core/dist/contexts/auth/types";

export interface IAuthCallbacks {
    onLogin?: (user: FirebaseUser) => void;
    onRegister?: (user: FirebaseUser) => void;
    onLogout?: (auth: Auth) => void;
}

export interface ILoginArgs {
    email: string;
    password: string;
    remember: boolean;
}

export interface IRegisterArgs {
    email: string;
    password: string;
    displayName?: string;
}

export interface IUser {
    email: string;
    name: string;
}

export class FirebaseAuth {
    onRegister(user: {}) {
      throw new Error("Method not implemented.");
    }
    updateProfile(user: {}, arg1: { displayName: any; }) {
      throw new Error("Method not implemented.");
    }
    sendEmailVerification(user: {}) {
      throw new Error("Method not implemented.");
    }
    private auth: Auth;

    constructor(private readonly authActions?: IAuthCallbacks, firebaseApp?: FirebaseApp, auth?: Auth) {
        this.auth = auth || getAuth(firebaseApp);
        this.auth.useDeviceLanguage();
    }

    public async handleLogOut(): Promise<AuthActionResponse> {
        try {
            await signOut(this.auth);
            this.authActions?.onLogout?.(this.auth);
            return { success: true };
        } catch (error:any) {
            return { success: false, error: { name: "Logout Error", message: error.message } };
        }
    }

    public async handleRegister(args: IRegisterArgs): Promise<AuthActionResponse> {
        try {
            const { email, password, displayName } = args;
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            await sendEmailVerification(userCredential.user);
            
            if (userCredential.user) {
                if (displayName) {
                    await updateProfile(userCredential.user, { displayName });
                }
                this.authActions?.onRegister?.(userCredential.user);
                return { success: true }; // Return success response
            } else {
                throw new Error('User credential not found after registration.');
            }
        } catch (error) {
            throw error;
        }
    }

    public async handleLogIn({ email, password, remember }: ILoginArgs): Promise<AuthActionResponse> {
        try {
            let persistence = browserSessionPersistence;
            if (remember) {
                persistence = browserLocalPersistence;
            }
            await this.auth.setPersistence(persistence);
    
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            const userToken = await userCredential?.user?.getIdToken?.();
            if (userToken) {
                this.authActions?.onLogin?.(userCredential.user);
                return { success: true }; 
            } else {
                throw new Error("User is not found");
            }
        } catch (error) {
            throw error;
        }
    }
    
    public async handleResetPassword(email: string): Promise<void> {
        await sendPasswordResetEmail(this.auth, email);
    }

    public async onUpdateUserData(args: IRegisterArgs): Promise<void> {
        try {
            if (this.auth?.currentUser) {
                const { displayName, email, password } = args;
                if (password) {
                    await updatePassword(this.auth.currentUser, password);
                }
                if (email && this.auth.currentUser.email !== email) {
                    await updateEmail(this.auth.currentUser, email);
                }
                if (displayName && this.auth.currentUser.displayName !== displayName) {
                    await updateProfile(this.auth.currentUser, { displayName });
                }
            }
        } catch (error) {
            throw error;
        }
    }

    public async getUserIdentity(): Promise<IUser> {
        try {
            const user = this.auth?.currentUser;
            return {
                email: user?.email || "",
                name: user?.displayName || ""
            };
        } catch (error) {
            throw error;
        }
    }

    public async handleCheckAuth(): Promise<CheckResponse> {
        try {
            const user = await this.getFirebaseUser();
            if (!user) {
                throw new Error("User is not found");
            }
            return{
            authenticated: false,
            redirectTo: "/",
            logout: false,
            error: undefined
            }
        } catch (error) {
            throw error;
        }
    }

    public async getPermissions(): Promise<ParsedToken> {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                throw new Error("No user is currently authenticated");
            }
    
            const idTokenResult = await getIdTokenResult(user);
            return idTokenResult?.claims || {};
        } catch (error) {
            throw error;
        }
    }

    public createRecaptcha(containerOrId: string | HTMLDivElement, parameters?: RecaptchaParameters): RecaptchaVerifier {
        return new RecaptchaVerifier(this.auth,containerOrId, parameters);
    }

    public async getFirebaseUser(): Promise<FirebaseUser | null> {
        return new Promise<FirebaseUser | null>((resolve, reject) => {
            const unsubscribe = this.auth.onAuthStateChanged(user => {
                unsubscribe();
                resolve(user);
            }, reject);
        });
    }

    public getAuthProvider(): AuthProvider {
        return {
            login: this.handleLogIn.bind(this),
            logout: this.handleLogOut.bind(this),
            check: this.handleCheckAuth.bind(this),
            register: this.handleRegister.bind(this),
            onError: async() => { return {
                redirectTo: "/",
                logout: false,
                error: { name: "Error", message: "An error occurred", stack: "Error stack" }
            }},
            getPermissions: this.getPermissions.bind(this),
            getIdentity: this.getUserIdentity.bind(this)
        };
    }
}
