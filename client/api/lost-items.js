// Vercel Serverless Function for Lost Items API
// 간단한 in-memory 저장소 (데모용)

// Note: Vercel Serverless Functions는 stateless이므로 
// 실제 프로덕션에서는 데이터베이스 사용 필요

export default function handler(req, res) {
  console.log(`[API] ${req.method} /api/lost-items`);
  
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    console.log('[API] OPTIONS request - CORS preflight');
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      console.log('[API] GET request - returning empty items');
      // 분실물 목록 조회 (임시로 빈 배열 반환)
      return res.status(200).json({
        success: true,
        items: []
      });
    }

    if (req.method === 'POST') {
      console.log('[API] POST request body:', req.body);
      
      // 분실물 등록
      const body = req.body || {};
      const { item_type, description, location, image_urls, lat, lng, place_name, address, lost_at, created_by_device_id } = body;
      
      console.log('[API] Creating new item with:', { item_type, description, location });
      
      const newItem = {
        id: Date.now(),
        author_id: 1,
        item_type: item_type || 'unknown',
        description: description || '',
        location: location || '',
        lat: lat || null,
        lng: lng || null,
        place_name: place_name || '',
        address: address || '',
        image_urls: image_urls || [],
        created_by_device_id: created_by_device_id || Date.now().toString(),
        lost_at: lost_at || new Date().toISOString(),
        comments: [],
        created_at: new Date().toISOString()
      };

      console.log('[API] New item created:', newItem);

      return res.status(200).json({
        success: true,
        item: newItem,
        message: '분실물이 등록되었습니다.'
      });
    }

    console.log('[API] Method not allowed:', req.method);
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });

  } catch (error) {
    console.error('[API] Error:', error);
    return res.status(500).json({ 
      success: false,
      error: '서버 오류가 발생했습니다.',
      details: error.message 
    });
  }
}

