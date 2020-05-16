import express from "express";
import mysql from "mysql";
import Luhn from "luhn-js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database : 'sync'
});


const app = express();
const port = 8080; // default port to listen

app.use(cors());
app.use(express.json());


app.get("/token",(req, res, next) => {
    const timestamp = (new Date()).getTime();
    res.setHeader('Content-Type', 'application/json');
    res.send({'token':Luhn.generate((Math.floor((Math.random()*10000)*timestamp)).toString().substring(0,15))});
});

app.get("/url",(req, res, next) => {
    const token = req.query.token.toString();
    const offset = Number(req.query.offset) || 0;
    const limit = Number(req.query.limit) || 100;
    if( token.length===16 && Luhn.isValid(token)){
        connection.query('SELECT url,created_at FROM url WHERE `token` = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',[token,limit,offset],(error, result, fields)=>{
            if (error) throw error;
            res.setHeader('Content-Type', 'application/json');
            res.send(result);
        } );
    }else {
        res.sendStatus(400);
    }
});


app.post("/url", (req, res, next) => {
    const token = req.body.token.toString();
    const url = req.body.url.toString();
    if( token.length===16 && url.length>0 && Luhn.isValid(token)){
        connection.query("INSERT INTO url(token, url) VALUES (?,?);",[token,url],(error, result, fields)=>{
            if (error) throw error;
            res.send({'status':'success'});
        } );
    }else {
        res.sendStatus(400);
    }

});

// start the express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});
