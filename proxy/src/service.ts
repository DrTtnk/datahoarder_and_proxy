import axios, { AxiosResponse } from 'axios';
import { BlobDocument, documentRepo } from './repo';

export const dataHoarder = process.env['DATAHOARDER_URL']!;

const tap =
  <T>(fn: (arg: T) => Promise<unknown>) =>
  async (arg: T) => {
    await fn(arg);
    return arg;
  };

const withAuth = async (
  fn: (auth: { headers: { Authorization: string } }) => Promise<AxiosResponse>,
) =>
  axios
    .post(`${dataHoarder}/login`)
    .then(({ data }) => fn({ headers: { Authorization: `Bearer ${data.accessToken}` } }));

export const getDocuments = async () =>
  withAuth((auth) => axios.get(`${dataHoarder}/documents`, auth))
    .then((_) => _.data as BlobDocument[])
    .then(tap((data) => Promise.all(data.map(documentRepo.upsertDocument))));

export const getDocument = async (id: string) =>
  withAuth((auth) => axios.get(`${dataHoarder}/documents/${id}`, auth))
    .then((_) => _.data as BlobDocument)
    .then(tap(documentRepo.upsertDocument));

export const saveDocument = async (document: BlobDocument) =>
  withAuth((auth) => axios.post(`${dataHoarder}/documents`, document, auth)).then(
    (_) => _.data as BlobDocument,
  );

export const deleteDocument = async (id: string) =>
  withAuth((auth) => axios.delete(`${dataHoarder}/documents/${id}`, auth)).then(() =>
    documentRepo.deleteDocument(id),
  );
