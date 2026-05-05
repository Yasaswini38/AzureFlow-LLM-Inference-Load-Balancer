const evtSource = new EventSource("/stream");

evtSource.onmessage = function(event) {
    const data = JSON.parse(event.data);
    
    // Update Top Metric Cards
    document.getElementById('rps').innerText = data.rps;
    document.getElementById('lat').innerText = data.lat + 'ms';
    document.getElementById('queue').innerText = data.queue;

    // Build the Nodes Grid
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
            </div>
        `;
    }).join('');
};

async function killNode() {
    await fetch('/control/kill', { method: 'POST' });
    document.getElementById('log-msg').innerText = "Simulating infrastructure failure...";
    setTimeout(() => document.getElementById('log-msg').innerText = "", 1500);
}

async function restoreNodes() {
    await fetch('/control/restore', { method: 'POST' });
}