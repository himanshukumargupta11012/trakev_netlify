const express = require("express")
const serverless =require('serverless-http')
const mongoose = require("mongoose")
const path = require("path")
const jwt = require("jsonwebtoken")
const hbs = require("hbs")
const bcrypt = require("bcrypt")
const copar = require("cookie-parser")

require("../db")

const app = express();
const port = process.env.PORT || 3008;

const router=express.Router();

const Signin = require("../data_user.js")
const Booking = require("../data_.js")
const Ticket = require("../data_ticket.js")

router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(express.static(path.join(__dirname, "/../dist/public")));

router.use(copar());

hbs.registerPartials(path.join(__dirname, "/../dist/partials"))
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, '../dist'))

router.get("/index", (req, res) => {
    res.render("index");
});

const middle= async (req,res,next)=>{
    try {
        console.log(req.cookies.trakev)
        const ver = jwt.verify(req.cookies.trakev, "himanshukumarguptaiswritingthiscodeforjwt")
    usr = await Signin.findOne({ email: ver.email })
    const list = await Signin.find({ dvr_stu: "driver" });
    console.log("hel")
    let str = []
    let ev = []
    for (let i = 0; i < list.length; i++) {
        if (list[i].ev_name != undefined)
            str[i] = list[i].ev_name + ":" + list[i].status + ' at ' + list[i].time
        ev[i] = list[i].ev_name
    }
    len = usr.tokens.length
    l = 0
    for (let i = 0; i < len; i++) {
        if (usr.tokens[i - l].token == req.cookies.trakev) {
            console.log(usr.tokens[i - l])
            usr.tokens.splice(i - l, 1)
            await usr.save()
            l += 1
        }
    }
    req.str=str
    req.usr=usr
    req.ev=ev
    console.log("hel")
    res.render("student",{ name: req.usr.name,str: req.str, ev: req.ev } );
    next();

    } catch (error) {
        res.render("index")
    }

    }


router.get("/", middle,async (req, res) => {
    console.log("hel")
    


})

router.get("/driver.hbs", (req, res) => {
    res.render("driver");
});
router.get("/signup.hbs", (req, res) => {
    res.render("signup");
});

router.get("/logout.hbs", async (req, res) => {
    const ver = jwt.verify(req.cookies.trakev, "himanshukumarguptaiswritingthiscodeforjwt")
    usr = await Signin.findOne({ email: ver.email })
    len = usr.tokens.length
    l = 0
    res.clearCookie("trakev")

    for (let i = 0; i < len; i++) {
        if (usr.tokens[i - l].token == req.cookies.trakev) {
            console.log(usr.tokens[i - l])
            usr.tokens.splice(i - l, 1)

            l += 1

        }

    }
    await usr.save()
    res.render("index")

})
router.get("/logout_all.hbs", async (req, res) => {
    const ver = jwt.verify(req.cookies.trakev, "himanshukumarguptaiswritingthiscodeforjwt")
    usr = await Signin.updateOne({ email: ver.email },{
        $unset:{
            tokens:[]
        }
    })
    // const hello=await Signin.updateOne({})
})
// app.get("/booking.hbs", (req, res) => {
//     res.render("booking");
// });

router.post("/signup", async (req, res) => {
    try {
        const pw = req.body.pw;
        const re_pw = req.body.re_pw;






        // const hell=async(token)=>{
        //     Signin.updateOne({email:req.body.email},{
        //         $set:{
        //             tokens:tokens.concat({token:await token})
        //         }

        //     })
        //     }



        // const verify=await jwt.verify(token,"himanshukumarguptaiswritingthiscodeforjwt");

        // 

        if (pw === re_pw) {
            const signindata = new Signin({
                dvr_stu: req.body.dvr_stu,
                name: req.body.name,
                email: req.body.email,
                mobno: req.body.mobno,
                pw: pw,
            })

            // console.log("hel")

            const token = await signindata.tokencreation();
            // console.log(token)
            res.cookie("trakev", token, {
                expires: new Date(Date.now() + 120000),
                httpOnly: true
            })
            // console.log(cookie)

            signuped = await signindata.save()



            // console.log("hello")


            res.status(201).render("index");
        }

        else {
            res.send("password not matching")
        }

    } catch (error) { res.send(error) }
    // } catch (error) { res.send("Email or Phone Number already registered") }



})
router.post("/signin", async (req, res) => {
    try {
        console.log(isNaN(req.body.email_mobno))

        if (isNaN(req.body.email_mobno)) {
            const pwget = await Signin.find({ email: req.body.email_mobno })
            global.id = pwget[0]._id
            global.name = pwget[0].name
            dvr_stu = pwget[0].dvr_stu
            pw = pwget[0].pw
            console.log("hekkk")

            // const token=await pwget.tokencreation();
            // console.log("hekkk")

            // res.cookie("trakev",token,{
            //     expires:new Date(Date.now()+300000),
            //     httpOnly:true
            // })
            console.log("hekkk")
            check = await bcrypt.compare(req.body.pwc, pw)
            try {
                const token = await pwget[0].tokencreation();
                res.cookie("trakev", token, {
                    expires: new Date(Date.now() + 120000),
                    httpOnly: true
                })
            } catch (error) {
                console.log(error)
                res.send(error)

            }


        }
        else {
            console.log(isNaN(req.body.email_mobno))

            const pwget = await Signin.find({ mobno: req.body.email_mobno })
            console.log("gfds")

            global.id = pwget[0]._id
            global.name = pwget[0].name
            pw = pwget[0].pw
            dvr_stu = pwget[0].dvr_stu
            console.log()
            check = await bcrypt.compare(req.body.pwc, pw)
            try {
                const token = await pwget[0].tokencreation();
                res.cookie("trakev", token, {
                    expires: new Date(Date.now() + 120000),
                    httpOnly: true
                })
            } catch (error) {
                console.log(error)
                res.send(error)

            }


        }


        // const check = await bcrypt.compare(req.body.pwc,pw)
        if (check) {
            if (dvr_stu === "student") {
                const list = await Signin.find({ dvr_stu: "driver" });
                combo = {}
                let str = []
                let ev = []
                for (let i = 0; i < list.length; i++) {
                    if (list[i].ev_name != undefined)
                        str[i] = list[i].ev_name + ":" + list[i].status + ' at ' + list[i].time
                    ev[i] = list[i].ev_name

                }
                console.log("hello")

                global.stat = str

                // middle()

                res.status(201).render("student",{ name: global.name, str: str, ev: ev })
            }
            else if (dvr_stu === "driver") {
                console.log("hell")
                res.status(201).render("driver", { name: global.name })
            }
            else {
                console.log("hel")
                res.send("check log credentials")
            }
        }
    }
    catch (error) {
        res.status(400).send(error);
    }
})

router.post("/update", async (req, res) => {
    try {
        const updatedoc = async (_id) => {
            try {
                const result = await Signin.updateOne({ _id: _id }, {
                    $set: {
                        ev_name: req.body.ev_name,
                        status: req.body.status,
                        time: new Date()
                    }

                })
                console.log(result)
                const find = await Signin.findOne({ _id: _id })


                res.status(201).render("driver", { name: global.name })

            }
            catch (err) {
                console.log(err)
            }
        }
        updatedoc(global.id);
    }
    catch (error) {
        res.status(400).send(error);
    }
})

router.post("/book", async (req, res) => {
    try {

        // const book_dvr = await Signin.updateOne({ ev_name: req.body.ev_name }, {

        //     $inc: {
        //         ticket: req.body.no_of_seats
        //     }

        // })

        full_date = req.body.date
        year = parseInt(full_date.substr(0, 4))
        month = parseInt(full_date.substr(5, 2))
        date = parseInt(full_date.substr(8, 2))

        date = new Date()
        console.log(date)

        //         helled=await hell.save()
        //             console.log("go to hell")

        const book_prsnt = await Ticket.updateOne({
            $and: [
                { trip_no: req.body.trip_no },
                { date: new Date(req.body.date) }
            ]
        }, {
            $inc: {
                no_of_seats: req.body.no_of_seats
            }
        })
        console.log(book_prsnt.matchedCount)
        if (book_prsnt.matchedCount == 0) {

            const book_nprsnt = new Ticket({
                trip_no: req.body.trip_no,
                date: new Date(req.body.date),
                no_of_seats: req.body.no_of_seats
            })

            booked_nprsnt = await book_nprsnt.save()
        }

        let str = new Date(req.body.date) + ":" + req.body.trip_no + ":" + req.body.no_of_seats
        console.log(str)
        const upd_history = Signin.updateOne({ _id: global.id }, {
            $push: { history: [str] }
        })
        console.log(upd_history)

        res.status(201).render("student", { name: global.name, str: global.stat })
    }
    catch (error) {
        res.status(400).send(error);
    }
})

// app.listen(port, () => { console.log("server is running at port no", port); })

app.use('/',router);
module.exports.handler=serverless(app)