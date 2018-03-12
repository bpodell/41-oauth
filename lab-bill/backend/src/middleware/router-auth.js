'use strict'

import {Router} from 'express'
import User from '../model/user.js'
import parserBody from './parser-body.js'
import {basicAuth} from './parser-auth.js'
import {log, daysToMilliseconds} from '../lib/util.js'
require('dotenv').config();
const GOOGLE_OAUTH_URL = 'https://www.googleapis.com/oauth2/v4/token';
const OPEN_ID_URL = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
const superagent = require('superagent');

export default new Router()
.post('/signup', parserBody, (req, res, next) => {
  log('__ROUTE__ POST /signup')

  new User.create(req.body)
  .then(user => user.tokenCreate())
  .then(token => {
    res.cookie('X-Sluggram-Token', token, {maxAge: 900000})
    res.cookie('snark-in-the-dark', 'hahahah', {maxAge: 900000})

    res.send(token)
  })
  .catch(next)
})
.get('/usernames/:username', (req, res, next) => {
  User.findOne({username: username})
  .then(user => {
    if(!user)
      return res.sendStatus(409)
    return res.sendStatus(200)
  })
  .catch(next)
})
.get('/login', basicAuth, (req, res, next) => {
  log('__ROUTE__ GET /login')
  req.user.tokenCreate()
  .then((token) => {
    let cookieOptions = {maxAge: daysToMilliseconds(7)}
    res.cookie('X-Sluggram-Token', token, cookieOptions)
    res.send(token)
  })
  .catch(next)
})
.get('/oauth/google',(request,response) => {

  if(!request.query.code){
    response.redirect(process.env.CLIENT_URL);
  } else {
    console.log('__CODE__',request.query.code);
    // console.log('__CODE__',process.env.GOOGLE_OAUTH_ID);
    // console.log('__CODE__',process.env.GOOGLE_OAUTH_SECRET);
    // console.log('__CODE__',`${process.env.API_URL}/oauth/google`);

    return superagent.post(GOOGLE_OAUTH_URL)
      .type('form')
      .send({
        code: request.query.code,
        grant_type: 'authorization_code',
        client_id: process.env.GOOGLE_OAUTH_ID,
        client_secret: process.env.GOOGLE_OAUTH_SECRET,
        redirect_uri: `${process.env.API_URL}/oauth/google`,
      })
      .then(tokenResponse => {

        console.log('Step 3.2 - GOOGLE TOKEN');

        if(!tokenResponse.body.access_token)
          response.redirect(process.env.CLIENT_URL);

        const token = tokenResponse.body.access_token;
        return superagent.get(OPEN_ID_URL)
          .set('Authorization', `Bearer ${token}`);
      })
      .then(openIDResponse => {
        console.log('Back from OpenID');
        console.log(openIDResponse.body);
        response.cookie('X-401d21-OAuth-Token','My Token!');
        response.redirect(process.env.CLIENT_URL);
      })
      .catch(error => {
        console.log('__ERROR__', error.message);
        response.cookie('X-401d21-OAuth-Token','');
        response.redirect(process.env.CLIENT_URL + '?error=oauth');
      });
  }
});
