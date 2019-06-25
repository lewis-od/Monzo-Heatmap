# Monzo Heatmap
A tiny web app that plots your Monzo transactions on a heatmap.

## Dev
Redis is used for caching. Ensure you have a Redis server running, then set
the `REDIS_URL` env variable, e.g.:
```bash
export REDIS_URL=redis://localhost:6379
```

We also use the google maps Javascript and Geocoding APIs. Create an API key for
each of these. In [index.html](), replace `YOUR_MAPS_API_KEY` in:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_MAPS_API_KEY&libraries=visualization" defer></script>
```
Then set the environment variable
```bash
export GMAPS_KEY=YOUR_GEOCODING_API_KEY
```
For dev purposes, these keys can be the same. For production, the Geocoding key
should be kept secret.

Finally:
```bash
pip install -r requirements.txt
export FLASK_APP=server
export FLASK_ENV=development
flask run
```

Then go to [http://localhost:5000/]().