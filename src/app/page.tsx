import { DEMO_OPTIONS } from "@/lib/demo-scenario";
import { HomeClient } from "@/components/family/HomeClient";

export default function Home() {
  const maria = {
    id: "maria",
    name: "Maria Souza",
    cpfChild: "***.***.***-**",
    group: "Berçário",
    protocol: "2027-004412",
    numOpcoes: DEMO_OPTIONS.length,
    status: DEMO_OPTIONS[0].statusReal,
    momento: "Acompanhamento de fila",
  };

  return <HomeClient maria={maria} />;
}
