package com.temp.app;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import androidx.appcompat.app.AppCompatActivity;
import androidx.activity.OnBackPressedCallback;

public class MainActivity extends AppCompatActivity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // 메인 테마로 전환
        setTheme(R.style.Theme_LostFinder);
        
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        
        if (webView != null) {
            // WebView 설정
            WebSettings webSettings = webView.getSettings();
            webSettings.setJavaScriptEnabled(true);
            webSettings.setDomStorageEnabled(true);
            webSettings.setLoadWithOverviewMode(true);
            webSettings.setUseWideViewPort(true);
            webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
            
            // 외부 브라우저가 아닌 WebView 내에서 열기
            webView.setWebViewClient(new WebViewClient());
            
            // WebView 보이기
            webView.setVisibility(android.view.View.VISIBLE);
            
            // React 앱 로드 (PC IP 주소:3000)
            webView.loadUrl("http://172.21.192.1:3000");
        }
        
        // 뒤로가기 처리 (최신 방식)
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView != null && webView.canGoBack()) {
                    webView.goBack();
                } else {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                }
            }
        });
    }
}
