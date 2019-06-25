# Monzo Heatmap
A tiny web app that plots your Monzo transactions on a heatmap.

## Dev
We use Redis for caching. Ensure you have a Redis server running, then set
the `REDIS_URL` env variable, e.g.:
```bash
export REDIS_URL=redis://localhost:6379
```

We also use the google maps Javascript and Geocoding APIs, so you'll need an
API key that can access those. Then set `GMAPS_KEY`.

Finally:
```bash
pip install -r requirements.txt
export FLASK_APP=server
export FLASK_ENV=development
flask run
```

Then go to [http://localhost:5000/].