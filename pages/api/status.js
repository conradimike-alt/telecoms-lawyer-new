import Replicate from "replicate";

export default async function handler(req, res) {
  const { id } = req.query;
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });
  try {
    const prediction = await replicate.predictions.get(id);
    res.status(200).json(prediction);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}