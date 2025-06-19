from flask import Flask, request, jsonify, Response
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse, unquote
from PIL import Image
import requests
from io import BytesIO
import os
from flask_cors import CORS
import re

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


def get_filename_from_url(url):
    path = urlparse(url).path
    filename = os.path.basename(path)
    filename = unquote(filename)
    if not filename or '.' not in filename:
        filename = 'image.jpg'
    # Замінюємо символи, які можуть бути проблемними у імені файлу
    filename = re.sub(r'[^\w\-.]', '_', filename)
    return filename


@app.route('/api/download')
def download_image():
    img_url = request.args.get('url')
    if not img_url:
        return jsonify({'error': 'Missing url parameter'}), 400
    try:
        headers_req = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
            # 'Referer': 'https://example.com/'  # за потреби додай реферер
        }
        resp = requests.get(img_url, headers=headers_req, stream=True, timeout=10)
        resp.raise_for_status()

        filename = get_filename_from_url(img_url)

        response_headers = {
            'Content-Disposition': f'attachment; filename="{filename}"',
            'Content-Type': resp.headers.get('Content-Type', 'application/octet-stream')
        }
        return Response(resp.content, headers=response_headers)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)