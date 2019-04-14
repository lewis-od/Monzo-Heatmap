from flask import Blueprint, request, jsonify, send_from_directory
from flask_cors import cross_origin
import googlemaps
import redis
import os

gmaps_key = os.environ.get('GMAPS_KEY', "")
gmaps = googlemaps.Client(key=gmaps_key)
cache = redis.Redis(host='localhost', port=6379, db=0)

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
            res = gmaps.geocode(addr)
            if len(res) > 0:
                location = res[0]['geometry']['location']
                output[addr] = location
                cache.set(addr + ':lat', location['lat'])
                cache.set(addr + ':lng', location['lng'])

    return jsonify(output)
