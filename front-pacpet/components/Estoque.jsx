import { api } from "../api/api";
import { useEffect, useState } from "react";

export function Estoque() {
    const [estoque, setEstoque] = useState(0);

    useEffect(() => {
        api.get("/estoque").then((res) => setEstoque(res.data.quantidadeAtual));
    }, []);

    return (
        <div className="card">
            <h3>Estoque Atual</h3>
            <p>{estoque} g</p>
        </div>
    );
}