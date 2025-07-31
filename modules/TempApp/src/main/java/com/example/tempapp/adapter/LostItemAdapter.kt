package com.example.tempapp.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.tempapp.R
import com.example.tempapp.data.LostItem

import java.text.SimpleDateFormat
import java.util.*

class LostItemAdapter(
    private val onItemClick: (LostItem) -> Unit
) : ListAdapter<LostItem, LostItemAdapter.LostItemViewHolder>(LostItemDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): LostItemViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(
            R.layout.item_lost_item,
            parent,
            false
        )
        return LostItemViewHolder(view, onItemClick)
    }

    override fun onBindViewHolder(holder: LostItemViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class LostItemViewHolder(
        itemView: android.view.View,
        private val onItemClick: (LostItem) -> Unit
    ) : RecyclerView.ViewHolder(itemView) {

        private val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
        private val cardView = itemView.findViewById<com.google.android.material.card.MaterialCardView>(R.id.cardView)
        private val tvMyItem = itemView.findViewById<android.widget.TextView>(R.id.tvMyItem)
        private val tvDescription = itemView.findViewById<android.widget.TextView>(R.id.tvDescription)
        private val tvRegisteredAt = itemView.findViewById<android.widget.TextView>(R.id.tvRegisteredAt)
        private val tvLocation = itemView.findViewById<android.widget.TextView>(R.id.tvLocation)

        fun bind(item: LostItem) {
            tvDescription.text = item.description
            tvRegisteredAt.text = "등록: ${dateFormat.format(item.registeredAt)}"
            tvLocation.text = "위치: ${String.format("%.4f, %.4f", item.latitude, item.longitude)}"
            
            // 본인 아이템인지 구분
            if (item.isMyItem) {
                cardView.setCardBackgroundColor(itemView.context.getColor(R.color.my_item_color))
                tvMyItem.visibility = android.view.View.VISIBLE
            } else {
                cardView.setCardBackgroundColor(itemView.context.getColor(R.color.white))
                tvMyItem.visibility = android.view.View.GONE
            }

            itemView.setOnClickListener {
                onItemClick(item)
            }
        }
    }

    private class LostItemDiffCallback : DiffUtil.ItemCallback<LostItem>() {
        override fun areItemsTheSame(oldItem: LostItem, newItem: LostItem): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: LostItem, newItem: LostItem): Boolean {
            return oldItem == newItem
        }
    }
} 