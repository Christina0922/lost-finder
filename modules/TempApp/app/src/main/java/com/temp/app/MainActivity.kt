package com.temp.app

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.viewinterop.AndroidView
import com.temp.app.ui.theme.TempAppTheme
import net.daum.mf.map.api.MapView
import net.daum.mf.map.api.MapPoint

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            TempAppTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    KakaoMapScreen(
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }
}

@Composable
fun KakaoMapScreen(modifier: Modifier = Modifier) {
    AndroidView(
        factory = { context ->
            MapView(context).apply {
                // 지도 초기 설정
                setMapViewEventListener(object : net.daum.mf.map.api.MapView.MapViewEventListener {
                    override fun onMapViewInitialized(mapView: MapView?) {
                        Log.d("KakaoMap", "지도가 초기화되었습니다!")
                        // 서울 시청으로 지도 중심 이동
                        mapView?.setMapCenterPoint(MapPoint.mapPointWithGeoCoord(37.5665, 126.9780), true)
                        mapView?.setZoomLevel(7, true)
                    }
                    
                    override fun onMapViewCenterPointMoved(mapView: MapView?, mapPoint: net.daum.mf.map.api.MapPoint?) {
                        Log.d("KakaoMap", "지도 중심점이 이동했습니다: $mapPoint")
                    }
                    
                    override fun onMapViewZoomLevelChanged(mapView: MapView?, zoomLevel: Int) {
                        Log.d("KakaoMap", "줌 레벨이 변경되었습니다: $zoomLevel")
                    }
                    
                    override fun onMapViewSingleTapped(mapView: MapView?, mapPoint: net.daum.mf.map.api.MapPoint?) {
                        Log.d("KakaoMap", "지도를 한 번 탭했습니다: $mapPoint")
                    }
                    
                    override fun onMapViewDoubleTapped(mapView: MapView?, mapPoint: net.daum.mf.map.api.MapPoint?) {
                        Log.d("KakaoMap", "지도를 두 번 탭했습니다: $mapPoint")
                    }
                    
                    override fun onMapViewLongPressed(mapView: MapView?, mapPoint: net.daum.mf.map.api.MapPoint?) {
                        Log.d("KakaoMap", "지도를 길게 눌렀습니다: $mapPoint")
                    }
                    
                    override fun onMapViewDragStarted(mapView: MapView?, mapPoint: net.daum.mf.map.api.MapPoint?) {
                        Log.d("KakaoMap", "지도 드래그가 시작되었습니다: $mapPoint")
                    }
                    
                    override fun onMapViewDragEnded(mapView: MapView?, mapPoint: net.daum.mf.map.api.MapPoint?) {
                        Log.d("KakaoMap", "지도 드래그가 끝났습니다: $mapPoint")
                    }
                    
                    override fun onMapViewMoveFinished(mapView: MapView?, mapPoint: net.daum.mf.map.api.MapPoint?) {
                        Log.d("KakaoMap", "지도 이동이 끝났습니다: $mapPoint")
                    }
                })
            }
        },
        modifier = modifier.fillMaxSize()
    )
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(
        text = "Hello $name!",
        modifier = modifier
    )
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    TempAppTheme {
        Greeting("Android")
    }
}