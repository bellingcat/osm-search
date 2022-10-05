## systemd configuration

`/etc/systemd/system/osm-api.service`

```
[Unit]
Description=Gunicorn instance to serve osm-api
After=network.target

[Service]
User=root
Group=www-data
WorkingDirectory=/root/osm-api
ExecStart=/usr/local/bin/pipenv run gunicorn --workers 3 -t 120 --bind 0.0.0.0:5000 api:app

[Install]
WantedBy=multi-user.target
```
