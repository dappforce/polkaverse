const express = require('express');
const next = require('next');

const port = parseInt(process.env.PORT) || 3003;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.use((req, res, next) => {
    const host = req.headers.host;

    if (host === 'grill.so') {
      return res.redirect(301, `http://grill.so/b${req.url}`);
    }

    next();
  });

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
