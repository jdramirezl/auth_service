import { Request, Response } from 'express';
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { auth, db, admi } from "../config/firebase";
import { collection, doc, getDoc } from "firebase/firestore"; 

export const Login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(422).json({
            email: "Email is required",
            password: "Password is required",
        });
        return;
    }

    try {
        console.log(email);
        console.log(password);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user
        if (!user) {
            return res.status(400).send({
                message: 'invalid credentials!'
            });
        }
        const adminLogin = req.path === '/api/admin/login';

        const token = await userCredential.user.getIdToken();

        const userDocRef = doc(db, "users", user.uid);
        
        const userAmbassador = await getDoc(userDocRef);
        if (userAmbassador.data().is_ambassador && adminLogin) {
            return res.status(401).send({
                message: 'unauthorized'
            });
        }
        
        res.cookie("jwt", token,{
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000//1 day
        });
        res.send({ message: 'success' });
    } catch (error) {
        console.error(error);
        const errorMessage = (error as Error).message || "Invalid credentials!";
        res.status(400).json({ error: errorMessage });
    }
};

export const Validate = async (req: Request, res: Response) => {
    try {
        console.log("validating*****************+");
        const { path } = req.body;
        const jwt = req.cookies['jwt'];

        const decodedToken = await admi.auth().verifyIdToken(jwt);

        if (!decodedToken) {
            return res.status(401).send({
                message: 'unauthenticated'
            });
        }

        const is_ambassador = path.indexOf('api/ambassador') >= 0;

        const userDocRef = doc(db, "users", decodedToken.uid);
        
        const userAmbassador = await getDoc(userDocRef);
        if ((is_ambassador && !userAmbassador.data().is_ambassador) || (!is_ambassador && userAmbassador.data().is_ambassador)) {
            return res.status(401).send({
                message: 'unauthorized'
            });
        }

        const userRecord = await admi.auth().getUser(decodedToken.uid);
        console.log({ 
            id: decodedToken.user_id,
            email: decodedToken.email,
            first_name: userRecord.displayName,
            is_ambassador: userAmbassador.data().is_ambassador
        });

        const [firstName, lastName] = userRecord.displayName.split(' ',2);
        console.log({ 
            id: decodedToken.user_id,
            email: decodedToken.email,
            first_name: firstName,
            last_name: lastName || '',
            is_ambassador: userAmbassador.data().is_ambassador
        })
        res.send({ 
            id: decodedToken.user_id,
            email: decodedToken.email,
            first_name: firstName,
            last_name: lastName || '',
            is_ambassador: userAmbassador.data().is_ambassador
        });
    } catch (e) {
        return res.status(401).send({
            message: 'unauthenticated'
        });
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


