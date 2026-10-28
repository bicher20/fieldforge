FROM python:3.12-slim

WORKDIR /srv/app

RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p app/static/uploads

EXPOSE 8000

CMD ["sh", "-c", "python scripts/seed_demo_data.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
