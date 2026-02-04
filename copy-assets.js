/**
 * copy-assets.js
 * 
 * 웹 빌드 결과물을 안드로이드 assets 폴더로 자동 복사하는 스크립트
 * 
 * 사용법:
 * - npm run build 후 자동 실행 (postbuild)
 * - 또는 수동 실행: node copy-assets.js
 * 
 * 위치: 프로젝트 루트 (D:\1000_b_project\lostfinder\copy-assets.js)
 */

const fs = require('fs');
const path = require('path');

// 프로젝트 루트 디렉토리 (이 스크립트가 있는 위치)
const PROJECT_ROOT = __dirname;

// React 빌드 산출물 위치
const SOURCE_DIR = path.join(PROJECT_ROOT, 'client', 'build');

// Android assets 위치
const TARGET_DIR = path.join(PROJECT_ROOT, 'app', 'src', 'main', 'assets');

console.log('🚀 웹 빌드 결과물을 안드로이드 assets로 복사 시작...');
console.log('프로젝트 루트:', PROJECT_ROOT);
console.log('소스:', SOURCE_DIR);
console.log('대상:', TARGET_DIR);
console.log('');

// 소스 디렉토리 확인
if (!fs.existsSync(SOURCE_DIR)) {
    console.error('❌ 오류: client/build 폴더가 없습니다.');
    console.error('   경로:', SOURCE_DIR);
    console.error('   먼저 "cd client && npm run build"를 실행하세요.');
    process.exit(1);
}

// index.html 존재 확인
const sourceIndexHtml = path.join(SOURCE_DIR, 'index.html');
if (!fs.existsSync(sourceIndexHtml)) {
    console.error('❌ 오류: client/build/index.html이 없습니다.');
    console.error('   경로:', sourceIndexHtml);
    console.error('   빌드가 제대로 완료되지 않았습니다.');
    process.exit(1);
}

console.log('✓ 소스 디렉토리 확인됨');
console.log('✓ index.html 확인됨');
console.log('');

// 대상 디렉토리 부모 폴더들 생성 (app/src/main/assets)
const targetParent = path.dirname(TARGET_DIR);
if (!fs.existsSync(targetParent)) {
    console.log('📁 부모 디렉토리 생성 중:', targetParent);
    fs.mkdirSync(targetParent, { recursive: true });
}

// 대상 디렉토리 생성
if (!fs.existsSync(TARGET_DIR)) {
    console.log('📁 assets 폴더 생성 중:', TARGET_DIR);
    fs.mkdirSync(TARGET_DIR, { recursive: true });
} else {
    console.log('📁 assets 폴더 이미 존재:', TARGET_DIR);
}
console.log('');

/**
 * 디렉토리 전체 복사 함수
 */
function copyDirectory(src, dest) {
    // 대상 디렉토리 생성
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    // 소스 디렉토리의 모든 항목 읽기
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            // 디렉토리인 경우 재귀적으로 복사
            copyDirectory(srcPath, destPath);
        } else {
            // 파일인 경우 복사
            fs.copyFileSync(srcPath, destPath);
            console.log('  ✓', path.relative(SOURCE_DIR, srcPath));
        }
    }
}

// 기존 assets 폴더 내용 삭제 (깨끗한 복사)
if (fs.existsSync(TARGET_DIR)) {
    console.log('🗑️  기존 assets 폴더 내용 삭제 중...');
    fs.rmSync(TARGET_DIR, { recursive: true, force: true });
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// 복사 실행
try {
    copyDirectory(SOURCE_DIR, TARGET_DIR);
    console.log('');
    
    // ===== 검증: index.html이 제대로 복사되었는지 확인 =====
    const indexHtmlPath = path.join(TARGET_DIR, 'index.html');
    if (!fs.existsSync(indexHtmlPath)) {
        console.error('❌ 오류: index.html이 복사되지 않았습니다!');
        console.error('   경로:', indexHtmlPath);
        process.exit(1);
    }
    
    // index.html 내용 확인 (보라색 화면 빌드인지 검증)
    const indexContent = fs.readFileSync(indexHtmlPath, 'utf8');
    if (!indexContent.includes('root') || !indexContent.includes('LostFinder')) {
        console.warn('⚠️  경고: index.html 내용이 예상과 다를 수 있습니다.');
    }
    
    // static 폴더 확인
    const staticDir = path.join(TARGET_DIR, 'static');
    if (!fs.existsSync(staticDir)) {
        console.warn('⚠️  경고: static 폴더가 복사되지 않았습니다.');
    } else {
        console.log('   ✓ static 폴더 확인됨');
    }
    
    console.log('');
    console.log('✅ 복사 완료!');
    console.log('   ✓ index.html 확인됨');
    console.log('   ✓ assets 폴더 준비 완료');
    console.log('   ✓ 경로:', TARGET_DIR);
    console.log('');
    console.log('📱 다음 단계:');
    console.log('   1. Android Studio에서 File → Sync Project with Gradle Files');
    console.log('   2. Build → Clean Project');
    console.log('   3. Build → Rebuild Project');
    console.log('   4. 앱을 실행하면 보라색 화면이 표시됩니다');
    console.log('   5. 이전 앱이 설치되어 있다면 삭제 후 재설치하세요 (캐시 제거)');
} catch (error) {
    console.error('❌ 복사 중 오류 발생:', error);
    process.exit(1);
}

