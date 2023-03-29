FROM python:3.11

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN playwright install webkit

COPY . .

CMD [ "uvicorn", "server:app", "--host", "0.0.0.0", "--workers", "4" ]