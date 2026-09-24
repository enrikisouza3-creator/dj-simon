import { redirect } from "next/navigation";

// Antes havia um formulário de login duplicado aqui (idêntico ao de
// /membro/login), o que já causou bug de divergência entre os dois
// (fix aplicado em um arquivo e esquecido no outro — botão "ENTRANDO..."
// travava pra sempre em /membro/login).
// Agora /membro é só um redirect: única fonte de verdade em /membro/login.
export default function MembroIndex() {
  redirect("/membro/login");
}
