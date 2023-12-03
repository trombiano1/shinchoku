const express = require("express");
const app = express();

const fs = require("fs");
const { parse } = require("csv-parse/sync");

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const data = fs.readFileSync("codes.csv")
const records = parse(data, { delimiter: ",", columns: true });
const codes = records.map(item => item.code.toLowerCase());

app.get("/index?", (req, res, next) => {
    res.render('index', { url: req.url, records: records });
});

app.get("/code/:var?", (req, res, next) => {
    var code_str;
    if (req.params.var === undefined) {
        code_str = "404";
    } else if (codes.includes(req.params.var)) {
        code_str = req.params.var;
    } else {
        code_str = "404";
    }
    const of_str = req.query.of;
    displayError(code_str, of_str, req, res);
});

app.use((req, res, next) => {
    const of_str = req.query.of;
    displayError(404, of_str, req, res);
});

function displayError(code_str, of_str, req, res) {
    const code = parseInt(code_str);
    const record = records.find(item => item.code == code_str);
    const status = record.status;

    res.status(code);
    
    if (req.accepts('html')) {
        if (of_str) {
            const message_before_of = record.message_before_of;
            const message_after_of = record.message_after_of;
            res.render('error', { url: req.url, code: code_str, codeMessage: `${code} ${status}`, message: message_before_of + of_str + message_after_of });
        } else {
            const message = record.message;
            res.render('error', { url: req.url, code: code_str, codeMessage: `${code} ${status}`, message: message });
        }
        return
    }
    
    if (req.accepts('json')) {
        res.json({ error: status});
        return;
    }
    
    res.type('txt').send(status);
    res.writeHead(code, {'Content-Type': 'text/plain'}); 
}

const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => console.log("Server is running ..."));