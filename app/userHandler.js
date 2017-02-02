'use strict';

var User = require('./users.js');
var Book = require('./books.js');


function equalBooks (book1, book2) {
    return (
        book1.title === book2.title && 
        book1.author === book2.author && 
        book1.cover === book2.cover
    );
}
function equalTrades (trade1, trade2) {
    return (
        (
            trade1.user1 === trade2.user1 && 
            trade1.user2 === trade2.user2 && 
            equalBooks(trade1.book1, trade2.book1) && 
            equalBooks(trade1.book2, trade2.book2)
        ) ||
        (
            trade1.user1 === trade2.user2 && 
            trade1.user2 === trade2.user1 && 
            equalBooks(trade1.book1, trade2.book2) && 
            equalBooks(trade1.book2, trade2.book1)
        )
    );
}


function UserHandler () {
    
    this.addUser = function (req, res) {
        var newUser = new User({
            username: req.body.username,
            password: req.body.password,
            name: '',
            email: req.body.email,
            city: '',
            state: '',
            books: [],
            tradeRequests: {
                in: [],
                out: []
            }
        });
        newUser.save(function (err) {
            if (err) { 
                console.log('add user db error'); 
                return res.json({error: 'DB', msg: 'Add user database error'});
            }
            res.json({msg: 'Added new user.'});
        });
    };
    
    this.login = function (req, res) {
        console.log('Login request: ' + req.body.username + '/' + req.body.password);
        User.findOne({ username: req.body.username }, function (err, user) {
            if (err) {
                console.log('login db error');
                return res.json({error: 'DB', msg: 'Login database error'});
            }
            if (!user) {
                console.log('username not found');
                return res.json({error: 'NOT_FOUND', msg: 'Username not found'});
            }
            if (user.password !== req.body.password) {
                console.log('password incorrect');
                return res.json({error: 'PASS', msg: 'Username and password do not match'});
            }
            console.log('password verified -> login');
            res.json({msg: 'Login verified'});
        });
    };
    
    this.getUser = function (req, res) {
        User.findOne({ username: req.body.username }, function (err, user) {
            if (err) {
                console.log('login db error');
                return res.json({error: 'DB', msg: 'Login database error'});
            }
            if (!user) {
                console.log('username not found');
                return res.json({error: 'NOT_FOUND', msg: 'Username not found'});
            }
            res.json(user);
        });
    };
    
    this.searchUsers = function (req, res) {
    	var searchReg = new RegExp(req.body.str, 'i');
        var users = [];
        var count = 0;
        
        var stream = User.find().stream();
        stream.on('error', function () {
            console.log('search db error');
            return res.json({error: 'DB', msg: 'Database error in search'});
        });
        stream.on('close', function () { res.json(users); });
        stream.on('data', function (user) {
            if (user.username.search(searchReg) > -1) { 
    	       users.push(user.username);
    	       if (++count === 10) { res.json(users); }
            }
        });
    };
    
    this.saveSettings = function (req, res) {
        User.findOneAndUpdate(
            { username: req.body.username },
            {
                name: req.body.name,
                email: req.body.email,
                city: req.body.city,
                state: req.body.state
            },
            function (err, user) {
                if (err) {
                console.log('saveSettings db error');
                return res.json({error: 'DB', msg: 'Update database error'});
                }
                if (!user) {
                    console.log('username not found');
                    return res.json({error: 'NOT_FOUND', msg: 'Username not found'});
                }
                res.json({msg: 'Settings updated'});
            }
        );
    };
    
    this.newBook = function (req, res) {
        User.findOne({username: req.body.username}, function (err, user) {
            if (err) {
                console.log('user db error in newbook');
                return res.json({error: 'DB_USER', msg: 'User database error in newBook'});
            }
            if (!user) {
                console.log('username not found');
                return res.json({error: 'NOT_FOUND', msg: 'Username not found'});
            }
            var book = new Book({
                title: req.body.title,
                author: req.body.author,
                cover: req.body.cover
            });
            book.save(function (err) {
                if (err) {
                    console.log('book db error in newbook');
                    return res.json({error: 'DB_BOOK', msg: 'Book database error in newBook'});
                }
                user.books.push(book);
                user.save(function (err, user) {
                    if (err) {
                        console.log('user db error in newbook');
                        return res.json({error: 'DB_USER', msg: 'User database error in newBook'});
                    }
                    return res.json({msg: 'Added new book', books: user.books});
                });
            });
        });
    };
    
    this.removeBook = function (req, res) {
        User.findOne({username: req.body.username}, function (err, user) {
            if (err) { 
                console.log('db error in removebook');
                return res.json({error: 'DB', msg: 'Database error in removeBook'});
            }
            if (!user) {
                console.log('username not found');
                return res.json({error: 'NOT_FOUND', msg: 'Username not found'});
            }
            var bookTarget = {
                title: req.body.title,
                author: req.body.author,
                cover: req.body.cover
            };
            var book;
            var userInd = 0;
            while (userInd < user.books.length) {
                book = user.books[userInd];
                if (    bookTarget.title === book.title 
                    &&  bookTarget.author === book.author 
                    &&  bookTarget.cover === book.cover) {
                    break;
                }
                userInd++;
            }
            if (userInd === user.books.length) {
                console.log('no book in user collection');
                return res.json({error: 'NO_BOOK', msg: 'Book not found in user\'s collection'});
            }
            user.books.splice(userInd, 1);
            user.save(function (err, user) {
                if (err) {
                    console.log('user db error in removeBook');
                    return res.json({error: 'DB', msg: 'Database error in removeBook'});
                }
                return res.json({msg: 'Removed book', books: user.books});
            });
        });
    };
    
    this.addBook = function (req, res) {
        User.findOne({username: req.body.username}, function (err, user) {
            if (err) { 
                console.log('db error in addbook');
                return res.json({error: 'DB', msg: 'Database error in addBook'});
            }
            if (!user) {
                console.log('username not found');
                return res.json({error: 'NOT_FOUND', msg: 'Username not found'});
            }
            
            user.books.push({
                title: req.body.title,
                author: req.body.author,
                cover: req.body.cover
            });
            user.save(function (err) {
                if (err) {
                    console.log('user db error in addBook');
                    return res.json({error: 'DB', msg: 'Database error in addBook'});
                }
                return res.json({msg: 'Added book', books: user.books});
            });
        });
    };
    
    this.searchBooks = function (req, res) {
    	var searchReg = new RegExp(req.body.str, 'i');
        var books = [];
        var count = 0;
        
        var stream = Book.find().stream();
        stream.on('error', function () {
            console.log('search db error');
            return res.json({error: 'DB', msg: 'Database error in search'});
        });
        stream.on('close', function () { res.json(books); });
        stream.on('data', function (book) {
            if (book.title.search(searchReg) > -1 || book.author.search(searchReg) > -1) { 
    	       books.push(book);
    	       if (++count === 20) { res.json(books); }
            }
        });
    };
    
    this.allBooks = function (req, res) {
        Book.find({}, function (err, books) {
            if (err) {
                console.log('allbooks db error');
                return res.json({error: 'DB', msg: 'Database error in allBooks'});
            }
            return res.json({books: books});
        });
    };
    
    this.addTrade = function (req, res) {
        User.findOne({ username: req.body.user1 }, function (err, user1) {
            if (err) { return res.json({error: 'DB', msg: 'User database error'}); }
            if (!user1) { return res.json({error: 'NOT_FOUND', msg: 'User1 not found'}); }
            User.findOne({ username: req.body.user2 }, function (err, user2) {
                if (err) { return res.json({error: 'DB', msg: 'User database error'}); }
                if (!user2) { return res.json({error: 'NOT_FOUND', msg: 'User2 not found'}); }
                
                var bookTarget = req.body.book1;
                var book;
                var book1Ind = -1;
                for (var i = 0; i < user1.books.length; i++) {
                    book = user1.books[i];
                    if (book.title === bookTarget.title && book.author === bookTarget.author && book.cover === bookTarget.cover) {
                        book1Ind = i;
                        break;
                    }
                }
                if (book1Ind < 0) { return res.json({error: 'NOT_FOUND', msg: 'Book1 not found in user1\'s collection'}); }
                bookTarget = req.body.book2;
                var book2Ind = -1;
                for (var i = 0; i < user2.books.length; i++) {
                    book = user2.books[i];
                    if (book.title === bookTarget.title && book.author === bookTarget.author && book.cover === bookTarget.cover) {
                        book2Ind = i;
                        break;
                    }
                }
                if (book2Ind < 0) { return res.json({error: 'NOT_FOUND', msg: 'Book2 not found in user2\'s collection'}); }
                
                var newTrade = {
                    user1: user1.username,
                    book1: user1.books[book1Ind],
                    user2: user2.username,
                    book2: user2.books[book2Ind]
                };
                if (user1.username === req.body.startUser) {
                    user1.tradeRequests.out.push(newTrade);
                    user1.markModified('tradeRequests.out');
                    user2.tradeRequests.in.push(newTrade);
                    user2.markModified('tradeRequests.in');
                } else {
                    user2.tradeRequests.out.push(newTrade);
                    user2.markModified('tradeRequests.out');
                    user1.tradeRequests.in.push(newTrade);
                    user1.markModified('tradeRequests.in');
                }
                user1.save(function (err) {
                    if (err) { return res.json({error: 'DB', msg: 'User database error'}); }
                    user2.save(function (err) {
                        if (err) { return res.json({error: 'DB', msg: 'User database error'}); }
                        res.json({msg: 'Trade added'});
                    });
                });
            });
        });
    };
    
    this.processTrade = function (req, res) {
        User.findOne({ username: req.body.user1 }, function (err, user1) {
            if (err) { return res.json({error: 'DB', msg: 'User database error'}); }
            User.findOne({ username: req.body.user2 }, function (err, user2) {
                if (err) { return res.json({error: 'DB', msg: 'User database error'}); }
                
                var bookTarget = req.body.book1;
                var book;
                var book1Ind = -1;
                if (user1) {
                    for (var i = 0; i < user1.books.length; i++) {
                        book = user1.books[i];
                        if (book.title === bookTarget.title && book.author === bookTarget.author && book.cover === bookTarget.cover) {
                            book1Ind = i;
                            break;
                        }
                    }
                }
                var book1Found = book1Ind > -1;
                
                bookTarget = req.body.book2;
                var book2Ind = -1;
                if (user2) {
                    for (var i = 0; i < user2.books.length; i++) {
                        book = user2.books[i];
                        if (book.title === bookTarget.title && book.author === bookTarget.author && book.cover === bookTarget.cover) {
                            book2Ind = i;
                            break;
                        }
                    }
                }
                var book2Found = book2Ind > -1;
                
                var trade;
                var trade1SearchResult = { index: -1, array: 'in' };
                if (user1) {
                    for (var i = 0; i < user1.tradeRequests.in.length; i++) {
                        trade = user1.tradeRequests.in[i];
                        if (equalTrades(req.body, trade)) {
                            trade1SearchResult.index = i;
                            break;
                        }
                    }
                    if (trade1SearchResult.index < 0) {
                        for (var i = 0; i < user1.tradeRequests.out.length; i++) {
                            trade = user1.tradeRequests.out[i];
                            if (equalTrades(req.body, trade)) {
                                trade1SearchResult.index = i;
                                trade1SearchResult.array = 'out';
                                break;
                            }
                        }
                    }
                }
                var trade1Found = trade1SearchResult.index > -1;
                
                var trade2SearchResult = { index: -1, array: 'in' };
                if (user2) {
                    for (var i = 0; i < user2.tradeRequests.in.length; i++) {
                        trade = user2.tradeRequests.in[i];
                        if (equalTrades(req.body, trade)) {
                            trade2SearchResult.index = i;
                            break;
                        }
                    }
                    if (trade2SearchResult.index < 0) {
                        for (var i = 0; i < user2.tradeRequests.out.length; i++) {
                            trade = user2.tradeRequests.out[i];
                            if (equalTrades(req.body, trade)) {
                                trade2SearchResult.index = i;
                                trade2SearchResult.array = 'out';
                                break;
                            }
                        }
                    }
                }
                var trade2Found = trade2SearchResult.index > -1;
                
                var error = { error: null, msg: '' };
                if (!user1 || !user2) {
                    error.error = 'NO_USER';
                    error.msg = 'One of the users was not found';
                } else if (!book1Found || !book2Found) {
                    error.error = 'NO_BOOK';
                    error.msg = 'One of the books was not found in the user collections';
                } else if (!trade1Found || !trade2Found) {
                    error.error = 'NO_TRADE';
                    error.msg = 'One of the users invalidated the trade';
                }
                
                if (trade1Found && trade2Found) {
                    /// Both users have trade
                    /// -> Remove from both
                    if (error.error) {
                        /// Remove trades and return error
                        if (trade1SearchResult.array === 'in') {
                            user1.tradeRequests.in.splice(trade1SearchResult.index, 1);
                            user1.markModified('tradeRequests.in');
                        } else {
                            user1.tradeRequests.out.splice(trade1SearchResult.index, 1);
                            user1.markModified('tradeRequests.out');
                        }
                        
                        if (trade2SearchResult.array === 'in') {
                            user2.tradeRequests.in.splice(trade2SearchResult.index, 1);
                            user2.markModified('tradeRequests.in');
                        } else {
                            user2.tradeRequests.out.splice(trade2SearchResult.index, 1);
                            user2.markModified('tradeRequests.out');
                        }
                        
                        user1.save(function (err1) { user2.save(function (err2) {
                            if (err1 || err2) { return res.json({error: 'DB', msg: 'User database error'}); }
                            else { return res.json(error); }
                        }); });
                    } else {
                        /// Process trade
                        user1.books[book1Ind] = req.body.book2;
                        user2.books[book2Ind] = req.body.book1;
                        user1.markModified('books');
                        user2.markModified('books');
                        
                        /// Remove trade and return success
                        if (trade1SearchResult.array === 'in') {
                            user1.tradeRequests.in.splice(trade1SearchResult.index, 1);
                            user1.markModified('tradeRequests.in');
                        } else {
                            user1.tradeRequests.out.splice(trade1SearchResult.index, 1);
                            user1.markModified('tradeRequests.out');
                        }
                        
                        if (trade2SearchResult.array === 'in') {
                            user2.tradeRequests.in.splice(trade2SearchResult.index, 1);
                            user2.markModified('tradeRequests.in');
                        } else {
                            user2.tradeRequests.out.splice(trade2SearchResult.index, 1);
                            user2.markModified('tradeRequests.out');
                        }
                        
                        user1.save(function (err1, user1) { user2.save(function (err2, user2) {
                            if (err1 || err2) { return res.json({error: 'DB', msg: 'User database error'}); }
                            if (req.body.caller === user1.username) {
                                return res.json({msg: 'Trade processed', books: user1.books});
                            } else {
                                return res.json({msg: 'Trade processed', books: user2.books});
                            }
                        }); });
                    }
                } else if (trade1Found) {
                    /// User1 has trade, but not user2
                    /// -> Remove from user1 only
                    if (trade1SearchResult.array === 'in') {
                        user1.tradeRequests.in.splice(trade1SearchResult.index, 1);
                        user1.markModified('tradeRequests.in');
                    } else {
                        user1.tradeRequests.out.splice(trade1SearchResult.index, 1);
                        user1.markModified('tradeRequests.out');
                    }
                    user1.save(function (err) { 
                        if (err) { return res.json({error: 'DB', msg: 'User database error'}); }
                        else { return res.json(error); }
                    });
                } else if (trade2Found) {
                    /// User2 has trade, but not user1
                    /// -> Remove from user2 only
                    if (trade2SearchResult.array === 'in') {
                        user2.tradeRequests.in.splice(trade2SearchResult.index, 1);
                        user2.markModified('tradeRequests.in');
                    } else {
                        user2.tradeRequests.out.splice(trade2SearchResult.index, 1);
                        user2.markModified('tradeRequests.out');
                    }
                    user2.save(function (err) { 
                        if (err) { return res.json({error: 'DB', msg: 'User database error'}); }
                        else { return res.json(error); }
                    });
                } else {
                    /// Neither user has trade
                    /// -> Remove from neither
                    return res.json(error);
                }
            });
        });
    };
    
    this.removeTrade = function (req, res) {
        User.findOne({ username: req.body.user1 }, function (err, user1) {
            if (err) { return res.json({error: 'DB', msg: 'User database error'}); }
            User.findOne({ username: req.body.user2 }, function (err, user2) {
                if (err) { return res.json({error: 'DB', msg: 'User database error'}); }
                
                var trade;
                var trade1SearchResult = { index: -1, array: 'in' };
                if (user1) {
                    for (var i = 0; i < user1.tradeRequests.in.length; i++) {
                        trade = user1.tradeRequests.in[i];
                        if (equalTrades(req.body, trade)) {
                            trade1SearchResult.index = i;
                            break;
                        }
                    }
                    if (trade1SearchResult.index < 0) {
                        for (var i = 0; i < user1.tradeRequests.out.length; i++) {
                            trade = user1.tradeRequests.out[i];
                            if (equalTrades(req.body, trade)) {
                                trade1SearchResult.index = i;
                                trade1SearchResult.array = 'out';
                                break;
                            }
                        }
                    }
                }
                var trade1Found = (trade1SearchResult.index > -1);
                
                var trade2SearchResult = { index: -1, array: 'in' };
                if (user2) {
                    for (var i = 0; i < user2.tradeRequests.in.length; i++) {
                        trade = user2.tradeRequests.in[i];
                        if (equalTrades(req.body, trade)) {
                            trade2SearchResult.index = i;
                            break;
                        }
                    }
                    if (trade2SearchResult.index < 0) {
                        for (var i = 0; i < user2.tradeRequests.out.length; i++) {
                            trade = user2.tradeRequests.out[i];
                            if (equalTrades(req.body, trade)) {
                                trade2SearchResult.index = i;
                                trade2SearchResult.array = 'out';
                                break;
                            }
                        }
                    }
                }
                var trade2Found = (trade2SearchResult.index > -1);
                
                if (trade1Found && trade2Found) {
                    if (trade1SearchResult.array === 'in') {
                        user1.tradeRequests.in.splice(trade1SearchResult.index, 1);
                        user1.markModified('tradeRequests.in');
                    } else {
                        user1.tradeRequests.out.splice(trade1SearchResult.index, 1);
                        user1.markModified('tradeRequests.out');
                    }
                    
                    if (trade2SearchResult.array === 'in') {
                        user2.tradeRequests.in.splice(trade2SearchResult.index, 1);
                        user2.markModified('tradeRequests.in');
                    } else {
                        user2.tradeRequests.out.splice(trade2SearchResult.index, 1);
                        user2.markModified('tradeRequests.out');
                    }
                    
                    user1.save(function (err1) { user2.save(function (err2) {
                        if (err1 || err2) { return res.json({error: 'DB', msg: 'User database error'}); }
                        else { return res.json({msg: 'Trade removed'}); }
                    }); });
                } else if (trade1Found) {
                    if (trade1SearchResult.array === 'in') {
                        user1.tradeRequests.in.splice(trade1SearchResult.index, 1);
                        user1.markModified('tradeRequests.in');
                    } else {
                        user1.tradeRequests.out.splice(trade1SearchResult.index, 1);
                        user1.markModified('tradeRequests.out');
                    }
                    user1.save(function (err) { 
                        if (err) { return res.json({error: 'DB', msg: 'User database error'}); }
                        else { return res.json({msg: 'Trade removed'}); }
                    });
                } else if (trade2Found) {
                    if (trade2SearchResult.array === 'in') {
                        user2.tradeRequests.in.splice(trade2SearchResult.index, 1);
                        user2.markModified('tradeRequests.in');
                    } else {
                        user2.tradeRequests.out.splice(trade2SearchResult.index, 1);
                        user2.markModified('tradeRequests.out');
                    }
                    user2.save(function (err) { 
                        if (err) { return res.json({error: 'DB', msg: 'User database error'}); }
                        else { return res.json({msg: 'Trade removed'}); }
                    });
                } else {
                    return res.json({msg: 'Trade was not found in user data'});
                }
            });
        });
    };
    
}

module.exports = UserHandler;