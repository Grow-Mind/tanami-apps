from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta

harvest_bp = Blueprint('harvest', __name__)

CROP_DATA = {
    "tomat":     {"yield_per_m2": 0.8, "price_per_kg": 5000, "days": 75},
    "cabai":     {"yield_per_m2": 0.6, "price_per_kg": 12000, "days": 90},
    "selada":    {"yield_per_m2": 1.2, "price_per_kg": 3000, "days": 45},
    "wortel":    {"yield_per_m2": 1.0, "price_per_kg": 4000, "days": 60},
    "bayam":     {"yield_per_m2": 1.5, "price_per_kg": 2500, "days": 30},
    "bawang-merah": {"yield_per_m2": 1.1, "price_per_kg": 14000, "days": 100},
    "bawang-putih": {"yield_per_m2": 0.9, "price_per_kg": 30000, "days": 120},
    "kentang":   {"yield_per_m2": 2.5, "price_per_kg": 6000, "days": 90},
    "terong":    {"yield_per_m2": 0.7, "price_per_kg": 4500, "days": 70},
    "mentimun":  {"yield_per_m2": 1.3, "price_per_kg": 3500, "days": 45},
    "kangkung":  {"yield_per_m2": 2.0, "price_per_kg": 2000, "days": 25},
    "sawi":      {"yield_per_m2": 1.8, "price_per_kg": 2200, "days": 30},
    "semangka":  {"yield_per_m2": 4.0, "price_per_kg": 4000, "days": 80},
    "melon":     {"yield_per_m2": 3.5, "price_per_kg": 5000, "days": 75},
    "jeruk":     {"yield_per_m2": 1.5, "price_per_kg": 8000, "days": 365},
    "mangga":    {"yield_per_m2": 2.0, "price_per_kg": 12000, "days": 365},
    "padi":      {"yield_per_m2": 0.5, "price_per_kg": 7000, "days": 120},
    "jagung":    {"yield_per_m2": 0.7, "price_per_kg": 4000, "days": 90},
    "kedelai":   {"yield_per_m2": 0.4, "price_per_kg": 10000, "days": 85},
}

@harvest_bp.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()

    crop = data.get("crop_type", "").lower()
    area = float(data.get("area", 0))
    planting_date_str = data.get("planting_date")
    user_price_per_kg = data.get("price_per_kg")

    # Validasi
    if crop not in CROP_DATA:
        return jsonify({"error": "crop_type tidak dikenal"}), 400

    if not planting_date_str:
        return jsonify({"error": "planting_date harus disertakan dalam format YYYY-MM-DD"}), 400

    try:
        planting_date = datetime.strptime(planting_date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Format tanggal salah. Gunakan YYYY-MM-DD."}), 400

    info = CROP_DATA[crop]

    # Gunakan harga dari user jika tersedia, jika tidak pakai default
    price_per_kg = float(user_price_per_kg) if user_price_per_kg else info["price_per_kg"]

    estimated_yield = area * info["yield_per_m2"]
    estimated_income = estimated_yield * price_per_kg
    estimated_harvest_date = planting_date + timedelta(days=info["days"])

    return jsonify({
        "crop_type": crop,
        "area": area,
        "price_per_kg": int(price_per_kg),
        "estimated_yield": round(estimated_yield, 2),
        "estimated_income": int(estimated_income),
        "harvest_duration_days": info["days"],
        "estimated_harvest_date": estimated_harvest_date.isoformat()
    }), 200
