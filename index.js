const express = require('express');
const cors = require('cors');
const morgan = require("morgan");
const path = require('path')
const rfs = require('rotating-file-stream') 
const { createProxyMiddleware } = require('http-proxy-middleware');
const bodyParser = require('body-parser');

// Create Express Server
const app = express();

// Configuration
const PORT = process.env.PORT || 5000;

// EDIT HERE - CORS: These origins will be able to use this application.
const corsWhitelist = [
    "http://localhost:3000", 
    "https://darylbuckle.github.io"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || corsWhitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS. Origin:' + origin))
    }
  }
}

// Add Cors
app.use(cors(corsOptions));

// Logging
const accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, 'log')
})  
app.use(morgan('combined', { stream: accessLogStream }))

// Body Parser
app.use(bodyParser.urlencoded({ extended: true }));

// Info GET endpoint
app.get('/info', (req, res, next) => {
    res.send('This is a proxy service for Authenticating with OAuth2.');
});

app.use('/token', createProxyMiddleware({
    target: "https://www.authurl.com", // EDIT HERE - This is the domain of the token endpoint
    changeOrigin: true,
    pathRewrite: {
        [`^/token`]: '/oauth/token' // EDIT HERE - /oauth/token is the endpoint of the token endpoint
    },
    onError(err, req, res) {
        res.writeHead(500, {
            'Content-Type': 'text/plain'
        });
        res.end('Something went wrong with authentication. ' + err);
    },
    onProxyReq(proxyReq, req, res) {
        // The original request will have a client secret that must match the verifier.
        // If it matches the client secret will be swapped with the clientSecret variable.
        const verifier = "key"; // EDIT HERE - Set this to whatever you'd like.
        const clientSecret = "yourClientSecret"; // EDIT HERE - This is your client secret for authenticating.

        if ( req.method == "POST" && req.body ) {
            let body = new Object();
            
            if ( req.body ) {
                Object.assign(body, req.body);
                delete req.body;
            }

            // Verify original client secret is equal to the verifier.
            let keyOk = false;
            if (body.client_secret === verifier) {
                keyOk = true;
            }

            // Update the client secret to the actual client secret.
            if (keyOk) {
                body.client_secret = clientSecret;
            }
            else {
                console.log("Proxy - Invalid Client Secret Key.");
            }

            // URI encode JSON object
            body = Object.keys( body ).map(function( key ) {
                return encodeURIComponent( key ) + '=' + encodeURIComponent( body[ key ])
            }).join('&');

            // Update header
            proxyReq.setHeader( 'content-type', 'application/x-www-form-urlencoded' );
            proxyReq.setHeader( 'content-length', body.length );

            // Write out body changes to the proxyReq stream
            proxyReq.write( body );
            proxyReq.end();
        }
    }
}));


// Start the Proxy
app.listen(PORT, () => {
    console.log(`Starting Proxy on port ${PORT}`);
});