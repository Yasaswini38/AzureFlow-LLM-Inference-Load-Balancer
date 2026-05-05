import asyncio
import json
import random
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Setup folder paths
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# --- GLOBAL CONFIG & STATE ---
MODELS = ["GPT-4o", "Mistral-7B", "Llama-3.1"]
NODE_COUNT = 6
# State: True for Online, False for Offline
node_status = [True] * NODE_COUNT

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="index.html", 
        context={"request": request}
    )

@app.get("/stream")
async def stream_metrics():
    async def generate():
        while True:
            alive_count = sum(node_status)
            
            # Logic: If nodes are dead, latency goes up and RPS goes down
            payload = {
                "rps": random.randint(18, 35) if alive_count > 0 else 0,
                "lat": random.randint(110, 240) if alive_count > 3 else random.randint(450, 900),
                "queue": random.randint(1, 15),
                "nodes": [
                    {
                        "id": f"node-{i+1:02}",
                        "model": MODELS[i % 3],
                        "load": random.randint(15, 95) if node_status[i] else 0,
                        "latency": random.randint(80, 380) if node_status[i] else 0,
                        "alive": node_status[i]
                    } for i in range(NODE_COUNT)
                ]
            }
            
            # SSE Format requirement: "data: <json>\n\n"
            yield f"data: {json.dumps(payload)}\n\n"
            await asyncio.sleep(1.2)

    return StreamingResponse(generate(), media_type="text/event-stream")

@app.post("/control/kill")
async def kill_node():
    alive = [i for i, status in enumerate(node_status) if status]
    if len(alive) > 1:
        target = random.choice(alive)
        node_status[target] = False
    return {"status": "ok"}

@app.post("/control/restore")
async def restore_all():
    global node_status
    node_status = [True] * NODE_COUNT
    return {"status": "ok"}