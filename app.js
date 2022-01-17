const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const res = require('express/lib/response');
require('dotenv').config();
const fs = require('fs');
// const writeStream = fs.createWriteStream('devBlog.csv');

const NodeCache = require( "node-cache" );
const myCache = new NodeCache();

const port = process.env.PORT || 4000;

const app = express();


//write headers
// writeStream.write(`PlayerCode, PlayerName, PlayerMoves\n`);


//Listen to server
app.listen(port, () => {
    console.log(`Server Established and  running on Port ⚡${port}`)
})

app.get('/', function (request, response) {
    axios.get('https://www.chessgames.com/chessecohelp.html')
    .then(res => {
        const $ = cheerio.load(res.data)
        $('body > font > p > table > tbody > tr').each((index, element) => {

            const playerCode = $(`body > font > p > table > tbody > tr:nth-child(${index+1}) > td:nth-child(1) > font`).text()
            const playerName = $(`body > font > p > table > tbody > tr:nth-child(${index+1}) > td:nth-child(2) > font > b`).text()
            const playerMoves = $(`body > font > p > table > tbody > tr:nth-child(${index+1}) > td:nth-child(2) > font > font`).text()
            response.write(`{${playerCode}, [${playerName}], ${playerMoves}},\n`);  
            success = myCache.set( playerCode, `{${playerCode}, [${playerName}], ${playerMoves}},\n`, 180 );
        });
        response.end();
    }).catch(err => console.error(err))
  })

  
  
  app.get('/:CODE', function (request, response) {
    const pcode = request.params.CODE;
    axios.get('https://www.chessgames.com/chessecohelp.html')
    .then(res => {
        const $ = cheerio.load(res.data)
        value = myCache.get(pcode);
        if(value == undefined)
        {
            $('body > font > p > table > tbody > tr').each((index, element) => {

                const playerCode = $(`body > font > p > table > tbody > tr:nth-child(${index+1}) > td:nth-child(1) > font`).text()
                if(playerCode === pcode)
                {   
                        const playerName = $(`body > font > p > table > tbody > tr:nth-child(${index+1}) > td:nth-child(2) > font > b`).text()
                        const playerMoves = $(`body > font > p > table > tbody > tr:nth-child(${index+1}) > td:nth-child(2) > font > font`).text()
                        response.write(`{${playerCode}, [${playerName}], ${playerMoves}},\n`);  
                        success = myCache.set( playerCode, `{${playerCode}, [${playerName}], ${playerMoves}},\n`, 180 );
                    
                    return false; // break loop 
                }
            });
        }
        else{
            response.write(value);
        }
        response.end();
    }).catch(err => console.error(err))
  })


  app.get('/:CODE/*', function(request, response) {
    const pCode = request.params.CODE;
    const pMoves = request.params[0];
    var playerMoves;

    axios.get('https://www.chessgames.com/chessecohelp.html')
    .then(res => {
        const $ = cheerio.load(res.data)
        $('body > font > p > table > tbody > tr').each((index, element) => {

            const playerCode = $(`body > font > p > table > tbody > tr:nth-child(${index+1}) > td:nth-child(1) > font`).text()
            if(playerCode === pCode)
            {   
                    playerMoves = $(`body > font > p > table > tbody > tr:nth-child(${index+1}) > td:nth-child(2) > font > font`).text()
                return false; // break loop 
            }
        });
        

        const movesArray = playerMoves.split(" ");
        const lastMove = pMoves.substr(pMoves.lastIndexOf('/')+1);

        // const lastIndex = Array.asList(movesArray).indexOf(lastMove);
        var lastIndex = movesArray.findIndex(i => i === lastMove);
        
        var result = movesArray[lastIndex+1];
        if(!isNaN(result))
        result = movesArray[lastIndex+2];
        response.send(result);

    }).catch(err => console.error(err))

});
  