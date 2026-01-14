// Vercel Serverless Function for Lost Items API
// 간단한 in-memory 저장소 (데모용)

// Note: Vercel Serverless Functions는 stateless이므로 
// 실제 프로덕션에서는 데이터베이스 사용 필요

export default function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // 분실물 목록 조회 (임시로 빈 배열 반환)
      return res.status(200).json({
        success: true,
        items: []
      });
    }

    if (req.method === 'POST') {
      // 분실물 등록
      const { item_type, description, location, image_urls } = req.body || {};
      
      const newItem = {
        id: Date.now(),
        author_id: 1,
        item_type: item_type || 'unknown',
        description: description || '',
        location: location || '',
        image_urls: image_urls || [],
        created_by_device_id: Date.now().toString(),
        comments: [],
        created_at: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        item: newItem,
        message: '분실물이 등록되었습니다.'
      });
    }

    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false,
      error: '서버 오류가 발생했습니다.',
      details: error.message 
    });
  }
}

