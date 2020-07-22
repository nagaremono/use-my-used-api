import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const PictureSchema = new Schema({
  image: { data: Buffer, contentType: String },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
});

export default mongoose.model('Picture', PictureSchema);
