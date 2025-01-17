var express = require("express");
var router = express.Router();
var dbobject = require("./connection");

const bcrypt = require("bcryptjs");
var salt = bcrypt.genSaltSync(10);

/* GET home page. */
router.post("/signup", function (req, res, next) {
  console.log(req.body.newUser);
  const { userName, password, firstName, lastName, email } = req.body.newUser;
  connection = dbobject();
  connection.connect();
  try {
    connection.query(
      `SELECT username FROM User WHERE username="${userName}"`,
      (err, rows, fields) => {
        console.log(rows);
        if (err) throw err;
        else if (rows.length !== 0) {
          res.json({ error: { code: 1, errormsg: "username cannot be same" } });
          console.log("username cannot be same");
          connection.end();
        } else {
          connection.query(
            `SELECT email FROM User WHERE email="${email}"`,
            async (err, rows, fields) => {
              if (err) throw err;
              else if (rows.length !== 0) {
                res.json({
                  error: { code: 2, errormsg: "email cannot be same" },
                });
                console.log("email cannot be same");
                connection.end();
              } else {
                const hashed_password = bcrypt.hashSync(password, salt);
                connection.query(
                  `INSERT INTO User (username,firstname,lastname,password,email)` +
                    `VALUES ("${userName}", "${firstName}", "${lastName}","${hashed_password}", "${email}");`,
                  (err, rows, fields) => {
                    if (err) throw err;
                    else {
                      console.log(rows, fields);
                      res.json({ msg: "user created successfully" });
                      connection.end();
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.json({
      error: { code: 3, errormsg: "internal error occured" },
    });
    connection.end();
  }
});

router.post("/signin", function (req, res, next) {
  const { email, password } = req.body.User;
  console.log(email, password);
  try {
    connection = dbobject();
    connection.connect();
    console.log("connected");

    connection.query(
      `SELECT email FROM User WHERE email="${email}"`,
      (err, rows, fields) => {
        if (err) throw err;
        else if (rows.length !== 0) {
          connection.query(
            `SELECT password FROM User WHERE email="${email}"`,
            (err, rows, fields) => {
              if (err) throw err;
              else if (rows.length !== 0) {
                if (bcrypt.compareSync(password, rows[0].password)) {
                  connection.query(
                    `SELECT id,username, email,firstname,lastname FROM User WHERE email="${email}"`,
                    (err, rows, fields) => {
                      if (err) throw err;
                      else {
                        res.json({
                          msg: "user logged in successfully",
                          user: rows[0],
                        });
                        connection.end();
                      }
                    }
                  );
                } else {
                  res.json({
                    error: { code: 2, errormsg: "password is incorrect" },
                  });
                  connection.end();
                }
              } else {
                res.json({
                  error: { code: 3, errormsg: "internal error occured" },
                });
                connection.end();
              }
            }
          );
        } else {
          res.json({
            error: { code: 1, errormsg: "email is not registered" },
          });
          connection.end();
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.json({
      error: { code: 3, errormsg: "internal error occured" },
    });
  }
});

module.exports = router;
