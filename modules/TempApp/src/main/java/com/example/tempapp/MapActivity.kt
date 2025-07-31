package com.example.tempapp

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebChromeClient
import android.content.ActivityNotFoundException
import android.net.Uri
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.tempapp.data.LostItem
import com.example.tempapp.data.LostItemStore



class MapActivity : AppCompatActivity() {

    private lateinit var lostItemStore: LostItemStore

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_map)

        lostItemStore = LostItemStore(this)
        setupWebView()
        setupButtons()
    }

    private fun setupWebView() {
        val webView = findViewById<WebView>(R.id.webView)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.allowFileAccess = true
        webView.settings.allowContentAccess = true
        webView.settings.loadWithOverviewMode = true
        webView.settings.useWideViewPort = true
        webView.settings.mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW

        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(message: String?, lineNumber: Int, sourceID: String?) {
                Log.d("WebView Console", "$message -- From line $lineNumber of $sourceID")
            }
        }

        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                Log.d("MapActivity", "✅ 지도 로딩 완료")
                loadLostItemsOnMap()
            }

            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                url?.let { currentUrl ->
                    if (currentUrl.startsWith("kakaomap://") || currentUrl.startsWith("daummaps://")) {
                        try {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(currentUrl))
                            startActivity(intent)
                            return true
                        } catch (e: ActivityNotFoundException) {
                            Toast.makeText(this@MapActivity, "카카오맵 앱이 설치되어 있지 않습니다.", Toast.LENGTH_SHORT).show()
                            return false
                        }
                    }
                }
                return false
            }
        }

        // 카카오맵 로드
        val kakaoMapUrl = "https://map.kakao.com/"
        webView.loadUrl(kakaoMapUrl)
    }

    private fun loadLostItemsOnMap() {
        val lostItems = lostItemStore.getAllLostItems()
        if (lostItems.isEmpty()) {
            Log.d("MapActivity", "등록된 분실물이 없습니다.")
            return
        }

        val itemsJson = createItemsJson(lostItems)
        val script = """
            (function() {
                if (typeof kakao !== 'undefined' && kakao.maps) {
                    kakao.maps.load(function() {
                        var map = new kakao.maps.Map(document.getElementById('map'), {
                            center: new kakao.maps.LatLng(37.5665, 126.9780),
                            level: 7
                        });
                        
                        var items = $itemsJson;
                        var bounds = new kakao.maps.LatLngBounds();
                        
                        items.forEach(function(item, index) {
                            var position = new kakao.maps.LatLng(item.latitude, item.longitude);
                            
                            // 마커 생성
                            var marker = new kakao.maps.Marker({
                                position: position,
                                map: map
                            });
                            
                            // 마커 색상 설정 (본인 아이템은 파란색, 다른 사람은 주황색)
                            if (item.isMyItem) {
                                marker.setZIndex(1);
                            }
                            
                            // 인포윈도우 생성
                            var content = '<div style="padding:10px;min-width:200px;">' +
                                '<h4 style="margin:0 0 5px 0;color:' + (item.isMyItem ? '#2196F3' : '#FF9800') + ';">' +
                                (item.isMyItem ? '내 분실물' : '분실물') + '</h4>' +
                                '<p style="margin:0 0 5px 0;font-size:14px;">' + item.description + '</p>' +
                                '<p style="margin:0;font-size:12px;color:#666;">등록: ' + 
                                new Date(item.registeredAt).toLocaleString() + '</p>' +
                                '</div>';
                            
                            var infowindow = new kakao.maps.InfoWindow({
                                content: content
                            });
                            
                            // 마커 클릭 이벤트
                            kakao.maps.event.addListener(marker, 'click', function() {
                                infowindow.open(map, marker);
                            });
                            
                            bounds.extend(position);
                        });
                        
                        // 모든 마커가 보이도록 지도 범위 조정
                        map.setBounds(bounds);
                    });
                }
            })();
        """.trimIndent()

        val webView = findViewById<WebView>(R.id.webView)
        webView.evaluateJavascript(script, null)
    }

    private fun setupButtons() {
        findViewById<android.widget.ImageButton>(R.id.btnBack).setOnClickListener {
            finish()
        }

        findViewById<android.widget.ImageButton>(R.id.btnRefresh).setOnClickListener {
            loadLostItemsOnMap()
            Toast.makeText(this, "지도를 새로고침했습니다.", Toast.LENGTH_SHORT).show()
        }
    }
    
    private fun createItemsJson(items: List<LostItem>): String {
        val jsonItems = items.map { item ->
            """
            {
                "id": "${item.id}",
                "description": "${item.description.replace("\"", "\\\"")}",
                "latitude": ${item.latitude},
                "longitude": ${item.longitude},
                "registeredAt": "${item.registeredAt}",
                "isMyItem": ${item.isMyItem}
            }
            """.trimIndent()
        }
        return "[${jsonItems.joinToString(",")}]"
    }
} 