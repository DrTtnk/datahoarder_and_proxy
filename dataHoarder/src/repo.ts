import M, { Schema, Document } from 'mongoose';

const connectWithRetry = (connection: string, name: string, reties: number) => {
  console.log(`Connecting to MongoDB ${name} [${connection}]...`);
  return M.connect(connection!, { connectTimeoutMS: 5000, socketTimeoutMS: 5000 })
    .then(() => console.log(`Connected to MongoDB ${name}!`))
    .catch(async (e) => {
      console.error(`Failed to connect to MongoDB ${name}:`, e);
      if (reties <= 0) {
        console.error('Retries exhausted. Exiting...');
        process.exit(1);
      }
      console.log('Retrying...');
      await connectWithRetry(connection, name, reties - 1);
    });
};

connectWithRetry(process.env['DATAHOARDER_DB']!, 'DataHoarder', 5);

export type BlobDocument = {
  id: string;
  name: string;
  content: any;
};
type StoredBlobDocument = Document & BlobDocument;

const StoredBlobDocumentSchema = new Schema({
  _id: { type: String, default: () => new M.Types.ObjectId().toString() },
  id: { type: String, required: true },
  name: { type: String, required: true },
  content: { type: Schema.Types.Mixed, required: true },
});

const StoredBlobDocument = M.model<StoredBlobDocument>(
  'StoredBlobDocument',
  StoredBlobDocumentSchema,
);

export const documentRepo = {
  getDocuments: () => StoredBlobDocument.find(),

  getDocument: (id: string) => StoredBlobDocument.findOne({ id }),

  upsertDocument: (document: BlobDocument) =>
    StoredBlobDocument.findOneAndUpdate({ id: document.id }, document, { upsert: true, new: true }),

  deleteDocument: (id: string) => StoredBlobDocument.deleteOne({ id }),
};
