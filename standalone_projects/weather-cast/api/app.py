from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import datetime

app = Flask(__name__)
CORS(app)

# 城市经纬度映射 (用于 Open-Meteo API)
CITY_COORDS = {
    '北京': {'lat': 39.9042, 'lon': 116.4074},
    '上海': {'lat': 31.2304, 'lon': 121.4737},
    '广州': {'lat': 23.1291, 'lon': 113.2644},
    '深圳': {'lat': 22.5431, 'lon': 114.0579},
    '成都': {'lat': 30.5728, 'lon': 104.0668},
    '杭州': {'lat': 30.2741, 'lon': 120.1551},
    '武汉': {'lat': 30.5928, 'lon': 114.3055},
    '西安': {'lat': 34.3416, 'lon': 108.9398},
    '南京': {'lat': 32.0603, 'lon': 118.7969},
    '重庆': {'lat': 29.5628, 'lon': 106.5818},
    '长沙': {'lat': 28.2282, 'lon': 112.9388},
    '天津': {'lat': 39.0842, 'lon': 117.2009},
    '苏州': {'lat': 31.2989, 'lon': 120.5853},
    '郑州': {'lat': 34.7466, 'lon': 113.6253},
    '东莞': {'lat': 23.0208, 'lon': 113.7518},
}

# WMO 天气代码转换
def get_condition_from_code(code):
    if code == 0: return '晴天'
    if code in [1, 2, 3]: return '多云'
    if code in [45, 48]: return '雾'
    if code in [51, 53, 55]: return '毛毛雨'
    if code in [61, 63, 65]: return '雨天'
    if code in [80, 81, 82]: return '阵雨'
    if code in [95, 96, 99]: return '雷阵雨'
    if code in [71, 73, 75, 77]: return '雪'
    return '阴'

@app.route('/api/weather', methods=['GET'])
def get_weather():
    city_name = request.args.get('city', '北京')
    
    # 模糊匹配城市
    coords = None
    matched_name = city_name
    
    # 1. 精确/模糊查找
    for k, v in CITY_COORDS.items():
        if k in city_name or city_name in k:
            coords = v
            matched_name = k
            break
            
    # 2. 如果没找到，尝试使用 Geocoding API (Open-Meteo) 搜索
    if not coords:
        try:
            geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city_name}&count=1&language=zh&format=json"
            geo_res = requests.get(geo_url).json()
            if 'results' in geo_res and len(geo_res['results']) > 0:
                result = geo_res['results'][0]
                coords = {'lat': result['latitude'], 'lon': result['longitude']}
                matched_name = result['name']
        except Exception as e:
            print(f"Geocoding error: {e}")

    # 如果还是没找到，返回北京的数据作为默认，但在前端可能显示为未找到
    if not coords:
        coords = CITY_COORDS['北京']
        matched_name = f"{city_name} (未找到, 显示北京)"

    try:
        # 调用 Open-Meteo API
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": coords['lat'],
            "longitude": coords['lon'],
            "current": ["temperature_2m", "relative_humidity_2m", "weather_code", "wind_speed_10m", "pressure_msl"],
            "daily": ["weather_code", "temperature_2m_max", "temperature_2m_min"],
            "timezone": "auto",
            "forecast_days": 6
        }
        
        response = requests.get(url, params=params)
        data = response.json()
        
        current = data['current']
        daily = data['daily']
        
        # 构造预报数据
        forecast_list = []
        today = datetime.date.today()
        
        for i in range(1, 6): # 未来5天
            date_obj = datetime.datetime.strptime(daily['time'][i], '%Y-%m-%d').date()
            weekday_str = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][date_obj.weekday()]
            
            forecast_list.append({
                'day': weekday_str,
                'date': daily['time'][i],
                'temp_high': round(daily['temperature_2m_max'][i]),
                'temp_low': round(daily['temperature_2m_min'][i]),
                'condition': get_condition_from_code(daily['weather_code'][i])
            })

        weather_data = {
            'city': matched_name,
            'temp': round(current['temperature_2m']),
            'condition': get_condition_from_code(current['weather_code']),
            'humidity': current['relative_humidity_2m'],
            'wind': round(current['wind_speed_10m']),
            'aqi': 50, # Open-Meteo 免费版不含 AQI，暂时模拟
            'pressure': round(current['pressure_msl']),
            'forecast': forecast_list
        }
        
        return jsonify(weather_data)

    except Exception as e:
        print(f"API Error: {e}")
        return jsonify({'error': 'Failed to fetch weather data'}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
