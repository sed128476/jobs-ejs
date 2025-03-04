import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const PaymentSchema = new mongoose.Schema({
  cardNumber: {
    type: String,
    required: [true, 'Please provide card number'],
  },
  securityCode: {
    type: String,
    required: [true, 'Please provide security code'],
  },
  expireDate: {
    type: String,
    required: [true, 'Please provide expiry date'],
  },
  zipCode: {
    type: String,
    required: [true, 'Please provide zip code'],
    validate: {
      validator: function(v) {
        return /\d{5}/.test(v);
      },
      message: props => `${props.value} is not a valid zip code!`
    }
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide user'],
  },
}, 
{ timestamps: true }
);

PaymentSchema.pre('save', async function () {
  const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS) || 10);
  this.securityCode = await bcrypt.hash(this.securityCode, salt);
});

PaymentSchema.methods.compareSecurityCode = async function (candidateSecurityCode) {
  const isMatch = await bcrypt.compare(candidateSecurityCode, this.securityCode);
  return isMatch;
};

export default mongoose.model('Payment', PaymentSchema);
