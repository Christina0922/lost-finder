package com.example.tempapp

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    // ◼ 쿠팡 파트너스 링크: 순환 오픈
    private val coupangLinks = listOf(
        "https://link.coupang.com/a/cIFtru", // 🚨 뇌울림 3.0 PRO 도난방지 경보기
        "https://link.coupang.com/a/cIFumx", // 📍 갤럭시 스마트태그2 위치추적
        "https://link.coupang.com/a/cIFuZl", // 🔒 레오바니 자물쇠
        "https://link.coupang.com/a/cIFvsF", // 🍏 Apple 에어태그
        "https://link.coupang.com/a/cIFv4K"  // 🧷 스프링 고리형 스트랩 (5개)
    )
    private val prefName = "coupang_prefs"
    private val keyIndex = "last_index"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // 헤더 버튼들 설정
        findViewById<TextView>(R.id.tvTitle).setOnClickListener {
            // 이미 초기화면이므로 아무것도 하지 않음
            Toast.makeText(this, "이미 초기화면입니다", Toast.LENGTH_SHORT).show()
        }
        
        findViewById<LinearLayout>(R.id.btnBack).setOnClickListener {
            // 이미 초기화면이므로 아무것도 하지 않음
            Toast.makeText(this, "이미 초기화면입니다", Toast.LENGTH_SHORT).show()
        }

        findViewById<LinearLayout>(R.id.btnLogin).setOnClickListener {
            val intent = Intent(this, WebViewActivity::class.java)
            intent.putExtra("url", "http://192.168.45.27:3000/login")
            startActivity(intent)
        }

        findViewById<LinearLayout>(R.id.btnSearch).setOnClickListener {
            // 분실물 찾기 기능 (필요시 구현)
            Toast.makeText(this, "분실물 찾기 기능", Toast.LENGTH_SHORT).show()
        }

        // 분실물 등록하기 → 주소 입력 화면
        findViewById<LinearLayout>(R.id.btnRegister).setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }

        // 목록 보기 → ListActivity
        findViewById<LinearLayout>(R.id.btnList).setOnClickListener {
            startActivity(Intent(this, ListActivity::class.java))
        }
        
        // 후기 보기 → SuccessStoriesActivity
        findViewById<LinearLayout>(R.id.btnReview).setOnClickListener {
            startActivity(Intent(this, SuccessStoriesActivity::class.java))
        }
        
        // 게임하기 → GameActivity
        findViewById<LinearLayout>(R.id.btnGame).setOnClickListener {
            startActivity(Intent(this, GameActivity::class.java))
        }

        // 헤더 설정 버튼 → SettingsActivity
        findViewById<LinearLayout>(R.id.btnSettings).setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }

        // 하단 배너 버튼 (쿠팡 링크)
        findViewById<Button>(R.id.btnBannerGo).setOnClickListener {
            openNextCoupangLink()
        }
    }

    private fun openNextCoupangLink() {
        val prefs = getSharedPreferences(prefName, MODE_PRIVATE)
        val last = prefs.getInt(keyIndex, -1)
        val nextIndex = (last + 1) % coupangLinks.size
        val url = coupangLinks[nextIndex]

        try {
            startActivity(
                Intent(Intent.ACTION_VIEW)
                    .setData(android.net.Uri.parse(url))
                    .addCategory(Intent.CATEGORY_BROWSABLE)
            )
            prefs.edit().putInt(keyIndex, nextIndex).apply()
        } catch (e: Exception) {
            Toast.makeText(this, "링크를 열 수 없습니다.", Toast.LENGTH_SHORT).show()
        }
    }
}
