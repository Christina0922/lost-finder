package com.temp.app

import android.content.Context
import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebSettings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.temp.app.ui.theme.TempAppTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        // 앱 데이터 완전 삭제 (개발용)
        try {
            deleteDatabase("webview.db")
            deleteDatabase("webviewCache.db")
        } catch (e: Exception) {
            // 데이터베이스가 없으면 무시
        }
        
        setContent {
            TempAppTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    WebViewScreen(
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }
}

@Composable
fun WebViewScreen(modifier: Modifier = Modifier) {
    AndroidView(
        factory = { context ->
            WebView(context).apply {
                webViewClient = object : WebViewClient() {
                    override fun onPageFinished(view: WebView?, url: String?) {
                        super.onPageFinished(view, url)
                        // 페이지 로드 완료 후 JavaScript로 강제 새로고침
                        view?.evaluateJavascript("window.location.reload(true);", null)
                    }
                }
                
                settings.apply {
                    javaScriptEnabled = true
                    domStorageEnabled = true
                    loadWithOverviewMode = true
                    useWideViewPort = true
                    builtInZoomControls = true
                    displayZoomControls = false
                    setSupportZoom(true)
                    mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                    cacheMode = WebSettings.LOAD_NO_CACHE // 캐시 완전 비활성화
                    setAppCacheEnabled(false) // 앱 캐시 비활성화
                    databaseEnabled = false // 데이터베이스 캐시 비활성화
                }
                
                // 모든 캐시 완전 클리어
                clearCache(true)
                clearHistory()
                clearFormData()
                
                // React 앱 로드 (개발 서버) - 실제 PC IP 주소 사용
                val timestamp = System.currentTimeMillis()
                loadUrl("http://172.30.1.44:3000?t=$timestamp")
                
                // 프로덕션용 (실제 서버)
                // loadUrl("https://your-domain.com")
            }
        },
        modifier = modifier.fillMaxSize()
    )
}
