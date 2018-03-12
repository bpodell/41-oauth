Run an npm i install on both your front end and back end directories. 

In the front end directory run live-server to get your local host running. 
In the back end directory run npm run start:watch to get the server running. 

In the .env file in the backend set up: 
```
PORT=3000
API_URL='http://localhost:3000'
CLIENT_URL='http://localhost:8080'
GOOGLE_OAUTH_ID=
GOOGLE_OAUTH_SECRET=
```

When you click on sigin you should be redirected to a google api where you can select your account. On success you will be redirected to the home page and you will see a console log of your google information on your backend server. On an error you will be redirected to a /error page and you will see your error on the backend server. 