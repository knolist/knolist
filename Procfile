release: source setup.sh
release: python3 manage.py db upgrade
release: npm run build
web: gunicorn manage:app