from flask import Flask, request, jsonify
from gnews import GNews
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)

# Initialize GNews object with default settings
google_news = GNews(language='en', country='US', period='7d', max_results=10)

@app.route('/news', methods=['GET'])
def get_news():
    # Get parameters from request
    keyword = request.args.get('keyword')
    topic = request.args.get('topic')
    location = request.args.get('location')
    site = request.args.get('site')
    
    # Update GNews object configuration
    google_news.language = request.args.get('language', 'en')
    google_news.country = request.args.get('country', 'US')
    google_news.period = request.args.get('period', '7d')
    google_news.max_results = int(request.args.get('max_results', 10))
    
    if 'exclude_websites' in request.args:
        google_news.exclude_websites = request.args.get('exclude_websites').split(',')
        print(google_news.exclude_websites)
    else:
        google_news.exclude_websites = []
    
    if 'start_date' in request.args:
        start_date = datetime.strptime(request.args.get('start_date'), '%Y-%m-%d')
        google_news.start_date = (start_date.year, start_date.month, start_date.day)
        print(google_news.start_date)
    else:
        google_news.start_date = None
    
    if 'end_date' in request.args:
        end_date = datetime.strptime(request.args.get('end_date'), '%Y-%m-%d')
        google_news.end_date = (end_date.year, end_date.month, end_date.day)
        
    else:
        google_news.end_date = None

    # Fetch news based on parameters
    if keyword:
        news = google_news.get_news(keyword)
    elif topic:
        news = google_news.get_news_by_topic(topic)
    elif location:
        news = google_news.get_news_by_location(location)
    elif site:
        news = google_news.get_news_by_site(site)
    else:
        news = google_news.get_top_news()

    response = jsonify(news)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == '__main__':
    app.run(debug=True)
    CORS(app, resources={r"/*": {"origins": "*"}})