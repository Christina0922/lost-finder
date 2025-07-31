package com.example.tempapp.data

import android.content.Context
import android.content.SharedPreferences
import java.util.*

class LostItemStore(private val context: Context) {
    
    private val sharedPreferences: SharedPreferences = context.getSharedPreferences("lost_items", Context.MODE_PRIVATE)
    
    fun addLostItem(item: LostItem) {
        val items = getAllLostItems().toMutableList()
        items.add(item)
        saveLostItems(items)
    }
    
    fun getAllLostItems(): List<LostItem> {
        val items = mutableListOf<LostItem>()
        val itemCount = sharedPreferences.getInt("item_count", 0)
        
        for (i in 0 until itemCount) {
            val description = sharedPreferences.getString("item_${i}_description", "") ?: ""
            val latitude = sharedPreferences.getFloat("item_${i}_latitude", 0f).toDouble()
            val longitude = sharedPreferences.getFloat("item_${i}_longitude", 0f).toDouble()
            val registeredAt = Date(sharedPreferences.getLong("item_${i}_registeredAt", 0))
            val isMyItem = sharedPreferences.getBoolean("item_${i}_isMyItem", false)
            val id = sharedPreferences.getString("item_${i}_id", "") ?: ""
            
            items.add(LostItem(id, description, latitude, longitude, registeredAt, isMyItem))
        }
        
        return items
    }
    
    fun getMyLostItems(): List<LostItem> {
        return getAllLostItems().filter { it.isMyItem }
    }
    
    private fun saveLostItems(items: List<LostItem>) {
        val editor = sharedPreferences.edit()
        editor.putInt("item_count", items.size)
        
        items.forEachIndexed { index, item ->
            editor.putString("item_${index}_id", item.id)
            editor.putString("item_${index}_description", item.description)
            editor.putFloat("item_${index}_latitude", item.latitude.toFloat())
            editor.putFloat("item_${index}_longitude", item.longitude.toFloat())
            editor.putLong("item_${index}_registeredAt", item.registeredAt.time)
            editor.putBoolean("item_${index}_isMyItem", item.isMyItem)
        }
        
        editor.apply()
    }
    
    fun clearAllItems() {
        sharedPreferences.edit().clear().apply()
    }
} 