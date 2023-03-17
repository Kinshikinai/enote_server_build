import { body } from "express-validator";

export const regVal = [
    body('login', 'Login length must be at least 2').isLength({min: 2}),
    body('password', 'Password length must be at least 8').isLength({min: 8})
];