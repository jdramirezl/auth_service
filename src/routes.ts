import {Router} from "express";
import {Login, Validate, Logout} from "./controllers/firebase-auth.controller";   

export const routes = (router: Router) => {
    router.post("/api/ambassador/login", Login);
    router.post("/api/admin/login", Login);
    router.post("/validate/token", Validate);
    router.post('/api/admin/logout', Logout);
    router.post('/api/ambassador/logout',Logout);
    //router.post("/logout", Logout);
}

