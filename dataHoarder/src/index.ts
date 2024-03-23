import express, { ErrorRequestHandler, Handler } from 'express';
import { documentRepo } from './repo';
import { expressjwt } from 'express-jwt';
import * as jwt from 'jsonwebtoken';

const authSecret = process.env['DATAHOARDER_TOKEN_SECRET']!;

const authenticated = expressjwt({
  secret: authSecret,
  algorithms: ['HS256'],
});

const defaultErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
};

const loggerMiddleware: Handler = (req, _res, next) => {
  console.log(`${req.method} ${req.path}`, JSON.stringify(req.body));
  next();
};

express()
  .use(express.json())

  .post('/login', (_, res) =>
    res.json({ accessToken: jwt.sign({ name: 'superuser' }, authSecret, { expiresIn: '1h' }) }),
  )

  .use(loggerMiddleware)
  .use(express.urlencoded({ extended: true }))

  .get('/health', (_, res) => res.sendStatus(200))

  .post('/documents', authenticated, (req, res) =>
    documentRepo.upsertDocument(req.body).then((doc) => res.json(doc)),
  )

  .get('/documents', authenticated, (_, res) =>
    documentRepo.getDocuments().then((doc) => res.json(doc)),
  )

  .get('/documents/:id', authenticated, (req, res) =>
    documentRepo
      .getDocument(req.params['id']!)
      .then((doc) => (doc ? res.json(doc) : res.sendStatus(404))),
  )

  .delete('/documents/:id', authenticated, (req, res) =>
    documentRepo.deleteDocument(req.params['id']!).then(() => res.sendStatus(204)),
  )

  .use(defaultErrorHandler)

  .listen(3000, () => console.log('DataHoarder running on port 3000'));
