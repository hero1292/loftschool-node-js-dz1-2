const http = require('http');
const port = process.env.PORT || 3000;

function startTimer (intervalMS, timeoutMS) {
  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      console.log(new Date().toUTCString());
    }, intervalMS);
    setTimeout(() => {
      clearInterval(timer);
      resolve(new Date().toUTCString());
    }, timeoutMS);
  });
}

http.createServer((req, res) => {
  startTimer(1000, 5000)
    .then((time) => {
      res.end(`Timer is stopped at ${time}`);
    });
}).listen(port, () => { console.log(`Server is listening on port ${port}`); });
