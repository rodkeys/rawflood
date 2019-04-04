const models = require("./controllers/modelController");
const User = models.user;




// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        next();
    }
};


// route for Home-Page
app.get('/', sessionChecker, (req, res) => {
    res.redirect('/login');
});


// route for user signup
app.route('/signup')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/public/signup.html');
    })
    .post((req, res) => {
        User.create({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password
            })
            .then(user => {
                req.session.user = user.dataValues;
                res.redirect('/dashboard');
            })
            .catch(error => {
                res.redirect('/signup');
            });
    });


// Example on how to destroy an entry
app.route("/destroy")
.get((req, res) => {
    User.destroy({ where: { username: "bob" } }).then((user) => {
        console.log('fin')
    })
})

// Example on how to update an entry
app.route("/update")
.get((req, res) => {
    User.update({username: "test1"}, {where: { username: "test"}})
        .then(result => {
            console.log('finee')
        })
        .catch(error => {
            console.log(error)
        })

})


// route for user Login
app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/public/login.html');
    })
    .post((req, res) => {
        var username = req.body.username,
            password = req.body.password;



        User.findOne({ where: { username: username } }).then(function(user) {

            if (!user) {
                res.redirect('/login');
            } else {
                 const hashedPassword = user.dataValues.password;
                if (!user.validPassword(password, hashedPassword)) {
                    res.redirect('/login');
                } else {
                    req.session.user = user.dataValues;
                    res.redirect('/dashboard');
                }
            }
        });
    });


// route for user's dashboard
app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.sendFile(__dirname + '/public/dashboard.html');
    } else {
        res.redirect('/login');
    }
});


// route for user logout
app.get('/logout', (req, res) => {
    if (req.session.user) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});


// route for handling 404 requests(unavailable routes)
app.use(function(req, res, next) {
    res.status(404).send("Sorry can't find that!")
});