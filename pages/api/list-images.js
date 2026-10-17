import { list } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    const { blobs } = await list({ limit: 200 });
    blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    return res.status(200).json(blobs);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
