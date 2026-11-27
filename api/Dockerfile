FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# TODO 23: Задокументируйте порт 8000 инструкцией EXPOSE.
CMD ["uvicorn", "shop.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
