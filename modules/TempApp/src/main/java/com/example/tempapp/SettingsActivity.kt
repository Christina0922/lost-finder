package com.example.tempapp

import android.content.SharedPreferences
import android.os.Bundle
import android.widget.Button
import android.widget.CheckBox
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class SettingsActivity : AppCompatActivity() {

    private lateinit var prefs: SharedPreferences
    private lateinit var melodyCheckBox: CheckBox
    private lateinit var vibrationCheckBox: CheckBox
    private lateinit var silentCheckBox: CheckBox

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)

        prefs = getSharedPreferences("notification_settings", MODE_PRIVATE)

        // 뒤로가기 버튼
        findViewById<LinearLayout>(R.id.btnBack).setOnClickListener {
            finish()
        }

        // 알림 설정 체크박스들
        melodyCheckBox = findViewById(R.id.checkboxMelody)
        vibrationCheckBox = findViewById(R.id.checkboxVibration)
        silentCheckBox = findViewById(R.id.checkboxSilent)

        // 저장된 설정 불러오기
        loadNotificationSettings()

        // 체크박스 이벤트 설정
        setupCheckBoxListeners()

        // 비밀번호 변경 버튼
        findViewById<Button>(R.id.btnChangePassword).setOnClickListener {
            changePassword()
        }
    }

    private fun loadNotificationSettings() {
        melodyCheckBox.isChecked = prefs.getBoolean("melody", true)
        vibrationCheckBox.isChecked = prefs.getBoolean("vibration", true)
        silentCheckBox.isChecked = prefs.getBoolean("silent", false)
    }

    private fun setupCheckBoxListeners() {
        melodyCheckBox.setOnCheckedChangeListener { _, isChecked ->
            if (isChecked) {
                silentCheckBox.isChecked = false
                vibrationCheckBox.isEnabled = true
            }
            saveNotificationSettings()
        }

        vibrationCheckBox.setOnCheckedChangeListener { _, isChecked ->
            if (isChecked) {
                silentCheckBox.isChecked = false
                melodyCheckBox.isEnabled = true
            }
            saveNotificationSettings()
        }

        silentCheckBox.setOnCheckedChangeListener { _, isChecked ->
            if (isChecked) {
                melodyCheckBox.isChecked = false
                vibrationCheckBox.isChecked = false
                melodyCheckBox.isEnabled = false
                vibrationCheckBox.isEnabled = false
            } else {
                melodyCheckBox.isEnabled = true
                vibrationCheckBox.isEnabled = true
            }
            saveNotificationSettings()
        }
    }

    private fun saveNotificationSettings() {
        prefs.edit().apply {
            putBoolean("melody", melodyCheckBox.isChecked)
            putBoolean("vibration", vibrationCheckBox.isChecked)
            putBoolean("silent", silentCheckBox.isChecked)
            apply()
        }
        
        val message = when {
            silentCheckBox.isChecked -> "무음 모드가 활성화되었습니다"
            melodyCheckBox.isChecked && vibrationCheckBox.isChecked -> "멜로디와 진동 알림이 활성화되었습니다"
            melodyCheckBox.isChecked -> "멜로디 알림이 활성화되었습니다"
            vibrationCheckBox.isChecked -> "진동 알림이 활성화되었습니다"
            else -> "모든 알림이 비활성화되었습니다"
        }
        
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }

    private fun changePassword() {
        val currentPassword = findViewById<EditText>(R.id.editCurrentPassword).text.toString()
        val newPassword = findViewById<EditText>(R.id.editNewPassword).text.toString()
        val confirmPassword = findViewById<EditText>(R.id.editConfirmPassword).text.toString()

        when {
            currentPassword.isEmpty() -> Toast.makeText(this, "현재 비밀번호를 입력하세요", Toast.LENGTH_SHORT).show()
            newPassword.isEmpty() -> Toast.makeText(this, "새 비밀번호를 입력하세요", Toast.LENGTH_SHORT).show()
            confirmPassword.isEmpty() -> Toast.makeText(this, "새 비밀번호 확인을 입력하세요", Toast.LENGTH_SHORT).show()
            newPassword != confirmPassword -> Toast.makeText(this, "새 비밀번호가 일치하지 않습니다", Toast.LENGTH_SHORT).show()
            newPassword.length < 6 -> Toast.makeText(this, "새 비밀번호는 최소 6자 이상이어야 합니다", Toast.LENGTH_SHORT).show()
            else -> {
                // 비밀번호 변경 로직 (실제로는 서버 API 호출)
                Toast.makeText(this, "비밀번호가 성공적으로 변경되었습니다", Toast.LENGTH_SHORT).show()
                findViewById<EditText>(R.id.editCurrentPassword).text.clear()
                findViewById<EditText>(R.id.editNewPassword).text.clear()
                findViewById<EditText>(R.id.editConfirmPassword).text.clear()
            }
        }
    }
} 