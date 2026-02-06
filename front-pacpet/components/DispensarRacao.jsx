import { api } from "../api/api";
import { useState } from "react";

export function DispensarRacao() {
    const [tipo, setTipo] = useState("curto");
    const [feedback, setFeedback] = useState(null);

    const dispensar = async () => {
        const res = await api.post("/dispensar", { tipo });
        setFeedback(`Ração liberada (${res.data.tempo}s)`);
};

return (
    <div className="card">
        <h3>Liberação Manual</h3>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="Liberar ração">Médio (5s)</option>
        </select>
        <button onClick={dispensar}>Liberar Ração</button>
        {feedback && <p className="success">{feedback}</p>}
    </div>
);
}