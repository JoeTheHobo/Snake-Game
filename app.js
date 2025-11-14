const simple = require("./server_simple.js");
const {presetGameModes} = require("./presetGameModes.js");
const {items} = require("./server_items.js");
const {tiles} = require("./server_tiles.js");
const zlib = require('zlib');
const express = require('express');
const app = express();
const pako = require('pako');
const profanity = require("./profanity.js");
const sanitize = require("./sanatize.js");
//                         Guest   Account AdminPurple
let server_nameColors = ["#a3a3a3","white","#C92FFD"];

//Account Libraries
const bcrypt = require('bcryptjs');
const crypto = require('crypto');  // You can use crypto to generate random tokens
const nodemailer = require('nodemailer');
// Create a reusable transporter object using the default SMTP transport (e.g., Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail', // For Gmail
    auth: {
        user: 'rborpodcast@gmail.com', // Your Gmail email address
        pass: 'qmdp qrlt ungn ipen'    // Your Gmail app password or account password
    }
});

const allBattlePasses = {};
const pass_beta = require("./Tech Trees/techTree_beta.js");
allBattlePasses[pass_beta.techTree_beta.name] = pass_beta.techTree_beta;


//Connecting To Database
const mysql = require('mysql2');
// Create MySQL Connection
const db = mysql.createConnection({
    host: 'localhost', // e.g., 'localhost' or '127.0.0.1'
    user: 'root',       // e.g., 'root'
    password: '',   // e.g., 'password123'
    database: 'snake_game'
  });

  // Connect to MySQL
db.connect(err => {
    if (err) {
      console.error('Database connection failed: ' + err.stack);
      return;
    }
    console.log('Connected to MySQL database.');
  });

  //socket.io start up
const http = require('http');
const server = http.createServer(app);
const path = require('path');
const { Server } = require("socket.io");
const io = new Server(server, { pingInterval: 25000, pingTimeout: 60000});

const port = 4000;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})
app.get('/reset-password', (req,res) => {
    const { token } = req.query;

    const query = 'SELECT * FROM credentials WHERE reset_token = ?';
    db.query(query, [token], (err, results) => {
        if (err) {
            console.log(7354,err);
            return;
        }



    });
})
app.get('/verify', (req, res) => {
    const { token } = req.query;

    const query = 'SELECT * FROM credentials WHERE verification_token = ?';
    db.query(query, [token], (err, results) => {
        if (err) {
            console.error('Error during token verification:', err);
            return res.status(500).send('An error occurred');
        }

        if (results.length === 0) {
            return res.status(400).send('Invalid or expired token');
        }

        // If token is valid, update the user's status as verified
        const updateQuery = 'UPDATE credentials SET verified = 1 WHERE verification_token = ?';
        db.query(updateQuery, [token], (err) => {
            if (err) {
                console.error('Error updating verification status:', err);
                return res.status(500).send('Error verifying email');
            }

            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });
    });
});

const lobbies = {};
const onlineAccounts = {};

io.on('connection', (socket) => { 
    socket.join(socket.id);
    socket.join("menuScreen");
    setGuestAccount(socket.id,true);

    //socket.emit communicates with the player that just connected, io.emit communicates with the whole lobby
    socket.on('disconnect', (reason) => {
        let username = onlineAccounts[socket.id].username;

        if (onlineAccounts[socket.id].lobby) {
            socket.leave(onlineAccounts[socket.id].lobby.id)
            let lobby = lobbies[onlineAccounts[socket.id].lobby];
            if (lobby.isInGame) {
                for (let i = 0; i < lobby.inGamePlayers.length; i++) {
                    if (lobby.inGamePlayers[i].accountID === socket.id) {
                        deletePlayer(lobby,lobby.inGamePlayers[i],false,false,true);
                    }
                }
            }
            
            for (let i = 0; i < lobby.players.length; i++) {
                if (lobby.players[i] === socket.id) {
                    lobby.players.splice(i,1); 
                }
            }

            if (lobby.players.length < 1) {
                delete lobbies[lobby.id];
            } else {
                lobby.chats.push({
                    account: null,
                    message: username + " Quit The Lobby",
                })

                if (lobby.hostID == socket.id) {
                    lobby.hostID = lobby.players[0];
                    lobby.hostName = onlineAccounts[lobby.players[0]].username;
                    lobby.hostTag = onlineAccounts[lobby.players[0]].tag;
                }
            
                lobby.activePlayers = getPlayersList(lobby.players);

                io.to(lobby.id).emit("updateLobbyPage", lobby);
            }

            
            updateLobbies();
        }
        
        io.to(socket.id).emit("kickPlayer","Disconnected due to " + reason + " [Code: 002]");
        delete onlineAccounts[socket.id];
    }) 
    socket.on("user_forgotPassword",() => {
        let account = onlineAccounts[socket.id];
        if (account.status === "Guest") return;

        const email = account.email;
        // Generate a random token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetLink = `http://167.71.180.126:4000/reset-password?token=${resetToken}`;

        // Store the token in the database (with an expiration time)
        const query = "UPDATE credentials SET reset_token = ?, reset_expiry = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE email = ?";
        db.query(query, [resetToken, email], (err, results) => {
            if (err) {
                io.to(socket.id).emit("popup","Failed To Send Email");
                return;
            }

            // Email content
            let mailOptions = {
                from: "rborpodcastgmail.com",
                to: email,
                subject: "Password Reset Request",
                html: `
                    <h2>Password Reset</h2>
                    <a href="${resetLink}">Click Here To Reset Password</a>
                    <p>This link will expire in 1 hour.</p>
                `
            };
            // Send email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    io.to(socket.id).emit("popup","Failed To Send Email");
                    return;
                }

                io.to(socket.id).emit("popup","Password Reset Sent To Email");
            });
        });

    })
    socket.on("user_changePassword",async (password) => {
        let account = onlineAccounts[socket.id];
        if (account.status === "Guest") return;
        if (!account.canChangePassword) return;

        const email = account.email;
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = "UPDATE credentials SET password = ? WHERE tag = ?";
        db.query(query, [hashedPassword,account.tag],(err,results) => {
            if (err) {
                console.log(67423,err);
                io.to(socket.id).emit("popup","Couldn't Change Password (System Error, try Again)")
                return;
            }

            io.to(socket.id).emit("popup","Password Changed")
        })
        account.canChangePassword = false;
    })
    socket.on("user_changePasswordCheck",(password) => {
        let account = onlineAccounts[socket.id];
        if (account.status == "Guest") return;

        const email = account.email;

        const query = "SELECT * FROM credentials WHERE email = ?";
        db.query(query,[email],(err,results) => {
            if (err) {
                console.log(7635,err);
                return;
            }

            // If no user found
            if (results.length === 0) {
                console.log(52394,"No User Found");
                return;
            }
            if (results.length > 1) {
                console.log(5623,"Duplicate Accounts Found");
                return;
            }
            const user = results[0];

            
            // If passwords are hashed, use bcrypt to compare
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error(436,"Bcrypt error:", err);
                    return;
                }

                if (!isMatch) {
                    account.canChangePassword = false;
                    io.to(socket.id).emit("disallowPasswordChange");
                    return;
                }

                //Success
                account.canChangePassword = true;
                io.to(socket.id).emit("allowPasswordChange");

            });

        })

    })
    socket.on("signInUsingToken",(token,email) => {
        const query = "SELECT * FROM credentials WHERE email = ?";
        db.query(query,[email],(err,results) => {
            if (err) {
                console.log(1452,err);
                return;
            }

            // If no user found
            if (results.length === 0) {
                console.log(5234,"No User Found");
                io.to(socket.id).emit("setScene","newMenu");
                return;
            }
            
            const user = results[0];

            if (user.sign_in_token === null) {
                io.to(socket.id).emit("setScene","newMenu");
                return;
            }

            // If passwords are hashed, use bcrypt to compare
            bcrypt.compare(token, user.sign_in_token, (err, isMatch) => {
                if (err) {
                    console.error(25436,"Bcrypt error:", err);
                    return;
                }

                if (!isMatch) {
                    io.to(socket.id).emit("setScene","newMenu");
                    return;
                }

                //Success
                gatherDBInventory(onlineAccounts[socket.id],user);

            });

        })
    })
    socket.on("user_logout",() => {
        if (onlineAccounts[socket.id].status == "Guest") return;

        let query = "UPDATE credentials SET sign_in_token = ? WHERE tag = ?";
        db.query(query,[null, Number(onlineAccounts[socket.id].tag)],(err) => {if (err) console.log(7543,err);});
        setGuestAccount(socket.id,false,true);
    })
    socket.on("user_login", (email,password,staySignedIn = false) =>{
        if (onlineAccounts[socket.id].status !== "Guest") return;
        let warning;
        if (email == "") warning = "Email Requied";
        if (password == "") warning = "Password Required";
        if (warning) {
            // Send warning message to the client if any validation fails
            io.to(socket.id).emit("login_error", warning);
            return;
        }
        
        // Check if email exists in the database
        const query = "SELECT * FROM credentials WHERE email = ?";
        db.query(query, [email], (err, results) => {
            if (err) {
                console.error("Database error:", err);
                io.to(socket.id).emit("login_error", "Server error, please try again.");
                return;
            }

            // If no user found
            if (results.length === 0) {
                io.to(socket.id).emit("login_error", "No accounts found.");
                return;
            }
            if (results.length > 1) {
                console.log(423,"Duplicate Accounts Found");
                return;
            }

            const user = results[0];

            // Check if the user is verified
            if (user.verified !== 1) {
                io.to(socket.id).emit("login_error", "Please verify your email before logging in.");
                return;
            }

            // If passwords are hashed, use bcrypt to compare
            bcrypt.compare(password, user.password, async (err, isMatch) => {
                if (err) {
                    console.error("Bcrypt error:", err);
                    io.to(socket.id).emit("login_error", "Server error, please try again.");
                    return;
                }

                if (!isMatch) {
                    io.to(socket.id).emit("login_error", "Invalid email or password.");
                    return;
                }

                // SUCCESS: Send login success response
                gatherDBInventory(onlineAccounts[socket.id],user);

                if (staySignedIn) {
                    let code = generateRandomString(10);
                    const hashedCode = await bcrypt.hash(code, 10);
                    io.to(socket.id).emit("lsSave","signInToken",code);
                    io.to(socket.id).emit("lsSave","signInEmail",email);

                    let query = "UPDATE credentials SET sign_in_token = ? WHERE email = ?";
                    db.query(query,[hashedCode,email],(err) => {
                        if (err) console.log(125, err);
                    })
                }
            });
        });
    })
    socket.on("user_signup", (email,username,password) => {
        let account = onlineAccounts[socket.id];
        if (account.status !== "Guest") return;
        if (account.loggedIn) {
            console.log("Caught Hacking",124);
            return;
        }

        let warning;
        if (email == "" || !email) warning = "Email Requied";
        if (username == "" || !username) warning = "Username Requied";
        if (password == "" || !password) warning = "Password Requied";
        if (username.length > 32) warning = "Username Is To Long";
        if (password.length > 100) warning = "Password Is Too Long";

        if (warning) {
            // Send warning message to the client if any validation fails
            io.to(socket.id).emit("signup_error", warning);
            return;
        }

        try {
            const maxTagQuery = "SELECT MAX(tag) AS highestTag FROM credentials";
            db.query(maxTagQuery, async(err,results) => {
                if (err) {
                    io.to(socket.id).emit("signup_error", "An error occurred, please try again later.");
                    return;
                }

                let tag = results[0].highestTag + 1;

                const hashedPassword = await bcrypt.hash(password, 10);

                const query = 'INSERT INTO credentials (username, tag, password, email, status, date_created) VALUES (?, ?, ?, ?, ?, ?)';
        
                db.query(query, [username, tag, hashedPassword, email,"Account", account.dateCreated], (err, results) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            // This means the email is already taken
                            io.to(socket.id).emit("signup_error", "Email Already Exists");
                            return;
                        }
                        // If it's some other error (not duplicate entry), you can log it and notify the user
                        io.to(socket.id).emit("signup_error", "An error occurred, please try again later.");
                        return;
                    }
                    //Success
                    // Create a unique token (e.g., using crypto or JWT)
                    const verificationToken = crypto.randomBytes(20).toString('hex') + "=verify";
                    const verificationLink = `http://167.71.180.126:4000/verify?token=${verificationToken}`;
                    
                    // Insert verification token into the database
                    const updateQuery = 'UPDATE credentials SET verification_token = ? WHERE email = ?';
                    db.query(updateQuery, [verificationToken, email], (err, results) => {
                        if (err) {
                            console.error('Error updating verification token:', err);
                            io.to(socket.id).emit("signup_error", "Error processing your request.");
                            return;
                        }
    
                        // Send a confirmation email with the verification link
                        const mailOptions = {
                            from: 'rborpodcast@gmail.com', // Your email address
                            to: email,
                            subject: 'Please verify your email address',
                            text: `Hello ${username},\n\nPlease verify your email address by clicking the link below:\n\n${verificationLink}\n\nThank you!`
                        };
    
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.error('Error sending email:', error);
                                io.to(socket.id).emit("signup_error", "Error sending verification email.");
                                return;
                            }
                            console.log('Email sent: ' + info.response);
                            io.to(socket.id).emit("user_registered_successfully", "User registered successfully! Please check your email for verification.");
                        });
                    });
    
                    //Add To Inventory Database
                    account.serverSnake.chatNameColor = 1;
                    const invQuery = "INSERT INTO inventory (tag, board_limit, coins, battle_pass_points, server_snake, name_color, challenge_limit, music_volume, sfx_volume) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    db.query(invQuery, [tag,account.boardLimit,account.coins,account.battlePassPoints, JSON.stringify(account.serverSnake), 0, account.challengeLimit,account.musicVolume,account.sfxVolume], (err,results) => {
                        if (err) {
                            console.log(err);
                        }
                    });

                    let type;
                    const allowedQuery = "INSERT INTO allowed (tag, allowed_id, type) VALUES (?, ?, ?)";
                    type = "items";
                    for (let i = 0; i < account.allowedItemIds.length; i++) {
                        db.query(allowedQuery,[tag,account.allowedItemIds[i],type],() =>{});
                    }
                    type = "tiles";
                    for (let i = 0; i < account.allowedTileIds.length; i++) {
                        db.query(allowedQuery,[tag,account.allowedTileIds[i],type],() =>{});
                    }
                    type = "skinPacks";
                    for (let i = 0; i < account.allowedItemSkinPacks.length; i++) {
                        db.query(allowedQuery,[tag,account.allowedItemSkinPacks[i],type],() =>{});
                    }
                    type = "snakeColors";
                    for (let i = 0; i < account.allowedSnakeColors.length; i++) {
                        db.query(allowedQuery,[tag,account.allowedSnakeColors[i],type],() =>{});
                    }
                    type = "nameColors";
                    db.query(allowedQuery,[tag,1,type],() =>{});
                    
                });

            });
        } catch {
            io.to(socket.id).emit("signup_error", "An error occurred while processing your request.");
        }
        
    })
    socket.on("openMapEditor",(boardID) => {
        let account = onlineAccounts[socket.id];
        if (!account.loggedIn) return;
        let query = "SELECT * FROM boards WHERE tag = ? AND id = ?";
        db.query(query,[Number(account.tag),boardID],(err,results) => {
            if (err) {
                console.log(723,err);
                return;
            }

            if (results.length == 0) {
                console.log(843,"No Board Found");
                return;
            }

            let board = results[0].board;
            decompressObject(board,(err,decompressed) => {
                if (err) {
                    console.log(1023,err)
                    return;
                }
                io.to(socket.id).emit("updatePlayersBoards",decompressed,"openMapEditor")
            });
        })
    })
    socket.on("gatherBoardsForBoardMenu",() => {
        gatherBoardsForUser(socket.id,"RefreshBoards");
    })
    socket.on("db_getAccountBoardStats",(sentFrom) => {
        sendBoardStats(socket.id,sentFrom);
    })
    socket.on("saveBoard",(board) => {
        let account = onlineAccounts[socket.id];
        if (!account.loggedIn) return;

        board = fixBoard(JSON.parse(pako.inflate(board, { to: 'string' })));
        //Check Board TO BE ADDED
        if (!account.loggedIn) return;
        if (Number(board.tag) !== Number(account.tag)) return;
        let boardCheck = checkBoard(board,account);
        if (boardCheck !== true) {
            io.to(socket.id).emit("popup","Board Saving Error:" + boardCheck);
            return;
        }

        compressObject(board,(err,compressedBoard) => {
            if (err) {
                console.log(2342134,err);
            }
            let query = "UPDATE boards SET board = ? WHERE id = ? AND tag = ?";
            db.query(query,[compressedBoard,Number(board.id),Number(account.tag)],(err,results)=>{
                if (err) console.log(74534,err);
            })
        })
    })
    socket.on("userLikesBoard", (boardID) => {
        let account = onlineAccounts[socket.id];
        if (!account?.loggedIn) return;
    
        const query = `
            INSERT INTO favorites (tag, id, type)
            SELECT ?, ?, ?
            WHERE NOT EXISTS (
                SELECT 1 FROM favorites WHERE tag = ? AND id = ? AND type = ?
            )
        `;
        
        const values = [
            Number(account.tag), boardID, "board",
            Number(account.tag), boardID, "board"
        ];
    
        db.query(query, values, (err, results) => {
            if (err) throw err;
        });
    });
    socket.on("userDislikesBoard", (boardID) => {
        let account = onlineAccounts[socket.id];
        if (!account?.loggedIn) return;
    
        const query = `
            DELETE FROM favorites 
            WHERE tag = ? AND id = ? AND type = ?
        `;
    
        const values = [Number(account.tag), boardID, "board"];
    
        db.query(query, values, (err, results) => {
            if (err) throw err;
        });
    });
    socket.on("depublishBoard", (boardID) => {
        try {
            let account = onlineAccounts[socket.id];
            if (!account.loggedIn) return;

            // Check ownership
            let checkOwnershipQuery = "SELECT id FROM boards WHERE id = ? AND tag = ?";
            db.query(checkOwnershipQuery, [boardID, Number(account.tag)], (err, results) => {
                if (err) {
                    console.log("Ownership check error:", err);
                    return;
                }

                if (results.length === 0) {
                    // No board found matching the id and tag, user doesn't own the board
                    console.log("Unauthorized depublish attempt");
                    return;
                }

                // User owns the board – proceed with depublishing
                let updateQuery = "UPDATE boards SET published = 0, plays = 0, total_plays = 0 WHERE id = ? AND tag = ?";
                db.query(updateQuery, [boardID, Number(account.tag)], (err, results) => {
                    if (err) {
                        console.log("Update error:", err);
                        return;
                    }
                });

                let deleteFavoriteQuery = "DELETE FROM favorites WHERE type = 'board' AND id = ?";
                db.query(deleteFavoriteQuery, [boardID], (err, results) => {
                    if (err) {
                        console.log("Delete favorites error:", err);
                        return;
                    }
                });
            });
        } catch (e) {
            console.log("Depublish error:", e);
        }
    });
    socket.on("publishBoard",(boardID) => {
        try {
            let account = onlineAccounts[socket.id];
            if (!account.loggedIn) return;

            let queryTotal = "SELECT * FROM boards WHERE tag = ? AND published = 1";
            db.query(queryTotal,[Number(account.tag)],(err,total) => {
                if (err) {
                    console.log(83214,err);
                    return;
                }

                if (total.length >= account.publishedBoardLimit && account.status !== "Admin") return;

                let query = "UPDATE boards SET published = 1 WHERE id = ? AND tag = ?";
                db.query(query,[boardID,Number(account.tag)],(err,results) => {
                    if (err) {
                        console.log(8324,err);
                        return;
                    }
                })
            })
            
            
        } catch {
            console.log("Publish error");
        }
    })
    socket.on("getZippedBoard",(boardID) => {
        try {
            let account = onlineAccounts[socket.id];
            if (!account.loggedIn) return;
            
            let query = "SELECT board from boards WHERE id = ? AND tag = ?";
            db.query(query,[boardID,Number(account.tag)],(err,results) => {
                if (err) {
                    console.log(8324,err);
                    return;
                }
                if (results.length == 0) {
                    console.log(62,"No Boards Found")
                    return;
                }

                io.to(socket.id).emit("sendingZippedBoard",results[0].board,board.name)
            })
        } catch {
            console.log("zipping error");
        }
    });
    socket.on("deleteBoard",(boardID) => {
        let account = onlineAccounts[socket.id];
        if (!account.loggedIn) return;

        if (account.loggedIn) {
            let query = "DELETE FROM boards WHERE tag = ? AND id = ?";
            db.query(query,[Number(account.tag),boardID],(err) => {
                if (err) {
                    console.log(7563,err)
                    return;
                }
            })
        }

    })
    
    socket.on("saveBoardToIndex",(board,index,sentFrom) => {
        return; //Outdated Function
        let account = onlineAccounts[socket.id];
        if (!account.loggedIn) return;

        //Varify Board Here -To Be Added
        board = fixBoard(JSON.parse(pako.inflate(board, { to: 'string' })));

        if (Number(board.tag) !== Number(account.tag)) {
            board.tag = Number(account.tag);
            board.boardAuthors.push({
                tag: account.tag,
                username: account.username,
            })
        }

        if (index > account.boardLimit-1) return;

        decompressObject(account.boards,(err,decompressed) => {
            if (err) {
                console.log(10,err)
                return;
            }
            account.boards = decompressed;

            let cancel = false;
            if (index > account.boards.length-1) {
                if (account.boards.length + 1 >= account.boardLimit) cancel = true;
                if (!cancel) {
                    board.id = Date.now();
                    account.boards.push(board); 
    
                    if (account.loggedIn) {
                        compressObject(board,(err,compressedBoard) => {
                            if (err) {
                                console.log(224,err);
                            }
                            let query = "INSERT INTO boards (tag, board, published, id) VALUES (?, ?, ?, ?)";
                            db.query(query,[Number(account.tag),compressedBoard,0,Number(board.id)],(err)=>{
                                if (err) console.log(64432,err);
                            })
                        })
                    }
                }
            } else {
                account.boards[index] = board;
                let boardID = account.boards[index].id;
                if (account.loggedIn) {
                    compressObject(board,(err,compressedBoard) => {
                        if (err) {
                            console.log(254,err);
                        }
                        let query = "UPDATE boards SET board = ? WHERE id = ? AND tag = ?";
                        db.query(query,[compressedBoard,boardID,Number(account.tag)],(err,results)=>{
                            if (err) console.log(64312,err);
                            console.log(results);
                        })
                    })
                }
            } 
    
            io.to(socket.id).emit("updatePlayersBoards",account.boards,sentFrom,board)
            compressObject(account.boards,(err,compressed) => {
                if (err) {
                    return;
                }
                account.boards = compressed;
            });
        })

    });
    socket.on("gatherUserStats",() => {
        let account = onlineAccounts[socket.id];
        if (!account.loggedIn) return;
        let tag = Number(account.tag);
        //Compile all of the stats into an array using the tag
        
        const query = `
            SELECT stat_name, stat_value
            FROM stats
            WHERE tag = ?
        `;

        db.query(query, [tag], (err, results) => {
            if (err) {
                console.error("Error fetching stats:", err);
                return;
            }

            // Send the results back to the client
            socket.emit("returningUserStats", results);
        });
    })
    socket.on("checkObjectiveCompletion",(slot) => {
        let account = onlineAccounts[socket.id];
        if (!account.loggedIn) return;

        let usersSlot = false;
        if (slot === 1) usersSlot = account.activeChallenge1;
        if (slot === 2) usersSlot = account.activeChallenge2;
        if (slot === 3) usersSlot = account.activeChallenge3;
        if (usersSlot === false) return;

        const query = `SELECT stat_value FROM stats WHERE tag = ? AND stat_name = ?`;
        db.query(query,[Number(account.tag),usersSlot.objective],(err,res) => {
            if (err) {
                console.log(12562434,err);
                return; 
            }
            let pointsNeeded = usersSlot.amt;
            let startVal = usersSlot.startValue;
            let currentVal;
            
            if (res.length === 0) currentVal = 0;
            else currentVal = res[0].stat_value;

            if ((currentVal - startVal) < pointsNeeded) return;
            
            socket.emit("completedObjective",2)

        });
        
        
    })
    socket.on("chooseObjective",(star,id,slot) => {
        let account = onlineAccounts[socket.id];
        if (!account.loggedIn) return;
        
        let usersSlot = false;
        if (slot === 1) usersSlot = account.activeChallenge1;
        if (slot === 2) usersSlot = account.activeChallenge2;
        if (slot === 3) usersSlot = account.activeChallenge3;

        if (usersSlot === false) return;

        let oldSlot = structuredClone(usersSlot);
        let challenge;

        for (let i = 0; i < account.weeklyChallenges.challenges.length; i++) {
            let selected = false;
            if (account.weeklyChallenges.challenges[i].star === star &&
                account.weeklyChallenges.challenges[i].id === id &&
                account.weeklyChallenges.challenges[i].completed === false &&
                account.weeklyChallenges.challenges[i].selected !== true) {
                    challenge = account.weeklyChallenges.challenges[i];
                    account.weeklyChallenges.challenges[i].selected = true;
                    selected == true;
                }
            
            if (oldSlot && !selected) {
                if (account.weeklyChallenges.challenges[i].star === oldSlot.star &&
                    account.weeklyChallenges.challenges[i].id === oldSlot.id) {
                    
                    account.weeklyChallenges.challenges[i].selected = false;
                }

            }

        }

        if (!challenge) return;

        const query = `SELECT stat_value FROM stats WHERE tag = ? AND stat_name = ?`;
        db.query(query,[Number(account.tag),challenge.objective],(err,res) => {
            if (err) {
                console.log("Couldn't Get Stat",err)
                return;
            }

            if (res.length === 0) challenge.startValue = 0;
            else challenge.startValue = res[0].stat_value;
            challenge.selected = true;
            usersSlot = challenge;

            if (slot === 1) account.activeChallenge1 = usersSlot;
            if (slot === 2) account.activeChallenge2 = usersSlot;
            if (slot === 3) account.activeChallenge3 = usersSlot;

            //EMIT
            socket.emit("updateChallenges",account.weeklyChallenges,account.activeChallenge1,account.activeChallenge2,account.activeChallenge3);

            let setName = "active_challenge_" + slot;
            db.query(
                `UPDATE inventory SET ${setName} = ?, weekly_challenges = ? WHERE tag = ?`,
                [JSON.stringify(challenge), JSON.stringify(account.weeklyChallenges) , Number(account.tag)],(err) => {
                    if (err) {
                        console.log(43653245,err);
                        return;
                    }
                }
            );

            const query = `
                SELECT stat_name, stat_value
                FROM stats
                WHERE tag = ?
            `;

            db.query(query, [Number(account.tag)], (err, results) => {
                if (err) {
                    console.error("Error fetching stats:", err);
                    return;
                }

                // Send the results back to the client
                socket.emit("returningUserStats", results,true);
            });


        })
    })
    socket.on("createNewBoard",(boardName,width,height,sentFrom) => {
        let account = onlineAccounts[socket.id];
        if (!account.loggedIn) return;
        boardName = boardName.toString();
        if (boardName.length > 30) boardName = "Untitled";
        if (boardName == "") boardName = "Untitled";
        boardName = profanity.clean(boardName);
        let boardCountQuery = "SELECT * FROM boards WHERE tag = ?";
        db.query(boardCountQuery,[Number(account.tag)],(err,results) => {
            if (err) {
                console.log(62435,err);
                return;
            }

            if (results.length >= account.boardLimit && account.status !== "Admin") return;

            width = 50;//Number(width);
            height = 30;//Number(height);
            let board = {
                name: boardName,
                tag: Number(account.tag),
                width: width,
                height: height,
                minPlayers: 1,
                maxPlayers: 8,
                description: "",
                itemDifferences: [],
                tileDifferences: [],
                background: backgrounds[0],
                gameModes: [presetGameModes[0]],
                originalMap: newMap(width,height), 
                map: [],
                id: Number(Date.now().toString() + simple.rnd(9999)),
                mouseOver: false,
                boardAuthors: [{
                    tag: account.tag,
                    username: account.username,
                }],
                spawnZones: {
                    players: [{
                        id: "player",
                        pos1: {
                            x: 0,
                            y: 0,
                        },
                        pos2: {
                            x: width-1,
                            y: height-1,
                        },
                        team: "white",
                        spawnCap: false,
                        respawnHere: true,
                        priority: 0,
                        alternate: true,
                        display: [
                            {
                                type: "background",
                                display: "background", 
                                backgroundColor: ".team",
                                border: {
                                    color: ".team.darken(20)",
                                    width: 3,
                                    radius: 0,
                                    opacity: 1,
                                },
                                opacity: 0.4,
                                position: {
                                    offSetX: 0,
                                    offSetY: 0,
                                    rotation: 0,
                                    location: "center",
                                    renderFrom: "zone",
                                },
                                xAlign: "center",
                                yAlign: "middle",
                                width: "100%",
                                height: "100%",
                            },
                            {
                                type: "textBox",
                                display: "background",
                                text: ".id",
                                font: {
                                    family: "VT323",
                                    color: "black",
                                    size: 20,
                                    textAlign: "center",
                                    textBaseline: "middle",
                                    bold: false,
                                    italic: false,
                                },
                                position: {
                                    offSetX: 0,
                                    offSetY: 0,
                                    rotation: 0,
                                    location: "center",
                                    renderFrom: "zone",
                                },
                                opacity: 1,
                            }
                        ],
    
                        visible: false,
                        visible_name: false,
                        active: true,
                        activateWhenBoardStatus: false,
                        deactivateWhenBoardStatus: false,
                        activateWhenTimePassed: false, //Seconds
                        deactivateWhenTimePassed: false, //Seconds
                    }],
                    items: [{
                        id: "item",
                        pos1: {
                            x: 0,
                            y: 0,
                        },
                        pos2: {
                            x: width-1,
                            y: height-1,
                        },
                        display: [
                            {
                                type: "background",
                                display: "background", 
                                backgroundColor: "white",
                                border: {
                                    color: "#bfbfbf",
                                    width: 3,
                                    radius: 0,
                                    opacity: 1,
                                },
                                opacity: 0.4,
                                position: {
                                    offSetX: 0,
                                    offSetY: 0,
                                    rotation: 0,
                                    location: "center",
                                    renderFrom: "zone",
                                },
                                xAlign: "center",
                                yAlign: "middle",
                                width: "100%",
                                height: "100%",
                            },
                            {
                                type: "textBox",
                                display: "background",
                                text: ".id",
                                font: {
                                    family: "VT323",
                                    color: "black",
                                    size: 20,
                                    textAlign: "center",
                                    textBaseline: "middle",
                                    bold: false,
                                    italic: false,
                                },
                                position: {
                                    offSetX: 0,
                                    offSetY: 0,
                                    rotation: 0,
                                    location: "center",
                                    renderFrom: "zone",
                                },
                                opacity: 1,
                            }
                        ],
                        itemsThatCantSpawnHere: [],
    
                        visible: false,
                        visible_name: false,
                        active: true,
                        activateWhenBoardStatus: false,
                        deactivateWhenBoardStatus: false,
                        activateWhenTimePassed: false, //Seconds
                        deactivateWhenTimePassed: false, //Seconds
                    }],
                    special: [],
                },
            };
    
            io.to(socket.id).emit("updatePlayersBoards",board,sentFrom)
            
            compressObject(board,(err,compressedBoard) => {
                if (err) {
                    console.log(34633,err);
                    return;
                }
                let query = "INSERT INTO boards (tag, board, published, id) VALUES (?, ?, ?, ?)";
                db.query(query,[Number(account.tag),compressedBoard,0,Number(board.id)],(err)=>{
                    if (err) console.log(6432,err);
                })
            })

        })

    })
    socket.on("newLobby", (lobby) =>{
        if (!lobby) return;

        let boardQuery = "SELECT board, id FROM boards WHERE published = 1";
        db.query(boardQuery, (err,results) => {
            if (err) {
                console.log(62,err);
                return;
            }

            decompressObject(results[0].board,(err,board) => {
                if (err) {
                    console.log(63,err)
                    return;
                }

                let id = Number(Date.now().toString() + simple.rnd(9999));
                lobbies[id] = {};
                lobbies[id].board = board;
                lobbies[id].boardID = results[0].id;
                lobbies[id].id = id;
                lobbies[id].hostID = socket.id;
                lobbies[id].hostName = onlineAccounts[socket.id].username;
                lobbies[id].hostTag = onlineAccounts[socket.id].tag;
                lobbies[id].players = [socket.id];
                lobbies[id].chats = [{
                    account: null,
                    message: "Lobby Created",
                }];
                if (lobby.code == "") lobby.code = rnd(9999);
                lobbies[id].code = lobby.code + "";
                let serverType = lobby.serverType.toLowerCase();
                if (!["public","hidden","private"]) serverType = "public";
                lobbies[id].serverType = serverType;
                lobbies[id].gameMode = board.gameModes[0];
                if (!lobby.playerMax) lobby.playerMax = 8;
                let playerMax = Number(lobby.playerMax);
                if (!simple.type(playerMax,true).isWholeNumber) playerMax = 8;
                if (playerMax < 1) playerMax = 1;
                if (playerMax > 8) playerMax = 8;
                lobbies[id].playerMax = playerMax;
                lobbies[id].lobbyBoards = [];
                lobbies[id].isInGame = false;
                lobbies[id].lobbyName = lobbies[id].hostName + "'s Lobby";
                onlineAccounts[socket.id].lobby = id;
                onlineAccounts[socket.id].player = structuredClone(onlineAccounts[socket.id].serverSnake);
                lobbies[id].activePlayers = getPlayersList(lobbies[id].players);
        
                socket.join(id);
                socket.leave("menuScreen")
                io.to(socket.id).emit("setClientLobby",lobbies[id])
                updateLobbies();
                gatherBoardsForUser(socket.id,"SetBoards")
                
            })

        })

    })
    socket.on("quitServer",() => {
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        if (!lobby) return;

        let username = onlineAccounts[socket.id].username;
        for (let i = 0; i < lobby.players.length; i++) {
            if (lobby.players[i] == socket.id) {
                lobby.players.splice(i,1);
            }
        }

        onlineAccounts[socket.id].lobby = false;
        socket.leave(lobby.id);
        socket.join("menuScreen");

        if (lobby.isInGame) {
            for (let i = 0; i < lobby.inGamePlayers.length; i++) {
                if (lobby.inGamePlayers[i].accountID === socket.id) {
                    deletePlayer(lobby,lobby.inGamePlayers[i],false,false,true);
                    lobby.inGamePlayers[i].leftGameAt = Date.now();
                }
            }
        }


        if (lobby.players.length == 0) {
            delete lobbies[lobby.id];
            updateLobbies();
        } else {
            if (lobby.hostID == socket.id) {
                lobby.hostID = lobby.players[0];
                lobby.hostName = onlineAccounts[lobby.players[0]].username;
                lobby.hostTag = onlineAccounts[lobby.players[0]].tag;
            }
        
            lobby.activePlayers = getPlayersList(lobby.players);
            lobby.chats.push({
                account: null,
                message: username + " Quit The Lobby",
            })
    
            io.to(lobby.id).emit("updateLobbyPage", lobby);
            updateLobbies();
        }
    })
    socket.on("joinLobby",(lobbyID,code,spectate) => {
        let account = onlineAccounts[socket.id];
        if (account.lobby) return;
        let lobby = lobbies[lobbyID];
        if (!lobby) return;

        if (lobby.serverType.toLowerCase() == "private" || lobby.serverType.toLowerCase() == "hidden") {
            if (lobby.code !== code) return;
        }
        if (lobby.players.length == lobby.playerMax) return;


        if (lobby.isInGame && !spectate) {
            io.to(socket.id).emit("askToSpectate",lobbyID,code);
            return;
        }
        
        socket.join(lobby.id);
        socket.leave("menuScreen");
        lobby.players.push(socket.id);
        lobby.chats.push({
            account: null,
            message: account.username + " Joined The Lobby",
        })
        account.lobby = lobby.id;
        account.player = structuredClone(account.serverSnake);
        account.player.canSubmitBoards = false;
        lobby.activePlayers = getPlayersList(lobby.players);
        updateLobbies();
        io.to(lobby.id).emit("updateLobbyPage", lobby.activePlayers, "players", lobby.hostID,lobby.players.length,lobby.playerMax);
        io.to(socket.id).emit("setClientLobby",lobby);
    })
    socket.on("refreshLobbies",() => {
        updateLobbies();
    })
    socket.on("sendChat",(message) => {
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        if (!lobby) return;
        if (message == "") return;
        message = profanity.clean(message,true,["swear_soft"]);

        let username;
        let color;
        for (let i = 0; i < lobby.players.length; i++) {
            if (lobby.players[i] == socket.id) {
                username = onlineAccounts[lobby.players[i]].username;
                color = server_nameColors[onlineAccounts[lobby.players[i]].serverSnake.chatNameColor];
            }
        }

        if (!color) color = "#a3a3a3";

        lobby.chats.push({
            message: message,
            account: username,
            color: color,
        })

        io.to(lobby.id).emit("updateLobbyPage", lobby.chats,"chats");
    })
    socket.on("searchingHiddenServer",(value) => {
        for (const lobbyID in lobbies) {
            let lobby = lobbies[lobbyID];
            if (lobby.serverType.toLowerCase() !== "hidden") continue;
            if (lobby.code === value) {
                socket.listeners("joinLobby")[0](lobby.id,value);
                return;
            }
        }
    })
    socket.on("updateLobbySettings",(settings) => {
        let account = onlineAccounts[socket.id];
        let lobby = lobbies[account.lobby];
        if (!lobby) return;
        if (lobby.hostID !== socket.id) return;

        let serverType = settings.serverType.toLowerCase();
        if (!["public","hidden","private"]) serverType = "public";
        lobby.serverType = serverType;
        
        if (settings.code == "") settings.code = rnd(9999);
        lobby.code = settings.code + "";

        io.to(lobby.id).emit("updateLobbyPage", {
            serverType: serverType,
            code: lobby.code,
        },"settings",lobby.hostID);
        updateLobbies();

    })
    socket.on("editServerGameMode", (gamemode) => {
        socket.listeners("changeServerGameMode")[0](gamemode);
    })
    socket.on("changeServerGameMode",(gameMode) => {
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        if (!lobby) return;
        if (lobby.hostID !== socket.id) return;
        if (!gameMode) return;
        if (checkGameMode(gameMode,socket.id) === true) {
            lobby.gameMode = gameMode;
            io.to(lobby.id).emit("updateLobbyPage", lobby.gameMode,"gameMode");
        } else {
            onlineAccounts[socket.id].kickPlayer = true;
            io.to(socket.id).emit("kickPlayer","Caught Hacking [Code: 956] " + checkGameMode(gameMode,socket.id));
            return;
        }

        
    })
    socket.on("addBoardToLobbyBoards",(board) => {
        let account = onlineAccounts[socket.id];
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        if (!onlineAccounts[socket.id].player.canSubmitBoards && lobby.hostID !== socket.id) return;
        if (!lobby) return;
        if (!board) return;


        //Varify Board Here -To Be Added
        board = fixBoard(JSON.parse(pako.inflate(board, { to: 'string' })));
        if (board.accountID !== socket.id) {
            board.accountID = socket.id;
            board.boardAuthors.push({
                tag: account.tag,
                username: account.username,
            })
        }
        lobby.lobbyBoards.push(board);
    })
    socket.on("askForLobbyBoards", () => {
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        if (!lobby) return;
        if (lobby.hostID !== socket.id) return;

        io.to(lobby.id).emit("settingLobbyBoards",lobby.lobbyBoards);

    })
    socket.on("playerDislikedLobbyBoard",() =>{
        let account = onlineAccounts[socket.id];
        if (!account.loggedIn) return;
        let lobby = lobbies[account.lobby];
        if (!lobby) return;
        
        const query = `
            DELETE FROM favorites 
            WHERE tag = ? AND id = ? AND type = ?
        `;
    
        const values = [Number(account.tag), lobby.boardID, "board"];
    
        db.query(query, values, (err, results) => {
            if (err) throw err;
        });

    })
    socket.on("playerLikedLobbyBoard",() => {
        let account = onlineAccounts[socket.id];
        if (!account.loggedIn) return;
        let lobby = lobbies[account.lobby];
        if (!lobby) return;

        const query = `
            INSERT INTO favorites (tag, id, type)
            SELECT ?, ?, ?
            WHERE NOT EXISTS (
                SELECT 1 FROM favorites WHERE tag = ? AND id = ? AND type = ?
            )
        `;
        
        const values = [
            Number(account.tag), lobby.boardID, "board",
            Number(account.tag), lobby.boardID, "board"
        ];
    
        db.query(query, values, (err, results) => {
            if (err) throw err;
        });
    })
    socket.on("checkIfILikeTheBoard",() => {
        let account = onlineAccounts[socket.id];
        if (!account.loggedIn) return;
        let lobby = lobbies[account.lobby];
        if (!lobby) return;

        const query = `SELECT * FROM favorites WHERE tag = ${Number(account.tag)} AND type = "board" AND id = "${lobby.boardID}"`;
        db.query(query,(err,results) => {
            if (err) throw err;

            if (results.length == 0) {
                io.to(socket.id).emit("playerHasNotLikedBoard");
            } else {
                io.to(socket.id).emit("playerHasLikedBoard");
            }
        })



    })
    socket.on("changeServerBoard",(boardID) => {
        let account = onlineAccounts[socket.id];
        let lobby = lobbies[account.lobby];
        if (!lobby) return;
        if (lobby.hostID !== socket.id) return;
        if (!boardID) return;

        let query = `SELECT * FROM boards WHERE id = ${boardID}`;
        db.query(query,(err,results) => {
            if (err) {
                console.log(939,err);
                return;
            }

            if (results.length == 0) return;

            let board = results[0];

            let pass = false;
            if (Number(account.tag) == Number(board.tag)) pass = true;
            if (board.published === 1) pass = true;

            if (!pass) return;

            decompressObject(board.board,(err,goodBoard) => {
                if (err) {
                    console.log(73, err);
                    return;
                }

                lobby.board = goodBoard;
                lobby.boardID = boardID;
                lobby.gameMode = lobby.board.gameModes[0]; 
                io.to(lobby.id).emit("updateLobbyPage", lobby.board,"board",lobby.hostID);
                io.to(lobby.id).emit("updateLobbyPage", lobby.gameMode,"gameMode",lobby.hostID);
                updateLobbies();
            })
        })

        
    })
    socket.on("setCode",(code) => {
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        if (!lobby) return;
        if (lobby.hostID !== socket.id) return;
        if (code == "") return;

        lobby.code = code;
    })
    socket.on("setPlayerBoardSubbmisionStatus",(player, value) => {
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        if (!lobby) return;
        if (lobby.hostID !== socket.id) return;

        let activePlayer = onlineAccounts[player.accountID];
        if (!activePlayer) return;
        if (lobby.id !== activePlayer.lobby) return;

        activePlayer.player.canSubmitBoards = value;

        lobby.activePlayers = getPlayersList(lobby.players);
        
        io.to(lobby.id).emit("updateLobbyPage", lobby.activePlayers,"submissionStatus",lobby.hostID);
    })
    socket.on("kickPlayerFromLobby",(player) => {
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        if (!lobby) return;
        if (lobby.hostID !== socket.id) return;

        let kickedPlayer = onlineAccounts[player.accountID];
        if (!kickedPlayer) return;
        if (lobby.id !== kickedPlayer.lobby) return;

        kickedPlayer.lobby = false;

        for (let i = 0; i < lobby.players.length; i++) {
            if (lobby.players[i] === kickedPlayer.id) {
                let username = kickedPlayer.username;
                lobby.chats.push({
                    account: null,
                    message: username + " Got Kicked From Lobby",
                })
                lobby.players.splice(i,1);
                break;
            }
        }
        lobby.activePlayers = getPlayersList(lobby.players);
        socket.leave(lobby.id);
        socket.join("homeScreen")

        updateLobbies();
        io.to(socket.id).emit("setPlayerToHomeScreen");
        io.to(lobby.id).emit("updateLobbyPage", lobby.activePlayers, "players",lobby.hostID,lobby.players.length,lobby.playerMax);
    })
    socket.on("setLobbyHost",(player) => {
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        if (!lobby) return;
        if (lobby.hostID !== socket.id) return;

        let newHost = onlineAccounts[player.accountID]; 
        if (!newHost) return;
        if (lobby.id !== newHost.lobby) return;
        lobby.hostID = newHost.id;
        lobby.hostName = newHost.username;
        lobby.hostTag = newHost.tag;

        let username = newHost.username;
        lobby.chats.push({
            account: null,
            message: username + " Is The New Lobby Host",
        })

        io.to(lobby.id).emit("updateLobbyPage", lobby);
    })
    socket.on("endGame",() => {
        let account = onlineAccounts[socket.id];
        let lobby = lobbies[account.lobby];
        if (!lobby) return;
        if (lobby.hostID !== socket.id) return;
        if (!lobby.isInGame) return;

        checkWinningCondition(lobby,"All Dead",false,undefined,true);
    })
    socket.on("changeLobbyName",(value) => {
        let account = onlineAccounts[socket.id];
        let lobby = lobbies[account.lobby];
        if (!lobby) return;
        if (lobby.hostID !== socket.id) return;
        if (value.length > 20) return;
        if (value === "") return;
        value = profanity.clean(value);
        lobby.lobbyName = value;

        io.to(lobby.id).emit("updateLobbyPage", lobby.lobbyName, "lobbyName");
        updateLobbies();
    })
    socket.on("ping", (callback) => {
        callback();
    });
    socket.on("startGame", () =>{
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        if (!lobby) return;
        if (lobby.hostID !== socket.id) return;

        helper_resetLobby(lobby);

        let allPlayersSpawned = helper_spawnPlayers(lobby);
        if (!allPlayersSpawned) {
            io.to(socket.id).emit("popup","Not All Players Can Spawn On This Board");
            return;
        }

        //Spawn All Items
        for (let i = 0; i < lobby.items.length; i++) {
            let item = lobby.items[i];
            for (let j = 0; j < Number(item.onStartSpawn); j++) {
                spawn(lobby,item.id,true);
            }
        }

        lobby.updatePositionTimeStamp = Date.now();
        lobby.gameTimeStart = Date.now();
        io.to(lobby.id).emit("startingGame", lobby);
        
        updateClientPositions(lobby)
        lobby.checkingSpawnTimers = true;
        lobby.gameLoop = function() {
            try {
                if (!this.updateStatsTime) this.updateStatsTime = Date.now() + 30000;
                else if (Date.now() >= this.updateStatsTime) {
                    this.updateStatsTime = Date.now() + 3000; //Set time to whatever is less lagiest
                    updateServerStats(lobby);
                }
                if (this.gameStartedAt === false) {
                    startGameLoop(lobby);
                }
                lobby.lobby_gameLoop_start = Date.now(); //For Stats

                server_movePlayers(this,socket.id);
                
                checkEndGametimers(this);
                if (this.checkingSpawnTimers) checkSpawnStatusTimers(this);
                checkEndGameBoardStatus(this);
                checkRespawnPlayers(this);
    
                updateClientPositions(this);
                
                setPlayersZones(this);
    
                this.updatePositionTimeStamp = Date.now();

                attemptCoinSpawn(lobby);
                
                if (!this.gameEnd) {
                    setTimeout(() => this.gameLoop(), 16);
                }



            } catch (err) {
                console.log("SERVER CRASHED",err);
                server_closeLobby(lobby);
            }
        }

        lobby.gameStatus = "prepare";
        lobby.waiting = true;
        setTimeout(function() {
            if (lobby.gameStatus === "game" || lobby.waiting == false) return;
            lobby.waiting = false;
            io.to(lobby.id).emit("preparingGame");
            setTimeout(function() {
                lobby.gameStatus = "game";
                lobby.gameLoop();
            },4000)
        },15000);
        
        updateLobbies();

    })
    socket.on("snakeIsReady", () => {
        let account = onlineAccounts[socket.id];
        let lobby = lobbies[account.lobby];
        if (!lobby) return;
        if (!lobby.isInGame) return;

        lobby.readyPlayers.push(socket.id);
        for (let i = 0; i < lobby.inGamePlayers.length; i++) {
            if (lobby.inGamePlayers[i].accountID == socket.id) lobby.inGamePlayers[i].preGameStatus = "ready";
        }
        io.to(lobby.id).emit("updatePreGamePlayerInfo",lobby.inGamePlayers)

        if (lobby.readyPlayers.length === lobby.inGamePlayers.length) {
            if (lobby.gameStatus == "game" || lobby.waiting == false) return;
            lobby.waiting = false;
            io.emit("preparingGame",lobby.id);
            setTimeout(function() {
                lobby.gameStatus = "game";
                lobby.gameLoop();
            },4000)
        }

    });
    socket.on("movePlayerKey",(direction) => {
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        let player = onlineAccounts[socket.id].player;
        if (!lobby) return;
        if (!player.allowedToMove) return;

        if (lobby.gameStatus == "prepare") {
            player.moving = direction;

            let pushObj = structuredClone(lobby.snakeMap[player.pos.y][player.pos.x]);
            pushObj.rnd = simple.rnd(9999);
            lobby.updateSnakeCells.push(pushObj);
            updateClientPositions(lobby);
            
            return;
        }

        if (onlineAccounts[socket.id].player.moveQueue.length >= 4) return;
        onlineAccounts[socket.id].player.moveQueue.push(direction);
    })
    socket.on("rerenderAllSnakes", () => {
        let account = onlineAccounts[socket.id];
        let lobby = lobbies[account.lobby];
        let player = account.player;
        if (!lobby || !player) return;

        rerenderSnake(lobby,lobby.activePlayers);
    })
    socket.on("dropItem",() => {
        let account = onlineAccounts[socket.id];
        let lobby = lobbies[account.lobby];
        let player = account.player;
        if (!lobby || !player) return;

        dropItem(lobby,player)

    })
    socket.on("fireItem",() => {
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        let player = onlineAccounts[socket.id].player;
        if (!lobby || !player) return;

        useItem(lobby,player);
    })
    socket.on("changeItem",(change) => {
        let player = onlineAccounts[socket.id].player;
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        if (!lobby || !player) return;

        let currentGameMode = lobby.gameMode;
        player.selectingItem += change;
        if (player.selectingItem < 0) player.selectingItem = currentGameMode.howManyItemsCanPlayersUse-1;
        if (player.selectingItem > currentGameMode.howManyItemsCanPlayersUse-1) player.selectingItem = 0;
    })


    //Menu
    socket.on("saveServerSnake",(serverSnake) => {
        let account = onlineAccounts[socket.id];
        let playerCheck = checkPlayer(serverSnake,socket.id,account.allowedNameColors,account.allowedSnakeColors,account) 
        if (playerCheck !== true) {
            io.to(socket.id).emit("popup","Couldn't Save Snake: " + playerCheck);
            return;
        }
        account.serverSnake = serverSnake;
        let lobby = lobbies[account.lobby];
        if (lobby) {
            let lobby = lobbies[account.lobby];
            if (!account) return;
            if (!lobby) return;

            account.player = structuredClone(account.serverSnake);
            lobby.activePlayers = getPlayersList(lobby.players);

            io.to(lobby.id).emit("updateLobbyPage", lobby);
        }

        if (account.loggedIn) {
            account.serverSnake.tag = Number(account.tag);
            let query = "UPDATE inventory SET server_snake = ? WHERE tag = ?";
            db.query(query,[JSON.stringify(account.serverSnake),Number(account.tag)],(err) => {
                if (err) console.log(err);
            })
        }
    })


    //Admin Tools
    socket.on("adminTools_loadDatabase",() => {
        let account = onlineAccounts[socket.id];
        if (account.status !== "Admin") return;

        const allColumns = new Set();

        const getAllColumnNames = async () => {
            // Step 1: Get all table names
            db.query("SHOW TABLES", async (err, tables) => {
                if (err) {
                    console.error("Error fetching tables:", err);
                    return;
                }
    
                const tableNames = tables.map(row => row[Object.keys(row)[0]]);
                let completed = 0;
    
                tableNames.forEach(table => {
                    // Step 2: For each table, get columns
                    db.query(`SHOW COLUMNS FROM \`${table}\``, (err, columns) => {
                        if (err) {
                            console.error(`Error fetching columns from ${table}:`, err);
                        } else {
                            columns.forEach(col => allColumns.add(col.Field));
                        }
    
                        completed++;
                        if (completed === tableNames.length) {
                            // Step 4: Send result back
                            io.to(socket.id).emit("adminTools_giveDatabaseData", {
                                columnNames: Array.from(allColumns),
                                tableNames: tableNames,
                            });
                        }
                    });
                });
            });
        };
    
        getAllColumnNames();

    })
    socket.on("adminTools_loadTable", (tableName, filters = []) => {
        let account = onlineAccounts[socket.id];
        if (account.status !== "Admin") return;
    
        // Step 1: Query the table columns first
        const getTableColumns = () => {
            return new Promise((resolve, reject) => {
                db.query(`SHOW COLUMNS FROM \`${tableName}\``, (err, columns) => {
                    if (err) return reject(err);
                    // Extract column names into an array
                    const columnNames = columns.map(col => col.Field);
                    resolve(columnNames);
                });
            });
        };
    
        getTableColumns()
            .then(columnNames => {
                // Step 2: Build WHERE condition based on filters and column existence
                let where = "";
                const values = [];
                if (filters.length > 0) {
                    const conditions = [];
    
                    for (let i = 0; i < filters.length; i++) {
                        const { name, type, value } = filters[i];
    
                        // Step 3: Only add filter to WHERE clause if column exists
                        if (columnNames.includes(name)) {
                            conditions.push(`\`${name}\` ${type} ?`);
                            values.push(value);
                        }
                    }
    
                    if (conditions.length > 0) {
                        where = "WHERE " + conditions.join(" AND ");
                    }
                }
    
                // Step 4: Build the query
                const query = `SELECT * FROM \`${tableName}\` ${where}`;
    
                // Step 5: Run the query with values (filters)
                db.query(query, values, (err, results) => {
                    if (err) throw err;
    
                    io.to(socket.id).emit("adminTools_giveTableData", results);
                });
            })
            .catch(err => {
                console.error("Error fetching columns:", err);
                io.to(socket.id).emit("adminTools_giveTableData", []);
            });
    });
    socket.on("adminTools_addBattlePass", () => {
        let account = onlineAccounts[socket.id];
        if (account.status !== "Admin") return;
    
        let pass = {
            set: [],
            background: "space",
            name: "untitled",
        };
    
        // First get the max ID to increment it manually
        let getMaxIdQuery = "SELECT MAX(id) AS maxId FROM battle_pass_templates";
        db.query(getMaxIdQuery, [], (err, results) => {
            if (err) throw err;
    
            let newId = (results[0].maxId || 0) + 1;
    
            let addPassQuery = `
                INSERT INTO battle_pass_templates (id, pass)
                VALUES (?, ?)
            `;
            db.query(
                addPassQuery,
                [newId, JSON.stringify(pass)],
                (err, results) => {
                    if (err) throw err;
    
                    // Get all passes after insert
                    let passQuery = "SELECT * FROM battle_pass_templates";
                    db.query(passQuery, [], (err, results) => {
                        if (err) throw err;
    
                        io.to(socket.id).emit("adminTools_giveBattlesPasses", results);
                    });
                }
            );
        });
    });
    socket.on("adminTools_getBattlePass",() => {
        let account = onlineAccounts[socket.id];
        if (account.status !== "Admin") return;
        let passQuery = "SELECT * FROM battle_pass_templates";
        db.query(passQuery, [], (err, results) => {
            if (err) throw err;

            io.to(socket.id).emit("adminTools_giveBattlesPasses", results);
        });
    });
    socket.on("adminTools_saveBattlePass",(id,pass) => { 
        let account = onlineAccounts[socket.id];
        if (account.status !== "Admin") return;

        let query = "UPDATE battle_pass_templates SET pass = ? WHERE id = ?";
        db.query(query,[JSON.stringify(pass),id],(err) => {
            if (err) {
                io.to(socket.id).emit("popup","Failed To Save Battle Pass");
                return;
            }
        })
    })
});


server.listen(port, () => {
    console.log('app listening on port' + port);
}) 




//Copying From Functions.js

function shortenBoard(oldBoard) {
    oldBoard.map = [];
    let board = structuredClone(oldBoard);

    let _newMap = [];
    for (let i = 0; i < board.originalMap.length; i++) {
        let row = [];
        for (let j = 0; j < board.originalMap[i].length; j++) {
            let cell = board.originalMap[i][j];
            let newCell = {
                mouseOver: false,
                tile: cell.tile.id,
                item: cell.item?.id || 0,
            }
            row.push(newCell);
        }
        _newMap.push(row);
    }
    board.originalMap = _newMap;

    board.originalMap = shortenMap(board.originalMap)

    return board;
}

function shortenMap(map) {
    let _newMap = [];
    for (let i = 0; i < map.length; i++) {
        let row = [];
        let s_tiles = [];
        let s_items = [];
        for(let j = 0; j < map[i].length; j++) {
            s_tiles.push(map[i][j].tile);
            s_items.push(map[i][j].item);
        }

        function combineCells(array) {
            let newTiles = [];
            let current = false;
            let count;
            for (let i = 0; i < array.length; i++) {
                if (current === false) {
                    current = array[i];
                    count = 1;
                    continue;
                }
                if (array[i] !== current) {
                    newTiles.push([current,count]);
                    current = array[i];
                    count = 1;
                    continue;
                }
                if (array[i] === current) {
                    count++;
                    continue;
                }
            }
            newTiles.push([current,count]);

            return newTiles;
        }

        s_tiles = combineCells(s_tiles);
        s_items = combineCells(s_items);


        row.push(s_tiles);
        row.push(s_items);
        _newMap.push(row);
    }
    return _newMap;
}
function setNestedValue(obj, path, value, toReturn = false) {
    path = structuredClone(path);
    let lastKey = path.pop(); // Remove and store the last key
    if (value === "_LAST_") {
        value = lastKey; // If value is "_LAST_", use the last key as the value
        lastKey = path.pop(); // Get the new last key
    }
    
    let target = path.reduce((acc, key) => {
        if (acc && acc.hasOwnProperty(key)) return acc[key];
        return undefined; // Exit early if the path doesn't exist
    }, obj);

    if (target === undefined || !target.hasOwnProperty(lastKey)) return; // Do nothing if path is invalid

    if (toReturn) {
        return target[lastKey]; // Return the value instead of setting it
    } else {
        target[lastKey] = value; // Set the value if not in return mode
    }
}
function getRealItem(id,type) {
    let list = type == "item" ? items : tiles;
    for (let i = 0; i < list.length; i++) {
        if (list[i].id == id) {
            return structuredClone(list[i]);
        }
    }
}
function getRealTile(name) {
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i].name == name) {
            return structuredClone(tiles[i]);
        }
    }
}
function getTile(lobby,name) {
    for (let i = 0; i < lobby.tiles.length; i++) {
        if (lobby.tiles[i].name == name) {
            return structuredClone(lobby.tiles[i]);
        }
    }
}
function getItem(lobby,name) {
    for (let i = 0; i < lobby.items.length; i++) {
        if (lobby.items[i].name == name) {
            return structuredClone(lobby.items[i]);
        }
    }
}
function calculateDistance(currentBoard,x1, y1, x2, y2, boardLength, boardHeight) {
    boardLength = currentBoard.map[0].length;
    boardHeight = currentBoard.map.length;
    let dx = Math.min(Math.abs(x1 - x2), boardLength - Math.abs(x1 - x2));
    let dy = Math.min(Math.abs(y1 - y2), boardHeight - Math.abs(y1 - y2));
    return dx + dy;
}
function fixBoardDifferences(map,differences,type) {
    for (let i = 0; i < differences.length; i++) {
        let e = differences[i];
        let d = {
            differences: e[0],
            x: e[1],
            y: e[2],
        }
        let pos = structuredClone(type == "item" ? map[d.y][d.x].item : map[d.y][d.x].tile);
        if (!pos) continue;
        for (let j = 0; j < d.differences.length; j++) {
            let change = d.differences[j];
            setNestedValue(pos,change,"_LAST_");
        }
        if (type == "item") map[d.y][d.x].item = pos;
        if (type == "tile") map[d.y][d.x].tile = pos;
    }
}
function spawn(lobby,thingToSpawn,gameStart = false,setZones) {
    if (simple.type(thingToSpawn) == "number") return spawnItem(lobby,thingToSpawn,gameStart)
    if (thingToSpawn?.type == "player") return spawnPlayer(lobby,thingToSpawn,gameStart,setZones);
}
function spawnItem(lobby,itemID,gameStart = false) {
    let board = lobby.board;

    //Find Item
    let item;
    for (let i = 0; i < lobby.items.length; i++) {
        if (lobby.items[i].id == itemID) item = lobby.items[i];
    }
    if (!item) {
        console.log("Couldn't Find Item",537)
        return false;
    }

    //Check That Item Can Spawn
    if (item.spawnLimit !== false && item.spawnLimit === 0) {
        console.log("Item Spawned To Much");
        return false;
    } 

    let spot;
    //Spawn Item
    for (let i = 0; i < item.spawnCount; i++) {
        spot = findEmptySpotInZones(lobby,lobby.spawnZones.items,"item",item);
        if (!spot) {
            console.log("No Available Spots For Items")
            return false;
        }

        runItemFunction(lobby,false,item,"onSpawn",{x:spot.x,y:spot.y},{playAudio: gameStart === false});
        board.map[spot.y][spot.x].item = structuredClone(item);
        board.map[spot.y][spot.x].item.pos = {
            x: spot.x,
            y: spot.y,
        }
        lobby.updateCells.push({
            x: spot.x,
            y: spot.y,
            item: board.map[spot.y][spot.x].item,
        })
        if (item.tags.includes("Tunnels")) {
            board.location_tunnels.push(
                {
                    x: spot.x,
                    y: spot.y,
                    name: item.name,
                }
            )
        }
    }

    if (item.spawnLimit !== false) item.spawnLimit--;

    return spot;
}
function spawnPlayer(lobby,player,gameStart = false,setZones) {
    let spot = findEmptySpotInZones(lobby,lobby.spawnZones.players,"player",gameStart,player,setZones);
    if (!spot) {
        console.log("No Available Spots For Player")
        if (gameStart) {
            return false;
        } else {
            setTimeout(function() {
                if (lobby.gameEnd) return;
                spawnPlayer(lobby,player,gameStart);
            },1000);
        }
        return;
    }

    
    player.pos.x = spot.x;
    player.pos.y = spot.y;
    player.team = spot.team;
    lobby.snakeMap[spot.y][spot.x].push({
        index: player.index,
        type: "head",
        siblings: [],
        x: spot.x,
        y: spot.y,
    });
    lobby.updateSnakeCells.push(lobby.snakeMap[spot.y][spot.x]);
    return true;
}
function findEmptySpotInZones(lobby,zones,type,extra,extra2,setZones) {
    let gameStart = false;
    if (type == "player") {
        gameStart = extra;
    }

    let shuffledZones = gameStart ? setZones : simple.shuffle(zones);

    for (let i = 0; i < shuffledZones.length; i++) {
        let zone = shuffledZones[i];
        if (!zone.active) continue;

        if (type == "item") if (zone.itemsThatCantSpawnHere.includes(extra.id)) continue;
        if (type == "player") {
            let player = extra2;
            if (!gameStart) {
                if (player.team !== zone.team) continue;
                if (!zone.respawnHere) continue;
            }
            if (gameStart) {
                if (zone.spawnCap !== false && zone.spawnCap < 1) continue;
                if (zone.spawnCap !== false && zone.spawnCap > 0) zone.spawnCap--;
            }
        }

        let spot = findEmptySpotInZone(zone,lobby)

        if (!spot) continue;

        if (gameStart) {
            if (zone.alternate) {
                setZones.push(setZones.shift());
            }
        }
        
        return spot;
    }

    return false;
}
function findEmptySpotInZone(zone,lobby) {
    let map = lobby.board.map;
    let activePlayers = lobby.inGamePlayers;

    let x,y,foundSpot = false,counter = 0;
    findingSpot: while (foundSpot === false) {
        x = simple.rnd(zone.pos1.x,zone.pos2.x);
        y = simple.rnd(zone.pos1.y,zone.pos2.y);
        
        counter++;
        if (counter > (map.length * map[0].length) ) {
            return false;
        }
        if (x > lobby.board.map[0].length-1) continue;
        if (x < 0) continue;
        if (y < 0) continue;
        if (y > lobby.board.map.length-1) continue;
        if (map[y][x].item !== false) continue;

        for (let j = 0; j < activePlayers.length; j++) {
            if (activePlayers[j] == false) continue;
            let distance = calculateDistance(lobby.board,activePlayers[j].pos.x,activePlayers[j].pos.y,x,y);
            if (distance < 5) {
                continue findingSpot;
            }
            for (let p = 0; p < activePlayers[j].tail.length; p++) {
                if (activePlayers[j].tail[p].x == x && activePlayers[j].tail[p].y == y) {
                    continue findingSpot;
                }
            }
        }
        return {
            x: x,
            y: y,
            team: zone.team,
        }
    }
}
function organizeZones(zones) {
    let allZones = [];
    let returnZones = [];

    //Create Empty Zone List
    for (let i = 0; i < 100; i++) {
        allZones.push([]);
    }
    //Add Zone To Correct Priority Placement
    for (let i = 0; i < zones.length; i++) {
        let zone = zones[i];
        let priority =  typeof zone.priority === "number" && zone.priority >= 0 && zone.priority < 100 ? zone.priority : 0;
        allZones[priority].push(zone);
    }
    //Shuffle all Priority Zones
    for (let i = 0; i < allZones.length; i++) {
        allZones[i] = simple.shuffle(allZones[i]);
    }
    //Join All Zones Together
    for (let i = 0; i < allZones.length; i++) {
        for (let j = 0; j < allZones[i].length; j++) {
            returnZones.push(allZones[i][j]);
        }
    }
    return returnZones.reverse();
}

//Copied From Main.js
function getLocations(lobby) {
    let currentBoard = lobby.board;
    for (let i = 0; i < currentBoard.map.length; i++) {
        for (let j = 0; j < currentBoard.map[0].length; j++) {
            let cell = currentBoard.map[i][j]; 

            cell.tile = structuredClone(getTile(lobby,cell.tile.name));
            cell.tile.pos = {
                x: j,
                y: i,
            }

            if (cell.tile.timeEvents?.length > 0) {
                lobby.timeEvents.push(cell.tile);
            }

            if (cell.item) {
                cell.item = structuredClone(getItem(lobby,cell.item.name));
                cell.item.pos = {
                    x: j,
                    y: i,
                }
                if (cell.item.pack == "Tunnels") {
                    lobby.board.location_tunnels.push({
                        x: j,
                        y: i,
                        name: cell.item.name,
                    })
                }
                if (cell.item.updateOn) {
                    for (let h = 0; h < cell.item.updateOn.length; h++) {
                        if (cell.item.updateOn[h] == "boardStatus") {
                            lobby.board.location_status.push({
                                x: j,
                                y: i,
                                name: cell.item.name,
                            })
                        }
                        if (cell.item.updateOn[h] == "playerGrows") {
                            lobby.board.playerGrow_status.push({
                                x: j,
                                y: i,
                                name: cell.item.name,
                            })
                        }
                    }
                }
            }

            
        }
    }
}
function removeBoardStatus(lobby,status,player) {
    if (status == "*P") status = player.team;
    if (status == "white") return;

    checking: for (let i = 0; i < lobby.boardStatus.length; i++) {
        if (lobby.boardStatus[i] == status) {
            lobby.boardStatus.splice(i,1);
            break checking;
        }
    }
    for (let i = 0; i < lobby.board.location_status.length; i++) {
        let status = lobby.board.location_status[i];
        lobby.updateCells.push({
            x: status.x,
            y: status.y,
        })
    }

    checkBoardStatusOnZones(lobby);
}
function addBoardStatus(lobby,status,player) {
    if (status == "white") return;
    if (status == "*P") status = player.team;
    if (status == "white") return;
    lobby.boardStatus.push(status);
    for (let i = 0; i < lobby.board.location_status.length; i++) {
        let status = lobby.board.location_status[i];
        lobby.updateCells.push({
            x: status.x,
            y: status.y,
        })
    }

    checkBoardStatusOnZones(lobby);
}
function checkBoardStatusOnZones(lobby) {
    let spawnList2 = lobby.spawnZones;
    let spawnList = [...spawnList2.players,...spawnList2.items];
    let statusList = lobby.boardStatus;

    let allStatus = {
        aquamarine: 0,
        blue: 0,
        buff: 0,
        coral: 0,
        crimsonpurple: 0,
        gold: 0,
        green: 0,
        lemon: 0,
        lime: 0,
        magenta: 0,
        orange: 0,
        pink: 0,
        red: 0,
        skyblue: 0,
        slateblue: 0,
        venom: 0,
    }

    for (let i = 0; i < statusList.length; i++) {
        allStatus[statusList[i]]++;
    }

    for (let i = 0; i < spawnList.length; i++) {
        let zone = spawnList[i];
        if (zone.activateWhenBoardStatus !== false) {
            if (allStatus[zone.activateWhenBoardStatus.status] >= zone.activateWhenBoardStatus.count) {
                zone.activateWhenBoardStatus = false;
                zone.active = true;
            }
        }
        if (zone.deactivateWhenBoardStatus !== false) {
            if (allStatus[zone.deactivateWhenBoardStatus.status] >= zone.deactivateWhenBoardStatus.count) {
                zone.deactivateWhenBoardStatus = false;
                zone.active = false;
            }
        }
    }
}
function dropItem(lobby,player) {
    let item = player.items[player.selectingItem];
    if (item == "empty") return;
    let x = player.pos.x;
    let y = player.pos.y;
    let currentBoard = lobby.board;
    if (currentBoard.map[y][x].item) return;
    currentBoard.map[y][x].item = item;
    currentBoard.map[y][x].item.pos = {
        x: x,
        y: y,
    }
    lobby.updateCells.push({
        x: x,
        y: y,
        item: currentBoard.map[y][x].item,
    })

    player.items[player.selectingItem] = "empty";
}
function useItem(lobby,player) {
    let item = player.items[player.selectingItem];
    if (item == "empty") return;
    if (!item.onActivate) return;
    let returnItem = runItemFunction(lobby,player,player.items[player.selectingItem],"onActivate",player.pos).returnItem;
    player.items[player.selectingItem] = returnItem;
}
function specialItemManager(lobby) {
    if (lobby.specialItemIteration >= lobby.specialItemActiveChance) {
        lobby.specialItemIteration = 0;
        lobby.specialItemActiveChance = simple.rnd(lobby.specialItemLowChance,lobby.specialItemHighChance);
        // Calculate the total weight
        let totalWeight = 0;
        for (let i = 0; i < lobby.items.length; i++) {
            if (lobby.items[i].spawnLimit < 1 && simple.type(lobby.items[i].spawnLimit) == "number") continue;
            totalWeight += lobby.items[i].specialSpawnWeight;
        }

        // Generate a random number between 0 and totalWeight
        const randomWeight = Math.random() * totalWeight;

        // Find the item corresponding to the random weight
        let cumulativeWeight = 0;
        findingItem: for (const item of lobby.items) {
            if (item.spawnLimit < 1 && simple.type(item.spawnLimit) == "number") continue;

            cumulativeWeight += item.specialSpawnWeight;
            if (randomWeight < cumulativeWeight) {
                spawn(lobby,item.id);
                break findingItem;
            }
        }

    } else {
        lobby.specialItemIteration++;
    }
}
function deletePlayer(lobby,player,playerWhoKilled,damage = 0,instaKill = false,item = false){
    let currentGameMode = lobby.gameMode;
    let activePlayers = lobby.inGamePlayers;
    let playerCanRespawn = false;
    if (currentGameMode.respawn) {
        playerCanRespawn = true;
        if (player.respawnCount !== -1) {
            if (player.respawnCount < 1)
                playerCanRespawn = false;
            else
                player.respawnCount--;
        }
    }

    let playerDied = true;
    if (playerWhoKilled) damage = playerWhoKilled.bodyArmor;

    if (player.respawnProtected) damage = 0;

    if (damage === 0) playerDied = false;


    if (player.equiped.head?.whenEquiped?.protect) {
        player.equiped.head.whenEquiped.protect -= damage;
        if (player.equiped.head.whenEquiped.protect > -1) {
            playerDied = false;
            if (player.equiped.head.whenEquiped.protect < 1) player.equiped.head = false;
        } else {
            player.equiped.head = false;
        }
    }

    if (playerDied || instaKill){
        if (item) {
            addPlayerStatus(`died_by_${item.type}_${item.id}`,1,player);
        }

        if (playerWhoKilled) {
            if (playerWhoKilled.name !== player.name) {
                addPlayerStatus("died_by_snake",1,player);
                playerWhoKilled.playerKills++;
                if (lobby.condition_kill.length > 0) {
                    for (let i = 0; i < lobby.condition_kill.length; i++) {
                        let condition = lobby.condition_kill[i];
                        if (condition.pullTeamStats) {
                            let teamKills = 0;
                            let team = playerWhoKilled.team;
                            for (let j = 0; j < activePlayers.length; j++) {
                                if (activePlayers[j].team == team) teamKills += activePlayers[j].playerKills;
                            }
                            if (teamKills >= condition.x) {
                                triggerWinningCondition(lobby,condition,playerWhoKilled);
                            }
                        } else {
                            if (playerWhoKilled.playerKills >= condition.x) {
                                triggerWinningCondition(lobby,condition,playerWhoKilled);
                            }
                        }
                        
                    }
                }
            } else {
                addPlayerStatus("died_by_self",1,player);
            }
        }

        //Delete Tail
        if (currentGameMode.whenSnakesDie == "vanish") {
            snakeMapRemoveAll(lobby,player);
        }
        if (currentGameMode.whenSnakesDie == "become food") {
            snakeMapRemoveAll(lobby,player,true,lobby.gameMode.setFoodRate);
        }

        //Delete Player
        player.isDead = true;
        player.justDied = true;
        if (!playerCanRespawn || lobby.gameEnd) {
            let playersDead = 0;
            let activeTeams = [];
            let livingPlayers = [];
            for (let i = 0; i < activePlayers.length; i++) {
                if (activePlayers[i].isDead) playersDead++;
                else {
                    if (!activeTeams.includes(activePlayers[i].team))
                        activeTeams.push(activePlayers[i].team);
                    livingPlayers.push(activePlayers[i])
                }
            }

            if (playersDead == activePlayers.length) {
                checkWinningCondition(lobby,"All Dead",false,player);
                return;
            }
            if (playersDead + 1 == activePlayers.length) {
                checkWinningCondition(lobby,"Last One Standing",false,livingPlayers[0]);
                return;
            }
            if (activeTeams.length === 1) {
                checkWinningCondition(lobby,"Last Team Standing",activeTeams[0],livingPlayers[0]);
                return;
            }
        } else {
            let deathPoint = Date.now();
            lobby.playerRespawns.push({
                player: player,
                death: deathPoint,
            })
            io.to(player.accountID).emit("startRespawnTimer",lobby.gameMode.respawnTimer,deathPoint);
        }
        return;
    }
}
function growPlayer(player,grow) {
    player.growTail += grow;
    
}
function runItemFunction(lobby,player,item,type,itemPos,settings = {playAudio: true}) {
    let toReturn = {
        returnItem: "empty",
        damageGiven: 0,
    }
    let currentBoard = lobby.board;
    let currentGameMode = lobby.gameMode;
    if (!type) return toReturn;

    let on;
    if (simple.type(type) == "object") on = type; 
    else {
        if (item[type])
            on = item[type];
        
    }

    if (!on) return toReturn;

    if (item.switchStatus == false || item.switchStatus == undefined) {
        item.switchStatus = true;
    } else {
        item.switchStatus = false;
    }

    let addStatList = [];
    if (on.addStat && player) {
        if (typeof on.addStat === "string") on.addStat = [on.addStat];
        for (let u = 0; u < on.addStat.length; u++) {
            let stat = on.addStat[u];
            let type = item.type;
            let id = item.id;
            let name = `${stat}_${type}_${id}`;
            if (["paint","activate"].includes(stat)) {
                addStatList.push({
                    name: name,
                    amt: 1,
                    player: player,
                    ident: stat,
                })
                continue;
            }
            addPlayerStatus(name,1,player);
        }
    }
    //Start Checking Ons Here (Stat checking needs to happen first)
    if (on.forcePlayerMove && player) {
        let playerMoving = player.moving;
        let direction = on.forcePlayerMove;

        let upSet = ["up","down"];
        let leftSet = ["left","right"];

        if (on.forcePlayerMove == "right" && playerMoving == "left") direction = simple.rnd(upSet);
        if (on.forcePlayerMove == "left" && playerMoving == "right") direction = simple.rnd(upSet);
        if (on.forcePlayerMove == "down" && playerMoving == "up") direction = simple.rnd(leftSet);
        if (on.forcePlayerMove == "up" && playerMoving == "down") direction = simple.rnd(leftSet);

        player.moveQueue = [direction];
    }
    if (on.setPlayerProperty && player) {
        let path = on.setPlayerProperty[0];
        let value = on.setPlayerProperty[1];
        setNestedValue(player,path,value);
    }
    if (on.switchBaseImgTag) {
        //Find out which index we are on
        let index = -1;
        for (let i = 0; i < on.switchBaseImgTag.switch.length; i++) {
            if (on.switchBaseImgTag.switch[i] === item.baseImgTags[on.switchBaseImgTag.index]) index = i;
        }
        //Find what to switch to
        let whatToSwitchTo;
        index += 1;
        if (index > on.switchBaseImgTag.switch.length-1) index = 0;
        whatToSwitchTo = on.switchBaseImgTag.switch[index];

        //Switch the image;
        item.baseImgTags[on.switchBaseImgTag.index] = whatToSwitchTo;

        if (settings.affectProjectile) {
            affectProjectile(lobby,settings.affectProjectile,["baseImgTags",item.baseImgTags]);
        } else {
            if (item.type == "item") {
                lobby.updateCells.push({
                    x: itemPos.x,
                    y: itemPos.y,
                    changes: [["baseImgTags"],item.baseImgTags],
                })
            }
            if (item.type == "tile") {
                lobby.updateTiles.push({
                    x: itemPos.x,
                    y: itemPos.y,
                    changes: [["baseImgTags"],item.baseImgTags],
                })
            }
        }
        
    }
    if (on.switchBoardStatus && player) {
        checkingIfToAddStats: for (let u = 0; u < addStatList.length; u++) {
            let stat = addStatList[u];
            if (!["activate"].includes(stat.ident)) continue checkingIfToAddStats;
            addPlayerStatus(stat.name,stat.amt,stat.player);
        }
        if (item.switchStatus === true) {
            addBoardStatus(lobby,on.switchBoardStatus,player);
        } else {
            removeBoardStatus(lobby,on.switchBoardStatus,player);
        }
    }
    if (on.addBoardStatus && player) {
        checkingIfToAddStats: for (let u = 0; u < addStatList.length; u++) {
            let stat = addStatList[u];
            if (!["activate"].includes(stat.ident)) continue checkingIfToAddStats;
            addPlayerStatus(stat.name,stat.amt,stat.player);
        }
        addBoardStatus(lobby,on.addBoardStatus,player);
    }
    if (on.removeBoardStatus && player) {
        checkingIfToAddStats: for (let u = 0; u < addStatList.length; u++) {
            let stat = addStatList[u];
            if (!["activate"].includes(stat.ident)) continue checkingIfToAddStats;
            addPlayerStatus(stat.name,stat.amt,stat.player);
        }
        removeBoardStatus(lobby,on.removeBoardStatus,player);
    }
    if (on.serverGiveCoin && player) {
        attempGiveCoin(lobby,player,itemPos);

    }
    setBoardStatus: if (on.setBoardStatus && player) {
        let status = on.setBoardStatus;
        if (on.setBoardStatus == "*P") status = player.team;
        if (item.sendingBoardStatus === status) break setBoardStatus; //If already sending that status don't send it again.

        checkingIfToAddStats: for (let u = 0; u < addStatList.length; u++) {
            let stat = addStatList[u];
            if (!["paint"].includes(stat.ident)) continue checkingIfToAddStats;
            addPlayerStatus(stat.name,stat.amt,stat.player);
        }

        if (item.sendingBoardStatus !== false) {
            removeBoardStatus(lobby,item.sendingBoardStatus,player);
        }

        item.sendingBoardStatus = status;
        addBoardStatus(lobby,status,player);
    }
    if (on.equip && player) {
        let oldItem = structuredClone(player.equiped[on.equip]);
        player.equiped[on.equip] = structuredClone(item);
        if (oldItem) {
            toReturn.returnItem = oldItem;
        }
    }
    if (on.setBaseImgTag) {
        let value = on.setBaseImgTag.value;
        if (value == "*P" && player) value = player.team;
        item.baseImgTags[on.setBaseImgTag.index] = value;
        if (item.type == "item") {
            lobby.updateCells.push({
                x: itemPos.x,
                y: itemPos.y,
                changes: [["baseImgTags"],item.baseImgTags],
            })
        }
        if (item.type == "tile") {
            lobby.updateTiles.push({
                x: itemPos.x,
                y: itemPos.y,
                changes: [["baseImgTags"],item.baseImgTags],
            })
        }
    }
    if (on.growPlayer > 0 && player) {
        growPlayer(player,on.growPlayer);
        addPlayerStatus("grow",on.growPlayer,player);
    }
    if (on.spawn) {
        for (let i = 0; i < on.spawn.length; i++) {
            for (let j = 0; j < on.spawn[i].count; j++) {
                spawn(lobby,on.spawn[i].id);
            }
        }
    }
    if (on.giveTurbo && player) {
        player.turboActive = true;
        player.turboDuration = Number(on.giveTurbo.duration);
        player.moveSpeed = Number(on.giveTurbo.moveSpeed);
    }
    if (on.addStatus && player) { //I think this is outdated ?
        for (let i = 0; i < on.addStatus.length; i++) {
            addPlayerStatus(lobby,player,on.addStatus[i])
        }
    }
    if (on.removeStatus && player) { //I think this one is outdated to
        for (let i = 0; i < on.removeStatus.length; i++) {
            removePlayerStatus(lobby,player,on.removeStatus[i])
        }
    }
    if (on.winGame === true && player) {
        player.winGame = true;
    }
    if (on.canvasFilter) {
        lobby.canvasFilters.push(on.canvasFilter);
    }
    if (on.playSound && item.playSounds && settings?.playAudio && lobby.playSounds) {
        let type = "sfx";
        if (on.playSound[2]) type = on.playSound[2];
        lobby.playSounds.push({
            src: "sounds/" + item.soundFolder + "/" + item.soundFolder + "_" + on.playSound[0] + "_" + simple.rnd(on.playSound[1]) + ".mp3",
            type: type,
        });
    }
    if (on.killPlayer) {
        if (player)
            deletePlayer(lobby,player,false,false,true);
        else if (settings.projectile) {
            deleteProjectile(lobby,settings.projectile);
        }
        toReturn.damageGiven += 99999;
    }
    if (on.spawnRandomItem) {
        specialItemManager(lobby);
    }
    if (on.deleteMe && itemPos && item.type == "item") {
        currentBoard.map[itemPos.y][itemPos.x].item = false;
        lobby.updateCells.push({
            x: itemPos.x,
            y: itemPos.y,
            item: false,
        })
    }
    if (on.pickUp && player) {
        for (let k = 0; k < currentGameMode.howManyItemsCanPlayersUse; k++) {
            if (player.items[k] !== "empty") continue;
            player.items[k] = structuredClone(item);
            if (item.type == "item") {
                currentBoard.map[player.pos.y][player.pos.x].item = false;
                lobby.updateCells.push({
                    x: player.pos.x,
                    y: player.pos.y,
                    item: false,
                })
            }
            break;
        }
    }
    if (on.giveInvincibility) {
        player.invincibilityDuration = Number(on.giveInvincibility.duration);

        player.invinsibleBodyEffect = 0;

        let onGoingRespawnProtectedCode = simple.rnd(1000);
        player.onGoingRespawnProtectedTimer = onGoingRespawnProtectedCode;
        setTimeout(function() {
            if (player.onGoingRespawnProtectedTimer === onGoingRespawnProtectedCode) {
                player.respawnProtected = false;
                player.invinsibleBodyEffect = false;
                rerenderSnake(lobby,player);
                updateClientPositions(lobby)
            }
        },lobby.gameMode.respawnProtection*1000);
        addPlayerStatus("invincibility_activated",1,player);
    }

    if (on.dealDamage) {
        if (player)
            deletePlayer(lobby,player,false,on.dealDamage,false,item);
        else if (settings.projectile) {
            projectileDealDamage(lobby,settings.projectile,on.dealDamage);
        }
        toReturn.damageGiven += on.dealDamage;
    }
    if (on.removePlayerItem && player) {
        for (let j = 0; j < on.removePlayerItem.length; j++) {
            let count = on.removePlayerItem[j].count;
            for (let k = 0; k < currentGameMode.howManyItemsCanPlayersUse; k++) {
                if (count == 0) continue;
                let playerSlot = player.items[k];
                if (playerSlot == "empty") continue;
                if (playerSlot.name == on.removePlayerItem[j].name) {
                    player.items[k] = "empty";
                    count--;
                }
            }
        }
        
    }
    if (on.teleport && player) {
        if (!player.justTeleported) {
            findingPortal: for (let z = 0; z < currentBoard.map.length; z++) {
                for (let h = 0; h < currentBoard.map[z].length; h++) {
                    if (!currentBoard.map[z][h].item) continue;
                    if (player.pos.x == h && player.pos.y == z) continue;
                    if (currentBoard.map[z][h].item.id === on.teleport) {
                        player.justTeleported = {
                            x: h,
                            y: z,
                        }
                        addPlayerStatus("teleport",1,player);
                        break findingPortal;
                    } 
                }
            }
        } else {
            player.justTeleported = false;
        }
    }
    if (on.checkStatus && player) {
        let check = on.checkStatus.check;
        let passedCheck = true;
        if (check.playerHasEmptySlot === true) {
            let pass = false;
            for (let k = 0; k < currentGameMode.howManyItemsCanPlayersUse; k++) {
                if (player.items[k] === "empty") pass = true;
            }
            if (!pass) passedCheck = false;
        }
        if (check.playerHasItem) {
            let pass = true;
            for (let j = 0; j < check.playerHasItem.length; j++) {
                let count = 0;
                for (let k = 0; k < currentGameMode.howManyItemsCanPlayersUse; k++) {
                    let playerSlot = player.items[k];
                    if (playerSlot.name == check.playerHasItem[j].name) count++;
                }
                if (count < check.playerHasItem[j].count) pass = false;
            }
            if (!pass) passedCheck = false;
        }
        if (check.playerTeamStatus) {
            if (player.team !== check.playerTeamStatus) passedCheck = false;
        }
        if (check.boardStatus) {
            let count = 0;
            let useStatus = check.boardStatus.name;
            if (useStatus == "*P") useStatus = player.team;
            if (useStatus !== "white") {
                for (let j = 0; j < lobby.boardStatus.length; j++) {
                    if (lobby.boardStatus[j] === useStatus) count++;
                }
                if (count < check.boardStatus.count) passedCheck = false;
            }
            
        }
        if (check.snakeSize) {
            if (player.tail.length + 1 < check.snakeSize) passedCheck = false;
        }


        //Finish Checking
        if (passedCheck) runItemFunction(lobby,player,item,on.checkStatus.pass,itemPos,settings);
        else runItemFunction(lobby,player,item,on.checkStatus.fail,itemPos,settings);
    }
    if (on.projectile) {
        createProjectile(lobby,player,item,on.projectile);
    }
    if (on.steps) {
        runSteps(on, lobby, player, item, itemPos,settings);
    }
    if (on.repeatEvent) {
        runRepeatEvent(on.repeatEvent,lobby,player,item,itemPos,settings);
    }
    if (on.deleteProjectile) {
        if (settings.affectProjectile) {
            //Delete Projectile
            for (let i = 0; i < lobby.projectiles.length; i++) {
                if (lobby.projectiles[i].id === settings.affectProjectile) {
                    lobby.projectiles.splice(i,1);
                }
            }
        } 
    }
    if (on.fallOffDamage) {
        helper_fallOffDamage(lobby,player,itemPos,on.fallOffDamage);
    }

    if (settings.returnFunc) settings.returnFunc();
    return toReturn;
}
function runRepeatEvent(repeatEvent,lobby,player,item,itemPos,settings,count = 0) {

    runItemFunction(lobby,player,item,item.events[repeatEvent.event],itemPos,settings);

    if (count >= repeatEvent.count) return;

    setTimeout(function() {
        runRepeatEvent(repeatEvent,lobby,player,item,itemPos,settings,count+1);
    },repeatEvent.delay*1000);
}
async function runSteps(on, lobby, player, item, itemPos, settings) {
    for (let i = 0; i < on.steps.length; i++) {
        let step = on.steps[i];

        if (!isNaN(step)) {
            await new Promise(resolve => setTimeout(resolve, step * 1000));
        } else {
            runItemFunction(lobby, player, item, step, itemPos, settings);
        }
    }
}
function addPlayerStatus(lobby,player,itemName) {
    player.status.push(getItem(lobby,itemName).name);
}
function removePlayerStatus(lobby,player,itemName) {
    findingStatus: for (let i = 0; i < player.status.length; i++) {
        if (player.status[i] == getItem(lobby,itemName).name) {
            player.status.splice(i,1);
            break findingStatus;
        }
    }
}

//From App.js
function  helper_fallOffDamage(lobby,player,itemPos,mode) {
    let currentBoard = lobby.board;
    let queue = [{ x: itemPos.x, y: itemPos.y, damage: mode.damage }];
    let visited = new Set();

    function key(x, y) {
        return `${x},${y}`;
    }

    while (queue.length > 0) {
        let { x, y, damage } = queue.shift();
        let posKey = key(x, y);

        // Skip already visited
        if (visited.has(posKey) || damage <= 0) continue;
        visited.add(posKey);

        // Handle effect at this tile
        let mapItem = currentBoard.map[y] ? currentBoard.map[y][x] ? currentBoard.map[y][x].item : false : false;
        let mapTile = currentBoard.map[y] ? currentBoard.map[y][x] ? currentBoard.map[y][x].tile : false : false;
        if (mode.who == "@e") {

            if (mapItem && damage > 0) {
                damage -= runItemFunction(lobby,false,mapItem,"onCollision",{y,x}).damageGiven;
                setTimeout(function() {
                    runItemFunction(lobby,false,mapItem,"offCollision",{y,x});
                },100)
            }
            if (mapTile && damage > 0) {
                damage -= runItemFunction(lobby,false,mapTile,"onCollision",{y,x}).damageGiven;
                setTimeout(function() {
                    runItemFunction(lobby,false,mapTile,"offCollision",{y,x});
                },100)

            }
        }
        if (mapTile) {
            let mapSnakes = lobby.snakeMap[y][x];
            if (mapSnakes.length > 1) {
                for (let i = 1; i < mapSnakes.length; i++) {
                    
                }
            }

        }

        damage -= mode.damageFallOff;


        // If there's still damage left, spread to neighbors
        if (damage > 0) {
            queue.push({ x: x + 1, y, damage });
            queue.push({ x: x - 1, y, damage });
            queue.push({ x, y: y + 1, damage });
            queue.push({ x, y: y - 1, damage });
        }
    }
}

function createProjectile(lobby,player,item,mode) {
    let id = item.id + player.accountID + simple.rnd(10000);

    let x;
    let y;


    let direction = mode.throw.direction ? mode.throw.direction : "*p";
    if (direction.toLowerCase() == "*p") direction = player.moving;

    if (direction == "right") {
        x = player.pos.x + 1;
        y = player.pos.y;
    }
    if (direction == "left") {
        x = player.pos.x - 1;
        y = player.pos.y;
    }
    if (direction == "up") {
        x = player.pos.x;
        y = player.pos.y - 1;
    }
    if (direction == "down") {
        x = player.pos.x;
        y = player.pos.y + 1;
    }
    let size = mode.throw.startSize;

    let sizeProgression = (mode.throw.endSize - mode.throw.startSize) / mode.throw.distance;

    let itemID = item.id;

    lobby.projectiles.push({
        id: id,
        pos: {
            x: x,
            y: y,
        },
        size: size,
        itemID: itemID,
        impact: false,
        subtractDamage: 0,
    })

    setTimeout(function() {
        moveProjectile(lobby,item,mode,x,y,direction,sizeProgression,id,1,player);
    },mode.throw.timeOut);
}
function moveProjectile(lobby,item,mode,x,y,direction,sizeProgression,id,distance,player) {
    for (let i = 0; i < lobby.projectiles.length; i++) {
        if (lobby.projectiles[i].id === id) {

            let oldX = lobby.projectiles[i].pos.x;
            let oldY = lobby.projectiles[i].pos.y;

            let x,y;
            if (direction == "right") {
                x = lobby.projectiles[i].pos.x + 1;
                y = lobby.projectiles[i].pos.y;
            }
            if (direction == "left") {
                x = lobby.projectiles[i].pos.x - 1;
                y = lobby.projectiles[i].pos.y;
            }
            if (direction == "up") {
                x = lobby.projectiles[i].pos.x;
                y = lobby.projectiles[i].pos.y - 1;
            }
            if (direction == "down") {
                x = lobby.projectiles[i].pos.x;
                y = lobby.projectiles[i].pos.y + 1;
            }

            runProjectilePosition(lobby,{x,y},id,mode.throw.height,mode.ignorePlayers ?? false);

            if (lobby.projectiles[i].impact === true) {
                lobby.projectiles[i].size = mode.throw.endSize;
                distance = mode.throw.distance;
            } else {
                lobby.projectiles[i].pos.x = x;
                lobby.projectiles[i].pos.y = y;
                if (lobby.projectiles[i].impact === 1) {
                    distance = mode.throw.distance;
                    lobby.projectiles[i].size = mode.throw.endSize;
                } else {
                    lobby.projectiles[i].size += sizeProgression;
                }
            }

            if (distance >= mode.throw.distance) {
                impactProjectile(lobby,item,mode,id);
            } else {
                setTimeout(function() {
                    moveProjectile(lobby,item,mode,x,y,direction,sizeProgression,id,distance+1);
                },mode.throw.timeOut);
            }
        }
    }
}
function impactProjectile(lobby,item,mode,id) {
    let impact = mode.impact;
    let itemStats;
    for (let i = 0; i < lobby.projectiles.length; i++) {
        if (lobby.projectiles[i].id === id) {
            itemStats = lobby.projectiles[i];
        }
    }

    if (!impact || !itemStats) return;

    runItemFunction(lobby,false,item,impact,itemStats.pos,{affectProjectile: id});
}
function affectProjectile(lobby,id,change) {
    for (let i = 0; i < lobby.projectiles.length; i++) {
        if (lobby.projectiles[i].id === id) {
            lobby.projectiles[i].change = change;
        }
    }
}
function runProjectilePosition(lobby,pos,id,height,ignorePlayers) {
    let currentBoard = lobby.board;
    let mapItem = currentBoard.map[pos.y][pos.x].item;
    let mapTile = currentBoard.map[pos.y][pos.x].tile;

    let itemHeight = mapItem.height ?? 0;
    let tileHeight = mapTile.height ?? 0;

    if (itemHeight >= height) runItemFunction(lobby,false,mapItem,"onCollision",pos,{projectile: id});
    if (tileHeight >= height) runItemFunction(lobby,false,mapTile,"onCollision",pos,{projectile: id});

    if (ignorePlayers) return;

    let snakeMap = lobby.snakeMap[pos.y][pos.x];

    if (snakeMap.length > 1) {
        deleteProjectile(lobby,id);
    }


}
function deleteProjectile(lobby,id) {
    for (let i = 0; i < lobby.projectiles.length; i++) {
        if (lobby.projectiles[i].id === id) {
            lobby.projectiles[i].impact = true;
        }
    }
}
function projectileDealDamage(lobby,id,damage) {
    for (let i = 0; i < lobby.projectiles.length; i++) {
        if (lobby.projectiles[i].id === id) {
            lobby.projectiles[i].impact = 1;
            lobby.projectiles[i].subtractDamage += damage;
        }
    }

}

function gatherBoardsForUser(socketID,sendType) {
    let account = onlineAccounts[socketID];
    let lobby = lobbies[account.lobby];
    if (!lobby) return;
    if (lobby.hostID !== socketID) return;

    let returningBoards = {
        personal: [],
        published: [],
        liked: [],
    };
    const likedQuery = `SELECT id FROM favorites WHERE tag = ${Number(account.tag)} AND type = "board"`;
    db.query(likedQuery,[],(err,likedList) => {
        if (err) throw err;

        returningBoards.liked = likedList;


        const personalQuery = `
            SELECT 
                b.board, 
                b.id, 
                c.username,
                IFNULL(f.likeCount, 0) AS likeCount
            FROM boards b
            JOIN credentials c ON b.tag = c.tag
            LEFT JOIN (
                SELECT id, COUNT(*) AS likeCount 
                FROM favorites 
                WHERE type = 'board' 
                GROUP BY id
            ) f ON b.id = f.id
            WHERE b.tag = ?
        `;
        db.query(personalQuery,[Number(account.tag)],(err,results) => {
            if (err) {
                console.log(735,err);
                return;
            }

            decompressBoardsFromDB(results,(personalBoards) => {
                returningBoards.personal = personalBoards;

                const publishedQuery = `
                    SELECT 
                        b.board, 
                        b.id, 
                        c.username,
                        IFNULL(f.likeCount, 0) AS likeCount,
                        IFNULL(b.plays, 0) AS plays
                    FROM boards b
                    JOIN credentials c ON b.tag = c.tag
                    LEFT JOIN (
                        SELECT id, COUNT(*) AS likeCount 
                        FROM favorites 
                        WHERE type = 'board' 
                        GROUP BY id
                    ) f ON b.id = f.id
                    WHERE b.published = 1
                `;
                db.query(publishedQuery,(err,results) => {
                    if (err) {
                        console.log(73,err);
                        return;
                    }

                    decompressBoardsFromDB(results,(publishedBoards) => {
                        returningBoards.published = publishedBoards.slice().reverse();
                        io.to(socketID).emit("serverSending_publishedBoards",returningBoards,sendType);
                    });
                })
            });

        })

    })
}
function helper_spawnPlayers(lobby) {
    let playerZones = organizeZones(lobby.spawnZones.players);
    for (let i = 0; i < lobby.players.length; i++) {
        let player = onlineAccounts[lobby.players[i]].player;
        let playerSpawned = spawn(lobby,player,true,playerZones);
        if (playerSpawned === false) return false;
    }

    return true;
}
function attempGiveCoin(lobby,player,itemPos) {
    let allowed = false;
    findingCoin: for (let i = 0; i < lobby.coin.locations.length; i++) {
        let loc = lobby.coin.locations[i];
        if (loc.x == itemPos.x && loc.y == itemPos.y) {
            allowed = true;
            lobby.coin.locations.splice(i,1);
            break findingCoin;
        }
    }

    if (!allowed) return;
    let account = onlineAccounts[player.accountID];
    addCoinsToUser(1,Number(account.tag),player.accountID);

}
function addCoinsToUser(amt,userID,socket) {
     // Add coins first
    const updateSql = `UPDATE inventory SET coins = coins + ? WHERE tag = ?`;

    db.query(updateSql, [amt, userID], (err, result) => {
        if (err) {
            console.log("Couldn't Give Coin", err);
            return;
        }

        // Now fetch the updated coin count
        const selectSql = `SELECT coins FROM inventory WHERE tag = ?`;
        db.query(selectSql, [userID], (err, rows) => {
            if (err) {
                console.log("Couldn't fetch updated coins", err);
                return;
            }

            const coins = rows[0]?.coins || 0;
            io.to(socket).emit("updateCoins", coins);
        });
    });
}
function attemptCoinSpawn(lobby) {
    let now = Date.now();

    if (lobby.coin.readyTime === false) {
        lobby.coin.readyTime = now + simple.rnd(60000,180000);
        return;
    }

    if (now >= lobby.coin.readyTime) {
        //Spawn Coin
        lobby.coin.readyTime = false;
        let spot = spawnItem(lobby,35);
        if (!spot) return;

        lobby.coin.locations.push({x: spot.x, y: spot.y});
    }
}
function helper_resetLobby(lobby) {
    //Making Sure We Have Correct Winning Conditions
    if (!lobby.gameMode.winningConditions) {
        lobby.gameMode.winningConditions = [false,false,false,false,false];
    }
    for (let i = 0; i < lobby.gameMode.winningConditions.length; i++) {
        let condition = lobby.gameMode.winningConditions[i];
        if (!condition) continue;
        if (!condition.pullTeamStatus) condition.pullTeamStats = false;
    }
    //Setting Up Quick Cheat For Conditions

    lobby.condition_time = [];
    lobby.condition_size = [];
    lobby.condition_time = [];
    lobby.condition_kill = [];
    lobby.condition_status = [];


    lobby.playerRespawns = [];
    
    for (let i = 0; i < lobby.gameMode.winningConditions.length; i++) {
        let condition = lobby.gameMode.winningConditions[i];
        if (!condition) continue;

        if (condition.condition == "Reach Snake Size Of X") lobby.condition_size.push(condition);
        if (condition.condition == "Survive X Minutes") lobby.condition_time.push(condition);
        if (condition.condition == "Kill X Snakes") lobby.condition_kill.push(condition);
        if (condition.condition == "X Minutes Pass") lobby.condition_time.push({condition: condition,startTime: false});
        if (condition.condition == "Board Status") lobby.condition_status.push(condition);
    }

    //Winning Condition Check End


    lobby.gameEnd = false;
    lobby.boardStatusCount = 0;
    lobby.playSounds = [];
    lobby.canvasFilters = [];
    lobby.boardStatus = [];
    lobby.lobby_gameLoop_start = false;
    lobby.gameStartedAt = false;

    lobby.coin = {
        locations: [],
        readyTime: false,
    }

    lobby.board.map = structuredClone(lobby.board.originalMap);

    lobby.oldObj = false;
    lobby.isInGame = true;
    lobby.readyPlayers = [];
    lobby.board.doColorRender = false;
    lobby.specialItemIteration = 0;
    lobby.specialItemActiveChance = 4;
    lobby.specialItemLowChance = 1;
    lobby.specialItemHighChance = 6;
    lobby.board.isActiveGame = true; 
    lobby.updateCells = [];
    lobby.updateTiles = [];
    lobby.projectiles = [];
    lobby.updateZones = [];
    lobby.updateSnakeCells = [];
    lobby.updatePoints = [];
    lobby.spawnZones = structuredClone(lobby.board.spawnZones);
    lobby.board.renderEmotesList = [];
    lobby.board.location_tunnels = [];
    lobby.board.location_status = [];
    lobby.board.playerGrow_status = [];
    lobby.timeEvents = [];
    lobby.snakeMap = [];
    for (let i = 0; i < lobby.board.map.length; i++) {
        let toPush = [];
        for (let j = 0; j < lobby.board.map[i].length; j++) {
            toPush.push([{
                x: j,
                y: i,
            }])
        }
        lobby.snakeMap.push(toPush);
    }

    lobby.items = structuredClone(items);
    lobby.tiles = structuredClone(tiles);
    
    for (let i = 0; i < lobby.gameMode.itemAlterations.length; i++) {
        let alterationGroup = lobby.gameMode.itemAlterations[i];
        for (let k = 0; k < lobby.items.length; k++) {
            let item = lobby.items[k];
            if (item.name !== alterationGroup.name) continue;

            for (let j = 0; j < alterationGroup.alterations.length; j++) {
                let alteration = alterationGroup.alterations[j];
                setNestedValue(item,alteration,"_LAST_");
            }
        }
    }

    //Resetting Players
    lobby.inGamePlayers = getPlayersList(lobby.players);

    for (let i = 0; i < lobby.inGamePlayers.length; i++) {
        let player = lobby.inGamePlayers[i];
        player.index = i;
        player.stats = [];
        player.canMove = true;
        player.canGrow = true;
        player.ghost = false;
        player.isPlayer = true;
        //Ressurect Player
        player.isDead = false;
        player.justDied = false;
        player.bodyArmor = 1;
        //Set Player Selecting Item To 1
        player.selectingItem = 0;
        player.justTeleported = false;
        //Set Player Item Usage
        player.howManyItemsCanIUse = lobby.gameMode.howManyItemsCanPlayersUse;
        player.whenInventoryIsFullInsertItemsAt = 0;
        player.status = [];
        //Set All Player Items To Empty
        player.items = [];
        for (let j = 0; j < lobby.gameMode.howManyItemsCanPlayersUse; j++) {
            player.items.push("empty");
        }
        //Draw Player's Card
        //drawPlayerBox(player);  add later
        //_________________________________________

        player.longestTail = 0;
        player.moving = "right";
        player.growTail = 0;
        player.tail = [];
        player.moveQueue = [];
        player.prevMove = "start";
        player.moveTik = 0;
        player.moveSpeed = 6;
        player.turboDuration = 0;
        player.turboActive = false;
        player.winGame = false;
        player.equiped = {
            head: false,
            body: false,
            tail: false,
        };
        
        player.playerKills = 0;
        player.index = i;
        player.preGameStatus = "waiting";
        player.respawnCount = lobby.gameMode.respawnCount || basedGameMode.respawnCount;
        player.pos = {
            x: false,
            y: false,
        }
        player.team = "white";
        player.invinsibleBodyEffect = false;

        player.timeAlive = [0];
        player.timeCameAlive = false;
        player.allowedToMove = true;

        player.zones = [];
    }

    lobby.specialZones = [];
    if (!lobby.spawnZones.special) lobby.spawnZones.special = [];
    else lobby.specialZones = structuredClone(lobby.spawnZones.special)
    for (let i = 0; i < lobby.specialZones.length; i++) {
        lobby.specialZones[i].occupiedBy = [];
        lobby.specialZones[i].startTimeStamp = false;
        lobby.specialZones[i].statusGave = 0;
        lobby.specialZones[i].statusGiven = [];
    }


    getLocations(lobby);
    fixBoardDifferences(lobby.board.map,lobby.board.itemDifferences,"item");
    fixBoardDifferences(lobby.board.map,lobby.board.tileDifferences,"tile");
    updateAllCells(lobby);
}
function findTeamWithHighestBoardStatus(lobby) {
    let statusList = lobby.boardStatus;
    let count = false;
    let team = false;

    let allStatus = {
        aquamarine: 0,
        blue: 0,
        buff: 0,
        coral: 0,
        crimsonpurple: 0,
        gold: 0,
        green: 0,
        lemon: 0,
        lime: 0,
        magenta: 0,
        orange: 0,
        pink: 0,
        red: 0,
        skyblue: 0,
        slateblue: 0,
        venom: 0,
    }

    for (let i = 0; i < statusList.length; i++) {
        const color = statusList[i];
        allStatus[color]++;
        if (count === false || allStatus[color] > count) {
            count = allStatus[color];
            team = color;
        }
    }

    return team;
}
function checkRespawnPlayers(lobby) {
    let now = Date.now();
    for (let i = 0; i < lobby.playerRespawns.length; i++) {
        let incident = lobby.playerRespawns[i];
        let timeDif = now - incident.death;
        if (!incident.spawned) {
            incident.spawned = true;
            respawnPlayer(lobby,incident.player,lobby.gameMode.respawnGrowth,lobby.gameMode.respawnTimer);
        }
        if (timeDif >= ((lobby.gameMode.respawnTimer) * 1000)) {
            incident.player.canMove = true;
            incident.player.canGrow = true;
            incident.player.ghost = false;
            incident.player.justDied = false;
            incident.player.moveTik = 0;
            incident.player.timeAlive.push(0);
            incident.player.timeCameAlive = Date.now();

            lobby.playerRespawns.splice(i,1);
            i--;
        }
    }
}
function checkEndGameBoardStatus(lobby) {
    let statusList = lobby.boardStatus;

    let allStatus = {
        aquamarine: 0,
        blue: 0,
        buff: 0,
        coral: 0,
        crimsonpurple: 0,
        gold: 0,
        green: 0,
        lemon: 0,
        lime: 0,
        magenta: 0,
        orange: 0,
        pink: 0,
        red: 0,
        skyblue: 0,
        slateblue: 0,
        venom: 0,
    }

    for (let i = 0; i < statusList.length; i++) {
        allStatus[statusList[i]]++;
    }

    for (let i = 0; i < lobby.condition_status.length; i++) {
        let condition = lobby.condition_status[i];

        let status = condition.x.status;

        if (status == "*P") {
            const firstHighStatus = Object.entries(allStatus).find(([_, v]) => v >= condition.x.count)?.[0];
            if (firstHighStatus !== undefined)
                triggerWinningCondition(lobby,condition,firstHighStatus);
        } else {
            if (allStatus[condition.x.status] >= condition.x.count) {
                triggerWinningCondition(lobby,condition);
            }
        }
    }
}
function checkEndGametimers(lobby) {
    for (let i = 0; i < lobby.condition_time.length; i++) {
        let condition = lobby.condition_time[i];
        let endTime = (condition.condition.x*60*1000)+condition.startTime;
        if (Date.now() >= endTime) {
            triggerWinningCondition(lobby,condition.condition);
        }
    }
}
function specialZones_recheck(lobby) {
    let specialZones = lobby.specialZones;

    for (let i = 0; i < specialZones.length; i++) {
        let zone = specialZones[i];
        if (!zone.giveStatusOnEnter) continue;
        if (zone.repeatStatusType.toLowerCase() == "single use" && zone.statusGave > 0) continue;

        let correctOccupied = specialZone_testOccupied(lobby,zone);
        if (correctOccupied) specialZone_startTimer(lobby,zone);
        else specialZone_endTimer(lobby,zone);
    }
}
function specialZone_timer(lobby,zone,time,secondCap) {
    if (time <= 0 && zone.startTimeStamp) {
        let correctOccupied = specialZone_testOccupied(lobby,zone);
        if (!correctOccupied) return;

        let status = [];
        if (zone.giveStatus.toLowerCase() === "*p") {
            if (zone.giveStatusFrom.toLowerCase() == "all players") {
                for (let i = 0; i < zone.occupiedBy.length; i++) {
                    status.push(zone.occupiedBy[i].team);
                }
            }
            if (zone.giveStatusFrom.toLowerCase() == "random player") {
                status.push(simple.rnd(zone.occupiedBy).team);
            }
            if (zone.giveStatusFrom.toLowerCase() == "random team") {
                let teams = [];
                for (let i = 0; i < zone.occupiedBy.length; i++) {
                    if (!teams.includes(zone.occupiedBy[i].team)) teams.push(zone.occupiedBy[i].team);
                }
                status.push(simple.rnd(teams));

            }
            if (zone.giveStatusFrom.toLowerCase() == "all teams") {
                let teams = [];
                for (let i = 0; i < zone.occupiedBy.length; i++) {
                    if (!teams.includes(zone.occupiedBy[i].team)) teams.push(zone.occupiedBy[i].team);
                }
                status = teams;
            }
            if (zone.giveStatusFrom.toLowerCase() == "largest team") {
                let teams = [];
                for (let i = 0; i < zone.occupiedBy.length; i++) {
                    teams.push(zone.occupiedBy[i].team);
                }
                status.push(findMostFrequent(teams));
            }
        } else status.push(zone.giveStatus);

        if (zone.giveStatusType == "add") {
            for (let i = 0; i < status.length; i++) {
                addBoardStatus(lobby,status[i]);
                zone.statusGiven.push(status[i]);
            }
            zone.statusGave++;
        }
        if (zone.giveStatusType == "remove") {
            for (let i = 0; i < status.length; i++) {
                removeBoardStatus(lobby,status[i]);
                checkZoneStatus: for (let j = 0; j < zone.statusGiven.length; j++) {
                    if (zone.statusGiven[j] == status[i]) {
                        zone.statusGiven.splice(j,1);
                        break checkZoneStatus;
                    }
                }
            }
            zone.statusGave++;
        }
        if (zone.giveStatusType == "set") {
            for (let j = 0; j < zone.statusGiven.length; j++) {
                removeBoardStatus(lobby,zone.statusGiven[j]);
            }
            zone.statusGiven = [];
            for (let i = 0; i < status.length; i++) {
                addBoardStatus(lobby,status[i]);
                zone.statusGiven.push(status[i]);
            }
            zone.statusGave++;
        }

        if (zone.repeatStatusType.toLowerCase() == "repeat") {
            specialZone_endTimer(lobby,zone);
            specialZone_startTimer(lobby,zone);
        }

        return;
    }

    if (zone.startTimeStamp) {
        setTimeout(function() {
            if (lobby.gameEnd) return;
            lobby.updateZones.push({
                id: zone.id,
                min: secondCap-time/2,
            })
            specialZone_timer(lobby,zone,time-1,secondCap);
        },500);
    } else {
        specialZone_endTimer(lobby,zone);
    }

}
function specialZone_endTimer(lobby,zone) {
    zone.startTimeStamp = false;
    lobby.updateZones.push({
        id: zone.id,
        min: false,
    })
}
function specialZone_startTimer(lobby,zone) {
    if (zone.startTimeStamp !== false) return;

    lobby.updateZones.push({
        id: zone.id,
        min: 0,
        max: zone.giveStatusDelay,
    })
    zone.startTimeStamp = true;
    specialZone_timer(lobby,zone,zone.giveStatusDelay*2,zone.giveStatusDelay);
}
function specialZone_testOccupied(lobby,zone) {
    let type = zone.giveStatusWhenOccupiedBy;

    if (type.toLowerCase() == "everyone" && zone.occupiedBy.length > 0) return true;
    if (type.toLowerCase() == "solo player" && zone.occupiedBy.length == 1) return true;
    if (type.toLowerCase() == "solo team") {
        let teams = [];
        for (let i = 0; i < zone.occupiedBy.length; i++) {
            if (!teams.includes(zone.occupiedBy[i].team)) teams.push(zone.occupiedBy[i].team);
        }
        if (teams.length == 1) return true;
    }
        
    return false;
}




function findMostFrequent(arr) {
    const frequencyMap = {};
    let maxCount = 0;
    let mostFrequentValue;
  
    for (const value of arr) {
      frequencyMap[value] = (frequencyMap[value] || 0) + 1;
      if (frequencyMap[value] > maxCount) {
        maxCount = frequencyMap[value];
        mostFrequentValue = value;
      }
    }
  
    return mostFrequentValue;
  }
async function server_closeLobby(lobby) {
    let socketsInRoom = await io.in(lobby.id).fetchSockets();

    io.to(lobby.id).emit("popup","Lobby Crashed");
    delete lobbies[lobby.id];

    socketsInRoom.forEach(socket => {
        socket.leave(lobby.id);
        socket.join("menuScreen");
        io.to(socket.id).emit("setScene","newMenu");
    });

    updateLobbies();

}
function database_addTotalPlaysToBoard(boardID,amount) {
    const query = `
        UPDATE boards 
        SET total_plays = IFNULL(total_plays, 0) + ? 
        WHERE id = ? AND published = 1
    `;

    db.query(query, [amount, boardID], (err, results) => {
        if (err) throw err;
    });
}
function database_addPlaysToBoard(boardID, amount) {
    const query = `
        UPDATE boards 
        SET plays = IFNULL(plays, 0) + ? 
        WHERE id = ? AND published = 1
    `;

    db.query(query, [amount, boardID], (err, results) => {
        if (err) throw err;
    });
}
function setPlayersZones(lobby) {
    //Define Vars
    let activePlayers = lobby.inGamePlayers;
    let playerZones = lobby.spawnZones.players;
    let itemZones = lobby.spawnZones.items;
    let specialZones = lobby.specialZones;

    //Clear All Zones Occupied
    function clearZone(zones) {
        for (let i = 0; i < zones.length;i++) {
            zones[i].occupiedBy = [];
        }
    }
    clearZone(playerZones);
    clearZone(itemZones);
    clearZone(specialZones);

    //Reset All Players
    for (let i = 0; i < activePlayers.length; i++) {
        let player = activePlayers[i];
        //Clear Zone
        player.zones = [];

        //Find Zones
        if (player.isDead) continue;

        function addPlayerZones(player,zones,x,y,type) {
            for (let i = 0; i < zones.length; i++) {
                let zone = zones[i];
                if (!zone.active && (type == "item" || type == "player")) continue;

                if (x >= zone.pos1.x && x <= zone.pos2.x) {
                    if (y >= zone.pos1.y && y <= zone.pos2.y) {
                        player.zones.push(zone.id)
                        zone.occupiedBy.push(player);
                    }
                }
            }
        }

        addPlayerZones(player,playerZones,player.pos.x,player.pos.y,"player");
        addPlayerZones(player,itemZones,player.pos.x,player.pos.y,"item");
        addPlayerZones(player,specialZones,player.pos.x,player.pos.y,"special");

        checkWinningCondition(lobby,"Touch Zone X",false,player);
    }

    //Check Zones
    specialZones_recheck(lobby);
}
function endLobbyGame(lobby,winningPlayers,winningTitle,conditionTitle,conditionImage) {
    if (lobby.gameEnd === true) return;

    lobby.gameEnd = true;
    lobby.isActiveGame = false;
    lobby.isInGame = false;

    let lobbyEndTime = Date.now();

    //Kill Any Non Dead Snakes
    for (let i = 0; i < lobby.inGamePlayers.length; i++) {
        let timePlayed = lobbyEndTime - lobby.gameTimeStart;
        if (lobby.inGamePlayers[i].leftGameAt) timePlayed = lobby.inGamePlayers[i].leftGameAt - lobby.gameTimeStart;
        addPlayerStatus("time_played",timePlayed,lobby.inGamePlayers[i]);
        addPlayerStatus("games_played",1,lobby.inGamePlayers[i]);
        if (lobby.inGamePlayers[i].timeAlive.length === 0) {
            addPlayerStatus("perfect_run",1,lobby.inGamePlayers[i]);
        }
        if (!lobby.inGamePlayers[i].isDead) {
            deletePlayer(lobby,lobby.inGamePlayers[i],false,false,true);
        }
    }

    let longestTail = lobby.inGamePlayers[0].longestTail;
    let timeSurvived = Math.max(...lobby.inGamePlayers[0].timeAlive);
    let mostKills = lobby.inGamePlayers[0].playerKills;
    let longestTailPlayer = lobby.inGamePlayers[0].accountName;
    let timeSurvivedPlayer = lobby.inGamePlayers[0].accountName;
    let mostKillsPlayer = lobby.inGamePlayers[0].accountName;
    for (let i = 1; i < lobby.inGamePlayers.length; i++) {
        if (lobby.inGamePlayers[i].longestTail > longestTail) {
            longestTail = lobby.inGamePlayers[i].longestTail;
            longestTailPlayer = lobby.inGamePlayers[i].accountName;
        }
        if (Math.max(...lobby.inGamePlayers[i].timeAlive) > timeSurvived) {
            timeSurvived = Math.max(lobby.inGamePlayers[i].timeAlive);
            timeSurvivedPlayer = lobby.inGamePlayers[i].accountName;
        }
        if (lobby.inGamePlayers[i].playerKills > mostKills) {
            mostKills = lobby.inGamePlayers[i].mostKills;
            mostKillsPlayer = lobby.inGamePlayers[i].accountName;
        }
    }

    let obj = {
        longestTailPlayer: longestTailPlayer,
        timeSurvivedPlayer: timeSurvivedPlayer,
        mostKillsPlayer: mostKillsPlayer,
        lobby: lobby,
        activePlayers: lobby.inGamePlayers,
        winningPlayers: winningPlayers,
        winningTitle: winningTitle,
        conditionTitle: conditionTitle,
        conditionImage: conditionImage,
    };
    updateServerStats(lobby);
    
    io.to(lobby.id).emit("endGame",obj)
    database_addPlaysToBoard(lobby.boardID,1);
    database_addTotalPlaysToBoard(lobby.boardID,lobby.inGamePlayers.length);

    
    updateLobbies();
}
function triggerWinningCondition(lobby,condition,player) {
    if (lobby.gameEnd === true) return;
    let winningPlayers = [];
    let winningTitle;
    let conditionTitle = "";
    let conditionImage = false;

    if (condition.condition == "Last One Standing") {
        conditionTitle = "Condition: Last One Standing";
    }
    if (condition.condition == "Last Team Standing") {
        conditionTitle = "Condition: Last Team Standing";
    }
    if (condition.condition == "Survive X Minutes") {
        conditionTitle = "Condition: Survive " + condition.x + " Minutes";
    }
    if (condition.condition == "Kill X Snakes") {
        conditionTitle = "Condition: Kill " + condition.x + " Snakes";
    }
    if (condition.condition == "Reach Snake Size Of X") {
        conditionTitle = "Condition: Reach Snake Size Of " + condition.x;
    }
    if (condition.condition == "Touch Zone X") {
        conditionTitle = "Condition: Touch Zone " + condition.x;
    }
    if (condition.condition == "Touch Item X") {
        conditionTitle = "Condition: Touch ";
        conditionImage = {
            type: "item",
            id: condition.x,
        }
    }
    if (condition.condition == "Touch Tile X") {
        conditionTitle = "Condition: Touch ";
        conditionImage = {
            type: "tile",
            id: condition.x,
        }
    }
    if (condition.condition == "All Dead") {
        winningTitle = "No Winners";
    }
    if (condition.condition == "X Minutes Pass") {
        conditionTitle = "Game Ended After " + condition.x + " Minutes.";
    }
    if (condition.condition == "Board Status") {
        let status = condition.x.status;
        if (status == "*P") status = "Of Any";
        conditionTitle = `The Board Reaches ${condition.x.count} ${status} Status'`;
    }

    if (condition.whoWins == "Player") {
        winningTitle = player.accountName + " Won";
        winningPlayers.push(player);
    } else if (condition.whoWins == "Board Status") {
        //Find Team With Highest Board Status
        let teamColor = findTeamWithHighestBoardStatus(lobby);
        if (!teamColor) {
            winningTitle = "No One Won";
        } else {
            winningTitle = (teamColor.charAt(0).toUpperCase() + teamColor.slice(1)) + " Team Won";
            for (let i = 0; i < lobby.inGamePlayers.length; i++) {
                if (lobby.inGamePlayers[i].team === teamColor) {
                    winningPlayers.push(lobby.inGamePlayers[i])
                }
            }
        }
    } else if (condition.whoWins == "Players Team") {
        winningTitle = (player.team.charAt(0).toUpperCase() + player.team.slice(1)) + " Team Won";
        for (let i = 0; i < lobby.inGamePlayers.length; i++) {
            if (lobby.inGamePlayers[i].team === player.team) {
                winningPlayers.push(lobby.inGamePlayers[i])
            }
        }
    } else if (condition.whoWins == "Everyone") {
        winningTitle = "Everyone Won";
        for (let i = 0; i < lobby.inGamePlayers.length; i++) {
            winningPlayers.push(lobby.inGamePlayers[i])
        }
    } else if (condition.whoWins == "No One") {
        winningTitle = "No One Won";
    } else if (condition.whoWins == "Highest Value") {
        let highestValue = condition.highestValue;
        if (!highestValue) highestValue = "Kills";
        winningTitle = "Snakes With Highest " + highestValue + " Won";

        let value = 0;

        //Step One Find Highest Value
        for (let i = 0; i < lobby.inGamePlayers.length; i++) {
            let check;
            if (highestValue.toLowerCase() == "kills") check = lobby.inGamePlayers[i].playerKills;
            if (highestValue.toLowerCase() == "size") check = lobby.inGamePlayers[i].tail.length;
            if (highestValue.toLowerCase() == "time") check = lobby.inGamePlayers[i].timeAlive[lobby.inGamePlayers[i].timeAlive.length-1];

            if (check > value) value = check;
        }

        //Step Two Find All Players With Highest Value
        for (let i = 0; i < lobby.inGamePlayers.length; i++) {
            let check;
            if (highestValue.toLowerCase() == "kills") check = lobby.inGamePlayers[i].playerKills;
            if (highestValue.toLowerCase() == "size") check = lobby.inGamePlayers[i].tail.length;
            if (highestValue.toLowerCase() == "time") check = lobby.inGamePlayers[i].timeAlive[lobby.inGamePlayers[i].timeAlive.length-1];

            if (check == value) winningPlayers.push(lobby.inGamePlayers[i]);

        }
    } else if (condition.whoWins !== false) {
        winningTitle = (condition.whoWins.charAt(0).toUpperCase() + condition.whoWins.slice(1)) + " Team Won";
        for (let i = 0; i < lobby.inGamePlayers.length; i++) {
            if (lobby.inGamePlayers[i].team === condition.whoWins) {
                winningPlayers.push(lobby.inGamePlayers[i])
            }
        }
    }

    endLobbyGame(lobby,winningPlayers,winningTitle,conditionTitle,conditionImage);


}
function checkWinningCondition(lobby,condition,value,player,forceEnd) {
    let winningConditions = lobby.gameMode.winningConditions;
    if (lobby.gameEnd === true) return;

    if (condition == "Time Alive") {
        if (lobby.condition_time.length == 0) return;

        for (let cs = 0; cs < lobby.condition_time.length; cs++) {
            let lobbyCondition = lobby.condition_time[cs];
            if (player.timeAlive[player.timeAlive.length-1] >= lobbyCondition.x*60000) {
                triggerWinningCondition(lobby,lobbyCondition,player);
            }
        }
        return;
    }

    for (let i = 0; i < winningConditions.length; i++) {
        if (!winningConditions[i]) continue;
        if (winningConditions[i].condition !== condition) continue;

        if (condition == "Touch Item X" || condition == "Touch Tile X") {
            if (value.id === winningConditions[i].x) {
                triggerWinningCondition(lobby,winningConditions[i],player)
                return;
            }
        }
        if (condition == "Last One Standing") {
            triggerWinningCondition(lobby,winningConditions[i],player);
            return;
        }
        if (condition == "Last Team Standing") {
            triggerWinningCondition(lobby,winningConditions[i],value);
            return;
        }
        if (condition == "Touch Zone X") {
            if (player.zones.includes(winningConditions[i].x)) {
                triggerWinningCondition(lobby,winningConditions[i],player);
                return;
            }
        }
        if (condition == "All Dead") {
            triggerWinningCondition(lobby,winningConditions[i],player);
            return;
        }
    }

    
    if (forceEnd) {

        triggerWinningCondition(lobby,{
            condition: "All Dead",
            x: false,
            whoWins: "No One",
            type: false,
            pullTeamStats: false,
            highestValue: "kills",
        },player);
    }

}
function sendBoardStats(socketID,sentFrom = null) {
    let account = onlineAccounts[socketID];
    if (!account.loggedIn) return;
    let query = "SELECT board, id, published FROM boards WHERE tag = ?";
    db.query(query,[Number(account.tag)],(err,results) => {
        if (err) {
            console.log(73,err);
            return;
        }

        decompressBoardsFromDB(results,(dbBoards) => {
            io.to(socketID).emit("serverSending_boardStats",dbBoards,sentFrom);
        });
    })
}
function decompressBoardsFromDB(dbBoards, func, sendBackBoards = []) {
    let promises = [];

    // Collect all promises for decompressing the boards
    for (let i = 0; i < dbBoards.length; i++) {
        let promise = new Promise((resolve, reject) => {
            decompressObject(dbBoards[i].board, (err, result) => {
                if (err) {
                    console.log(8321, err);
                    reject(err);
                } else {
                    let obj = dbBoards[i];
                    obj.board = result;
                    sendBackBoards.push(obj);
                    resolve();
                }
            });
        });
        promises.push(promise);
    }

    // Wait for all promises to resolve and then return the result
    Promise.all(promises)
        .then(() => {
            func(sendBackBoards);
        })
        .catch((err) => {
            console.error("Error decompressing boards:", err);
        });
}
function setGuestAccount(socketID,full = false,sendHome = false) {
    let username = "GuestSnake";//simple.rnd(playerNames1) + simple.rnd(playerNames2);
    let tag = simple.rnd(1000,9999) + "";
    const date = new Date();
    const formattedDate = date.toISOString().split('T')[0];
    onlineAccounts[socketID] = {
        loggedIn: false,
        id: socketID,

        playerLimit: 10,
        players: [ ],
        publishedBoardLimit: 2,
        boardLimit: 3,
        canChangePassword: false,

        player: false, //For Lobbies
        serverSnake: newPlayer(socketID,username,tag),
        lobby: false,
        username: username,
        tag: tag,
        status: "Guest",
        dateCreated: formattedDate,
        coins: 0,
        battlePassPoints: 0,
        challengeLimit: 2,
        questsAccepted: [],
        email: false,
        battlePasses: [{
            name: "beta",
            unlocked: [-1],
        }],

        musicVolume: 100,
        sfxVolume: 100,


        allowedItemIds: [1,4,6,34,14,15,18,],
        allowedTileIds: [1,3,6],
        allowedItemSkinPacks: [0],
        allowedSnakeColors: [0,1,2,3],
        allowedNameColors: [0],
    }
    let account = onlineAccounts[socketID];
    
    let accessedBattlePasses = {};
    for (let i = 0; i < account.battlePasses.length; i++) {
        accessedBattlePasses[account.battlePasses[i].name] = allBattlePasses[account.battlePasses[i].name];
    }
    account.serverSnake.colorID = simple.rnd(account.allowedSnakeColors);

    updateLobbies();
    let sendItems = full ? pako.deflate(JSON.stringify(items), { to: 'string' }) : undefined;
    let sendTiles = full ? pako.deflate(JSON.stringify(tiles), { to: 'string' }) : undefined;
    let sendNameColors = full ? server_nameColors : undefined;
    let sendSnakeColors = full ? server_snakeColors : undefined;
    
    io.to(socketID).emit('setPlayer', socketID, account,accessedBattlePasses,sendItems,full ? basedGameMode : undefined,full ? presetGameModes : undefined,full ? backgrounds : undefined,sendTiles,sendNameColors,sendSnakeColors);
    if (sendHome) 
        io.to(socketID).emit("setScene","newMenu");

}
function gatherDBInventory(account,user) {
    let dbObj = {};
    let query = "SELECT * FROM inventory WHERE tag = ?";
    db.query(query, [Number(user.tag)], (err,results) => {
        if (err || results.length === 0) {
            console.log(err)
            return;
        }

        dbObj.inventory = results[0];

        gatherDBallowed(account,user,dbObj);


    })
}
function gatherDBallowed(account,user,dbObj) {
    query = "SELECT * FROM allowed WHERE tag = ?";
    db.query(query, [Number(user.tag)], (err,results) => {
        if (err) return false;

        dbObj.allowed = {
            items: [],
            tiles: [],
            skinPacks: [],
            snakeColors: [],
            nameColors: [],
        };
        for (let i = 0; i < results.length; i++) {
            dbObj.allowed[results[i].type].push(results[i].allowed_id);
        }

        setSocketToUser(account,user,dbObj);
        
    })
}
function setSocketToUser(account,user,dbObj) {
    account.loggedIn = true;
    account.canChangePassword = false;
    //credentials
    account.status = user.status;
    account.dateCreated = user.date_created;
    account.id = account.id;
    account.username = user.username;
    account.tag = formatNumber(user.tag);
    account.email = user.email;

    //inventory
    account.boardLimit = dbObj.inventory.board_limit;
    account.gameModeLimit = dbObj.inventory.gamemode_limit;
    account.coins = dbObj.inventory.coins;
    account.battlePassPoints = dbObj.inventory.battle_pass_points;
    account.serverSnake = JSON.parse(dbObj.inventory.server_snake);
    account.serverSnake.accountID = account.id;
    account.challengeLimit = dbObj.inventory.challenge_limit;
    account.musicVolume = dbObj.inventory.music_volume;
    account.sfxVolume = dbObj.inventory.sfx_volume;
    account.publishedBoardLimit = dbObj.inventory.published_board_limit;
    account.weeklyChallenges = dbObj.inventory.weekly_challenges;
    account.activeChallenge1 = dbObj.inventory.active_challenge_1;
    account.activeChallenge2 = dbObj.inventory.active_challenge_2;
    account.activeChallenge3 = dbObj.inventory.active_challenge_3;

    //allowed
    account.allowedNameColors = dbObj.allowed.nameColors;
    account.allowedItemIds = dbObj.allowed.items;
    account.allowedTileIds = dbObj.allowed.tiles;
    account.allowedItemSkinPacks = dbObj.allowed.skinPacks;
    for (let i = 0; i < account.allowedItemSkinPacks.length; i++) {
        account.allowedItemSkinPacks[i] = server_skinPacks[account.allowedItemSkinPacks[i]];
    }
    account.allowedSnakeColors = dbObj.allowed.snakeColors;

    account.questsAccepted = [];
    account.battlePasses = [{
        name: "beta",
        unlocked: [-1],
    }];

    let accessedBattlePasses = {};
    for (let i = 0; i < account.battlePasses.length; i++) {
        accessedBattlePasses[account.battlePasses[i].name] = allBattlePasses[account.battlePasses[i].name];
    }

    //Handle Challenges
    if (account.weeklyChallenges === null) {
        account.weeklyChallenges = gatherWeeklyChallenges();
        db.query("UPDATE inventory SET weekly_challenges = ? WHERE tag = ?", [JSON.stringify(account.weeklyChallenges), user.tag]);
    } else {
        let reset = shouldResetChallenges(account.weeklyChallenges.startDate);
        if (reset) {
            account.weeklyChallenges = gatherWeeklyChallenges();
            account.activeChallenge1 = null;
            account.activeChallenge2 = null;
            account.activeChallenge3 = null;
            db.query(
                "UPDATE inventory SET weekly_challenges = ?, active_challenge_1 = null, active_challenge_2 = null, active_challenge_3 = null WHERE tag = ?",
                [JSON.stringify(account.weeklyChallenges), user.tag]
            );

        }
    }
    
    updateLobbies();

    io.to(account.id).emit('setPlayer', account.id, account,accessedBattlePasses);
    io.to(account.id).emit("setScene","newMenu");
    sendBoardStats(account.id,"Set Player");
    sendStatsIO(user.tag,account.id)
}

function generateRandomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function zipAllBoards(boardList,func,index = 0,list = []) {
    compressObject(boardList[index],(err,compressed) => {
        if (err) {
            console.log("Error Code: 354",err);
            return;
        }
        list.push(compressed);
        if (index < boardList.length) {
            zipAllBoards(boardList,func,index+1,list);
        } else {
            func(list);
        }
    })
}

let server_skinPacks = ["basic","disco"];
let server_snakeColors = [
    { hue: 360, saturation: 300, brightness: 116 },
    { hue: 157, saturation: 234, brightness: 116 },
    { hue: 116, saturation: 211, brightness: 115 },
    { hue: 208, saturation: 203, brightness: 118 },
    { hue: 307, saturation: 160, brightness: 89 }, 
    { hue: 58, saturation: 192, brightness: 143 }, 
    { hue: 275, saturation: 62, brightness: 162 }, 
    { hue: 208, saturation: 62, brightness: 150 }, 
    { hue: 141, saturation: 62, brightness: 150 }, 
    { hue: 250, saturation: 234, brightness: 86 }, 
    { hue: 70, saturation: 0, brightness: 86 },
    { hue: 121, saturation: 180, brightness: 86 }, 
    { hue: 309, saturation: 300, brightness: 200 },
    { hue: 309, saturation: 58, brightness: 200 }, 
    { hue: 236, saturation: 106, brightness: 74 }, 
    { hue: 236, saturation: 210, brightness: 74 }, 
    { hue: 137, saturation: 210, brightness: 74 }, 
    { hue: 137, saturation: 53, brightness: 74 },
    { hue: 290, saturation: 130, brightness: 74 }, 
    { hue: 35, saturation: 119, brightness: 186 }, 
    { hue: 156, saturation: 119, brightness: 186 },
    { hue: 341, saturation: 119, brightness: 186 },
    { hue: 318, saturation: 300, brightness: 200 },
];

function getColorById(id) {
    for (let i = 0; i < server_snakeColors.length; i++) {
        if (server_snakeColors[i].id === id) return server_snakeColors[i].color;
    }
}




function getItemById(lobby,id) {
    for (let i = 0;i < lobby.items.length; i++) {
        if (lobby.items[i].id == id) return lobby.items[i];
    }
}
function updateAllCells(lobby) {
    let currentBoard = lobby.board;
    for (let i = 0; i < currentBoard.map.length; i++) {
        for (let j = 0; j < currentBoard.map[0].length; j++) {
            let cell = currentBoard.map[i][j]; 
            lobby.updateTiles.push({
                x: j,
                y: i,
                item: cell.tile,
            })
            if (cell.item) {
                lobby.updateCells.push({
                    x: j,
                    y: i,
                    item: cell.item,
                })
            }
        }
    }
}
function startGameLoop(lobby) {
    lobby.gameStartedAt = Date.now(); 


    for (let i = 0; i < lobby.timeEvents.length; i++) {
        let object = lobby.timeEvents[i];

        for (let j = 0; j < object.timeEvents.length; j++) {
            let event = object.timeEvents[j];
            if (!event.repeat) event.repeat = 1;

            function TimeEvent(event) {
                runItemFunction(lobby,false,object,object.events[event.event],object.pos);

                setTimeout(function() {
                    if (simple.type(event.repeat) == "number") {
                        event.repeat--;
                        if (event.repeat === -1) return;
                    }
                    if (lobby.gameEnd) return;
                    TimeEvent(event)
                },event.time*1000)
            }

            setTimeout(function() {
                if (simple.type(event.repeat) == "number") {
                    event.repeat--;
                    if (event.repeat === -1) return;
                }
                TimeEvent(event)
            },event.time*1000)
        }

    }

    for (let i = 0; i < lobby.inGamePlayers.length; i++) {
        lobby.inGamePlayers[i].timeCameAlive = Date.now();
    }

    for (let i = 0; i < lobby.condition_time.length; i++) {
        lobby.condition_time[i].startTime = Date.now();
    }

}
function checkSpawnStatusTimers(lobby) {
    let spawnList2 = lobby.spawnZones;
    let spawnList = [...spawnList2.players,...spawnList2.items];
    let timeSinceStart = (Date.now() - lobby.gameStartedAt)/1000;

    let foundDelays = false;
    for (let i = 0; i < spawnList.length; i++) {
        let zone = spawnList[i];
        if (zone.activateWhenTimePassed !== false) {
            if (timeSinceStart > zone.activateWhenTimePassed) {
                zone.activateWhenTimePassed = false;
                zone.active = true;
            } else {
                foundDelays = true;
            }
        }
        if (zone.deactivateWhenTimePassed !== false) {
            if (timeSinceStart > zone.deactivateWhenTimePassed) {
                zone.deactivateWhenTimePassed = false;
                zone.active = false;
            } else {
                foundDelays = true;
            }
        }
    }

    if (!foundDelays) lobby.checkingSpawnTimers = false;

}
function rerenderSnake(lobby,player) {
    if (simple.type(player) == "array") {
        for (let i = 0; i < player.length; i++) {
            rerenderSnake(lobby,player[i]);
        }
        return;
    }
    for (let i = 0; i < player.tail.length; i++) {
        lobby.updateSnakeCells.push(lobby.snakeMap[player.tail[i].y][player.tail[i].x]);
    }
    lobby.updateSnakeCells.push(lobby.snakeMap[player.pos.y][player.pos.x]);
}
function updateLobbies() {
    let lobbyList = Object.values(lobbies)
        .filter(lobby => lobby.serverType.toLowerCase() !== "hidden")
        .reduce((acc, lobby) => {
            acc[lobby.id] = { ...lobby, code: "", gameLoop: "" };
            return acc;
        }, {});
    io.to("menuScreen").emit("updateLobbies", lobbyList,Object.keys(onlineAccounts).length,Object.keys(lobbies).length);
}
setInterval(() => {
    io.emit("updateMemorry",process.memoryUsage());
  }, 5000);
function updateClientPositions(lobby) {
    let lobby_gameLoop_start = lobby.lobby_gameLoop_start;
    if (!lobby_gameLoop_start) lobby_gameLoop_start = Date.now();
    let emitingActivePlayers = Object.values(lobby.inGamePlayers).map(({ 
        index, 
        selectingItem, 
        items, 
        tail, 
        moving, 
        playerKills, 
        equiped,
        team,
        invinsibleBodyEffect,
        invincibleDuration,
        timeAlive,
        ghost,
        pos,
    }) => ({
        i: index,  
        s: selectingItem, 
        it: items, 
        t: tail.length + 1,  
        m: moving,  
        k: playerKills, 
        e: equiped,
        te: team,
        ibe: invinsibleBodyEffect,
        id: invincibleDuration,
        ta: timeAlive[timeAlive.length-1],
        gh: ghost,
        po: pos,
    }));
    let newObj = {
        a: emitingActivePlayers,  
        s: lobby.updateSnakeCells,
        c: lobby.updateCells,
        pr: lobby.projectiles,
        t: lobby.updateTiles,
        p: lobby.playSounds,
        b: lobby.boardStatus,
        g: Date.now() - lobby_gameLoop_start,
        f: lobby.canvasFilters,
        z: lobby.updateZones,
        
    };

    // Compare with previous object
    let changedList = getChangedValues(lobby.oldObj, newObj);
    let changes = pako.deflate(JSON.stringify(changedList), { to: 'string' });

    if (Object.keys(changes).length > 0) { // Only emit if there are changes
        io.to(lobby.id).emit("updatePositions", changes);
    }

    // Store the new state for next comparison
    lobby.oldObj = newObj;
    
    lobby.updateSnakeCells = [];
    lobby.updateCells = [];
    lobby.updateTiles = [];
    lobby.updateZones = [];
    lobby.playSounds = [];
    lobby.canvasFilters = [];
}
function getChangedValues(oldObj, newObj) {
    if (!oldObj) return newObj; // If no old state, send everything

    let changes = {};

    for (let key in newObj) {
        if (key == "a" || key == "b" || key == "s" || key == "pr")
            changes[key] = newObj[key]; // Only store changed values
        else if (JSON.stringify(newObj[key]) !== JSON.stringify(oldObj[key])) {
            changes[key] = newObj[key]; // Only store changed values
        }
    }

    return changes;
}

function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64); // Decode Base64 to binary string
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer; // Return ArrayBuffer
}
// Function to compress an object
function compressObject(obj, callback) {
    const jsonString = JSON.stringify(obj);
    zlib.gzip(jsonString, (err, compressedData) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, compressedData);
    });
}

// Function to decompress back to an object
function decompressObject(compressedData, callback) {
    zlib.gunzip(compressedData, (err, decompressedBuffer) => {
        if (err) {
            return callback(err, null);
        }
        const jsonString = decompressedBuffer.toString();
        callback(null, JSON.parse(jsonString));
    });
}
function newMap(width,height) {
    _newMap = [];
    for (let i = 0; i < height; i++) {
        let arr = [];
        for (let j = 0; j < width; j++) {
            arr.push({
                tile: getRealTile("grass"),
                item: false,
            })
        }
        _newMap.push(arr);
    }
    return _newMap;
}
let backgrounds = ["colors","water","space","clear"];
// everything I've moved is down here
let playerNames1 = [
    "Squabbling", "Terrifying", "Witty", "Sassy", "Mysterious",
    "Jolly", "Spunky", "Clumsy", "Grumpy", "Cheeky",
    "Funky", "Zesty", "Breezy", "Quirky", "Snarky",
    "Boisterous", "Goofy", "Rambunctious", "Vivacious", "Frolicking"
];
let playerNames2 = [
    "Cheesecake", "Martian", "Taco", "Wombat", "Penguin",
    "Sasquatch", "Narwhal", "Donut", "Giraffe", "Unicorn",
    "Robot", "Ostrich", "Dragon", "Platypus", "Sloth",
    "Cactus", "Llama", "Cupcake", "Blobfish", "Banana"
];
function formatNumber(num) {
    return num.toString().padStart(4, '0');
}
function checkBoard(board,account) {
    try {

        /*
            Check Each Gamemode
            Check Player Has Access to each item (skins too)
            Check Player Has Access to each tile (skins too)
            Check Board Settings (name, background, description)
            Check Spawn zones (Names)
        */
        if (!board) return "No Board Found";
        if (account.status == "Admin") return true;

        if (!board.gameModes) return "No Gamemodes Found1";
        if (board.gameModes.length == 0) return "No Gamemodes Found2";
        for (let i = 0; i < board.gameModes.length; i++) {
            let gameModeCheck = checkGameMode(board.gameModes[i]);
            if (simple.type(gameModeCheck) == "string") return  "Gamemode " + board.gameModes[i].name + " Error: " + gameModeCheck;
        }

        if (simple.type(board.description) !== "string") return "Board Description Is Not A String";
        if (board.description.length >= 200) return "Board Description Is To Long";
        if (simple.type(board.height) !== "number") return "Board Height Is Not A Number";
        if (simple.type(board.width) !== "number") return "Board Width Is Not A Number";
        if (board.height !== 30) return "Board Height Is Not 30";
        if (board.width !== 50) return "Board Width Is Not 50";
        if (!board.originalMap) return "Board has no map";
        if (simple.type(board.originalMap) !== "array") return "Boards Map Is Not An Array";
        if (board.originalMap[0].length !== 50) return "Board Width Is Not 50";
        if (board.originalMap.length !== 30) return "Board Height Is Not 30";

        let itemCheck = checkBoardItems(board,"item",account.allowedItemIds,account.allowedItemSkinPacks);
        if (itemCheck !== true) return itemCheck;
        let tileCheck = checkBoardItems(board,"tile",account.allowedTileIds,account.allowedItemSkinPacks);
        if (tileCheck !== true) return tileCheck;

        if (!board.spawnZones) return "Board Doesn't Have Spawn Zones";
        let spawnZoneCheck = checkSpawnZones(board.spawnZones);
        if (spawnZoneCheck !== true) return spawnZoneCheck;

        let tileDifferencesCheck = checkDifferences(board.tileDifferences,account.allowedItemSkinPacks);
        if (tileDifferencesCheck !== true) return tileDifferencesCheck;
        let itemDifferencesCheck = checkDifferences(board.itemDifferences,account.allowedItemSkinPacks);
        if (itemDifferencesCheck !== true) return itemDifferencesCheck;
    
        return true;
    } catch (err) {
        console.log(err);
        return err;
    }
}

function checkDifferences(differences,allowedSkins) {
    for (let i = 0; i < differences.length; i++) {
        let difference = differences[i];
        for (let j = 0; j < difference[0].length; j++) {
            let dArray = difference[0][j];
            if (dArray[0] == "skin") {
                if (!allowedSkins.includes(dArray[1])) return "Illegal Skin: " + dArray[1];
            }
        }
    }

    return true;
}

function checkSpawnZones(boardSpawnZones) {
    let playerZonesChecked = checkSpawnZoneHelper(boardSpawnZones.players);
    if (playerZonesChecked !== true) return playerZonesChecked;
    let itemZonesChecked = checkSpawnZoneHelper(boardSpawnZones.items);
    if (itemZonesChecked !== true) return itemZonesChecked;

    return true;
}
function checkSpawnZoneHelper(zones) {

    if (zones.length == 0) return "No Spawn Zones Found";
    for (let i = 0; i < zones.length; i++) {
        let zone = zones[i];
        if (profanity.check(zone.id)) return "Profanity Found In Zone Name:" + zone.id;

    }

    return true;
}
function checkBoardItems(board,type,allowedIDs,allowedSkinPacks) {
    for (let i = 0; i < board.originalMap.length; i++) {
        for (let j = 0; j < board.originalMap[i].length; j++) {
            let cell = board.originalMap[i][j][type];
            if (cell === false && type == "item") continue;
            if (cell === false && type == "tile") return "No Tile Found At " + i + "," + j;

            if (!allowedIDs.includes(cell.id)) return "Illegal Item At " + i  +"," + j + ": " + cell.name;
            let itemCheck = checkItem(cell,type,"Illegal Item At " + i  +"," + j + ": " + cell.name);
            if (itemCheck !== true) return "Illegal Item At " + i  +"," + j + ": " + itemCheck;
        }
    }

    return true;
}
function checkItem(item,type,returnPrefix) {

    let realItem = getRealItem(item.id,type);

    if (realItem.name !== item.name) return returnPrefix + ", Illegal Name: " + item.name;


    return true;
}
function checkGameMode(gameMode,accountID) {
    //if (gameMode.accountID !== accountID) return "accountID";
    if (simple.type(gameMode.name) !== "string") return "Incorrect Gamemode Name:" + gameMode.name;
    if (gameMode.name == "") return "Incorrect Gamemode Name2:" + gameMode.name;
    if (gameMode.name.length > 32) return "Incorrect Gamemode Name3:" + gameMode.name;
    if (profanity.check(gameMode.name)) return "Incorrect Gamemode Name4:" + gameMode.name;
    if (gameMode.howManyItemsCanPlayersUse < 0 || gameMode.howManyItemsCanPlayersUse > 10) return "howManyItemsCanPlayersUse";
    if (!["scroll","direct"].includes(gameMode.mode_usingItemType)) return "mode_usingItemType";
    if (!["vanish","remain","become food"].includes(gameMode.whenSnakesDie)) return "whenSnakesDie";
    if (![false,true].includes(gameMode.respawn)) return "respawn";
    if (![false,true].includes(gameMode.snakeCollision)) return "snakeCollision";
    if (![false,true].includes(gameMode.teamCollision)) return "teamCollision";
    gameMode.respawnGrowth = Number(gameMode.respawnGrowth);
    if (gameMode.respawnGrowth < 0 || gameMode.respawnGrowth > 100) return "Incorrect Gamemode Respawn Growth:" + gameMode.respawnGrowth;
    if (gameMode.respawnProtection < 0 || gameMode.respawnProtection > 15) return "Incorrect Gamemode Respawn Protection:" + gameMode.respawnProtection;
    gameMode.respawnTimer = Number(gameMode.respawnTimer);
    if (gameMode.respawnTimer < 0 || gameMode.respawnTimer > 60) return "respawnTimer";
    if (gameMode.setFoodRate < 0 || gameMode.setFoodRate > 100) return "Incorrect Gamemode Food Rate:" + gameMode.setFoodRate;

    //Need to check winning conditions

    //Check player has right items


    return true;
}
let basedGameMode = {
    name: "Untitled",
    howManyItemsCanPlayersUse: 2,
    mode_usingItemType: "scroll",
    itemAlterations: [],
    whenSnakesDie: "remain",
    respawn: false,
    respawnTimer: 5,
    respawnGrowth: 50, //Percent
    respawnProtection: 3, //Seconds
    respawnCount: -1,
    snakeCollision: true,
    teamCollision: true,
    setFoodRate: 50,
}
function respawnPlayer(lobby,player,growthPercentage,respawnTimer) {
    let length = Math.round((growthPercentage/100) * player.tail.length);

    //Delete Old Tail
    snakeMapRemoveAll(lobby,player);

    player.tail = [];
    player.items = [];
    for (let j = 0; j < lobby.gameMode.howManyItemsCanPlayersUse; j++) {
        player.items.push("empty");
    }
    player.canGrow = false;
    player.canMove = false;
    player.ghost = true;
    let team = player.team;
    player.status = ["status_" + team];
    player.bodyArmor = 1;
    player.isDead = false;
    player.justTeleported = false;
    player.moveQueue = [];
    player.moveTik = 0;
    player.moveSpeed = 6;
    player.turboDuration = 0;
    player.turboActive = false;
    player.respawnProtected = true;
    player.equiped = {
        head: false,
        body: false,
        tail: false,
    }
    player.invinsibleBodyEffect = 0;

    let onGoingRespawnProtectedCode = simple.rnd(1000);
    player.onGoingRespawnProtectedTimer = onGoingRespawnProtectedCode;
    setTimeout(function() {
        if (player.onGoingRespawnProtectedTimer === onGoingRespawnProtectedCode) {
            player.respawnProtected = false;
            player.invinsibleBodyEffect = false;
            rerenderSnake(lobby,player);
            updateClientPositions(lobby)
        }
    },(lobby.gameMode.respawnProtection+respawnTimer)*1000);

    io.to(player.accountID).emit("showPlayerRing",player.index,respawnTimer)
    spawn(lobby,player);
    growPlayer(player,length);
}
function snakeMapSetType(lobby,index,y,x,type) {
    let snakeMap = lobby.snakeMap;
    let group = snakeMap[y][x];
    if (type == "tail") {
        for (let i = 0; i < group.length; i++) {
            if (group[i].index == index) {
                lobby.snakeMap[y][x][i].type = type;
                if (type == "tail" && lobby.snakeMap[y][x][i].siblings.length > 1) lobby.snakeMap[y][x][i].siblings.shift();
                return;
            }
        }
    }
    if (type == "body") {
        for (let i = group.length-1; i > 0; i--) {
            if (group[i].index == index) {
                lobby.snakeMap[y][x][i].type = type;
                return;
            }
        }
    }
    
}

function snakeMapRemoveAll(lobby,player,setFood,setFoodRate = 100) {
    let snakeMap = lobby.snakeMap;
    let currentBoard = lobby.board;
    for (let i = 0; i < snakeMap.length; i++) {
        for (let j = 0; j < snakeMap[i].length; j++) {
            for (let k = snakeMap[i][j].length-1; k > 0; k--) {
                if (snakeMap[i][j][k].index == player.index) {
                    snakeMap[i][j].splice(k,1);
                    lobby.updateSnakeCells.push(lobby.snakeMap[i][j]);
                    if (setFood && !currentBoard.map[i][j].item && simple.rnd(100) < setFoodRate) {
                        let x = j;
                        let y = i;
                        runItemFunction(lobby,false,getItemById(lobby,34),"onSpawn",{x:x,y:y},{playAudio: false});
                        currentBoard.map[y][x].item = structuredClone(getItemById(lobby,34));
                        currentBoard.map[y][x].item.pos = {
                            x: x,
                            y: y,
                        }
                        lobby.updateCells.push({
                            x: x,
                            y: y,
                            item: currentBoard.map[y][x].item,
                        })
                    }
                }
            }
        }
    }
}
function snakeMapRemove(lobby,index,y,x) {
    let snakeMap = lobby.snakeMap;
    let group = snakeMap[y][x];
    for (let i = 0; i < group.length; i++) {
        if (group[i].index == index) {
            lobby.snakeMap[y][x].splice(i,1);
            return;
        }
    }
}
function snakeMapSetSibling(lobby,index,posY,posX,sibY,sibX) {
    let snakeMap = lobby.snakeMap;
    let group = snakeMap[posY][posX];
    for (let i = group.length-1; i > 0; i--) {
        if (group[i].index == index) {
            group[i].siblings = [{
                x: sibX,
                y: sibY,
            }];
            return;
        }
    }

}
function snakeMapAddSibling(lobby,index,posY,posX,sibY,sibX) {
    let snakeMap = lobby.snakeMap;
    let group = snakeMap[posY][posX];
    for (let i = group.length-1; i > 0; i--) {
        if (group[i].index == index) {
            group[i].siblings.push({
                x: sibX,
                y: sibY,
            })
            return;
        }
    }
}
function getPlayersList(playerIds) {
    let list = [];
    for (let i = 0; i < playerIds.length; i++) {
        onlineAccounts[playerIds[i]].player.accountName = onlineAccounts[playerIds[i]].username;
        list.push(onlineAccounts[playerIds[i]].player);
    }
    return list;
}
function server_movePlayers(lobby,socketID) {
    activePlayers = lobby.inGamePlayers; //Players that are only in the game, alive or dead. Players can be in the lobby, but not in the game.
    let currentBoard = lobby.board; //
    let currentGameMode = lobby.gameMode;
    if (lobby.gameEnd) return; //If Round Ended make sure to not move all the players.

    for (let i = 0; i < activePlayers.length; i++) {
        let player = activePlayers[i];
        if (player.isDead) continue;

        if (!player.ghost) {
            player.timeAlive[player.timeAlive.length-1] = Date.now() - player.timeCameAlive; //Setting their time alive stat
            checkWinningCondition(lobby,"Time Alive",player.timeAlive[player.timeAlive.length-1],player); //Check player time survived winning condition
        }
        
        //Check Players Move Tik, if it's too short skip player.
        if ((player.moveTik) < (player.moveSpeed/currentBoard.map[player.pos.y][player.pos.x].tile.changePlayerSpeed)) {   
            player.moveTik++;
            continue;
        }
        //Reset Move Tik
        player.moveTik = 0
        //Decrease Turbo If Required
        if (player.turboActive == true) {
            player.turboDuration --;
            if (player.turboDuration <= 0) {
                player.turboActive = false;
                removePlayerStatus(lobby,player,"turbo"); //I think this is outdated
                player.moveSpeed = 6;
            }
        }

        //If Snake Is Invincible tell client To render their snake.
        if (simple.type(player.invinsibleBodyEffect) == "number") {
            player.invinsibleBodyEffect++;
            rerenderSnake(lobby,player);
            if (player.invinsibleBodyEffect > 6) player.invinsibleBodyEffect = 0;
        }

        //Save the players old direction and location in case they die on this turn, so we can reset it back.
        let playerOldMoving = player.moving;
        let playerOldPos = { x: player.pos.x, y: player.pos.y };

        helper_movePlayer(lobby,player,currentBoard,activePlayers,currentGameMode);

        //Check Items and Tiles Under Player.
        if (!player.isDead) {
            //Test Item Underplayer
            let mapItem = currentBoard.map[player.pos.y][player.pos.x].item;
            if (mapItem) {
                runItemFunction(lobby,player,mapItem,"onCollision",{x: player.pos.x,y: player.pos.y},undefined,socketID);
                checkWinningCondition(lobby,"Touch Item X",mapItem,player);
            }
        }
        if (!player.isDead) {
            //Test Tile UnderPlayer
            let mapTile = currentBoard.map[player.pos.y][player.pos.x].tile;
            checkWinningCondition(lobby,"Touch Tile X",mapTile,player);
            if (mapTile.onCollision) runItemFunction(lobby,player,mapTile,"onCollision",{x: player.pos.x,y: player.pos.y});

            //Testing While On Tile Properties
            player.allowedToMove = mapTile?.whileOn?.playerCanMove || true; //If the tile prevents the player from being able to move. (I.E. Ice)
        }

        //If Player died then reset player and move to the next.
        if (player.isDead) {
            player.pos = playerOldPos;
            player.moving = playerOldMoving;
            continue;
        }

        //Growing/Moving Tail
        if (player.canMove) helper_manageTail(lobby,player,playerOldPos,currentBoard);

    }
}
function helper_manageTail(lobby,player,playerOldPos,currentBoard) {
    let playerX = playerOldPos.x;
    let playerY = playerOldPos.y;

    if (player.growTail > 0 && player.canGrow) {
        player.tail.unshift({
            x: playerX,
            y: playerY,
            direction: player.moving,
        });
        player.growTail--;
        for (let i = 0; i < lobby.board.playerGrow_status.length; i++) {
            let status = lobby.board.playerGrow_status[i];
            lobby.updateCells.push({
                x: status.x,
                y: status.y,
                //item: status.item, //Delete If You Notice Nothing Wrong In The Future
            })
        }
        if (player.tail.length > player.longestTail) player.longestTail = player.tail.length;
        if (lobby.condition_size.length > 0) {
            for (let cs = 0; cs < lobby.condition_size.length; cs++) {
                let condition = lobby.condition_size[cs];
                if (condition.pullTeamStats) {
                    let teamSnakeSize = 0;
                    let team = player.team;
                    for (let j = 0; j < activePlayers.length; j++) {
                        if (activePlayers[j].team === team) teamSnakeSize += (activePlayers[j].tail.length + 1);
                    }
                    if (teamSnakeSize >= condition.x) {
                        triggerWinningCondition(lobby,condition,player);
                    }
                } else {
                    if (player.tail.length + 1 >= condition.x) {
                        triggerWinningCondition(lobby,condition,player);
                    }
                }
            }
        }
    } else if (player.tail.length > 0) {
        player.tail.unshift({
            x: playerX,
            y: playerY,
            direction: player.moving,
        });
        lobby.updateSnakeCells.push(lobby.snakeMap[player.tail[player.tail.length-1].y][player.tail[player.tail.length-1].x]);
        

        let tail = player.tail[player.tail.length-1];
        if (currentBoard.map[tail.y][tail.x].item) {
            let mapItem = currentBoard.map[tail.y][tail.x].item;
            if (mapItem.offCollision) runItemFunction(lobby,player,mapItem,"offCollision",{x: tail.x,y: tail.y});
        }
        let mapTile = currentBoard.map[tail.y][tail.x].tile;
        if (mapTile.offCollision) runItemFunction(lobby,player,mapTile,"offCollision",{x: tail.x,y: tail.y});
        
        snakeMapRemove(lobby,player.index,tail.y,tail.x);
        player.tail.pop();
    } else {
        snakeMapRemove(lobby,player.index,playerY,playerX);
        if (currentBoard.map[playerY][playerX].item) {
            let mapItem = currentBoard.map[playerY][playerX].item;
            if (mapItem.offCollision) runItemFunction(lobby,player,mapItem,"offCollision",{x: playerX,y:playerY});
        }
        let mapTile = currentBoard.map[playerY][playerX].tile;
        if (mapTile.offCollision) runItemFunction(lobby,player,mapTile,"offCollision",{x: playerX,y:playerY});
    }
    if (player.tail.length > 0) {
        snakeMapSetType(lobby,player.index,player.tail[0].y,player.tail[0].x,"body");
        snakeMapSetType(lobby,player.index,player.tail[player.tail.length-1].y,player.tail[player.tail.length-1].x,"tail");
        lobby.updateSnakeCells.push(lobby.snakeMap[player.tail[player.tail.length-1].y][player.tail[player.tail.length-1].x]);
    }

    let sibling = player.tail.length > 0 ? [player.tail[0]] : [];
    lobby.snakeMap[player.pos.y][player.pos.x].push({
        index: player.index,
        siblings: sibling,
        type: "head",
        x: player.pos.x,
        y: player.pos.y,
    });
    if (sibling.length == 1) {
        snakeMapAddSibling(lobby,player.index,sibling[0].y,sibling[0].x,player.pos.y,player.pos.x)
    }
    if (player.tail.length == 1) snakeMapSetSibling(lobby,player.index,player.tail[0].y,player.tail[0].x,player.pos.y,player.pos.x);

    lobby.updateSnakeCells.push(lobby.snakeMap[playerY][playerX]);
    lobby.updateSnakeCells.push(lobby.snakeMap[player.pos.y][player.pos.x]);
}
function helper_movePlayer(lobby,player,currentBoard,activePlayers,currentGameMode) {
    //check the movement queue
    let oldPlayerMoving = player.moving;

    if (player.moveQueue.length != 0){
        if(player.moving == "left" && player.moveQueue[0] != "right" || 
            player.moving == "right" && player.moveQueue[0] != "left" || 
            player.moving == "up" && player.moveQueue[0] != "down" || 
            player.moving == "down" && player.moveQueue[0] != "up"){
            player.moving = player.moveQueue[0];
        }
        else if (player.moving === false)
        {
            player.moving = player.moveQueue[0];
        }

        player.moveQueue.shift();
    }

    let turned = false;
    if (player.moving === "left" && ["up","down"].includes(oldPlayerMoving)) turned = true;
    if (player.moving === "right" && ["up","down"].includes(oldPlayerMoving)) turned = true;
    if (player.moving === "up" && ["left","right"].includes(oldPlayerMoving)) turned = true;
    if (player.moving === "down" && ["left","right"].includes(oldPlayerMoving)) turned = true;
    if (turned) {
        addPlayerStatus("turns_made",1,player);
    }
    

    //Move Player and make sure he can't go back on himself
    if (player.canMove) {
        switch (player.moving) {
            case "left": player.pos.x--; break;
            case "right": player.pos.x++; break;
            case "up": player.pos.y--; break;
            case "down": player.pos.y++; break;
        }        
    }

    //Teleport Player If Needed
    if (simple.type(player.justTeleported) == "object") {
        //cameraQuickZoom = "tunnel"; -Need to add later, for Follow Snake View (FSV)
        player.pos.x = player.justTeleported.x;
        player.pos.y = player.justTeleported.y;
        player.justTeleported = true;
    }

    //Collision Testing
    //Test If Player Hits Edge
    const maxX = currentBoard.map[0].length - 1;
    const maxY = currentBoard.map.length - 1;

    if (player.pos.x > maxX || player.pos.x < 0 || player.pos.y > maxY || player.pos.y < 0) {
        if (player.pos.x > maxX) { cameraQuickZoom = "right"; player.pos.x = 0; }
        else if (player.pos.x < 0) { cameraQuickZoom = "left"; player.pos.x = maxX; }

        if (player.pos.y > maxY) { cameraQuickZoom = "bottom"; player.pos.y = 0; }
        else if (player.pos.y < 0) { cameraQuickZoom = "top"; player.pos.y = maxY; }
    }

    //Check for Player Collisions
    if (currentGameMode.snakeCollision && !player.ghost) {
        let occupiedPositions = new Map();
    
        // Step 1: Populate occupiedPositions with all players' tails & positions
        for (let a = 0; a < activePlayers.length; a++) {
            let checkedPlayer = activePlayers[a];
            if (checkedPlayer.ghost) continue;
            if (checkedPlayer.isDead && currentGameMode.whenSnakesDie !== "remain") continue;
            if (checkedPlayer.team === player.team && !currentGameMode.teamCollision && player.team !== "white") continue;
    
            for (let b = 0; b < checkedPlayer.tail.length; b++) {
                occupiedPositions.set(`${checkedPlayer.tail[b].x},${checkedPlayer.tail[b].y}`, checkedPlayer);
            }
            if (checkedPlayer.id !== player.id) {
                occupiedPositions.set(`${checkedPlayer.pos.x},${checkedPlayer.pos.y}`, checkedPlayer);
            }
        }
        // Step 2: Check if the player's new position exists in occupiedPositions
        if (occupiedPositions.has(`${player.pos.x},${player.pos.y}`)) {
            let killer = occupiedPositions.get(`${player.pos.x},${player.pos.y}`);
            deletePlayer(lobby, player, killer);
        }
    }
}


//Players Menu
function newPlayer(socketID,accountName,accountTag) {
    return {
        downKey: "s",
        upKey: "w",
        leftKey: "a",
        rightKey: "d",
        useItem1: "q",
        useItem2: "e",
        fireItem: "r",
        dropItem: "f",
        toggleTeamsKey: "Shift",
        toggleNamesKey: "Tab",
        chatNameColor: 0,
        type: "player",
        name: simple.rnd(playerNames1) + simple.rnd(playerNames2),
        moving: false,
        growTail: 0,
        isDead: false,
        stats: [],
        pos: {
            x: 0,
            y: 0, 
        },
        tail: [],
        moveQueue: [],
        prevMove: "start",
        id: Date.now(),
        whenInventoryIsFullInsertItemsAt: 0,
        moveTik: 0,
        moveSpeed: 6,
        selectingItem: 0,
        longestTail: 0,
        turboDuration: 0,
        turboActive: false,
        colorID: 0,
        equiped: {
            head: false,
            body: false,
            tail: false,
        },
        items: [],
        status: [],
        active: false, 
        accountID: socketID,
        accountName: accountName,
        accountTag: accountTag,
        team: "white",
        invinsibleBodyEffect: false,
        invincibleDuration: false,
        snakeSkin: "classic",
    }
}
function checkPlayer(player,socketID,allowedNameColors,allowedSnakeColors,account) {
    if (account.status == "Admin") return true;
    if (player.accountID !== socketID) return "socketId-1" + player.accountID + "," + socketID;
    if (!allowedNameColors.includes(player.chatNameColor)) return "Bad Name Color";
    if (!allowedSnakeColors.includes(player.colorID)) return "Bad Snake Color";

    return true;
}

function fixBoard(oldBoard) {
    if (simple.type(oldBoard.originalMap[0][0]) !== "array") return oldBoard;

    let board = structuredClone(oldBoard);
    board.map = [];

    board.originalMap = decompressMap(board.originalMap);

    return board;
}
function decompressMap(map) {
    let _newMap = [];
    for (let i = 0; i < map.length; i++) {
        let row = [];

        let _tiles = [];
        let _items = [];

        for (let j = 0; j < map[i][0].length; j++) {
            for (let k = 0; k < map[i][0][j][1]; k++) {
                _tiles.push(map[i][0][j][0]);
            }
        }
        for (let j = 0; j < map[i][1].length; j++) {
            for (let k = 0; k < map[i][1][j][1]; k++) {
                _items.push(map[i][1][j][0]);
            }
        }

        for (let j = 0; j < _tiles.length; j++) {
            row.push({
                mouseOver: false,
                tile: getByID(_tiles[j],tiles),
                item: _items[j] === 0 ? false : getByID(_items[j],items),
            })
        }

        _newMap.push(row);
    }
    return _newMap;
}
function getByID(id,type) {
    for (let i = 0; i < type.length; i++) {
        if (type[i].id === id) {
            return type[i];
        }
    }
}


//Objective Logic
let objectives = {
    one: [],
    two: [],
    three: [],
}

function newObjective(cat,obj) {
    obj.id = objectives[cat].length;
    obj.completed = false;
    obj.star = cat;
    objectives[cat].push(obj);
}
newObjective("one",{
    display_text: "Eat 15 Mice",
    objective: "eat_item_1",
    amt: 15,
})
newObjective("one",{
    display_text: "Travel 2000 Tiles",
    objective: "total_tiles_traveled",
    amt: 2000,
})
newObjective("one",{
    display_text: "Use Turbo 5 Times",
    objective: "use_item_3",
    amt: 5,
})
newObjective("one",{
    display_text: "Eat Bunch O' Mice 10 Times",
    objective: "eat_item_2",
    amt: 10,
})
newObjective("one",{
    display_text: "Play 5 Games",
    objective: "games_played",
    amt: 5,
})


newObjective("two",{
    display_text: "Destroy 15 Rocks",
    objective: "destroy_item_4",
    amt: 15,
})
newObjective("two",{
    display_text: "Grow 50 In 1 Game",
    objective: "grow",
    amt: 50,
    oneGame: true,
})
newObjective("two",{
    display_text: "Paint 50 Tiles",
    objective: "paint_tile_12",
    amt: 50,
})
newObjective("two",{
    display_text: "Teleport 50 Times",
    objective: "teleport",
    amt: 50,
})
newObjective("two",{
    display_text: "Eat 200 Dead Snake Cells",
    objective: "eat_item_34",
    amt: 200,
})


newObjective("three",{
    display_text: "Capture The Flag 50 Times",
    objective: "activate_item_26",
    amt: 50,
})
newObjective("three",{
    display_text: "Play 100 Games",
    objective: "games_played",
    amt: 100,
})
newObjective("three",{
    display_text: "Collect 30 Coins",
    objective: "collect_item_35",
    amt: 30,
})

let rewards = {
    one: {
        
    },
}
function shouldResetChallenges(userStartDate) {
  const userDate = new Date(userStartDate);
  const mostRecentReset = getMostRecentResetTime();

  return userDate < mostRecentReset;
}
function getMostRecentResetTime() {
  const now = new Date();

  // Start from current UTC date/time
  const reset = new Date(now);

  // Force to UTC (you can change to your preferred TZ offset)
  const day = reset.getUTCDay(); // 0 = Sun, 1 = Mon, ...
  const diffToMonday = (day + 6) % 7; // days since last Monday
  reset.setUTCDate(reset.getUTCDate() - diffToMonday);
  reset.setUTCHours(3, 0, 0, 0); // Monday 3 AM UTC

  // If we haven't hit Monday 3 AM yet this week, go back one week
  if (now < reset) {
    reset.setUTCDate(reset.getUTCDate() - 7);
  }

  return reset;
}

function gatherWeeklyChallenges(old) {
    let obj = {
        challenges: [],
        startDate: Date.now(),
    };

    let firstChallengeChosen = [];
    for (let i = 0; i < 2; i++) {
        let findingFirstChallenge = false;
        while (!findingFirstChallenge) {
            challenge = simple.rnd(objectives.one);
            if (old) if (challenge.id === old[0].id || challenge.id === old[1].id) continue;
            if (firstChallengeChosen.length > 0) if (firstChallengeChosen[0].id === challenge.id) continue;
            findingFirstChallenge = challenge;
        }
        firstChallengeChosen.push(findingFirstChallenge);
        obj.challenges.push(findingFirstChallenge);
    }
    
    let secondChallengesChosen = [];
    for (let i = 0; i < 2; i++) {
        let findingSecondChallenge = false;
        while (!findingSecondChallenge) {
            challenge = simple.rnd(objectives.two);
            if (old) if (challenge.id === old[2].id || challenge.id === old[3].id) continue;
            if (secondChallengesChosen.length > 0) if (secondChallengesChosen[0].id === challenge.id) continue;
            findingSecondChallenge = challenge;
        }
        secondChallengesChosen.push(findingSecondChallenge);
        obj.challenges.push(findingSecondChallenge);
    }

    let findingThirdChallenge = false;
    while (!findingThirdChallenge) {
        challenge = simple.rnd(objectives.three);
        if (old) if (challenge.id === old[4].id) continue;
        findingThirdChallenge = challenge;
    }
    obj.challenges.push(findingThirdChallenge);

    return obj;
}




function addPlayerStatus(stat,amt,player) {
    for (let i = 0; i < player.stats.length; i++) {
        if (player.stats[i].stat == stat) {
            player.stats[i].amt += amt;
            return;
        } 
    }
    player.stats.push({
        stat: stat,
        amt: amt
    })
}
function updateServerStats(lobby) {

    for (let i = 0; i < lobby.inGamePlayers.length; i++) {
        let player = lobby.inGamePlayers[i];
        let account = onlineAccounts[player.accountID];
        let tag = Number(account.tag);

        let total_deaths = 0;
        let total_tiles_traveled = 0;

        for (let j = 0; j < player.stats.length; j++) {
            /*
                player.stat = {
                    stat: string,
                    amt: number
                }
            */
           let stat = player.stats[j];

            if (stat.stat.startsWith("died_by")) {
                total_deaths += stat.amt;
            }
            if (stat.stat.startsWith("traverse")) {
                total_tiles_traveled += stat.amt;
            }

            const query = `
                INSERT INTO stats (tag, stat_name, stat_value)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE stat_value = stat_value + VALUES(stat_value)
            `;
            db.query(query,[tag,stat.stat,stat.amt],(err) => {
                if (err) throw err;
            })

        }

        player.stats = [];

        // Insert or update total_deaths stat
        if (total_deaths > 0) {
            const totalQuery = `
                INSERT INTO stats (tag, stat_name, stat_value)
                VALUES (?, 'total_deaths', ?)
                ON DUPLICATE KEY UPDATE stat_value = stat_value + VALUES(stat_value)
            `;
            db.query(totalQuery, [tag, total_deaths], (err) => {
                if (err) throw err;
            });
        }
        if (total_tiles_traveled > 0) {
            const totalQuery = `
                INSERT INTO stats (tag, stat_name, stat_value)
                VALUES (?, 'total_tiles_traveled', ?)
                ON DUPLICATE KEY UPDATE stat_value = stat_value + VALUES(stat_value)
            `;
            db.query(totalQuery, [tag, total_tiles_traveled], (err) => {
                if (err) throw err;
            });
        }


        sendStatsIO(tag,player.accountID)
        
    }   
}
function sendStatsIO(tag,emitTo) {
    const query = `
        SELECT stat_name, stat_value
        FROM stats
        WHERE tag = ?
    `;

    db.query(query, [tag], (err, results) => {
        if (err) {
            console.error("Error fetching stats:", err);
            return;
        }

        // Send the results back to the client
        io.to(emitTo).emit("returningUserStats", results,true);
    });
}