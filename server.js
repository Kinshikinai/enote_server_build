import express from "express";
import cors from "cors";
import db from "./db.js";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config()

import { validationResult } from "express-validator";
import { regVal } from "./auth.js";

const port = process.env.port || 3001;
const app  = express();

app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
   res.send('BRUH');
})

app.post('/reg', regVal, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send(errors.array());
        }
        else {
            await db.query('SELECT id FROM `users` WHERE login=?', [req.body.login])
            .then(async result => {
                if (result[0].length == 0) {
                    await db.query('INSERT INTO `users`(`login`, `password`) VALUES (?,?)', [req.body.login, req.body.password])
                    .then(async result => {
                        console.log('REG: ' + req.body.login + ' ' + req.body.password);
                        return res.json(result[0].insertId);
                    })
                    .catch(async err => {
                        if (err) {
                            return res.status(400).send(...err);
                        }
                    });
                }
                else {
                    return res.json({
                        msg: 'Username is already taken',
                        err: true
                    });
                }
            })
            .catch(async err => {
                if (err) {
                    return console.log(err);
                }
            });
        }
    } catch (err) {
        return console.log('post /reg ' + err);
    }
});

app.post('/login', async (req, res) => {
    try {
        await db.query('SELECT * FROM `users`')
        .then(async result => {
            if (result[0].length == 0) {
                return res.json({
                    msg: 'No users registered yet',
                    err: true
                });
            }
        });
        await db.query('SELECT id, password FROM `users` WHERE login=?', [req.body.login])
        .then(async result => {
            if (result[0].length == 0) {
                return res.json({
                    msg: 'Incorrect username or password',
                    passed: false
                });
            }
            else {
                if (req.body.password == result[0][0].password) {
                    console.log('LOGIN'  + req.body.login + ' ' + req.body.password);
                    res.json({
                        id: result[0][0].id,
                        passed: true
                    });
                }
                else {
                    res.json({
                        msg: 'Incorrect username or password',
                        passed: false
                    });
                }
            }
        })
        .catch(async err => {
            return res.send('ERR');
        });
    } catch (err) {
        return console.log('post /login ' + err);
    }
})

app.post('/notes/:user_id', async (req, res) => {
    try {
        const id = parseInt(req.params.user_id);
        if (req.body.password === 'bruh') {
            await db.query('SELECT * FROM `users` WHERE id=?', [id])
            .then(async result => {
                if (result[0].length == 0) {
                    return res.status(400).json({
                        msg: 'No such user found',
                        err: true
                    })
                }
                else {
                    await db.query('INSERT INTO `notes`(`user_id`, `heading`, `body`) VALUES (?,?,?)', [id, req.body.heading, req.body.body])
                    .then(async result => {
                        return res.json(result);
                    })
                    .catch(async err => {
                        if (err) {
                            return res.status(400).json(err);
                        }
                    });
                }
            })
            .catch(async err => {
                if (err) {
                    return res.status(400).json(err);
                }
            });
        }
    } catch (err) {
        return console.log('post /notes/:user_id ' + err);
    }
});

app.get('/notes_by_user/:user_id/:password', async (req, res) => {
    try {
        const id = parseInt(req.params.user_id);
        if (req.params.password === 'bruh') {
            await db.query('SELECT * FROM `notes` WHERE user_id=?', [id])
            .then(async result => {
                if (result[0].length == 0) {
                    return res.json({
                        msg: 'No such user found or user have no eNotes',
                        err: true
                    });
                }
                
                const newresult = [];
                
                result[0].forEach(el => {
                    var bruh = {
                        ...el,
                        str: el.heading + el.body,
                    }
                    newresult.push(bruh);
                });

                return res.json(newresult);
            })
            .catch(async err => {
                if(err) {
                    return res.status(400).json(err);
                } 
            });
        } else {
            res.status(400).json({
                err: true,
                msg: 'Invalid password',
            });
        }
    } catch (err) {
        return console.log('post /notes/:user_id ' + err);
    }
});

// app.get('/notes_by_id/:id/:password', async (req, res) => {
//     try {
//         const id = parseInt(req.params.id);
//         if (req.params.password === 'bruh') {
//             await db.query('SELECT * FROM `notes` WHERE id=?', [id])
//             .then(async result => {
//                 if (result[0].length == 0) {
//                     return res.status(400).json({
//                         msg: 'No such eNote found',
//                         err: true
//                     });
//                 }
                
//                 const newresult = [];
                
//                 result[0].forEach(el => {
//                     var bruh = {
//                         ...el,
//                         str: el.heading + el.body,
//                     }
//                     newresult.push(bruh);
//                 });

//                 return res.json(newresult);
//             })
//             .catch(async err => {
//                 if(err) {
//                     return res.status(400).json(err);
//                 } 
//             });
//         } else {
//             res.status(400).json({
//                 err: true,
//                 msg: 'Invalid password',
//             });
//         }
//     } catch (err) {
//         return console.log('post /notes/:user_id ' + err);
//     }
// });

app.get('/allnotes/:password', async(req, res) => {
    try {
        const password = req.params.password;
        if (password == 'bruh') {
            await db.query('SELECT * FROM `notes`')
            .then(async result => {
                if (result[0].length == 0) {
                    return res.status(400).json({
                        msg: 'No notes created yet or all deleted',
                        err: true
                    });
                }
                return res.json(result[0]);
            })
            .catch(async err => {
                if (err) {
                    return res.status(400).json(err);
                }
            });
        }
        else {
            return res.status(400).json({
                msg: 'Invalid password',
                err: true
            });
        }
    } catch (err) {
        return console.log(err);
    }
});

app.get('/user_by_id/:id/:password', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (req.params.password === 'bruh') {
            await db.query('SELECT login, password FROM `users` WHERE id=?', [id])
            .then(async result => {
                res.json(result[0][0]); 
            })
            .catch(async err => {
                return res.status(400).json(err);
            });
        } else {
            res.status(400).json({
                err: true,
                msg: 'Invalid password',
            });
        }
    } catch (err) {
        return console.log(err);
    }
})

app.get('/user_by_un/:username/:password', async (req, res) => {
    try {
        const un = req.params.username;
        if (req.params.password === 'bruh') {
            await db.query('SELECT id FROM `users` WHERE login=?', [un])
            .then(async result => {
                res.json(result[0][0]); 
            })
            .catch(async err => {
                return res.status(400).json(err);
            });
        } else {
            res.status(400).json({
                err: true,
                msg: 'Invalid password',
            });
        }
    } catch (err) {
        return console.log(err);
    }
})

app.get('/users/:password', async (req, res) => {
    try {
        const password = req.params.password;
        if (password == 'bruh') {
            await db.query('SELECT * FROM `users`')
            .then(async result => {
                return res.json(result[0]);
            })
            .catch(async err => {
                if (err) {
                    return console.log(err);
                }
            });
        }
        else {
            return res.status(400).json({
                msg: 'Invalid password',
                err: true
            });
        }
    } catch (err) {
        return console.log(err);
    }
});

app.delete('/notes/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await db.query('DELETE FROM `notes` WHERE id=?', [id])
        .then(async result => {
            if (result[0].affectedRows == 0) {
                return res.status(400).json({
                    msg: 'Note is deleted or doesn\'t exist',
                    err: true
                });
            } 
            else {
                return res.status(400).json({
                    success: true
                });
            }
        })
        .catch(async err => {
            if (err) {
                return console.log(err);
            }
        });
    } catch (err) {
        return console.log(err);
    }
});

app.patch('/notes/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await db.query('UPDATE `notes` SET `heading`=?,`body`=? WHERE id=? AND user_id=?', [req.body.newheading, req.body.newbody, id, req.body.user_id])
        .then(async result => {
            if (result.data[0].affectedRows == 0) {
                return res.status(400).json({
                    msg: 'You don\'t have access to this note',
                    err: true
                });
            } 
            return res.json(result);
        })
        .catch(async err => {
            if (err) {
                return res.status(400).json(err);
            }
        });
    } catch (err) {
        return console.log(err);
    }
});

app.listen(port, err => {
    if (err) {
        console.log(err);
    }
    else {
        console.log(`SERVER STARTED ON: http://localhost:${port}/`);
    }
})