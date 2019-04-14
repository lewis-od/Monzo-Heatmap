from flask import Flask, request, jsonify, send_from_directory
from config import gmaps_key
import googlemaps
import os

gmaps = googlemaps.Client(key=gmaps_key)
cache = {}

app = Flask(__name__)

@app.route('/')
def index():
    return send_from_directory(os.curdir, 'index.html')

@app.route('/js/<path:path>')
def js(path):
    return send_from_directory('js', path)

@app.route('/css/<path:path>')
def css(path):
    return send_from_directory('css', path)

@app.route('/geocode', methods=('POST',))
def geocode():
    addresses = request.get_json()
    output = {}
    for addr in addresses:
        if addr in cache.keys():
            output[addr] = cache[addr]
        else:
            res = gmaps.geocode(addr)
            if len(res) > 0:
                location = res[0]['geometry']['location']
                output[addr] = location
                cache[addr] = location

    return jsonify(output)
