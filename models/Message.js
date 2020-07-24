import mongoose from 'mongoose';
import moment from 'moment';

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User' },
  receiver: { type: Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true },
  timePosted: { type: Date, default: moment() },
});

messageSchema.virtual('formattedDate').get(function () {
  return moment(this.posted).format('MMMM Do, YYYY, h:mm:ss a');
});

export default mongoose.model('Message', messageSchema);
