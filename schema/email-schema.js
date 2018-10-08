const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema(
  {
    content: {
      type: String,
    },
    to: { type: String },
    from: { type: Object },
    subject: { type: String },
  },
  {
    timestamps: true,
    collection: 'email',
  }
);
const EmailModel = mongoose.model('email', EmailSchema);

module.exports = EmailModel;
