# C:\LostFinderProject\server\app.py
# Flask의 dotenv 로딩 완전 차단
import os
os.environ['FLASK_LOAD_DOTENV'] = 'false'
os.environ['LOAD_DOTENV'] = 'false'
os.environ['DOTENV_LOAD_NONE'] = 'true'

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
app.config['LOAD_DOTENV'] = False

# CORS 설정
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000"]}}, supports_credentials=True)

@app.route("/health")
def health():
    return jsonify({"ok": True})

@app.route("/api/login", methods=["POST"])
def login():
    try:
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or data.get("id") or "").strip()
        password = (data.get("password") or data.get("pw") or "")
        
        print(f"로그인 시도: {email}")
        
        if not email or not password:
            return jsonify({"ok": False, "message": "이메일과 비밀번호를 입력해 주세요."}), 400
        
        # 테스트 계정
        if email == "yoonjeongc@gmail.com" and password == "skinner1":
            return jsonify({
                "ok": True,
                "user": {"email": email, "name": "YJ"},
                "token": "dummy-token"
            }), 200
        
        return jsonify({"ok": False, "message": "이메일 또는 비밀번호가 일치하지 않습니다."}), 401
        
    except Exception as e:
        print(f"로그인 오류: {e}")
        return jsonify({"ok": False, "message": "서버 오류가 발생했습니다."}), 500

if __name__ == "__main__":
    print("🚀 Flask 서버 시작 중...")
    print("📝 테스트 계정: yoonjeongc@gmail.com / skinner1")
    app.run(host="127.0.0.1", port=5000, debug=True)
