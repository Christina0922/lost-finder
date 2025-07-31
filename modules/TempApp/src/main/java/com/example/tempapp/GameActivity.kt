package com.example.tempapp

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import android.widget.TextView
import android.widget.Button
import android.os.Handler
import android.os.Looper
import java.util.*

class GameActivity : AppCompatActivity() {

    private lateinit var tvScore: TextView
    private lateinit var tvTime: TextView
    private lateinit var tvFoundItems: TextView
    private lateinit var tvCurrentItem: TextView
    private lateinit var btnFindItem: Button
    private lateinit var btnStartGame: Button
    private lateinit var btnBack: Button

    private var score = 0
    private var timeLeft = 60
    private var isPlaying = false
    private var currentItem = ""
    private val foundItems = mutableSetOf<String>()
    private val handler = Handler(Looper.getMainLooper())
    private var timerRunnable: Runnable? = null

    private val items = listOf(
        "지갑", "핸드폰", "노트북", "카드", "열쇠", "가방", "시계", "반지",
        "책", "우산", "모자", "장갑", "목도리", "선글라스", "이어폰", "충전기"
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_game)

        Log.d("GameActivity", "✅ 게임 화면 시작")

        setupViews()
        updateUI()
    }

    private fun setupViews() {
        tvScore = findViewById(R.id.tvScore)
        tvTime = findViewById(R.id.tvTime)
        tvFoundItems = findViewById(R.id.tvFoundItems)
        tvCurrentItem = findViewById(R.id.tvCurrentItem)
        btnFindItem = findViewById(R.id.btnFindItem)
        btnStartGame = findViewById(R.id.btnStartGame)
        btnBack = findViewById(R.id.btnBack)

        btnStartGame.setOnClickListener {
            startGame()
        }

        btnFindItem.setOnClickListener {
            findItem()
        }

        btnBack.setOnClickListener {
            finish()
        }
    }

    private fun startGame() {
        score = 0
        timeLeft = 60
        isPlaying = true
        foundItems.clear()
        
        btnStartGame.visibility = View.GONE
        btnFindItem.visibility = View.VISIBLE
        tvCurrentItem.visibility = View.VISIBLE
        
        generateNewItem()
        startTimer()
        updateUI()
    }

    private fun generateNewItem() {
        val availableItems = items.filter { !foundItems.contains(it) }
        if (availableItems.isNotEmpty()) {
            currentItem = availableItems.random()
            tvCurrentItem.text = "찾아야 할 물건: $currentItem"
        } else {
            currentItem = ""
            tvCurrentItem.text = "모든 물건을 찾았습니다!"
        }
    }

    private fun findItem() {
        if (currentItem.isNotEmpty() && !foundItems.contains(currentItem)) {
            score += 10
            foundItems.add(currentItem)
            Toast.makeText(this, "$currentItem found! +10 points", Toast.LENGTH_SHORT).show()
            generateNewItem()
            updateUI()
        }
    }

    private fun startTimer() {
        timerRunnable = object : Runnable {
            override fun run() {
                if (isPlaying && timeLeft > 0) {
                    timeLeft--
                    updateUI()
                    handler.postDelayed(this, 1000)
                } else if (timeLeft <= 0) {
                    endGame()
                }
            }
        }
        handler.post(timerRunnable!!)
    }

    private fun endGame() {
        isPlaying = false
        btnStartGame.visibility = View.VISIBLE
        btnFindItem.visibility = View.GONE
        tvCurrentItem.visibility = View.GONE
        
        timerRunnable?.let { handler.removeCallbacks(it) }
        
        Toast.makeText(this, "게임 종료! 최종 점수: ${score}점", Toast.LENGTH_LONG).show()
        updateUI()
    }

    private fun updateUI() {
        tvScore.text = "점수: $score"
        tvTime.text = "시간: ${timeLeft}초"
        tvFoundItems.text = "찾은 물건: ${foundItems.size}개"
    }

    override fun onDestroy() {
        super.onDestroy()
        timerRunnable?.let { handler.removeCallbacks(it) }
    }
} 