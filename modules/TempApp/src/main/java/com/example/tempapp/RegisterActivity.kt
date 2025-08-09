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
        setupHeader()
    }

    private fun setupWebView() {
        // WebView는 현재 레이아웃에 없으므로 주석 처리
        // 나중에 지도 기능이 필요하면 추가
    }

    private fun injectLocationSelectionScript() {
        // WebView 관련 스크립트 주석 처리
    }

    private fun setupButtons() {
        findViewById<android.widget.Button>(R.id.btnSubmit).setOnClickListener {
            val title = findViewById<android.widget.EditText>(R.id.etTitle).text.toString().trim()
            val address = findViewById<android.widget.EditText>(R.id.etAddress).text.toString().trim()
            val description = findViewById<android.widget.EditText>(R.id.etDesc).text.toString().trim()
            
            // 강화된 유효성 검사
            when {
                title.isEmpty() -> {
                    Toast.makeText(this, "제목을 입력해주세요.", Toast.LENGTH_SHORT).show()
                    findViewById<android.widget.EditText>(R.id.etTitle).requestFocus()
                    return@setOnClickListener
                }
                address.isEmpty() -> {
                    Toast.makeText(this, "분실 주소를 입력해주세요.", Toast.LENGTH_SHORT).show()
                    findViewById<android.widget.EditText>(R.id.etAddress).requestFocus()
                    return@setOnClickListener
                }
                title.length < 2 -> {
                    Toast.makeText(this, "제목은 최소 2글자 이상 입력해주세요.", Toast.LENGTH_SHORT).show()
                    findViewById<android.widget.EditText>(R.id.etTitle).requestFocus()
                    return@setOnClickListener
                }
                address.length < 5 -> {
                    Toast.makeText(this, "주소는 최소 5글자 이상 입력해주세요.", Toast.LENGTH_SHORT).show()
                    findViewById<android.widget.EditText>(R.id.etAddress).requestFocus()
                    return@setOnClickListener
                }
            }

            // 분실물 등록
            val lostItem = LostItem(
                description = "$title - $address${if (description.isNotEmpty()) " - $description" else ""}",
                latitude = selectedLatitude,
                longitude = selectedLongitude,
                isMyItem = true
            )

            lostItemStore.addLostItem(lostItem)
            
            Toast.makeText(this, "분실물이 등록되었습니다!", Toast.LENGTH_LONG).show()
            
            // 메인 화면으로 돌아가기
            finish()
        }
    }

    // JavaScript에서 호출할 함수
    fun onLocationSelected(lat: Double, lng: Double) {
        selectedLatitude = lat
        selectedLongitude = lng
        Log.d("RegisterActivity", "위치 선택됨: $lat, $lng")
    }

    private fun setupHeader() {
        // LostFinder 타이틀 클릭 → 초기화면으로
        findViewById<android.widget.TextView>(R.id.tvTitle).setOnClickListener {
            finish()
        }

        // 초기화면으로 가기 버튼
        findViewById<android.widget.LinearLayout>(R.id.btnHome).setOnClickListener {
            finish()
        }
    }
    

} 