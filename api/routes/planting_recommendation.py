import os
import json
import requests
from datetime import datetime
from flask import Blueprint, request, jsonify
from utils.middleware import login_required   

planting_bp = Blueprint('planting', __name__, url_prefix='/planting')
API_KEY = os.getenv("OPENWEATHER_API")
if not API_KEY:
    raise RuntimeError("OPENWEATHER_API key missing in environment")

def load_json(path, default):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return default

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CROPS          = load_json(os.path.join(BASE_DIR, "..", "data", "crops.json"), [])
PLANTING_RULES = load_json(os.path.join(BASE_DIR, "..", "data", "planting_rules.json"), {})

def _geo_ip():
    """
    Fallback bila user tidak kirim lat/lon.
    Mengembalikan dict {'lat':.., 'lon':.., 'name':..}
    """
    try:
        ip = request.headers.get("X-Forwarded-For", request.remote_addr).split(",")[0]
        geo = requests.get(f"https://ipapi.co/{ip}/json/", timeout=3).json()
        return {
            "lat": float(geo.get("latitude")),
            "lon": float(geo.get("longitude")),
            "name": f"{geo.get('city')}, {geo.get('region')}"
        }
    except Exception:
        # Default ke Indonesia
        return {"lat": -2.5489, "lon": 118.0149, "name": "Indonesia"}

def get_weather_data(lat, lon):
    current_url = (
        f"https://api.openweathermap.org/data/2.5/weather"
        f"?lat={lat}&lon={lon}&appid={API_KEY}&units=metric&lang=id"
    )
    forecast_url = (
        f"https://api.openweathermap.org/data/2.5/forecast"
        f"?lat={lat}&lon={lon}&appid={API_KEY}&units=metric&lang=id"
    )

    cur  = requests.get(current_url, timeout=10).json()
    fore = requests.get(forecast_url, timeout=10).json()

    current = {
        "temp": round(cur["main"]["temp"]),
        "humidity": cur["main"]["humidity"],
        "windSpeed": round(cur["wind"].get("speed", 0), 1),
        "visibility": round(cur.get("visibility", 0) / 1000),
        "description": cur["weather"][0]["description"],
        "pressure": cur["main"]["pressure"]
    }
    forecast = process_forecast(fore["list"])
    return {"current": current, "forecast": forecast}

def process_forecast(raw):
    daily = {}
    for item in raw:
        dt = datetime.fromtimestamp(item["dt"])
        key = dt.strftime("%Y-%m-%d")
        if key not in daily:
            daily[key] = {
                "date": _fmt_id_date(dt),
                "temps": [], "humidity": [], "rainfall": 0, "windSpeed": []
            }
        daily[key]["temps"].append(item["main"]["temp"])
        daily[key]["humidity"].append(item["main"]["humidity"])
        daily[key]["windSpeed"].append(item["wind"].get("speed", 0))
        rain = item.get("rain", {})
        daily[key]["rainfall"] += rain.get("3h", rain.get("1h", 0) * 3)
    out = []
    for k in sorted(daily):
        d = daily[k]
        out.append({
            "date": d["date"],
            "tempMin": round(min(d["temps"])),
            "tempMax": round(max(d["temps"])),
            "tempAvg": round(sum(d["temps"]) / len(d["temps"])),
            "humidity": round(sum(d["humidity"]) / len(d["humidity"])),
            "rainfall": round(d["rainfall"], 1),
            "windSpeed": round(sum(d["windSpeed"]) / len(d["windSpeed"]), 1)
        })
    return out

def _fmt_id_date(dt):
    days   = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
    months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
              "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
    return f"{days[dt.weekday()]}, {dt.day} {months[dt.month-1]}"

def recommend_crop(weather, crop_id):
    crop  = next((c for c in CROPS if c["id"] == crop_id), None)
    rules = PLANTING_RULES.get(crop_id)
    if not crop or not rules or not weather.get("forecast"):
        return {"status": "unknown", "statusText": "Data tidak lengkap",
                "recommendation": "Tidak dapat memberikan rekomendasi"}

    forecast = weather["forecast"][:8]
    if not forecast:
        return {"status": "unknown", "statusText": "Data tidak lengkap",
                "recommendation": "Tidak dapat memberikan rekomendasi"}

    # average metrics
    avgT   = round(sum(d["tempAvg"] for d in forecast) / len(forecast))
    totalR = round(sum(d["rainfall"] for d in forecast), 1)
    avgH   = round(sum(d["humidity"] for d in forecast) / len(forecast))

    # scoring
    def score(val, opt, acc):
        if opt["min"] <= val <= opt["max"]:
            return 1.0
        elif acc["min"] <= val <= acc["max"]:
            return 0.6
        return 0.2

    tScore = score(avgT, rules["temperature"]["optimal"], rules["temperature"]["acceptable"])
    rScore = score(totalR, rules["rainfall"]["optimal"], rules["rainfall"]["acceptable"])
    hScore = score(avgH, rules["humidity"]["optimal"], rules["humidity"]["acceptable"])
    overall = (tScore + rScore + hScore) / 3

    # avoid conditions
    issues = []
    maxDry = 0
    streak = 0
    for d in forecast:
        if d["rainfall"] < 1:
            streak += 1
            maxDry = max(maxDry, streak)
        else:
            streak = 0
    if maxDry > rules["avoidConditions"]["maxConsecutiveDryDays"]:
        issues.append(f"{maxDry} hari berturut-turut tanpa hujan")
    maxRain = max(d["rainfall"] for d in forecast)
    if maxRain > rules["avoidConditions"]["maxDailyRainfall"]:
        issues.append(f"hujan terlalu deras ({maxRain}mm/hari)")
    minTemp = min(d["tempMin"] for d in forecast)
    if minTemp < rules["avoidConditions"]["minTemperature"]:
        issues.append(f"suhu terlalu rendah ({minTemp}°C)")

    # best dates
    best = []
    for d in forecast:
        if (rules["temperature"]["acceptable"]["min"] <= d["tempAvg"] <= rules["temperature"]["acceptable"]["max"] and
            d["rainfall"] <= rules["avoidConditions"]["maxDailyRainfall"] and
            rules["humidity"]["acceptable"]["min"] <= d["humidity"] <= rules["humidity"]["acceptable"]["max"] and
            d["tempMin"] >= rules["avoidConditions"]["minTemperature"]):
            best.append(d["date"])
    best = best[:3]

    # status mapping
    if issues:
        status, txt, rec = "bad", "Tidak Disarankan", f"Hindari menanam karena: {', '.join(issues)}"
        best = []
    elif overall >= 0.8 and best:
        status, txt, rec = "optimal", "Sangat Baik", f"Kondisi sangat optimal untuk menanam {crop['name']}."
    elif overall >= 0.6 and best:
        status, txt, rec = "good", "Baik", f"Kondisi baik untuk menanam {crop['name']}."
    elif overall >= 0.4:
        status, txt = "poor", "Kurang Baik"
        rec = "Kondisi kurang optimal tapi masih memungkinkan." if best else "Pertimbangkan menunda penanaman."
    else:
        status, txt, rec = "bad", "Buruk", "Kondisi tidak mendukung. Disarankan menunda."
        best = []

    return {
        "status": status, "statusText": txt, "recommendation": rec,
        "bestDates": best,
        "avgTemp": avgT, "totalRainfall": totalR, "avgHumidity": avgH,
        "scores": {"temperature": tScore, "rainfall": rScore,
                   "humidity": hScore, "overall": overall}
    }

@planting_bp.route("/weather")
@login_required
def api_weather():
    """
    GET /planting/weather?lat=..&lon=..
    Jika lat/lon kosong → gunakan lokasi otomatis.
    """
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    location_name = request.args.get("location_name")

    if lat is None or lon is None:
        geo = _geo_ip()
        lat, lon = geo["lat"], geo["lon"]
        location_name = geo["name"]

    try:
        data = get_weather_data(lat, lon)
        return jsonify({
            **data,
            "location": {"name": location_name or "Lokasi Anda",
                         "coords": {"lat": lat, "lon": lon}}
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@planting_bp.route("/recommendation")
@login_required
def api_recommendation():
    """
    GET /planting/recommendation?crop_id=padi&lat=..&lon=..
    """
    crop_id = request.args.get("crop_id", "padi")
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)

    if lat is None or lon is None:
        geo = _geo_ip()
        lat, lon = geo["lat"], geo["lon"]

    try:
        weather = get_weather_data(lat, lon)
        rec = recommend_crop(weather, crop_id)
        return jsonify([rec])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@planting_bp.route("/recommendations")
@login_required
def api_recommendations_all():
    """
    GET /planting/recommendations?crop_id=all
    Kalau crop_id=all → return rekomendasi semua tanaman
    Kalau crop_id=padi → return satu tanaman
    """
    crop_id = request.args.get("crop_id", "all")
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)

    if lat is None or lon is None:
        geo = _geo_ip()
        lat, lon = geo["lat"], geo["lon"]

    if crop_id == "all":
        # kirim array rekomendasi semua tanaman
        results = []
        for crop in CROPS:
            rec = recommend_crop(get_weather_data(lat, lon), crop["id"])
            results.append({**rec, "crop": crop["name"], "id": crop["id"]})
        return jsonify(results)

    # satu tanaman
    rec = recommend_crop(get_weather_data(lat, lon), crop_id)
    rec["crop"] = next(c["name"] for c in CROPS if c["id"] == crop_id)
    return jsonify(rec)


@planting_bp.route("/crops")
@login_required
def api_crops():
    """Daftar tanaman yang tersedia"""
    return jsonify(CROPS)