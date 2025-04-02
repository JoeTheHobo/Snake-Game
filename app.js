const simple = require("./server_simple.js");
const {presetGameModes} = require("./presetGameModes.js");
const {items} = require("./server_items.js");
const {tiles} = require("./server_tiles.js");
const zlib = require('zlib');
const express = require('express');
const app = express();
const pako = require('pako');
const profanity = require("./profanity.js");

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

  //socke.io start up
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
        console.log("A user disconnected due to " + reason);
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
        db.query(query,[null, onlineAccounts[socket.id].tag],(err) => {if (err) console.log(7543,err);});
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
        if (onlineAccounts[socket.id].status !== "Guest") return;
        let account = onlineAccounts[socket.id];
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
            const countQuery = "SELECT COUNT(*) AS total FROM credentials";
            db.query(countQuery, async(err,results) => {
                if (err) {
                    io.to(socket.id).emit("signup_error", "An error occurred, please try again later.");
                    return;
                }

                let tag = results[0].total + 1;

                const hashedPassword = await bcrypt.hash(password, 10);

                const query = 'INSERT INTO credentials (username, tag, password, email) VALUES (?, ?, ?, ?)';
        
                db.query(query, [username, tag, hashedPassword, email], (err, results) => {
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
                    const verificationToken = crypto.randomBytes(20).toString('hex');
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
    
                    let account = onlineAccounts[socket.id];
                    //Add To Inventory Database
                    const invQuery = "INSERT INTO inventory (tag, board_limit, coins, battle_pass_points, server_snake, name_color, challenge_limit, music_volume, sfx_volume, status, date_created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    db.query(invQuery, [tag,account.boardLimit,account.coins,account.battlePassPoints, JSON.stringify(account.serverSnake), account.chatNameColor, account.challengeLimit,account.musicVolume,account.sfxVolume, "Account", account.dateCreated], (err,results) => {
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
    socket.on("getPersonalBoards",() => {
        let account = onlineAccounts[socket.id];
        let lobby = lobbies[account.lobby];
        if (!lobby) return;
        if (lobby.hostID !== socket.id) return;

        let query = `SELECT board, id FROM boards WHERE tag = ${account.tag}`;
        db.query(query,(err,results) => {
            if (err) {
                console.log(735,err);
                return;
            }

            decompressBoardsFromDB(results,(dbBoards) => {
                io.to(socket.id).emit("serverSending_publishedBoards",dbBoards);
            });

        })


    })
    socket.on("getPublishedBoards",() => {
        let account = onlineAccounts[socket.id];
        let lobby = lobbies[account.lobby];
        if (!lobby) return;
        if (lobby.hostID !== socket.id) return;

        let query = "SELECT board, id FROM boards WHERE published = 1";
        db.query(query,(err,results) => {
            if (err) {
                console.log(73,err);
                return;
            }

            decompressBoardsFromDB(results,(dbBoards) => {
                io.to(socket.id).emit("serverSending_publishedBoards",dbBoards);
            });
        })

    })
    socket.on("db_getAccountBoardStats",() => {
        let account = onlineAccounts[socket.id];
        if (!account.loggedIn) return;
        let query = "SELECT board, id, published FROM boards WHERE tag = ?";
        db.query(query,[Number(account.tag)],(err,results) => {
            if (err) {
                console.log(73,err);
                return;
            }

            decompressBoardsFromDB(results,(dbBoards) => {
                io.to(socket.id).emit("serverSending_boardStats",dbBoards);
            });
        })
    })
    socket.on("saveBoard",(board) => {
        let account = onlineAccounts[socket.id];
        if (!account.loggedIn) return;

        board = fixBoard(JSON.parse(pako.inflate(board, { to: 'string' })));
        //Check Board TO BE ADDED
        if (!account.loggedIn) return;
        if (Number(board.tag) !== Number(account.tag)) return;

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
    socket.on("depublishBoard",(boardID) => {
        try {
            let account = onlineAccounts[socket.id];
            if (!account.loggedIn) return;
            
            let query = "UPDATE boards SET published = 0 WHERE id = ? AND tag = ?";
            db.query(query,[boardID,Number(account.tag)],(err,results) => {
                if (err) {
                    console.log(8324,err);
                    return;
                }

                let query = "SELECT board, id, published FROM boards WHERE tag = ?";
                db.query(query,[Number(account.tag)],(err,results) => {
                    if (err) {
                        console.log(73,err);
                        return;
                    }
        
                    decompressBoardsFromDB(results,(dbBoards) => {
                        io.to(socket.id).emit("serverSending_boardStats",dbBoards);
                    });
                })
            })
        } catch {
            console.log("Publish error");
        }
    })
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

                if (total.length >= account.publishedBoardLimit) return;

                let query = "UPDATE boards SET published = 1 WHERE id = ? AND tag = ?";
                db.query(query,[boardID,Number(account.tag)],(err,results) => {
                    if (err) {
                        console.log(8324,err);
                        return;
                    }
    
                    let query = "SELECT board, id, published FROM boards WHERE tag = ?";
                    db.query(query,[Number(account.tag)],(err,results) => {
                        if (err) {
                            console.log(73,err);
                            return;
                        }
            
                        decompressBoardsFromDB(results,(dbBoards) => {
                            io.to(socket.id).emit("serverSending_boardStats",dbBoards);
                        });
                    })
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

                io.to(socket.id).emit("sendingZippedBoard",compressed.toString("base64"),board.name)
            })
        } catch {
            console.log("zipping error");
        }
    });
    socket.on("deleteBoard",(boardID,sentFrom) => {
        let account = onlineAccounts[socket.id];
        if (!account.loggedIn) return;

        if (account.loggedIn) {
            let query = "DELETE FROM boards WHERE tag = ? AND id = ?";
            db.query(query,[Number(account.tag),boardID],(err) => {
                if (err) {
                    console.log(7563,err)
                    return;
                }

                let query = "SELECT board, id, published FROM boards WHERE tag = ?";
                db.query(query,[Number(account.tag)],(err,results) => {
                    if (err) {
                        console.log(73,err);
                        return;
                    }
        
                    decompressBoardsFromDB(results,(dbBoards) => {
                        io.to(socket.id).emit("serverSending_boardStats",dbBoards);
                    });
                })


            })
        }

    })
    
    socket.on("saveBoardToIndex",(board,index,sentFrom) => {
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
                    console.log(11,err)
                    return;
                }
                account.boards = compressed;
            });
        })

    });
    socket.on("createNewBoard",(boardName,width,height,sentFrom) => {
        let account = onlineAccounts[socket.id];
        if (!account.loggedIn) return;
        boardName = boardName.toString();
        if (boardName.length > 30) boardName = "Untitled";
        if (boardName == "") boardName = "Untitled";
        boardName = profanity.clean(boardName);

        width = 50;//Number(width);
        height = 30;//Number(height);
        let board = {
            name: boardName,
            tag: Number(account.tag),
            width: width,
            height: height,
            minPlayers: 1,
            maxPlayers: 8,
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
                    id: "Player Zone: #0000",
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

                    active: true,
                    activateWhenBoardStatus: false,
                    deactivateWhenBoardStatus: false,
                    activateWhenTimePassed: false, //Seconds
                    deactivateWhenTimePassed: false, //Seconds
                }],
                items: [{
                    id: "Item Zone: #0000",
                    pos1: {
                        x: 0,
                        y: 0,
                    },
                    pos2: {
                        x: width-1,
                        y: height-1,
                    },
                    itemsThatCantSpawnHere: [],

                    active: true,
                    activateWhenBoardStatus: false,
                    deactivateWhenBoardStatus: false,
                    activateWhenTimePassed: false, //Seconds
                    deactivateWhenTimePassed: false, //Seconds
                }],
            },
        };

        io.to(socket.id).emit("updatePlayersBoards",board,sentFrom)
        
        if (account.loggedIn) {
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
        }
    })
    socket.on("newLobby", (lobby) =>{
        if (!lobby) return;

        let boardQuery = "SELECT board FROM boards WHERE published = 1";
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

        if (lobby.isInGame) {
            for (let i = 0; i < lobby.inGamePlayers.length; i++) {
                if (lobby.inGamePlayers[i].accountID === socket.id) {
                    deletePlayer(lobby,lobby.inGamePlayers[i],false,false,true);
                }
            }
        }

        onlineAccounts[socket.id].lobby = false;
        socket.leave(lobby.id);
        socket.join("menuScreen");

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

        let account;
        for (let i = 0; i < lobby.players.length; i++) {
            if (lobby.players[i] == socket.id) {
                account = onlineAccounts[lobby.players[i]].username;
            }
        }

        lobby.chats.push({
            message: message,
            account: account,
            color: onlineAccounts[socket.id].chatNameColor,
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

            board = results[0];

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

        lobby.gameEnd = true;
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
        if (lobby.hostID !== socket.id) {
            onlineAccounts[socket.id].kickPlayer = true;
            io.to(socket.id).emit("kickPlayer","Caught Hacking [Code: 001]");
            return;
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

            player.pos = {
                x: false,
                y: false,
            }
            player.team = "white";
            player.invinsibleBodyEffect = false;

            player.timeAlive = [0];
            player.timeCameAlive = false;
            player.allowedToMove = true;
        }

        

        getLocations(lobby);
        fixBoardDifferences(lobby.board.map,lobby.board.itemDifferences,"item");
        fixBoardDifferences(lobby.board.map,lobby.board.tileDifferences,"tile");
        updateAllCells(lobby);


        for (let i = 0; i < lobby.players.length; i++) {
            let player = onlineAccounts[lobby.players[i]].player;
            spawn(lobby,player,true);
        }

        for (let i = 0; i < lobby.items.length; i++) {
            let item = lobby.items[i];
            for (let j = 0; j < Number(item.onStartSpawn); j++) {
                spawn(lobby,item.id,true);
            }
        }


        lobby.gameEnd = false;
        lobby.updatePositionTimeStamp = Date.now();
        lobby.gameTimeStart = Date.now();
        lobby.boardStatusCount = 0;
        lobby.playSounds = [];
        lobby.canvasFilters = [];
        lobby.boardStatus = [];
        lobby.lobby_gameLoop_start = false;

        io.to(lobby.id).emit("startingGame", lobby,onlineAccounts[socket.id].player);
        
        updateClientPositions(lobby)
        lobby.checkingSpawnTimers = true;
        lobby.gameStartedAt = false;
        lobby.gameLoop = function() {
            if (this.gameStartedAt === false) {
                startGameLoop(lobby);
            }
            lobby.lobby_gameLoop_start = Date.now();
            server_movePlayers(this,socket.id)

            if (this.checkingSpawnTimers) checkSpawnStatusTimers(this);

            updateClientPositions(this);

            this.updatePositionTimeStamp = Date.now();
            this.updateSnakeCells = [];
            this.updateCells = [];
            this.updateTiles = [];
            this.playSounds = [];
            this.canvasFilters = [];
            
            //Check If Anyone Got The Crown
            let winningPlayer = false;
            for (let i = 0; i < this.inGamePlayers.length; i++) {
                if (this.inGamePlayers[i].winGame) {
                    winningPlayer = this.inGamePlayers[i];
                    break;
                }
            }

            if (!this.gameEnd && !winningPlayer) {
                setTimeout(() => this.gameLoop(), 16);
            } else {
                this.isActiveGame = false;
                this.isInGame = false;

                //Kill Any Non Dead Snakes
                for (let i = 0; i < this.inGamePlayers.length; i++) {
                    if (!this.inGamePlayers[i].isDead) {
                        deletePlayer(this,this.inGamePlayers[i],false,false,true);
                    }
                }

                let longestTail = this.inGamePlayers[0].longestTail;
                let timeSurvived = Math.max(...this.inGamePlayers[0].timeAlive);
                let mostKills = this.inGamePlayers[0].playerKills;
                let longestTailPlayer = this.inGamePlayers[0];
                let timeSurvivedPlayer = this.inGamePlayers[0];
                let mostKillsPlayer = this.inGamePlayers[0];
                for (let i = 1; i < this.inGamePlayers.length; i++) {
                    if (this.inGamePlayers[i].longestTail > longestTail) {
                        longestTail = this.inGamePlayers[i].longestTail;
                        longestTailPlayer = this.inGamePlayers[i];
                    }
                    if (Math.max(...this.inGamePlayers[i].timeAlive) > timeSurvived) {
                        timeSurvived = Math.max(this.inGamePlayers[i].timeAlive);
                        timeSurvivedPlayer = this.inGamePlayers[i];
                    }
                    if (this.inGamePlayers[i].playerKills > mostKills) {
                        mostKills = this.inGamePlayers[i].mostKills;
                        mostKillsPlayer = this.inGamePlayers[i];
                    }
                }

                let totalSeconds = Math.floor(timeSurvived / 1000);
                let minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
                let seconds = (totalSeconds % 60).toString().padStart(2, '0');

                let obj = {
                    lobby: this,
                    longestTail: longestTail,
                    timeSurvived: timeSurvived,
                    longestTailPlayer: longestTailPlayer,
                    timeSurvivedPlayer: timeSurvivedPlayer,
                    mostKillsPlayer: mostKillsPlayer,
                    minutes: minutes,
                    seconds: seconds,
                    winningPlayer: winningPlayer,
                };
                io.to(lobby.id).emit("endGame",obj)

                
                updateLobbies();
                
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
    socket.on("createNewPlayer",() => {
        onlineAccounts[socket.id].players.push(newPlayer(socket.id,onlineAccounts[socket.id].username),onlineAccounts[socket.id].tag);
        io.emit("playersBeenMade",onlineAccounts[socket.id].players);
    })
    socket.on("localSendingPlayers",(players,serverSnake,updateLobby = false) => {
        if (!players) {
            console.log("Tried Sending: " + players)
            return;
        }
        let checksOut = true;
        for (let i = 0; i < players.length; i++) {
            if (checkPlayer(players[i],socket.id) !== true) checksOut = checkPlayer(players[i],socket.id);
        }
        if (checkPlayer(serverSnake,socket.id) !== true) checksOut = checkPlayer(serverSnake,socket.id);
        if (checksOut === true) {
            onlineAccounts[socket.id].players = players;
            onlineAccounts[socket.id].serverSnake = serverSnake;
            if (updateLobby) {
                let account = onlineAccounts[socket.id];
                let lobby = lobbies[account.lobby];
                if (!account) return;
                if (!lobby) return;

                onlineAccounts[socket.id].player = structuredClone(onlineAccounts[socket.id].serverSnake);
                lobby.activePlayers = getPlayersList(lobby.players);

                io.to(lobby.id).emit("updateLobbyPage", lobby);
                
            }

            if (onlineAccounts[socket.id].loggedIn) {
                onlineAccounts[socket.id].serverSnake.tag = Number(onlineAccounts[socket.id].tag);
                let query = "UPDATE inventory SET server_snake = ? WHERE tag = ?";
                db.query(query,[JSON.stringify(onlineAccounts[socket.id].serverSnake),Number(onlineAccounts[socket.id].tag)],(err) => {
                    if (err) console.log(err);
                })
            }
        } else {
            onlineAccounts[socket.id].kickPlayer = true;
            io.to(socket.id).emit("kickPlayer","Hacked Players: " + checksOut + " [Code: 7834]");
        }
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
function spawn(lobby,thingToSpawn,gameStart = false) {
    if (simple.type(thingToSpawn) == "number") spawnItem(lobby,thingToSpawn,gameStart)
    if (thingToSpawn?.type == "player") spawnPlayer(lobby,thingToSpawn,gameStart);
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
        return;
    }

    //Check That Item Can Spawn
    if (item.spawnLimit !== false && item.spawnLimit === 0) {
        console.log("Item Spawned To Much");
        return;
    } 

    //Spawn Item
    for (let i = 0; i < item.spawnCount; i++) {
        let spot = findEmptySpotInZones(lobby,lobby.spawnZones.items,"item",item);
        if (!spot) {
            console.log("No Available Spots For Items")
            return;
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
}
function spawnPlayer(lobby,player,gameStart = false) {
    let spot = findEmptySpotInZones(lobby,lobby.spawnZones.players,"player",gameStart,player);
    if (!spot) {
        console.log("No Available Spots For Player")
        setTimeout(function() {
            spawnPlayer(lobby,player,gameStart)
        },1000);
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
}
function findEmptySpotInZones(lobby,zones,type,extra,extra2) {
    let shuffledZones = simple.shuffle(zones);

    for (let i = 0; i < shuffledZones.length; i++) {
        let z = shuffledZones[i];
        if (!z.active) continue;

        if (type == "item") if (z.itemsThatCantSpawnHere.includes(extra.id)) continue;
        if (type == "player") {
            let gameStart = extra;
            let player = extra2;
            if (!gameStart) {
                if (player.team !== z.team) continue;
                if (!z.respawnHere) continue;
            }
            if (gameStart) {
                if (z.spawnCap !== false && z.spawnCap < 1) continue;
                if (z.spawnCap !== false && z.spawnCap > 0) z.spawnCap--;
            }
        }

        let spot = findEmptySpotInZone(z,lobby)

        if (!spot) continue;
        
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
    let returnItem = runItemFunction(lobby,player,player.items[player.selectingItem],"onActivate",player.pos);
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
function deletePlayer(lobby,player,playerWhoKilled,damage = 0,instaKill = false){
    let currentGameMode = lobby.gameMode;
    let activePlayers = lobby.inGamePlayers;

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
        if (playerWhoKilled) if (playerWhoKilled.name !== player.name) playerWhoKilled.playerKills++;

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

        if (!currentGameMode.respawn) {
            let playersDead = 0;
            for (let i = 0; i < activePlayers.length; i++) {
                if (activePlayers[i].isDead) playersDead++;
            }
            if (playersDead == activePlayers.length) {
                lobby.gameEnd = true;
            }
        } else {
            setTimeout(function() {
                respawnPlayer(lobby,player,currentGameMode.respawnGrowth);
            },currentGameMode.respawnTimer * 1000);
        }
        return;
    }
}
function growPlayer(player,grow) {
    player.growTail += grow;
    
}
function runItemFunction(lobby,player,item,type,itemPos,settings = {playAudio: true},socketID) {
    let returnItem = "empty";
    let currentBoard = lobby.board;
    let currentGameMode = lobby.gameMode;
    if (!type) return returnItem;

    let collision;
    if (simple.type(type) == "object") collision = type; 
    else {
        if (item[type])
            collision = item[type];
    }

    if (!collision) return returnItem;

    if (item.switchStatus == false || item.switchStatus == undefined) {
        item.switchStatus = true;
    } else {
        item.switchStatus = false;
    }

    if (collision.forcePlayerMove && player) {
        let direction = collision.forcePlayerMove;
        player.moveQueue = [direction];
    }
    if (collision.setPlayerProperty && player) {
        let path = collision.setPlayerProperty[0];
        let value = collision.setPlayerProperty[1];
        setNestedValue(player,path,value);
    }
    if (collision.switchBaseImgTag) {
        item.baseImgTags[collision.switchBaseImgTag.index] = item.baseImgTags[collision.switchBaseImgTag.index] == collision.switchBaseImgTag.switch[0] ? collision.switchBaseImgTag.switch[1] : collision.switchBaseImgTag.switch[0];
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
    if (collision.switchBoardStatus && player) {
        if (item.switchStatus === true) {
            addBoardStatus(lobby,collision.switchBoardStatus,player);
        } else {
            removeBoardStatus(lobby,collision.switchBoardStatus,player);
        }
    }
    if (collision.addBoardStatus && player) {
        addBoardStatus(lobby,collision.addBoardStatus,player);
    }
    if (collision.removeBoardStatus && player) {
        removeBoardStatus(lobby,collision.removeBoardStatus,player);
    }
    if (collision.setBoardStatus && player) {
        let status = collision.setBoardStatus;
        if (collision.setBoardStatus == "*P") status = player.team;
        if (item.sendingBoardStatus === status) return;

        if (item.sendingBoardStatus !== false) {
            removeBoardStatus(lobby,item.sendingBoardStatus,player);
        }

        item.sendingBoardStatus = status;
        addBoardStatus(lobby,status,player);
    }
    if (collision.equip && player) {
        let oldItem = structuredClone(player.equiped[collision.equip]);
        player.equiped[collision.equip] = structuredClone(item);
        if (oldItem) {
            returnItem = oldItem;
        }
    }
    if (collision.setBaseImgTag) {
        let value = collision.setBaseImgTag.value;
        if (value == "*P" && player) value = player.team;
        item.baseImgTags[collision.setBaseImgTag.index] = value;
        
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
    if (collision.growPlayer > 0 && player) {
        growPlayer(player,collision.growPlayer);
    }
    if (collision.spawn) {
        for (let i = 0; i < collision.spawn.length; i++) {
            for (let j = 0; j < collision.spawn[i].count; j++) {
                spawn(lobby,collision.spawn[i].id);
            }
        }
    }
    if (collision.giveTurbo && player) {
        player.turboActive = true;
        player.turboDuration = Number(collision.giveTurbo.duration);
        player.moveSpeed = Number(collision.giveTurbo.moveSpeed);
    }
    if (collision.addStatus && player) {
        for (let i = 0; i < collision.addStatus.length; i++) {
            addPlayerStatus(lobby,player,collision.addStatus[i])
        }
    }
    if (collision.removeStatus && player) {
        for (let i = 0; i < collision.removeStatus.length; i++) {
            removePlayerStatus(lobby,player,collision.removeStatus[i])
        }
    }
    if (collision.winGame === true && player) {
        player.winGame = true;
    }
    if (collision.canvasFilter) {
        lobby.canvasFilters.push(collision.canvasFilter);
    }
    if (collision.playSound && item.playSounds && settings?.playAudio && lobby.playSounds) {
        let type = "sfx";
        if (collision.playSound[2]) type = collision.playSound[2];
        lobby.playSounds.push({
            src: "sounds/" + item.soundFolder + "/" + item.soundFolder + "_" + collision.playSound[0] + "_" + simple.rnd(collision.playSound[1]) + ".mp3",
            type: type,
        });
    }
    if (collision.killPlayer && player) {
        deletePlayer(lobby,player,false,false,true);
    }
    if (collision.spawnRandomItem) {
        specialItemManager(lobby);
    }
    if (collision.deleteMe && player) {
        if (item.type == "item") {
            currentBoard.map[player.pos.y][player.pos.x].item = false;
            lobby.updateCells.push({
                x: player.pos.x,
                y: player.pos.y,
                item: false,
            })
        }
    }
    if (collision.pickUp && player) {
        for (let k = 0; k < currentGameMode.howManyItemsCanPlayersUse; k++) {
            if (player.items[k] == "empty") {
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
    }
    if (collision.dealDamage && player) {
        deletePlayer(lobby,player,false,collision.dealDamage);
    }
    if (collision.removePlayerItem && player) {
        for (let j = 0; j < collision.removePlayerItem.length; j++) {
            let count = collision.removePlayerItem[j].count;
            for (let k = 0; k < currentGameMode.howManyItemsCanPlayersUse; k++) {
                if (count == 0) continue;
                let playerSlot = player.items[k];
                if (playerSlot == "empty") continue;
                if (playerSlot.name == collision.removePlayerItem[j].name) {
                    player.items[k] = "empty";
                    count--;
                }
            }
        }
        
    }
    if (collision.teleport && player) {
        if (!player.justTeleported) {
            findingPortal: for (let z = 0; z < currentBoard.map.length; z++) {
                for (let h = 0; h < currentBoard.map[z].length; h++) {
                    if (!currentBoard.map[z][h].item) continue;
                    if (player.pos.x == h && player.pos.y == z) continue;
                    if (currentBoard.map[z][h].item.id === collision.teleport) {
                        player.justTeleported = {
                            x: h,
                            y: z,
                        }
                        break findingPortal;
                    } 
                }
            }
        } else {
            player.justTeleported = false;
        }
    }
    if (collision.checkStatus && player) {
        let check = collision.checkStatus.check;
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
        if (passedCheck) runItemFunction(lobby,player,item,collision.checkStatus.pass,itemPos,settings);
        else runItemFunction(lobby,player,item,collision.checkStatus.fail,itemPos,settings);
    }

    return returnItem;
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
function decompressBoardsFromDB(dbBoards,func, index = 0,sendBackBoards = []) {
    if (index === dbBoards.length) {
        func(sendBackBoards);
        return;
    }

    decompressObject(dbBoards[index].board,(err,result) => {
        if (err) {
            console.log(8321,err);
            return;
        }

        let obj = dbBoards[index];
        obj.board = result;

        sendBackBoards.push(obj);

        decompressBoardsFromDB(dbBoards,func,index+1,sendBackBoards);

    })
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
        boardLimit: 10,
        canChangePassword: false,

        player: false, //For Lobbies
        serverSnake: newPlayer(socketID,username,tag),
        lobby: false,
        username: username,
        tag: tag,
        chatNameColor: "white",
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


        allowedItemIds: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50],
        allowedTileIds: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50],
        allowedItemSkinPacks: [0],
        allowedSnakeColors: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
    }
    let account = onlineAccounts[socketID];

    let sendSnakeColors = [];
    for (let i = 0; i < account.allowedSnakeColors.length; i++) {
        sendSnakeColors.push(getColorById(account.allowedSnakeColors[i]));
    }
    account.snakeColors = sendSnakeColors;
    
    let accessedBattlePasses = {};
    for (let i = 0; i < account.battlePasses.length; i++) {
        accessedBattlePasses[account.battlePasses[i].name] = allBattlePasses[account.battlePasses[i].name];
    }
    let randomColor = getColorById(simple.rnd(account.allowedSnakeColors)); 
    account.serverSnake.hue = randomColor.hue;
    account.serverSnake.saturation = randomColor.saturation;
    account.serverSnake.brightness = randomColor.brightness;


    updateLobbies();
    let sendItems = full ? pako.deflate(JSON.stringify(items), { to: 'string' }) : undefined;
    let sendTiles = full ? pako.deflate(JSON.stringify(tiles), { to: 'string' }) : undefined;

    io.to(socketID).emit('setPlayer', socketID, account,accessedBattlePasses,sendItems,full ? basedGameMode : undefined,full ? presetGameModes : undefined,full ? backgrounds : undefined,sendTiles);
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
    account.chatNameColor = dbObj.inventory.name_color;
    account.challengeLimit = dbObj.inventory.challenge_limit;
    account.musicVolume = dbObj.inventory.music_volume;
    account.sfxVolume = dbObj.inventory.sfx_volume;
    account.publishedBoardLimit = dbObj.inventory.published_board_limit;

    //allowed
    account.allowedItemIds = dbObj.allowed.items;
    account.allowedTileIds = dbObj.allowed.tiles;
    account.allowedItemSkinPacks = dbObj.allowed.skinPacks;
    account.allowedSnakeColors = dbObj.allowed.snakeColors;

    account.questsAccepted = [];
    account.battlePasses = [{
        name: "beta",
        unlocked: [-1],
    }];

    
    let sendSnakeColors = [];
    for (let i = 0; i < account.allowedSnakeColors.length; i++) {
        sendSnakeColors.push(getColorById(account.allowedSnakeColors[i]));
    }
    account.snakeColors = sendSnakeColors;

    let accessedBattlePasses = {};
    for (let i = 0; i < account.battlePasses.length; i++) {
        accessedBattlePasses[account.battlePasses[i].name] = allBattlePasses[account.battlePasses[i].name];
    }
    updateLobbies();

    io.to(account.id).emit('setPlayer', account.id, account,accessedBattlePasses);
    io.to(account.id).emit("setScene","newMenu");
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

let server_skinPacks = ["basic"];
let server_snakeColors = [
    { color: { hue: 360, saturation: 300, brightness: 116 }, id: 0 },
    { color: { hue: 157, saturation: 234, brightness: 116 }, id: 1 },
    { color: { hue: 116, saturation: 211, brightness: 115 }, id: 2 },
    { color: { hue: 208, saturation: 203, brightness: 118 }, id: 3 },
    { color: { hue: 307, saturation: 160, brightness: 89 }, id: 4 },
    { color: { hue: 58, saturation: 192, brightness: 143 }, id: 5 },
    { color: { hue: 275, saturation: 62, brightness: 162 }, id: 6 },
    { color: { hue: 208, saturation: 62, brightness: 150 }, id: 7 },
    { color: { hue: 141, saturation: 62, brightness: 150 }, id: 8 },
    { color: { hue: 250, saturation: 234, brightness: 86 }, id: 9 },
    { color: { hue: 70, saturation: 0, brightness: 86 }, id: 10 },
    { color: { hue: 121, saturation: 180, brightness: 86 }, id: 11 },
    { color: { hue: 309, saturation: 300, brightness: 200 }, id: 12 },
    { color: { hue: 309, saturation: 58, brightness: 200 }, id: 13 },
    { color: { hue: 236, saturation: 106, brightness: 74 }, id: 14 },
    { color: { hue: 236, saturation: 210, brightness: 74 }, id: 15 },
    { color: { hue: 137, saturation: 210, brightness: 74 }, id: 16 },
    { color: { hue: 137, saturation: 53, brightness: 74 }, id: 17 },
    { color: { hue: 290, saturation: 130, brightness: 74 }, id: 18 },
    { color: { hue: 35, saturation: 119, brightness: 186 }, id: 19 },
    { color: { hue: 156, saturation: 119, brightness: 186 }, id: 20 },
    { color: { hue: 341, saturation: 119, brightness: 186 }, id: 21 },
    { color: { hue: 318, saturation: 300, brightness: 200 }, id: 22 }
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
        timeAlive,
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
        ta: timeAlive[timeAlive.length-1],
    }));
    let newObj = {
        a: emitingActivePlayers,  
        s: lobby.updateSnakeCells,
        c: lobby.updateCells,
        t: lobby.updateTiles,
        p: lobby.playSounds,
        b: lobby.boardStatus,
        g: Date.now() - lobby_gameLoop_start,
        f: lobby.canvasFilters,
    };

    // Compare with previous object
    let changedList = getChangedValues(lobby.oldObj, newObj);
    let changes = pako.deflate(JSON.stringify(changedList), { to: 'string' });

    if (Object.keys(changes).length > 0) { // Only emit if there are changes
        io.to(lobby.id).emit("updatePositions", changes);
    }

    // Store the new state for next comparison
    lobby.oldObj = newObj;
}
function getChangedValues(oldObj, newObj) {
    if (!oldObj) return newObj; // If no old state, send everything

    let changes = {};

    for (let key in newObj) {
        if (key == "a" || key == "b" || key == "s")
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
function checkGameMode(gameMode,accountID) {
    //if (gameMode.accountID !== accountID) return "accountID";
    if (simple.type(gameMode.name) !== "string") return ["name1",gameMode.name];
    if (gameMode.name == "") return ["name2",gameMode.name];
    if (gameMode.name.length > 32) return ["name3",gameMode.name];
    if (profanity.check(gameMode.name)) return ["name4",gameMode.name,profanity.clean(gameMode.name)];
    if (gameMode.howManyItemsCanPlayersUse < 0 || gameMode.howManyItemsCanPlayersUse > 10) return "howManyItemsCanPlayersUse";
    if (!["scroll","direct"].includes(gameMode.mode_usingItemType)) return "mode_usingItemType";
    if (!["vanish","remain","become food"].includes(gameMode.whenSnakesDie)) return "whenSnakesDie";
    if (![false,true].includes(gameMode.respawn)) return "respawn";
    if (![false,true].includes(gameMode.snakeCollision)) return "snakeCollision";
    if (![false,true].includes(gameMode.teamCollision)) return "teamCollision";
    gameMode.respawnGrowth = Number(gameMode.respawnGrowth);
    if (gameMode.respawnGrowth < 0 || gameMode.respawnGrowth > 100) return ["respawnGrowth",gameMode.respawnGrowth];
    if (gameMode.respawnProtection < 0 || gameMode.respawnProtection > 15) return ["respawnProtection",gameMode.respawnProtection];
    gameMode.respawnTimer = Number(gameMode.respawnTimer);
    if (gameMode.respawnTimer < 0 || gameMode.respawnTimer > 60) return "respawnTimer";
    if (gameMode.setFoodRate < 0 || gameMode.setFoodRate > 100) return ["setFoodRate",gameMode.setFoodRate];

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
    snakeCollision: true,
    teamCollision: true,
    setFoodRate: 50,
}
function respawnPlayer(lobby,player,growthPercentage) {
    let length = Math.round((growthPercentage/100) * player.tail.length);

    //Delete Old Tail
    snakeMapRemoveAll(lobby,player);

    player.isDead = false;
    player.tail = [];
    player.items = [];
    for (let j = 0; j < lobby.gameMode.howManyItemsCanPlayersUse; j++) {
        player.items.push("empty");
    }
    let team = player.team;
    player.status = ["status_" + team];
    player.justDied = false;
    player.bodyArmor = 1;
    player.justTeleported = false;
    player.moveQueue = [];
    player.moveTik = 0;
    player.moveSpeed = 6;
    player.turboDuration = 0;
    player.turboActive = false;
    player.respawnProtected = true;
    player.timeAlive.push(0);
    player.timeCameAlive = Date.now();
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
    },lobby.gameMode.respawnProtection*1000);


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
    activePlayers = lobby.inGamePlayers;
    let currentBoard = lobby.board;
    let currentGameMode = lobby.gameMode;
    for (let i = 0; i < activePlayers.length; i++) {
        let player = activePlayers[i];
        
        if (player.isDead) continue;

        player.timeAlive[player.timeAlive.length-1] = Date.now() - player.timeCameAlive;
        
        if ((player.moveTik) < (player.moveSpeed/currentBoard.map[player.pos.y][player.pos.x].tile.changePlayerSpeed)) {   
            player.moveTik++;
            continue;
        }

        if (simple.type(player.invinsibleBodyEffect) == "number") {
            player.invinsibleBodyEffect++;
            rerenderSnake(lobby,player);
            if (player.invinsibleBodyEffect > 6) player.invinsibleBodyEffect = 0;
        }

        if (player.turboActive == true) {
            player.turboDuration --;
            if (player.turboDuration <= 0) {
                player.turboActive = false;
                removePlayerStatus(lobby,player,"turbo");
                player.moveSpeed = 6;
            }
        }
        player.moveTik = 0

        let playerOldMoving = player.moving;

        //check the movement queue
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
        
        //Moving The Player
        let playerOldPos = { x: player.pos.x, y: player.pos.y };

        //Move Player and make sure he can't go back on himself
        switch (player.moving) {
            case "left": player.pos.x--; break;
            case "right": player.pos.x++; break;
            case "up": player.pos.y--; break;
            case "down": player.pos.y++; break;
        }            

        //Teleport Player If Needed
        if (simple.type(player.justTeleported) == "object") {
            //deleteSnakeCells(); Add Later?
            cameraQuickZoom = "tunnel";
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
        if (currentGameMode.snakeCollision) {
            let occupiedPositions = new Map();
        
            // Step 1: Populate occupiedPositions with all players' tails & positions
            for (let a = 0; a < activePlayers.length; a++) {
                let checkedPlayer = activePlayers[a];
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

        //Test Item Underplayer
        let mapItem = currentBoard.map[player.pos.y][player.pos.x].item;
        if (mapItem) runItemFunction(lobby,player,mapItem,"onCollision",{x: player.pos.x,y: player.pos.y},undefined,socketID);

        if (!player.isDead) {

            //Test Tile UnderPlayer
            let mapTile = currentBoard.map[player.pos.y][player.pos.x].tile;
            if (mapTile.onCollision) runItemFunction(lobby,player,mapTile,"onCollision",{x: player.pos.x,y: player.pos.y});

            //Testing While On Tile Properties
            player.allowedToMove = mapTile.whileOn.playerCanMove;

            //Growing/Moving Tail
            let playerX = playerOldPos.x;
            let playerY = playerOldPos.y;

            if (player.growTail > 0) {
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
            } else if(player.tail.length > 0) {
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

            //End Growing Tail
        } else {
            player.pos = playerOldPos;
            player.moving = playerOldMoving;
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
        type: "player",
        name: simple.rnd(playerNames1) + simple.rnd(playerNames2),
        hue: simple.rnd(360), //Hue[{hue: 360, saturation: 300, brightness: 116},
        saturation: simple.rnd(300), //Saturation
        brightness: simple.rnd(20,200), //Brightness
        moving: false,
        growTail: 0,
        isDead: false,
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
        snakeSkin: "classic",
    }
}
function checkPlayer(player,socketID) {
    if (player.name == "") return "name-1";
    if (player.name.length > 20) return "name-2";
    
    if (Number(player.hue) < 0) return "color-1";
    if (Number(player.hue) > 360) return "color-2";
    if (Number(player.saturation) < 0) return "saturation-1";
    if (Number(player.saturation) > 300) return "saturation-2";
    if (Number(player.brightness) < 20) return "brightness-1";
    if (Number(player.brightness) > 200) return "brightness-2";

    if (player.accountID !== socketID) return "socketId-1" + player.accountID + "," + socketID;

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
