import type { VercelRequest, VercelResponse } from '@vercel/node';

// 간단한 in-memory 저장소 (데모용)
let items: any[] = [];
let itemIdCounter = 1;

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // 분실물 목록 조회
    return res.status(200).json({
      success: true,
      items: items
    });
  }

  if (req.method === 'POST') {
    // 분실물 등록
    const { item_type, description, location, image_urls } = req.body;
    
    const newItem = {
      id: itemIdCounter++,
      author_id: 1,
      item_type,
      description,
      location,
      image_urls: image_urls || [],
      created_by_device_id: Date.now().toString(),
      comments: [],
      created_at: new Date().toISOString()
    };

    items.push(newItem);

    return res.status(200).json({
      success: true,
      item: newItem
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

