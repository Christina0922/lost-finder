package com.example.tempapp.data

import java.util.Date
import java.util.UUID

data class LostItem(
    val id: String = UUID.randomUUID().toString(),
    val description: String,
    val latitude: Double,
    val longitude: Double,
    val registeredAt: Date = Date(),
    val isMyItem: Boolean = false // 본인이 등록한 아이템인지 구분
) 