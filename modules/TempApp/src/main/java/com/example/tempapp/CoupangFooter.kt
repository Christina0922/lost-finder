package com.example.tempapp

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import com.google.android.material.button.MaterialButton

object CoupangFooter {
    // 쿠팡 파트너스 링크(순환)
    private val coupangLinks = listOf(
        "https://link.coupang.com/a/cIFtru",
        "https://link.coupang.com/a/cIFumx",
        "https://link.coupang.com/a/cIFuZl",
        "https://link.coupang.com/a/cIFvsF",
        "https://link.coupang.com/a/cIFv4K"
    )
    private const val PREF_NAME = "coupang_prefs"
    private const val KEY_INDEX = "last_index"

    fun setup(activity: Activity, footer: android.view.View) {
        val btn = footer.findViewById<MaterialButton>(R.id.btnBannerGo)
        btn.setOnClickListener { openNextCoupangLink(activity) }
    }

    private fun openNextCoupangLink(activity: Activity) {
        val prefs = activity.getSharedPreferences(PREF_NAME, Activity.MODE_PRIVATE)
        val last = prefs.getInt(KEY_INDEX, -1)
        val nextIndex = (last + 1) % coupangLinks.size
        val url = coupangLinks[nextIndex]

        try {
            activity.startActivity(
                Intent(Intent.ACTION_VIEW)
                    .setData(Uri.parse(url))
                    .addCategory(Intent.CATEGORY_BROWSABLE)
            )
            prefs.edit().putInt(KEY_INDEX, nextIndex).apply()
        } catch (e: Exception) {
            Toast.makeText(activity, "링크를 열 수 없습니다.", Toast.LENGTH_SHORT).show()
        }
    }
}
