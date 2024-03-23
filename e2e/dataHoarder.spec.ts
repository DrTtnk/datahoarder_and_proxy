// tests/e2e.test.ts
import request from 'supertest';

describe('Service E2E Test', () => {
  const serviceUrl = process.env['CLUSTER']!;
  let accessToken: string;

  const someDoc = {
    id: 'some-id',
    name: 'some-name',
    content: 'some-content',
  };

  beforeAll(async () => {
    const response = await request(serviceUrl).post('/login').send();

    accessToken = response.body.accessToken;

    console.log(`Access token: ${accessToken}`);
  });

  it('should get all documents', async () => {
    const response = await request(serviceUrl)
      .get('/documents')
      .set('authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it('should create a document', async () => {
    const response = await request(serviceUrl)
      .post('/documents')
      .send(someDoc)
      .set('authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(someDoc);
  });

  it('should get a specific document', async () => {
    const documentId = 'some-id';
    const response = await request(serviceUrl)
      .get(`/documents/${documentId}`)
      .set('authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(someDoc);
  });

  it('should update a document', async () => {
    const document = {
      id: someDoc.id,
      name: 'some-name',
      content: 'some-updated-content',
    };

    const response = await request(serviceUrl)
      .post('/documents')
      .send(document)
      .set('authorization', `Bearer ${accessToken}`);
    expect(response.status).toBe(200);

    const updatedResponse = await request(serviceUrl)
      .get(`/documents/${document.id}`)
      .set('authorization', `Bearer ${accessToken}`);

    expect(updatedResponse.status).toBe(200);
    expect(updatedResponse.body).toMatchObject(document);
  });
});
