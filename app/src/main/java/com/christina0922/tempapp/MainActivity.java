package com.christina0922.tempapp;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceError;
import android.graphics.Bitmap;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;

public class MainActivity extends AppCompatActivity {
    private static final String TAG = "MainActivity";
    private WebView webView;
    private ValueCallback<Uri[]> fileUploadCallback;
    
    // 파일 선택 결과 처리
    private final ActivityResultLauncher<Intent> fileChooserLauncher = 
        registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
            if (fileUploadCallback == null) return;
            
            Uri[] results = null;
            if (result.getResultCode() == Activity.RESULT_OK) {
                Intent data = result.getData();
                if (data != null) {
                    if (data.getClipData() != null) {
                        // 여러 파일 선택
                        int count = data.getClipData().getItemCount();
                        results = new Uri[count];
                        for (int i = 0; i < count; i++) {
                            results[i] = data.getClipData().getItemAt(i).getUri();
                        }
                    } else if (data.getData() != null) {
                        // 단일 파일 선택
                        results = new Uri[]{data.getData()};
                    }
                }
            }
            
            fileUploadCallback.onReceiveValue(results);
            fileUploadCallback = null;
        });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        try {
            setContentView(R.layout.activity_main);

            webView = findViewById(R.id.webview);
            
            // 네트워크 연결 확인
            if (!isNetworkAvailable()) {
                showNetworkErrorDialog();
                return;
            }
            
            if (webView != null) {
            // ✅ 기존 캐시 완전 삭제
            webView.clearCache(true);
            webView.clearFormData();
            webView.clearHistory();
            android.webkit.CookieManager.getInstance().removeAllCookies(null);
            android.webkit.CookieManager.getInstance().flush();
            
            // WebView 설정
            WebSettings webSettings = webView.getSettings();
            webSettings.setJavaScriptEnabled(true);
            webSettings.setDomStorageEnabled(true);
            webSettings.setLoadWithOverviewMode(true);
            webSettings.setUseWideViewPort(true);
            webSettings.setCacheMode(WebSettings.LOAD_NO_CACHE);
            webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
            webSettings.setBuiltInZoomControls(false);
            webSettings.setSupportZoom(false);
            webSettings.setAllowFileAccess(true);
            webSettings.setAllowContentAccess(true);
            
            // Mixed content 허용 (Android 5.0+)
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
                webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            }
            
            // WebChromeClient 설정 (파일 업로드 지원)
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback,
                                                FileChooserParams fileChooserParams) {
                    // 이전 콜백이 있으면 취소
                    if (fileUploadCallback != null) {
                        fileUploadCallback.onReceiveValue(null);
                    }
                    
                    fileUploadCallback = filePathCallback;
                    
                    Intent intent = fileChooserParams.createIntent();
                    intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true); // 여러 파일 선택 허용
                    
                    try {
                        fileChooserLauncher.launch(intent);
                    } catch (Exception e) {
                        Log.e(TAG, "파일 선택 오류: " + e.getMessage());
                        fileUploadCallback = null;
                        return false;
                    }
                    
                    return true;
                }
            });
            
            // WebViewClient 설정
            webView.setWebViewClient(new WebViewClient() {
                @Override
                public void onPageStarted(WebView view, String url, Bitmap favicon) {
                    super.onPageStarted(view, url, favicon);
                    Log.d(TAG, "페이지 로드 시작: " + url);
                }
                
                @Override
                public void onPageFinished(WebView view, String url) {
                    super.onPageFinished(view, url);
                    Log.d(TAG, "페이지 로드 완료: " + url);
                }
                
                @Override
                public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                    super.onReceivedError(view, request, error);
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                        Log.e(TAG, "WebView 에러: " + error.getDescription() + " (코드: " + error.getErrorCode() + ")");
                        
                        // 메인 페이지 로드 실패 시 사용자에게 알림
                        if (request.isForMainFrame()) {
                            runOnUiThread(() -> {
                                Toast.makeText(MainActivity.this, 
                                    "페이지 로드 실패. 인터넷 연결을 확인해주세요.", 
                                    Toast.LENGTH_LONG).show();
                            });
                        }
                    }
                }
                
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    // WebView 내에서 모든 링크 열기
                    return false;
                }
            });
            
            // WebView 보이기
            webView.setVisibility(android.view.View.VISIBLE);
            
            // React 앱 로드 (프로덕션)
            String url = "https://lost-finder-client.vercel.app/";
            Log.d(TAG, "URL 로드 중: " + url);
            webView.loadUrl(url);
        } else {
            Log.e(TAG, "WebView를 찾을 수 없습니다!");
        }
        
        // 뒤로가기 처리
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
        } catch (Exception e) {
            Log.e(TAG, "onCreate 오류: " + e.getMessage(), e);
            Toast.makeText(this, "앱 초기화 중 오류가 발생했습니다.", Toast.LENGTH_LONG).show();
        }
    }
    
    // 네트워크 연결 확인
    private boolean isNetworkAvailable() {
        try {
            ConnectivityManager connectivityManager = 
                (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
            
            if (connectivityManager != null) {
                NetworkInfo activeNetworkInfo = connectivityManager.getActiveNetworkInfo();
                return activeNetworkInfo != null && activeNetworkInfo.isConnected();
            }
            return false;
        } catch (Exception e) {
            Log.e(TAG, "네트워크 상태 확인 오류: " + e.getMessage());
            return true; // 오류 시 앱이 계속 실행되도록
        }
    }
    
    // 네트워크 오류 다이얼로그 표시
    private void showNetworkErrorDialog() {
        new AlertDialog.Builder(this)
            .setTitle("인터넷 연결 없음")
            .setMessage("인터넷에 연결되어 있지 않습니다.\n인터넷 연결 후 다시 시도해주세요.")
            .setPositiveButton("재시도", (dialog, which) -> {
                recreate(); // 액티비티 재시작
            })
            .setNegativeButton("종료", (dialog, which) -> {
                finish();
            })
            .setCancelable(false)
            .show();
    }
}

