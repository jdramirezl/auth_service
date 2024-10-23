import {Router} from "express";
import {Login, Logout} from "./controllers/firebase-auth.controller";   

export const routes = (router: Router) => {
    router.post("/login", Login);
    router.post("/logout", Logout);
}

