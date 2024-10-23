import { Request, Response } from 'express';
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
} from '../config/firebase';

const auth = getAuth();

export const Login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(422).json({
            email: "Email is required",
            password: "Password is required",
        });
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        res.send({ message: 'success' });
    } catch (error) {
        console.error(error);
        const errorMessage = (error as Error).message || "Invalid credentials!";
        res.status(400).json({ error: errorMessage });
    }
};

export const Logout = async (req: Request, res: Response): Promise<void> => {
    try {
        await signOut(auth);
        res.clearCookie("jwt");
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error(error);
        const errorMessage = (error as Error).message || "An error occurred while logging out";
        res.status(500).json({ error: errorMessage });
    }
};


