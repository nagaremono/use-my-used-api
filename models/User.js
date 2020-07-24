import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, maxlength: 25 },
  password: { type: String, required: true, minlength: 8 },
  items: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
  isAdmin: { type: Boolean, default: false, required: true },
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
});

export default mongoose.model('User', userSchema);
