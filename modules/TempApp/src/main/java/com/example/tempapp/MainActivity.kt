package com.example.tempapp

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private val AUTH_PREFS = "auth_prefs"
    private val KEY_LOGGED_IN = "isLoggedIn"

    // 쿠팡 링크(순환)
    private val coupangLinks = listOf(
        "https://link.coupang.com/a/cIFtru",
        "https://link.coupang.com/a/cIFumx",
        "https://link.coupang.com/a/cIFuZl",
        "https://link.coupang.com/a/cIFvsF",
        "https://link.coupang.com/a/cIFv4K"
    )
    private val COUPANG_PREFS = "coupang_prefs"
    private val KEY_COUPANG_INDEX = "last_index"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        findViewById<TextView>(R.id.tvLoginTitle).setOnClickListener {
            Toast.makeText(this, "이미 초기화면입니다", Toast.LENGTH_SHORT).show()
        }

        findViewById<com.google.android.material.button.MaterialButton>(R.id.btnHome).setOnClickListener {
            Toast.makeText(this, "이미 홈 화면입니다", Toast.LENGTH_SHORT).show()
        }
        findViewById<com.google.android.material.button.MaterialButton>(R.id.btnList).setOnClickListener {
            startActivity(Intent(this, ListActivity::class.java))
        }
        findViewById<com.google.android.material.button.MaterialButton>(R.id.btnRegister).setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
        findViewById<com.google.android.material.button.MaterialButton>(R.id.btnReview).setOnClickListener {
            startActivity(Intent(this, SuccessStoriesActivity::class.java))
        }
        findViewById<com.google.android.material.button.MaterialButton>(R.id.btnLogout).setOnClickListener {
            Toast.makeText(this, "로그아웃되었습니다", Toast.LENGTH_SHORT).show()
        }

        // 로그인 버튼은 기존 동작대로 두시되(필요 시 수정), 쿠팡은 푸터 버튼에서만 열리도록 연결
        findViewById<com.google.android.material.button.MaterialButton>(R.id.btnSubmitLogin).setOnClickListener {
            Toast.makeText(this, "로그인 버튼 클릭", Toast.LENGTH_SHORT).show()
        }
        // ✅ 푸터 버튼 → 쿠팡 링크 순환 오픈
        findViewById<com.google.android.material.button.MaterialButton>(R.id.btnBannerGo).setOnClickListener {
            openNextCoupangLink()
        }
    }

    private fun openNextCoupangLink() {
        val prefs = getSharedPreferences(COUPANG_PREFS, MODE_PRIVATE)
        val last = prefs.getInt(KEY_COUPANG_INDEX, -1)
        val nextIndex = (last + 1) % coupangLinks.size
        val url = coupangLinks[nextIndex]

        try {
            startActivity(
                Intent(Intent.ACTION_VIEW)
                    .setData(Uri.parse(url))
                    .addCategory(Intent.CATEGORY_BROWSABLE)
            )
            prefs.edit().putInt(KEY_COUPANG_INDEX, nextIndex).apply()
        } catch (e: Exception) {
            Toast.makeText(this, "링크를 열 수 없습니다.", Toast.LENGTH_SHORT).show()
        }
    }
}
