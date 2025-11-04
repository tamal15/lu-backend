import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  img: { type: String, default: "" },
  title: { type: String, default: "" },
  category: { type: String, default: "" },
  subCategory: { type: String, default: "" },
  _id: { type: String } // keep the string id you provided
}, {_id:false});

const CardDataSchema = new mongoose.Schema({
  footer: { type: String, default: "" },
  items: { type: [ItemSchema], default: [] },
  _id: { type: String }
}, {_id:false});

const BannerSchema = new mongoose.Schema({
  _id: { type: String },
  category: { type: String, default: "" },
  subCategory: { type: String, default: "" },
  cardsData: { type: [CardDataSchema], default: [] },
  backgroundImages: { type: [String], default: [] },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false, timestamps: true });

export default mongoose.model("Banner", BannerSchema, "categorybanner");
