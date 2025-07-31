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

import java.text.SimpleDateFormat
import java.util.*

class RegisterActivity : AppCompatActivity() {

    private lateinit var lostItemStore: LostItemStore
    private var selectedLatitude: Double = 37.5665 // 서울시청 기본값
    private var selectedLongitude: Double = 126.9780

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

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
                Log.d("RegisterActivity", "✅ 지도 로딩 완료")
                injectLocationSelectionScript()
            }

            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                url?.let { currentUrl ->
                    if (currentUrl.startsWith("kakaomap://") || currentUrl.startsWith("daummaps://")) {
                        try {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(currentUrl))
                            startActivity(intent)
                            return true
                        } catch (e: ActivityNotFoundException) {
                            Toast.makeText(this@RegisterActivity, "카카오맵 앱이 설치되어 있지 않습니다.", Toast.LENGTH_SHORT).show()
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

    private fun injectLocationSelectionScript() {
        val script = """
            (function() {
                // 지도 클릭 이벤트 추가
                if (typeof kakao !== 'undefined' && kakao.maps) {
                    kakao.maps.load(function() {
                        var map = new kakao.maps.Map(document.getElementById('map'), {
                            center: new kakao.maps.LatLng($selectedLatitude, $selectedLongitude),
                            level: 7
                        });
                        
                        // 지도 클릭 이벤트
                        kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
                            var latlng = mouseEvent.latLng;
                            selectedLatitude = latlng.getLat();
                            selectedLongitude = latlng.getLng();
                            
                            // 마커 추가
                            var marker = new kakao.maps.Marker({
                                position: latlng
                            });
                            marker.setMap(map);
                            
                            // Android에 좌표 전달
                            Android.onLocationSelected(selectedLatitude, selectedLongitude);
                        });
                    });
                }
            })();
        """.trimIndent()

        val webView = findViewById<WebView>(R.id.webView)
        webView.evaluateJavascript(script, null)
    }

    private fun setupButtons() {
        findViewById<android.widget.Button>(R.id.btnRegister).setOnClickListener {
            val description = findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.etDescription).text.toString().trim()
            
            // 강화된 유효성 검사
            when {
                description.isEmpty() -> {
                    Toast.makeText(this, "설명을 입력해주세요.", Toast.LENGTH_SHORT).show()
                    findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.etDescription).requestFocus()
                    return@setOnClickListener
                }
                description.length < 3 -> {
                    Toast.makeText(this, "설명은 최소 3글자 이상 입력해주세요.", Toast.LENGTH_SHORT).show()
                    findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.etDescription).requestFocus()
                    return@setOnClickListener
                }
                description.length > 100 -> {
                    Toast.makeText(this, "설명은 최대 100글자까지 입력 가능합니다.", Toast.LENGTH_SHORT).show()
                    findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.etDescription).requestFocus()
                    return@setOnClickListener
                }
                selectedLatitude == 37.5665 && selectedLongitude == 126.9780 -> {
                    Toast.makeText(this, "지도에서 위치를 선택해주세요.", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }
            }

            // 분실물 등록 (점수 시스템 추가)
            val lostItem = LostItem(
                description = description,
                latitude = selectedLatitude,
                longitude = selectedLongitude,
                isMyItem = true
            )

            lostItemStore.addLostItem(lostItem)
            
            // 점수 계산 및 표시
            val score = calculateScore(description)
            Toast.makeText(this, "분실물이 등록되었습니다! (+${score}점)", Toast.LENGTH_LONG).show()
            
            // 메인 화면으로 돌아가기
            finish()
        }

        findViewById<android.widget.ImageButton>(R.id.btnBack).setOnClickListener {
            finish()
        }
    }

    // JavaScript에서 호출할 함수
    fun onLocationSelected(lat: Double, lng: Double) {
        selectedLatitude = lat
        selectedLongitude = lng
        Log.d("RegisterActivity", "위치 선택됨: $lat, $lng")
    }
    
    // 점수 계산 함수
    private fun calculateScore(description: String): Int {
        var score = 10 // 기본 점수
        
        // 설명 길이에 따른 보너스 점수
        when {
            description.length >= 20 -> score += 5
            description.length >= 10 -> score += 3
            description.length >= 5 -> score += 1
        }
        
        // 특정 키워드에 따른 보너스 점수
        val keywords = listOf("지갑", "핸드폰", "노트북", "카드", "열쇠", "가방", "시계", "반지")
        keywords.forEach { keyword ->
            if (description.contains(keyword)) {
                score += 2
            }
        }
        
        return score
    }
} 