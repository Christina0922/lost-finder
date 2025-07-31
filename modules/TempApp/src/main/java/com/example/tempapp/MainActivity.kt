package com.example.tempapp

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import android.content.SharedPreferences

class MainActivity : AppCompatActivity() {

    private lateinit var sharedPreferences: SharedPreferences
    private var isLoggedIn = false
    private var username = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        Log.d("MainActivity", "✅ 분실물 찾기 앱 시작")

        sharedPreferences = getSharedPreferences("user_prefs", MODE_PRIVATE)
        checkLoginStatus()
        setupButtons()
    }

    private fun checkLoginStatus() {
        isLoggedIn = sharedPreferences.getBoolean("is_logged_in", false)
        username = sharedPreferences.getString("username", "") ?: ""
        
        updateUI()
    }

    private fun updateUI() {
        val loginBeforeLayout = findViewById<View>(R.id.loginBeforeLayout)
        val loginAfterLayout = findViewById<View>(R.id.loginAfterLayout)
        val tvUsername = findViewById<android.widget.TextView>(R.id.tvUsername)

        if (isLoggedIn) {
            loginBeforeLayout.visibility = View.GONE
            loginAfterLayout.visibility = View.VISIBLE
            tvUsername.text = "${username}님"
        } else {
            loginBeforeLayout.visibility = View.VISIBLE
            loginAfterLayout.visibility = View.GONE
        }
    }

    private fun setupButtons() {
        // 로그인 전 버튼들
        findViewById<android.widget.Button>(R.id.btnLogin).setOnClickListener {
            // 로그인 화면으로 이동 (WebView로 React 페이지 열기)
            val intent = Intent(this, WebViewActivity::class.java)
            intent.putExtra("url", "http://localhost:3000/login")
            startActivity(intent)
        }

        findViewById<android.widget.Button>(R.id.btnSignup).setOnClickListener {
            // 회원가입 화면으로 이동
            val intent = Intent(this, WebViewActivity::class.java)
            intent.putExtra("url", "http://localhost:3000/signup")
            startActivity(intent)
        }

        // 로그인 후 버튼들
        findViewById<android.widget.Button>(R.id.btnRegister).setOnClickListener {
            if (!isLoggedIn) {
                Toast.makeText(this, "로그인이 필요합니다.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            val intent = Intent(this, RegisterActivity::class.java)
            startActivity(intent)
        }

        findViewById<android.widget.Button>(R.id.btnListView).setOnClickListener {
            if (!isLoggedIn) {
                Toast.makeText(this, "로그인이 필요합니다.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            val intent = Intent(this, ListActivity::class.java)
            startActivity(intent)
        }

        findViewById<android.widget.Button>(R.id.btnReviews).setOnClickListener {
            if (!isLoggedIn) {
                Toast.makeText(this, "로그인이 필요합니다.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            val intent = Intent(this, SuccessStoriesActivity::class.java)
            startActivity(intent)
        }

        findViewById<android.widget.Button>(R.id.btnGame).setOnClickListener {
            if (!isLoggedIn) {
                Toast.makeText(this, "로그인이 필요합니다.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            val intent = Intent(this, GameActivity::class.java)
            startActivity(intent)
        }

        findViewById<android.widget.Button>(R.id.btnLogout).setOnClickListener {
            logout()
        }

        // 설정 버튼
        findViewById<android.widget.ImageButton>(R.id.btnSettings).setOnClickListener {
            val intent = Intent(this, SettingsActivity::class.java)
            startActivity(intent)
        }

        // 쿠팡 광고 버튼
        findViewById<android.widget.Button>(R.id.btnCoupang).setOnClickListener {
            // 쿠팡 링크로 이동
            try {
                val intent = Intent(Intent.ACTION_VIEW, android.net.Uri.parse("https://www.coupang.com"))
                startActivity(intent)
            } catch (e: Exception) {
                Toast.makeText(this, "브라우저를 열 수 없습니다.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun logout() {
        sharedPreferences.edit().apply {
            putBoolean("is_logged_in", false)
            putString("username", "")
            apply()
        }
        isLoggedIn = false
        username = ""
        updateUI()
        Toast.makeText(this, "로그아웃되었습니다.", Toast.LENGTH_SHORT).show()
    }

    override fun onResume() {
        super.onResume()
        checkLoginStatus()
    }
} 