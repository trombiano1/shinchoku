const express = require("express");
const app = express();

const fs = require("fs");
const { parse } = require("csv-parse/sync");

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const data = fs.readFileSync("./codes.csv")
const records = parse(data, { delimiter: ",", columns: true });
const codes = records.map(item => item.code.toLowerCase());

app.get("/code/:var?", (req, res, next) => {
    var codeStr;
    if (req.params.var === undefined) {
        codeStr = "404";
    } else if (codes.includes(req.params.var)) {
        codeStr = req.params.var;
    } else {
        codeStr = "404";
    }
    const code = parseInt(codeStr);
    const record = records.find(item => item.code == codeStr);
    const status = record.status;
    const message = record.message;

    res.status(code);
    
    if (req.accepts('html')) {
        res.render('error', { url: req.url, code: codeStr, codeMessage: `${code} ${status}`, message: message });
        return
    }
    
    if (req.accepts('json')) {
        res.json({ error: status });
        return;
    }
    
    res.type('txt').send(status);
    res.writeHead(code, {'Content-Type': 'text/plain'});
});

app.get("/index?", (req, res, next) => {
    // respond with html page
    res.render('index', { url: req.url, records: records });
});

app.use((req, res, next) => {
    const code = 404;
    const record = records.find(item => item.code == "404");
    const status = record.status;
    const message = record.message;

    res.status(code);
    
    if (req.accepts('html')) {
        res.render('error', { url: req.url, code: "404", codeMessage: `${code} ${status}`, message: message });
        return
    }
    
    if (req.accepts('json')) {
        res.json({ error: 'Processing' });
        return;
    }
    
    res.type('txt').send('Processing');
    res.writeHead(code, {'Content-Type': 'text/plain'});
});

app.listen(process.env.PORT, () => console.log("Server is running ..."));