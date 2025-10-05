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

        // 로그인 버튼 클릭 시 즉시 로그인 처리
        findViewById<com.google.android.material.button.MaterialButton>(R.id.btnSubmitLogin).setOnClickListener {
            // 이메일과 비밀번호 검증
            val email = findViewById<TextView>(R.id.etEmail).text.toString()
            val password = findViewById<TextView>(R.id.etPassword).text.toString()
            
            if (email == "yoonjeongc@gmail.com" && password == "skinner1") {
                // 로그인 성공 - 바로 메인 화면으로 이동
                Toast.makeText(this, "로그인 성공! 🎉", Toast.LENGTH_SHORT).show()
                startActivity(Intent(this, MainActivity::class.java))
                finish()
            } else {
                // 로그인 실패 - 오류 메시지 표시
                Toast.makeText(this, "이메일 또는 비밀번호가 틀렸습니다", Toast.LENGTH_SHORT).show()
            }
        }
        
        // 삼성패스 팝업 차단
        findViewById<TextView>(R.id.etEmail).apply {
            inputType = android.text.InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS
            importantForAutofill = android.view.View.IMPORTANT_FOR_AUTOFILL_NO
        }
        findViewById<TextView>(R.id.etPassword).apply {
            inputType = android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
            importantForAutofill = android.view.View.IMPORTANT_FOR_AUTOFILL_NO
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
