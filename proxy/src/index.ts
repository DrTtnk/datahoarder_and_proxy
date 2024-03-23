import express, { ErrorRequestHandler, Handler } from 'express';
import { expressjwt } from 'express-jwt';
import * as jwt from 'jsonwebtoken';
import * as DHS from './service';

const authSecret = process.env['PROXY_TOKEN_SECRET']!;

const authenticated = expressjwt({
  secret: authSecret,
  algorithms: ['HS256'],
});

const defaultErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err.stack);
  if (err.name === 'UnauthorizedError') {
    res.status(401).send({ error: 'Unauthorized' });
  } else {
    res.status(500).send({ error: 'Something went wrong!' });
  }
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

  .use(express.urlencoded({ extended: true }))
  .use(loggerMiddleware)

  .get('/health', (_, res) => res.sendStatus(200))

  .post('/documents', authenticated, (req, res) =>
    DHS.saveDocument(req.body).then((doc) => res.json(doc)),
  )

  .get('/documents', authenticated, (_, res) => DHS.getDocuments().then((doc) => res.json(doc)))

  .get('/documents/:id', authenticated, (req, res) =>
    DHS.getDocument(req.params['id']!).then((doc) => res.json(doc)),
  )

  .delete('/documents/:id', authenticated, (req, res) =>
    DHS.deleteDocument(req.params['id']!).then(() => res.sendStatus(204)),
  )

  .use(defaultErrorHandler)

  .listen(3000, () => console.log('Proxy running on port 3000'));
