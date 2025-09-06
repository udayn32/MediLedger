import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema(
  {
    email: { type: String, unique: true, required: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String },
    role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  // Optional off-chain profile details (rendered in patient dashboard)
  avatarCid: { type: String }, // IPFS CID for avatar image
  profileCid: { type: String }, // IPFS CID for extended profile JSON
  phone: { type: String },
  address: { type: String }, // physical address or wallet; free-form
  gender: { type: String },
  bloodGroup: { type: String },
  dob: { type: String }, // ISO date string (kept as string to avoid TZ surprises)
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export default models.User || model('User', UserSchema);
