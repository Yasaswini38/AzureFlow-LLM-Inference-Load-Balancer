import asyncio
import json
import random
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# --- GLOBAL STATE ---
MODELS = ["GPT-4o", "Mistral-7B", "Llama-3.1"]
node_status = [True] * 6
is_spike = False

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(
        request=request, name="index.html", context={"request": request}
    )

@app.get("/stream")
async def stream_metrics():
    async def generate():
        global is_spike
        while True:
            alive_count = sum(node_status)
            multiplier = 2.5 if is_spike else 1.0
            
            # Simulated MaaS Telemetry
            payload = {
                "rps": int(random.randint(15, 30) * multiplier) if alive_count > 0 else 0,
                "lat": int(random.randint(110, 240) * (1.4 if is_spike else 1.0)),
                "queue": int(random.randint(1, 10) * multiplier),
                "nodes": [
                    {
                        "id": f"node-{i+1:02}",
                        "model": MODELS[i % 3],
                        "load": random.randint(15, 95) if node_status[i] else 0,
                        "latency": random.randint(90, 380) if node_status[i] else 0,
                        "alive": node_status[i]
                    } for i in range(6)
                ]
            }
            yield f"data: {json.dumps(payload)}\n\n"
            await asyncio.sleep(1.2)
    return StreamingResponse(generate(), media_type="text/event-stream")

@app.post("/control/spike")
async def trigger_spike():
    global is_spike
    is_spike = True
    await asyncio.sleep(8) 
    is_spike = False
    return {"status": "spike_reset"}

@app.post("/control/kill")
async def kill_node():
    alive = [i for i, s in enumerate(node_status) if s]
    if len(alive) > 1: node_status[random.choice(alive)] = False
    return {"status": "ok"}

@app.post("/control/restore")
async def restore():
    global node_status
    node_status = [True] * 6
    return {"status": "ok"}
