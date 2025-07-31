package com.example.tempapp

import android.app.Application

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // 카카오맵 SDK는 .aar 파일로 자동 초기화됩니다
    }
} 