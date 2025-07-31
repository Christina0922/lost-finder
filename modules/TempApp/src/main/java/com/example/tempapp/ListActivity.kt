package com.example.tempapp

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.tempapp.data.LostItem
import com.example.tempapp.data.LostItemStore

import com.example.tempapp.adapter.LostItemAdapter
import java.text.SimpleDateFormat
import java.util.*

class ListActivity : AppCompatActivity() {

    private lateinit var lostItemStore: LostItemStore
    private lateinit var adapter: LostItemAdapter
    private var currentSortType = SortType.NEWEST // 기본값: 최신순
    
    // 페이지네이션 관련 변수
    private val itemsPerPage = 10
    private var currentPage = 0
    private var allItems = listOf<LostItem>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_list)

        lostItemStore = LostItemStore(this)
        setupRecyclerView()
        setupButtons()
        loadLostItems()
    }

    private fun setupRecyclerView() {
        adapter = LostItemAdapter { lostItem ->
            // 카드 클릭 시 지도로 이동
            val intent = Intent(this, MapActivity::class.java)
            intent.putExtra("center_lat", lostItem.latitude)
            intent.putExtra("center_lng", lostItem.longitude)
            startActivity(intent)
        }

        findViewById<androidx.recyclerview.widget.RecyclerView>(R.id.recyclerView).apply {
            layoutManager = LinearLayoutManager(this@ListActivity)
            adapter = this@ListActivity.adapter
        }
    }

    private fun setupButtons() {
        findViewById<android.widget.ImageButton>(R.id.btnBack).setOnClickListener {
            finish()
        }

        findViewById<android.widget.ImageButton>(R.id.btnRefresh).setOnClickListener {
            loadLostItems()
            Toast.makeText(this, "목록을 새로고침했습니다.", Toast.LENGTH_SHORT).show()
        }
        
        // 정렬 버튼 추가
        findViewById<android.widget.Button>(R.id.btnSort).setOnClickListener {
            showSortDialog()
        }
        
        // 페이지네이션 버튼 추가
        findViewById<android.widget.Button>(R.id.btnPrevPage).setOnClickListener {
            if (currentPage > 0) {
                currentPage--
                updatePaginationButtons()
                loadCurrentPage()
            }
        }
        
        findViewById<android.widget.Button>(R.id.btnNextPage).setOnClickListener {
            val maxPage = (allItems.size - 1) / itemsPerPage
            if (currentPage < maxPage) {
                currentPage++
                updatePaginationButtons()
                loadCurrentPage()
            }
        }
    }

    private fun loadLostItems() {
        val lostItems = lostItemStore.getAllLostItems()
        allItems = sortItems(lostItems, currentSortType)
        
        if (allItems.isEmpty()) {
            findViewById<android.widget.TextView>(R.id.tvEmpty).visibility = android.view.View.VISIBLE
            findViewById<androidx.recyclerview.widget.RecyclerView>(R.id.recyclerView).visibility = android.view.View.GONE
            findViewById<android.widget.LinearLayout>(R.id.paginationLayout).visibility = android.view.View.GONE
        } else {
            findViewById<android.widget.TextView>(R.id.tvEmpty).visibility = android.view.View.GONE
            findViewById<androidx.recyclerview.widget.RecyclerView>(R.id.recyclerView).visibility = android.view.View.VISIBLE
            
            // 페이지네이션 초기화
            currentPage = 0
            updatePaginationButtons()
            loadCurrentPage()
        }
    }
    
    private fun loadCurrentPage() {
        val startIndex = currentPage * itemsPerPage
        val endIndex = minOf(startIndex + itemsPerPage, allItems.size)
        val currentPageItems = allItems.subList(startIndex, endIndex)
        
        adapter.submitList(currentPageItems)
        updatePageInfo()
    }
    
    private fun updatePaginationButtons() {
        val maxPage = (allItems.size - 1) / itemsPerPage
        
        findViewById<android.widget.Button>(R.id.btnPrevPage).isEnabled = currentPage > 0
        findViewById<android.widget.Button>(R.id.btnNextPage).isEnabled = currentPage < maxPage
        
        // 페이지네이션 레이아웃 표시/숨김
        findViewById<android.widget.LinearLayout>(R.id.paginationLayout).visibility = 
            if (allItems.size > itemsPerPage) android.view.View.VISIBLE else android.view.View.GONE
    }
    
    private fun updatePageInfo() {
        val maxPage = (allItems.size - 1) / itemsPerPage
        findViewById<android.widget.TextView>(R.id.tvPageInfo).text = 
            "${currentPage + 1} / ${maxPage + 1} (총 ${allItems.size}개)"
    }

    override fun onResume() {
        super.onResume()
        loadLostItems()
    }
    
    // 정렬 다이얼로그 표시
    private fun showSortDialog() {
        val sortOptions = arrayOf("최신순", "오래된순", "내 분실물만", "전체보기")
        
        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("정렬 방식 선택")
            .setItems(sortOptions) { _, which ->
                currentSortType = when (which) {
                    0 -> SortType.NEWEST
                    1 -> SortType.OLDEST
                    2 -> SortType.MY_ITEMS
                    3 -> SortType.ALL
                    else -> SortType.NEWEST
                }
                // 정렬 변경 시 첫 페이지로 리셋
                currentPage = 0
                loadLostItems()
                Toast.makeText(this, "정렬이 변경되었습니다.", Toast.LENGTH_SHORT).show()
            }
            .show()
    }
    
    // 아이템 정렬 함수
    private fun sortItems(items: List<LostItem>, sortType: SortType): List<LostItem> {
        return when (sortType) {
            SortType.NEWEST -> items.sortedByDescending { it.registeredAt }
            SortType.OLDEST -> items.sortedBy { it.registeredAt }
            SortType.MY_ITEMS -> items.filter { it.isMyItem }.sortedByDescending { it.registeredAt }
            SortType.ALL -> items.sortedByDescending { it.registeredAt }
        }
    }
    
    // 정렬 타입 enum
    enum class SortType {
        NEWEST, OLDEST, MY_ITEMS, ALL
    }
} 