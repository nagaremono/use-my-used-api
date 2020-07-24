import mongoose from 'mongoose';
import moment from 'moment';

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true },
  price: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: [
      'Computer',
      'Furniture',
      'Mobile Phone',
      'Tools',
      'Vehicle',
      'Electronics',
      'Others',
    ],
  },
  quantity: { type: String, required: true },
  picture: { type: Schema.Types.ObjectId, required: true, ref: 'Picture' },
  seller: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  posted: { type: Date, default: moment() },
});

ItemSchema.virtual('formattedDate').get(function () {
  return moment(this.posted).format('MMMM Do, YYYY, h:mm:ss a');
});

export default mongoose.model('Item', ItemSchema);
