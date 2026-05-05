// Configuration
const MODELS = ['GPT-4o', 'Mistral-7B', 'Llama-3.1'];
let tpHistory = new Array(20).fill(0);

const evtSource = new EventSource("/stream");

evtSource.onmessage = function(event) {
    const data = JSON.parse(event.data);
    
    // 1. Update Numeric Metrics
    document.getElementById('rps').innerText = data.rps;
    document.getElementById('lat').innerText = data.lat + 'ms';
    document.getElementById('queue').innerText = data.queue;

    // 2. Update Throughput Graph
    tpHistory.push(data.rps);
    tpHistory.shift();
    const row = document.getElementById('tp-row');
    const max = Math.max(...tpHistory, 1);
    row.innerHTML = tpHistory.map(v => {
        const pct = Math.round((v / max) * 100);
        return `<div class="tp-bar" style="height:${Math.max(pct, 5)}%"></div>`;
    }).join('');

    // 3. Update Request Stream
    const list = document.getElementById('req-list');
    const statuses = ['done', 'processing', 'routing'];
    const newReq = `
        <div class="req">
            <span class="req-id">#${Math.floor(Math.random() * 9000 + 1000)}</span>
            <span class="req-model">${MODELS[Math.floor(Math.random() * 3)]}</span>
            <span class="req-status status-${statuses[Math.floor(Math.random() * 3)]}">${statuses[Math.floor(Math.random() * 3)]}</span>
        </div>`;
    list.insertAdjacentHTML('afterbegin', newReq);
    if (list.children.length > 6) list.lastElementChild.remove();

    // 4. Update Nodes Grid
    const grid = document.getElementById('nodes-grid');
    grid.innerHTML = data.nodes.map(n => {
        const load = n.load || 0;
        const statusClass = load > 85 ? 'hot' : 'cool';
        const barClass = load > 85 ? 'bar-red' : 'bar-green';
        return `
            <div class="node ${n.alive ? statusClass : ''}" style="opacity: ${n.alive ? 1 : 0.3}">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="font-size:14px">${n.id}</strong>
                    <span style="background:#0f172a; padding:3px 10px; border-radius:6px; font-size:11px; font-weight:bold">${n.model}</span>
                </div>
                <div class="bar-track">
                    <div class="bar-fill ${barClass}" style="width: ${load}%"></div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:11px; color:#94a3b8">
                    <span>${n.alive ? `Active Load: ${load}%` : 'Replica Down'}</span>
                    <span>${n.alive ? n.latency + 'ms' : '--'}</span>
                </div>
            </div>`;
    }).join('');

    // 5. Update Latency Bars
    renderLatencyBars();
};

function renderLatencyBars() {
    const container = document.getElementById('lat-bars');
    container.innerHTML = MODELS.map(m => `
        <div style="margin-bottom:8px">
            <div style="font-size:10px; color:#94a3b8; margin-bottom:4px">${m}</div>
            <div style="display:flex; align-items:center; gap:10px">
                <div class="bar-track" style="flex:1; margin:0"><div class="bar-fill bar-green" style="width:${Math.random()*50+30}%"></div></div>
                <span style="font-size:10px">${Math.floor(Math.random()*100+120)}ms</span>
            </div>
        </div>`).join('');
}

// Control API Hooks
async function addSpike() { 
    document.getElementById('sim-note').innerText = "Injecting Spike...";
    await fetch('/control/spike', {method: 'POST'});
    setTimeout(() => { document.getElementById('sim-note').innerText = ""; }, 3000);
}
async function killNode() { await fetch('/control/kill', {method: 'POST'}); }
async function healNodes() { await fetch('/control/restore', {method: 'POST'}); }
