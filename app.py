from flask import Flask, request, jsonify
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from PIL import Image
import requests
from io import BytesIO
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Дозволяємо CORS, щоб фронтенд міг робити запити

def is_valid_image(url):
    try:
        response = requests.get(url, timeout=5)
        image = Image.open(BytesIO(response.content))
        width, height = image.size
        return width >= 300 and height >= 300
    except Exception:
        return False

@app.route('/api/fetch-images', methods=['POST'])
def fetch_images():
    data = request.get_json()
    page_url = data.get('url')

    try:
        page = requests.get(page_url, timeout=10)
        soup = BeautifulSoup(page.content, 'html.parser')

        img_tags = soup.find_all('img')
        image_urls = []

        for tag in img_tags:
            src = tag.get('src') or tag.get('data-src')
            if not src:
                continue
            full_url = urljoin(page_url, src)
            if is_valid_image(full_url):
                image_urls.append(full_url)

        return jsonify(image_urls)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)