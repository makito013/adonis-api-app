const { Ignitor } = require('@adonisjs/ignitor')
const https = require('https')
const fs = require('fs')
const path = require('path')



const options = {
  key: fs.readFileSync(path.join(__dirname, './server.key')),
  cert: fs.readFileSync(path.join(__dirname, './server.crt'))
}


new Ignitor(require('@adonisjs/fold'))
 .appRoot(__dirname)
 .fireHttpServer((handler) => {
   return https.createServer(options, handler)
})
.catch(console.error)
