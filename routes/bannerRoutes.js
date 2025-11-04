import express from "express";
const router = express.Router();
import  Banner from "../models/Banner.js";

// GET all banners
router.get("/", async (req, res) => {
  try {
    const banners = await Banner.find({});
    res.json(banners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update a whole banner (category / subCategory / cardsData)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    update.updatedAt = new Date();
    const updated = await Banner.findOneAndUpdate({ _id: id }, update, { new: true, upsert: true });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update a specific item inside a card
router.put("/:bannerId/card/:cardId/item/:itemId", async (req, res) => {
  try {
    const { bannerId, cardId, itemId } = req.params;
    const payload = req.body; // fields to update (img, title, category, subCategory)
    const banner = await Banner.findOne({ _id: bannerId });
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    let card = banner.cardsData.find(c => c._id === cardId);
    if (!card) return res.status(404).json({ message: "Card not found" });

    let item = card.items.find(i => i._id === itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // update only provided fields
    Object.keys(payload).forEach(k => item[k] = payload[k]);
    banner.updatedAt = new Date();
    await banner.save();
    res.json(banner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update a card footer or card-level fields
router.put("/:bannerId/card/:cardId", async (req, res) => {
  try {
    const { bannerId, cardId } = req.params;
    const payload = req.body; // footer etc.
    const banner = await Banner.findOne({ _id: bannerId });
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    let card = banner.cardsData.find(c => c._id === cardId);
    if (!card) return res.status(404).json({ message: "Card not found" });

    Object.keys(payload).forEach(k => card[k] = payload[k]);
    banner.updatedAt = new Date();
    await banner.save();
    res.json(banner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update backgroundImages of first banner
router.put("/:bannerId/update-background", async (req, res) => {
  try {
    const { bannerId } = req.params;
    const { backgroundImages } = req.body; // expect an array of URLs

    if (!Array.isArray(backgroundImages))
      return res.status(400).json({ message: "backgroundImages must be an array" });

    const banner = await Banner.findOne({ _id: bannerId });
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    banner.backgroundImages = backgroundImages;
    banner.updatedAt = new Date();
    await banner.save();

    res.json(banner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
