import React from "react";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Status from "../components/Status";
import ManualFeeding from "../components/ManualFeeding";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <>
      <Navbar />

      <main className="dashboard">
        <Card title="Pet 🐶😺">
          <p>
            <strong>Nome:</strong> {user?.petName || "Não informado"}
          </p>
          <p>
            <strong>Dono:</strong> {user?.name || "Não informado"}
          </p>
        </Card>

        <Card title="Liberação Manual">
          <ManualFeeding />
        </Card>

        <Card title="Status">
          <Status />
        </Card>



      </main>
    </>
  );
}
