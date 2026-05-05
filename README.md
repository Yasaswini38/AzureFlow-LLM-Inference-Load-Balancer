# AzureFlow — LLM Inference Load Balancer

### Why This Project?
In a production AI environment, you never send a user's request directly to a single GPU or model instance. High-traffic applications require a **Gateway** or **Load Balancer** to manage thousands of simultaneous requests across a global cluster of model replicas.

**AzureFlow** simulates the critical "Traffic Manager" layer of AI infrastructure. It provides a visual and functional representation of how **Model-as-a-Service (MaaS)** platforms (like Azure OpenAI or Anthropic) maintain high availability and low latency during high-demand scenarios.

### The Problem It Solves
*   **Infrastructure Blindness**: In standard API setups, developers can't see why a request is slow. AzureFlow provides **Observability**, showing real-time load and latency across every node.
*   **Unmanaged Failures**: If a GPU cluster goes down, the system must reroute traffic instantly. This project demonstrates **Fault Tolerance** through its "Kill Node" simulation logic.
*   **Resource Bottlenecks**: It addresses **Load Imbalance** by simulating a "Least-Connections" routing strategy, ensuring no single replica is overwhelmed while others are idle.

---

### Module Breakdown

| Module | Technical Responsibility |
| :--- | :--- |
| **`app.py` (Backend)** | The **Control Plane**. It manages the state of the 6 inference replicas and pushes real-time telemetry via a Server-Sent Events (SSE) stream. |
| **`templates/index.html`** | The **Dashboard Skeleton**. It provides the entry point and structural layout for the Azure-themed "Portal". |
| **`static/style.css`** | The **Visual Layer**. It defines the professional dark theme, the "Hot/Cool" node states based on load, and the responsive grid system. |
| **`static/script.js`** | The **Real-Time Orchestrator**. It maintains the open connection to the backend and dynamically builds the HTML components as data arrives. |

---

###  Key Engineering Concepts Demonstrated
1.  **Real-time Telemetry**: Uses **SSE (Server-Sent Events)** to push live metrics (RPS, Latency, Queue Depth) without page refreshes.
2.  **Distributed Health Monitoring**: Simulates how a gateway tracks the "Liveness" of backend inference nodes.
3.  **Chaos Engineering**: Includes a manual "Kill Node" trigger to demonstrate how a distributed system handles unexpected replica failures.

---

### How to Run Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/AzureFlow.git
   cd AzureFlow
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the server:**
```bash 
uicorn app:app --reload
```

**Developed by Yasaswini Padamati**  
*Technical Professional | AI Engineering Enthusiast*
