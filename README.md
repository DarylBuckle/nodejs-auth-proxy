# nodejs-auth-proxy

This is a template for a nodejs proxy application which stores a client secret for authenticating with OAuth2, which can be used by SPAs.

## About

The purpose of this app is to store the client secret for single page web applications requiring OAuth2 authentication but not having a server application.

This app acts as a proxy for requests to an authentication server that require the client secret to be sent. Since it is not secure to store a client secret with a client's code, it instead would call this proxy which will add the client secret to the request and forward it to the destination authentication server.

## Using this template

1. Select use this template in GitHub to clone the repository.


2. Open Index.js and search for ```EDIT HERE```. Each line that should be edited is indicated with EDIT HERE.
    - **Cors Whitelist**: Include the url which will call the proxy.
    - **Target**: Domain where the token endpoint is hosted.
    - **Path Rewrite**: Rewrite /token to the endpoint used to retrieve a token.
    - **Verifier**: This should be a random string. When calling the proxy, client_secret should be equal to this string. If it matches if will then be replaced with the Client Secret when the request is forwarded to the token endpoint.
    - **Client Secret**: This is where you should store your client secret.

3. Install packages using ```yarn install```.

4. Build and test using ```node index.js```.

5. Deploy the app. Some scripts are included in the package.json to deploy to Heroku.


## How to use

When you need to fetch a token, post to the token endpoint of the deployed proxy, as if you were posting to the token endpoint directly, but instead set client_secret equal to your verifier.

You can also call using [react-oauth2-authcode-provider](https://github.com/darylbuckle/react-oauth2-authcode-provider).

```tsx
<AuthCodeProvider 
    authenticationProps={{
        authUrl: 'https://www.yourcodeendpoint.com/oauth/authorize',
        callBackPath: '/',
        tokenUrl: 'https://frozen-inlet-97325.herokuapp.com/token', // Your deployed proxy url
        clientId: 'clientId',
        clientSecret: 'verifier',
        scope: 'activity:read',
    }}
/>
```


## License

MIT © [DarylBuckle](https://github.com/DarylBuckle) 2020
