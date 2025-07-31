package com.example.tempapp

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import android.content.SharedPreferences

class SettingsActivity : AppCompatActivity() {

    private lateinit var sharedPreferences: SharedPreferences

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)

        sharedPreferences = getSharedPreferences("user_prefs", MODE_PRIVATE)
        setupButtons()
    }

    private fun setupButtons() {
        // 뒤로가기 버튼
        findViewById<android.widget.ImageButton>(R.id.btnBack).setOnClickListener {
            finish()
        }

        // 테마 설정 버튼
        findViewById<android.widget.Button>(R.id.btnTheme).setOnClickListener {
            showThemeDialog()
        }

        // 알림 설정 버튼
        findViewById<android.widget.Button>(R.id.btnNotification).setOnClickListener {
            showNotificationDialog()
        }

        // 로그아웃 버튼
        findViewById<android.widget.Button>(R.id.btnLogout).setOnClickListener {
            logout()
        }
    }

    private fun showThemeDialog() {
        val themes = arrayOf("라이트 모드", "다크 모드")
        val currentTheme = sharedPreferences.getString("theme", "라이트 모드") ?: "라이트 모드"
        val currentIndex = themes.indexOf(currentTheme)

        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("테마 설정")
            .setSingleChoiceItems(themes, currentIndex) { _, which ->
                val selectedTheme = themes[which]
                sharedPreferences.edit().putString("theme", selectedTheme).apply()
                Toast.makeText(this, "테마가 변경되었습니다: $selectedTheme", Toast.LENGTH_SHORT).show()
            }
            .setPositiveButton("확인", null)
            .show()
    }

    private fun showNotificationDialog() {
        val notifications = arrayOf("진동", "무음", "멜로디")
        val currentNotification = sharedPreferences.getString("notification", "진동") ?: "진동"
        val currentIndex = notifications.indexOf(currentNotification)

        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("알림 설정")
            .setSingleChoiceItems(notifications, currentIndex) { _, which ->
                val selectedNotification = notifications[which]
                sharedPreferences.edit().putString("notification", selectedNotification).apply()
                Toast.makeText(this, "알림 설정이 변경되었습니다: $selectedNotification", Toast.LENGTH_SHORT).show()
            }
            .setPositiveButton("확인", null)
            .show()
    }

    private fun logout() {
        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("로그아웃")
            .setMessage("정말 로그아웃하시겠습니까?")
            .setPositiveButton("로그아웃") { _, _ ->
                sharedPreferences.edit().apply {
                    putBoolean("is_logged_in", false)
                    putString("username", "")
                    apply()
                }
                Toast.makeText(this, "로그아웃되었습니다.", Toast.LENGTH_SHORT).show()
                
                // 메인 화면으로 돌아가기
                val intent = Intent(this, MainActivity::class.java)
                intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK
                startActivity(intent)
                finish()
            }
            .setNegativeButton("취소", null)
            .show()
    }
} 