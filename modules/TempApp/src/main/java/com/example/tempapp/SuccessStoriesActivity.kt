package com.example.tempapp

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import android.content.SharedPreferences
import android.widget.EditText
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.ScrollView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.button.MaterialButton
import org.json.JSONArray
import org.json.JSONObject
import android.view.LayoutInflater
import android.view.ViewGroup

class SuccessStoriesActivity : AppCompatActivity() {

    private lateinit var sharedPreferences: SharedPreferences
    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: SuccessStoriesAdapter
    private val stories = mutableListOf<SuccessStory>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_success_stories)

        Log.d("SuccessStoriesActivity", "✅ 후기 보기/작성 화면 시작")

        sharedPreferences = getSharedPreferences("success_stories", MODE_PRIVATE)
        setupViews()
        loadStories()
    }

    private fun setupViews() {
        // 뒤로가기 버튼
        findViewById<android.widget.ImageButton>(R.id.btnBack).setOnClickListener {
            finish()
        }

        // 후기 작성 폼
        val btnSubmit = findViewById<MaterialButton>(R.id.btnSubmit)
        val etContent = findViewById<EditText>(R.id.etContent)
        val etName = findViewById<EditText>(R.id.etName)
        val etLocation = findViewById<EditText>(R.id.etLocation)

        btnSubmit.setOnClickListener {
            val content = etContent.text.toString().trim()
            val name = etName.text.toString().trim()
            val location = etLocation.text.toString().trim()

            if (content.isEmpty() || name.isEmpty() || location.isEmpty()) {
                Toast.makeText(this, "모든 필드를 입력해주세요.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            addStory(content, name, location)
            etContent.text.clear()
            etName.text.clear()
            etLocation.text.clear()
            Toast.makeText(this, "후기가 등록되었습니다!", Toast.LENGTH_SHORT).show()
        }

        // RecyclerView 설정
        recyclerView = findViewById(R.id.recyclerView)
        adapter = SuccessStoriesAdapter(stories)
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.adapter = adapter
    }

    private fun loadStories() {
        val storiesJson = sharedPreferences.getString("stories", "[]")
        try {
            val jsonArray = JSONArray(storiesJson)
            stories.clear()
            for (i in 0 until jsonArray.length()) {
                val jsonObject = jsonArray.getJSONObject(i)
                val story = SuccessStory(
                    content = jsonObject.getString("content"),
                    name = jsonObject.getString("name"),
                    location = jsonObject.getString("location"),
                    likes = jsonObject.optInt("likes", 0)
                )
                stories.add(story)
            }
            adapter.notifyDataSetChanged()
        } catch (e: Exception) {
            Log.e("SuccessStoriesActivity", "❌ 후기 로딩 실패: ${e.message}")
        }
    }

    private fun addStory(content: String, name: String, location: String) {
        val story = SuccessStory(content, name, location, 0)
        stories.add(0, story)
        adapter.notifyItemInserted(0)
        saveStories()
    }

    private fun saveStories() {
        try {
            val jsonArray = JSONArray()
            for (story in stories) {
                val jsonObject = JSONObject()
                jsonObject.put("content", story.content)
                jsonObject.put("name", story.name)
                jsonObject.put("location", story.location)
                jsonObject.put("likes", story.likes)
                jsonArray.put(jsonObject)
            }
            sharedPreferences.edit().putString("stories", jsonArray.toString()).apply()
        } catch (e: Exception) {
            Log.e("SuccessStoriesActivity", "❌ 후기 저장 실패: ${e.message}")
        }
    }

    data class SuccessStory(
        val content: String,
        val name: String,
        val location: String,
        var likes: Int
    )
}

class SuccessStoriesAdapter(private val stories: List<SuccessStoriesActivity.SuccessStory>) : 
    RecyclerView.Adapter<SuccessStoriesAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvContent: TextView = view.findViewById(R.id.tvContent)
        val tvName: TextView = view.findViewById(R.id.tvName)
        val tvLocation: TextView = view.findViewById(R.id.tvLocation)
        val tvLikes: TextView = view.findViewById(R.id.tvLikes)
        val btnLike: Button = view.findViewById(R.id.btnLike)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_success_story, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val story = stories[position]
        holder.tvContent.text = story.content
        holder.tvName.text = "작성자: ${story.name}"
        holder.tvLocation.text = "위치: ${story.location}"
        holder.tvLikes.text = "좋아요 ${story.likes}개"

        holder.btnLike.setOnClickListener {
            story.likes++
            holder.tvLikes.text = "좋아요 ${story.likes}개"
            // 저장 로직은 여기에 추가
        }
    }

    override fun getItemCount() = stories.size
} 