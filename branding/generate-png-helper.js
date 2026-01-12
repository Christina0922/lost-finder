const fs = require('fs');
const path = require('path');

// PNG 생성을 위한 간단한 HTML 생성 (브라우저에서 렌더링용)
const sizes = [1024, 512, 192, 128, 64, 48, 32, 16];

const svgMark = fs.readFileSync(path.join(__dirname, 'logo-mark.svg'), 'utf8');
const svgLockup = fs.readFileSync(path.join(__dirname, 'logo-lockup.svg'), 'utf8');

// PNG 디렉토리 생성
const pngDir = path.join(__dirname, 'png');
const iconsDir = path.join(__dirname, 'icons');

if (!fs.existsSync(pngDir)) fs.mkdirSync(pngDir, { recursive: true });
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

// 각 SVG를 data URL로 변환
const svgMarkDataUrl = 'data:image/svg+xml;base64,' + Buffer.from(svgMark).toString('base64');
const svgLockupDataUrl = 'data:image/svg+xml;base64,' + Buffer.from(svgLockup).toString('base64');

// HTML 생성 (Canvas를 사용한 변환)
const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Logo PNG Generator</title>
</head>
<body>
  <h2>LostFinder Logo PNG 생성기</h2>
  <p>아래 이미지를 우클릭하여 저장하세요</p>
  
  <h3>심볼 로고</h3>
  ${sizes.map(size => `
    <div style="margin: 20px 0;">
      <h4>${size}x${size}</h4>
      <canvas id="mark-${size}" width="${size}" height="${size}" style="border: 1px solid #ccc;"></canvas>
      <br>
      <a id="download-mark-${size}" download="logo-mark-${size}.png">다운로드</a>
    </div>
  `).join('')}
  
  <h3>워드마크 로고</h3>
  <div style="margin: 20px 0;">
    <h4>1024x326</h4>
    <canvas id="lockup-1024" width="1024" height="326" style="border: 1px solid #ccc;"></canvas>
    <br>
    <a id="download-lockup-1024" download="logo-lockup-1024.png">다운로드</a>
  </div>
  
  <script>
    // 심볼 로고 렌더링
    const svgMark = '${svgMarkDataUrl}';
    ${sizes.map(size => `
      {
        const canvas = document.getElementById('mark-${size}');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = function() {
          ctx.clearRect(0, 0, ${size}, ${size});
          ctx.drawImage(img, 0, 0, ${size}, ${size});
          
          const link = document.getElementById('download-mark-${size}');
          link.href = canvas.toDataURL('image/png');
        };
        img.src = svgMark;
      }
    `).join('')}
    
    // 워드마크 로고 렌더링
    const svgLockup = '${svgLockupDataUrl}';
    {
      const canvas = document.getElementById('lockup-1024');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = function() {
        ctx.clearRect(0, 0, 1024, 326);
        ctx.drawImage(img, 0, 0, 1024, 326);
        
        const link = document.getElementById('download-lockup-1024');
        link.href = canvas.toDataURL('image/png');
      };
      img.src = svgLockup;
    }
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'generate-pngs.html'), html);

console.log('✅ PNG 생성기가 생성되었습니다!');
console.log('📂 branding/generate-pngs.html 파일을 브라우저에서 열어 PNG를 다운로드하세요.');
console.log('');
console.log('필요한 PNG 파일:');
console.log('  - logo-mark-1024.png → branding/png/');
sizes.forEach(size => {
  console.log(`  - logo-mark-${size}.png → branding/icons/${size <= 48 ? 'favicon' : 'app-icon'}-${size}.png`);
});
console.log('  - logo-lockup-1024.png → branding/png/');

