from flask import Blueprint, request, jsonify, send_from_directory
import googlemaps
import redis
import os

gmaps_key = os.environ.get('GMAPS_KEY', "")
gmaps = googlemaps.Client(key=gmaps_key)
cache = redis.from_url(os.environ.get('REDIS_URL'))

bp = Blueprint('app', __name__)

@bp.route('/')
def index():
    return send_from_directory(os.pardir, 'index.html')

@bp.route('/js/<path:path>')
def js(path):
    return send_from_directory(os.path.join(os.pardir, 'js'), path)

@bp.route('/css/<path:path>')
def css(path):
    return send_from_directory(os.path.join(os.pardir, 'css'), path)

@bp.route('/geocode', methods=('POST',))
def geocode():
    addresses = request.get_json()
    output = {}
    for addr in addresses:
        stored_lat = cache.get(addr + ':lat')
        if stored_lat is not None:
            stored_lng = cache.get(addr + ':lng')
            output[addr] = { 'lat': float(stored_lat), 'lng': float(stored_lng) }
        else:
            # Bias results to the UK
            bounds = {
                'southwest': '49.923465,-6.547706',
                'northeast': '59.454472, 0.081914'
            }
            res = gmaps.geocode(addr, bounds=bounds)
            if len(res) > 0:
                location = res[0]['geometry']['location']
                output[addr] = location
                cache.set(addr + ':lat', location['lat'])
                cache.set(addr + ':lng', location['lng'])

    return jsonify(output)
