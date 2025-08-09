package com.example.tempapp

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.browser.customtabs.CustomTabsIntent

object CoupangOpener {

    // 순환할 쿠팡 파트너스 링크 목록
    private val LINKS = listOf(
        "https://link.coupang.com/a/cIFtru", // 🚨 뇌울림 3.0 PRO 도난방지 경보기
        "https://link.coupang.com/a/cIFumx", // 📍 갤럭시 스마트태그2 위치추적
        "https://link.coupang.com/a/cIFuZl", // 🔒 레오바니 자물쇠
        "https://link.coupang.com/a/cIFvsF", // 🍏 Apple 에어태그
        "https://link.coupang.com/a/cIFv4K"  // 🧷 스프링 고리형 스트랩 (5개)
    )

    private const val PREF = "coupang_prefs"
    private const val KEY_INDEX = "coupang_index"

    /** 다음 링크를 순환 선택해서 외부 브라우저(또는 CCT)로 연다 */
    fun openNext(context: Context) {
        val prefs = context.getSharedPreferences(PREF, Context.MODE_PRIVATE)
        val current = prefs.getInt(KEY_INDEX, 0)
        val url = LINKS[current % LINKS.size]

        // 다음 인덱스 저장 (순환)
        prefs.edit().putInt(KEY_INDEX, (current + 1) % LINKS.size).apply()

        openExternal(context, url)
    }

    /** Chrome Custom Tabs 우선, 실패 시 기본 브라우저로 열기 */
    private fun openExternal(context: Context, url: String) {
        val uri = Uri.parse(url)

        // 1) Chrome Custom Tabs 시도
        try {
            val customTabsIntent = CustomTabsIntent.Builder()
                .setShareState(CustomTabsIntent.SHARE_STATE_ON)
                .build()
            // 쿠팡 측 추적에 도움이 되도록 리퍼러 힌트 추가 (필수는 아니지만 무해)
            customTabsIntent.intent.putExtra(
                Intent.EXTRA_REFERRER,
                Uri.parse("android-app://${context.packageName}")
            )
            customTabsIntent.launchUrl(context, uri)
            return
        } catch (_: Exception) {
            // 아래 기본 브라우저 열기로 폴백
        }

        // 2) 기본 브라우저 열기 (폴백)
        val intent = Intent(Intent.ACTION_VIEW, uri).apply {
            addCategory(Intent.CATEGORY_BROWSABLE)
            putExtra(Intent.EXTRA_REFERRER, Uri.parse("android-app://${context.packageName}"))
        }
        try {
            context.startActivity(intent)
        } catch (_: ActivityNotFoundException) {
            // 기기에 브라우저가 정말 없는 극단적 상황: 아무 것도 하지 않음
        }
    }
} 