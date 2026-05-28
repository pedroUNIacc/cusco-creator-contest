// ============================================================
// Página principal do Pit Stop do Cusco (rota "/")
// Concentra: hero, simulador de pedido, Cãocurso, Cusco Clan,
// autenticação local, modal de login e formulário de inscrição.
// Persistência: tudo em localStorage (sem backend ainda).
// ============================================================

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import logo from "@/assets/logo.png";

// Imagens das raças usadas no carrossel e no simulador
import dogCaramelo from "@/assets/dog-caramelo.png";
import dogGolden from "@/assets/dog-golden.png";
import dogFox from "@/assets/dog-fox.png";
import dogDoberman from "@/assets/dog-doberman.png";
import dogRott from "@/assets/dog-rott.png";

// Componentes do shadcn que montam o carrossel da hero
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";


// Rota principal do TanStack Router — define metadados (SEO/og) e fontes da página
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pit Stop do Cusco — Hot Dogs no Barra Shopping" },
      {
        name: "description",
        content:
          "Monte seu cusco, vote no Cãocurso do Mês e venha nos visitar no Barra Shopping. Hot dogs com raça!",
      },
      { property: "og:title", content: "Pit Stop do Cusco" },
      {
        property: "og:description",
        content: "Adote seu cusco e participe do Cãocurso do Mês!",
      },
    ],
    links: [
      // Carrega as fontes Fredoka (display) e Nunito (texto) usadas no design
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap",
      },
    ],
  }),
  component: Index,
});



// ---------------- DADOS ESTÁTICOS DO CARDÁPIO ----------------

// Tipo que representa uma raça/opção de hot dog no cardápio
type Breed = {
  id: string;            // identificador único usado para selecionar a raça
  name: string;          // nome exibido (ex.: "Caramelo")
  tag: string;           // subtítulo curto e divertido
  desc: string;          // descrição do recheio
  price: number;         // preço base em reais
  img: string;           // imagem importada da pasta assets
  vibe: string;          // frase curta para o resumo do pedido
  maxComplements: number;// quantos complementos podem ser marcados
};

// Catálogo de raças exibido no carrossel da hero e no simulador.
// Cada raça tem seu próprio limite de complementos.
const BREEDS: Breed[] = [

  {
    id: "caramelo",
    name: "Caramelo",
    tag: "O vira-lata básico (e raiz)",
    desc: "Pão, salsicha + 1 complemento",
    price: 5,
    img: dogCaramelo,
    vibe: "Pra quem é fiel ao básico bom.",
    maxComplements: 1,
  },
  {
    id: "golden",
    name: "Golden",
    tag: "Dócil, mas fominha",
    desc: "Caramelo + 1 salsicha extra",
    price: 7,
    img: dogGolden,
    vibe: "Dobrou na salsicha, dobrou no amor.",
    maxComplements: 1,
  },
  {
    id: "fox",
    name: "FoxPaulistinha",
    tag: "Pequeno notável",
    desc: "Pão, salsicha + 5 complementos",
    price: 10,
    img: dogFox,
    vibe: "Recheado até o último latido.",
    maxComplements: 5,
  },
  {
    id: "doberman",
    name: "Doberman",
    tag: "Imponente, sem frescura",
    desc: "FoxPaulistinha + 1 salsicha extra",
    price: 12,
    img: dogDoberman,
    vibe: "Pra fome braba.",
    maxComplements: 5,
  },
  {
    id: "rottweiler",
    name: "Rottweiler",
    tag: "Top da matilha",
    desc: "Pão + 2 linguiças + 5 complementos (sem salsicha)",
    price: 15,
    img: dogRott,
    vibe: "Late forte, come mais forte ainda.",
    maxComplements: 5,
  },
];

// Lista de complementos que o cliente pode marcar no simulador.
// O limite por pedido vem do campo `maxComplements` da raça escolhida.
const COMPLEMENTS: { id: string; name: string; emoji: string }[] = [
  { id: "batata", name: "Batata palha", emoji: "🥔" },
  { id: "milho", name: "Milho", emoji: "🌽" },
  { id: "ervilha", name: "Ervilha", emoji: "🟢" },
  { id: "queijo", name: "Queijo ralado", emoji: "🧀" },
  { id: "cebola", name: "Cebola crispy", emoji: "🧅" },
  { id: "bacon", name: "Bacon", emoji: "🥓" },
  { id: "catupiry", name: "Catupiry", emoji: "🥣" },
  { id: "molho", name: "Molho da casa", emoji: "🥫" },
];

// Catálogo de recompensas do programa de pontos "Cusco Clan".
// `cost` é em ossinhos (pontos). O cliente troca pontos por mimos da casa.
const REWARDS: { id: string; name: string; emoji: string; cost: number; desc: string }[] = [
  { id: "refri", name: "Refri grátis", emoji: "🥤", cost: 15, desc: "Resgate uma latinha gelada no balcão." },
  { id: "batata", name: "Batata palha extra", emoji: "🥔", cost: 24, desc: "Topping crocante por conta da casa." },
  { id: "salsicha", name: "Salsicha extra", emoji: "🌭", cost: 36, desc: "Dobra a pegada do teu próximo cusco." },
  { id: "caramelo", name: "Hot dog Caramelo", emoji: "🐶", cost: 75, desc: "Um Caramelo inteirinho de cortesia." },
  { id: "golden", name: "Hot dog Golden", emoji: "🦴", cost: 105, desc: "Dose dupla de salsicha, dose dupla de amor." },
  { id: "fox", name: "Hot dog FoxPaulistinha", emoji: "🐕", cost: 150, desc: "Recheado até o último latido." },
  { id: "doberman", name: "Hot dog Doberman", emoji: "🐕‍🦺", cost: 180, desc: "Pra fome braba, sem economizar." },
  { id: "rott", name: "Combo Rottweiler + Refri", emoji: "👑", cost: 240, desc: "O top da matilha + refri pra fechar." },
];



/* ---------------- AUTENTICAÇÃO LOCAL (localStorage) ----------------
 * Implementação simples sem backend: o usuário "logado" é salvo no
 * localStorage do navegador. Serve só pra simular o fluxo no protótipo.
 * Em produção, isso deve ser trocado por autenticação real (ex.: Cloud).
 */

// Forma do usuário em memória — só nome e email
type User = { name: string; email: string };
// Chave usada no localStorage pra guardar o usuário logado
const AUTH_KEY = "pitstop_user";

// Lê o usuário salvo no navegador (retorna null no SSR ou se não houver)
function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

// Hook que expõe o usuário atual + funções de login/logout
function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  // Carrega o usuário do localStorage só no cliente (evita erro de SSR)
  useEffect(() => {
    setUser(getStoredUser());
  }, []);
  const login = (u: User) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(u));
    setUser(u);
  };
  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  };
  return { user, login, logout };
}

/* ---------------- CUSCO CLAN — PROGRAMA DE PONTOS ----------------
 * Cada usuário tem um saldo de "ossinhos" (pontos) e um histórico de
 * resgates, ambos persistidos no localStorage. Os dados são chaveados
 * por email para suportar múltiplos usuários no mesmo navegador.
 *
 * Sempre que pontos/resgates mudam, disparamos um CustomEvent global
 * (POINTS_EVENT) para que componentes que usam `usePoints` re-sincronizem.
 */

const POINTS_EVENT = "pitstop_points_updated";

// Monta a chave do saldo de pontos para um email específico
function pointsKey(email: string) {
  return `pitstop_points_${email.toLowerCase()}`;
}
// Monta a chave da lista de resgates para um email específico
function redemptionsKey(email: string) {
  return `pitstop_redemptions_${email.toLowerCase()}`;
}

// Lê o saldo atual de pontos do usuário
function getPoints(email: string): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(pointsKey(email));
  return raw ? Number(raw) || 0 : 0;
}

// Soma pontos ao saldo (usado após uma compra/adoção)
function addPoints(email: string, amount: number) {
  const next = getPoints(email) + amount;
  localStorage.setItem(pointsKey(email), String(next));
  window.dispatchEvent(new CustomEvent(POINTS_EVENT));
  return next;
}

// Tenta gastar pontos — devolve false se o saldo for insuficiente
function spendPoints(email: string, amount: number): boolean {
  const cur = getPoints(email);
  if (cur < amount) return false;
  localStorage.setItem(pointsKey(email), String(cur - amount));
  window.dispatchEvent(new CustomEvent(POINTS_EVENT));
  return true;
}

// Formato de um resgate de recompensa
type Redemption = { id: string; reward: string; cost: number; code: string; at: string };

// Adiciona um novo resgate ao topo do histórico
function addRedemption(email: string, r: Redemption) {
  const raw = localStorage.getItem(redemptionsKey(email));
  const list: Redemption[] = raw ? JSON.parse(raw) : [];
  list.unshift(r);
  localStorage.setItem(redemptionsKey(email), JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(POINTS_EVENT));
}

// Lê todos os resgates do usuário (mais recentes primeiro)
function getRedemptions(email: string): Redemption[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(redemptionsKey(email));
  return raw ? JSON.parse(raw) : [];
}

// Hook reativo: devolve saldo e resgates do usuário, atualizando
// automaticamente quando o evento POINTS_EVENT ou um "storage" disparam
function usePoints(email: string | undefined) {
  const [points, setPoints] = useState(0);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  useEffect(() => {
    // Sem usuário logado: zera o estado
    if (!email) {
      setPoints(0);
      setRedemptions([]);
      return;
    }
    const sync = () => {
      setPoints(getPoints(email));
      setRedemptions(getRedemptions(email));
    };
    sync();
    // Mudanças na mesma aba viajam por CustomEvent;
    // mudanças em outras abas vêm via evento "storage" do browser
    window.addEventListener(POINTS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(POINTS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [email]);
  return { points, redemptions };
}


// ---------------- COMPONENTE RAIZ DA PÁGINA ----------------
// Monta o layout principal: header, seções e modal de login global
function Index() {
  // Estado de autenticação compartilhado entre header, simulador e Cusco Clan
  const auth = useAuth();
  // Controla a exibição do modal de login chamado pelo header/Cusco Clan
  const [showHeaderLogin, setShowHeaderLogin] = useState(false);
  return (
    <div className="min-h-screen text-foreground">
      {/* Cabeçalho fixo com navegação e botão de login/sair */}
      <Header
        user={auth.user}
        onLogout={auth.logout}
        onLoginClick={() => setShowHeaderLogin(true)}
      />
      <main>
        {/* Seções da landing, em ordem de scroll */}
        <Hero />
        <Simulator auth={auth} onLoginClick={() => setShowHeaderLogin(true)} />
        <Caocurso />
        <CuscoClan auth={auth} onLoginClick={() => setShowHeaderLogin(true)} />
        <WhereWeAre />
      </main>

      <Footer />

      {/* Modal de login renderizado por cima de tudo quando solicitado */}
      {showHeaderLogin && (
        <LoginModal
          onClose={() => setShowHeaderLogin(false)}
          onSuccess={(u) => {
            auth.login(u);
            setShowHeaderLogin(false);
          }}
        />
      )}
    </div>
  );
}

// ---------------- HEADER (cabeçalho fixo) ----------------
// Mostra logo, navegação por âncoras e estado do usuário (logado/visitante)
function Header({

  user,
  onLogout,
  onLoginClick,
}: {
  user: User | null;
  onLogout: () => void;
  onLoginClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 ink-border border-t-0 border-x-0">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        <a href="#top" className="flex items-center gap-2">
          <img src={logo} alt="Pit Stop do Cusco" className="h-12 w-12 rounded-full ink-border bg-background" />
          <div className="leading-none">
            <div className="font-display text-lg font-bold">PITSTOP</div>
            <div className="font-display text-[10px] tracking-widest text-muted-foreground">DO CUSCO</div>
          </div>
        </a>
        <nav className="hidden sm:flex items-center gap-1 text-sm font-bold">
          <a href="#simulador" className="px-3 py-2 rounded-full hover:bg-primary transition">🌭 Adote seu Cusco</a>
          <a href="#caocurso" className="px-3 py-2 rounded-full hover:bg-primary transition">🏆 Cãocurso</a>
          <a href="#cuscoclan" className="px-3 py-2 rounded-full hover:bg-primary transition">🦴 Cusco Clan</a>
        <div className="flex items-center gap-2">
          {/* Se há usuário logado, mostra saudação + botão Sair.
              Caso contrário, mostra botão Entrar que abre o modal de login. */}
          {user ? (

          {user ? (
            <>
              <span className="hidden sm:inline text-sm font-bold">Olá, {user.name.split(" ")[0]} 🐾</span>
              <button
                onClick={onLogout}
                className="text-xs font-bold px-3 py-2 rounded-full ink-border chunky-shadow-sm bg-background cursor-pointer"
              >
                Sair
              </button>
            </>
          ) : (
            <button
              onClick={onLoginClick}
              className="text-sm font-bold px-4 py-2 rounded-full ink-border chunky-shadow-sm bg-background hover:bg-primary transition cursor-pointer"
            >
              Entrar 🐾
            </button>
          )}
          <a
            href="#simulador"
            className="sm:hidden bg-accent text-accent-foreground font-bold px-4 py-2 rounded-full ink-border chunky-shadow-sm text-sm"
          >
            Montar 🌭
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const scrollRef = useScrollReveal();
  return (
    <section ref={scrollRef} id="top" className="scroll-reveal relative overflow-hidden">
      <div className="absolute inset-0 paw-bg" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 pt-10 pb-14 sm:pt-16 sm:pb-20 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <span className="inline-block bg-accent text-accent-foreground font-bold text-xs px-3 py-1 rounded-full ink-border chunky-shadow-sm">
            🐾 BARRA SHOPPING · QUIOSQUE
          </span>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] text-balance whitespace-normal">
            <span className="whitespace-nowrap">Hot dog <span className="text-accent">com raça</span>,</span>{" "}
            <span className="whitespace-nowrap">fome de <em className="not-italic underline decoration-accent decoration-[6px] underline-offset-4">vira&#8209;lata</em>.</span>
          </h1>
          <p className="mt-5 text-lg text-foreground/80 max-w-md">
            Monte seu cusco do jeitinho que ele late mais alto, ganhe um Certificado de Adoção e ainda concorra a refri grátis. Au au!
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#simulador" className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-full ink-border chunky-shadow">
              Adotar meu cusco 🦴
            </a>
            <a href="#caocurso" className="bg-background font-bold px-6 py-3 rounded-full ink-border chunky-shadow-sm">
              Votar no Cãocurso ❤️
            </a>
          </div>
        </div>
        <HeroCarousel />
      </div>
    </section>
  );
}

function HeroCarousel() {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    const id = setInterval(() => api.scrollNext(), 3200);
    return () => {
      api.off("select", onSelect);
      clearInterval(id);
    };
  }, [api]);

  return (
    <div className="relative">
      <div className="absolute -inset-6 bg-primary/40 rounded-[3rem] -rotate-3 ink-border" aria-hidden />
      <div className="relative bg-card rounded-[2.5rem] ink-border chunky-shadow overflow-hidden">
        <Carousel opts={{ loop: true, align: "start" }} setApi={setApi}>
          <CarouselContent className="ml-0">
            {BREEDS.map((b) => (
              <CarouselItem key={b.id} className="pl-0 basis-full">
                <div className="relative aspect-[4/3] bg-bun">
                  <img src={b.img} alt={b.name} className="w-full h-full object-cover" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="flex justify-center gap-2.5 py-3 bg-background">
          {BREEDS.map((b, i) => (
            <button
              key={b.id}
              aria-label={`Ir para ${b.name}`}
              onClick={() => api?.scrollTo(i)}
              className={`h-3 rounded-full ink-border transition-all cursor-pointer ${current === i ? "w-10 bg-accent" : "w-3 bg-muted-foreground/40 hover:bg-muted-foreground/60"
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- SIMULATOR ---------------- */

function Simulator({ auth, onLoginClick }: { auth: ReturnType<typeof useAuth>; onLoginClick: () => void }) {
  const scrollRef = useScrollReveal();
  const [breedId, setBreedId] = useState<string>("fox");
  const [drink, setDrink] = useState(true);
  const [name, setName] = useState("");
  const [joinContest, setJoinContest] = useState(false);
  const [done, setDone] = useState(false);
  const [showPetCard, setShowPetCard] = useState(false);
  const [complements, setComplements] = useState<string[]>([]);

  const breed = useMemo(() => BREEDS.find((b) => b.id === breedId)!, [breedId]);
  const total = breed.price + (drink ? 1 : 0);

  // Reset complements when breed changes (different max)
  useEffect(() => {
    setComplements([]);
  }, [breedId]);

  function toggleComplement(id: string) {
    setComplements((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= breed.maxComplements) return prev;
      return [...prev, id];
    });
  }

  function handleAdopt() {
    setDone(true);
    if (auth.user) addPoints(auth.user.email, total);
    if (joinContest) {
      if (auth.user) setShowPetCard(true);
      else onLoginClick();
    }
  }


  return (
    <section ref={scrollRef} id="simulador" className="scroll-reveal py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle
          kicker="PASSO A PASSO"
          title="Adote seu Cusco 🐶"
          subtitle="Escolhe a raça, manda a bebida e leva pra casa um Certificado de Adoção oficial."
        />

        {!done ? (
          <div className="mt-10 grid lg:grid-cols-[1fr_360px] gap-6">
            {/* Step 1: breeds */}
            <div className="bg-card rounded-3xl ink-border chunky-shadow p-5 sm:p-7">
              <StepHeader n={1} title="Escolha a raça" />
              <div className="mt-5 grid sm:grid-cols-2 gap-4">
                {BREEDS.map((b) => {
                  const selected = b.id === breedId;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setBreedId(b.id)}
                      className={`text-left rounded-2xl ink-border overflow-hidden transition transform ${selected ? "bg-primary chunky-shadow -translate-y-0.5" : "bg-background hover:-translate-y-0.5"
                        }`}
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-bun">
                        <img src={b.img} alt={b.name} loading="lazy" className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4">
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="font-display text-xl font-bold">{b.name}</h3>
                          <span className="font-display font-bold text-accent">R$ {b.price},00</span>
                        </div>
                        <p className="text-xs uppercase tracking-wider font-bold opacity-70">{b.tag}</p>
                        <p className="text-sm mt-1.5">{b.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-7">
                <StepHeader n={2} title="Escolha os complementos" />
                <p className="mt-2 text-sm text-foreground/70">
                  Pode marcar até <strong>{breed.maxComplements}</strong>{" "}
                  {breed.maxComplements === 1 ? "complemento" : "complementos"} no{" "}
                  <strong>{breed.name}</strong>. Selecionados:{" "}
                  <strong>
                    {complements.length}/{breed.maxComplements}
                  </strong>
                </p>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {COMPLEMENTS.map((c) => {
                    const checked = complements.includes(c.id);
                    const disabled = !checked && complements.length >= breed.maxComplements;
                    return (
                      <label
                        key={c.id}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl ink-border transition select-none ${checked
                          ? "bg-accent text-accent-foreground chunky-shadow-sm"
                          : disabled
                            ? "bg-muted opacity-50 cursor-not-allowed"
                            : "bg-background hover:bg-primary/30 cursor-pointer"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleComplement(c.id)}
                          className="h-4 w-4 accent-accent cursor-pointer disabled:cursor-not-allowed"
                        />
                        <span className="text-base leading-none">{c.emoji}</span>
                        <span className="text-sm font-bold leading-tight">{c.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>



              <div className="mt-7">
                <StepHeader n={3} title="Quer um refri pra acompanhar?" />
                <button
                  onClick={() => setDrink((d) => !d)}
                  className={`mt-4 w-full sm:w-auto flex items-center gap-3 px-5 py-3 rounded-full ink-border chunky-shadow-sm font-bold ${drink ? "bg-accent text-accent-foreground" : "bg-background"
                    }`}
                >
                  <span className={`h-6 w-11 rounded-full ink-border relative transition ${drink ? "bg-background" : "bg-muted"}`}>
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${drink ? "left-6" : "left-0.5"}`}
                      style={{ background: "var(--ink)" }}
                    />
                  </span>
                  {drink ? "Bora! Refri por +R$ 1,00 🥤" : "Sem refri, valeu 🙅"}
                </button>
              </div>
            </div>

            {/* Summary */}
            <aside className="bg-ink text-background rounded-3xl ink-border chunky-shadow p-6 lg:sticky lg:top-24 self-start" style={{ background: "var(--ink)" }}>
              <h3 className="font-display text-xl font-bold">Seu pedido</h3>
              <div className="mt-4 flex gap-3 items-center">
                <img src={breed.img} alt="" className="h-16 w-16 rounded-xl object-cover ink-border" />
                <div>
                  <div className="font-display text-lg">{breed.name}</div>
                  <div className="text-xs opacity-80">{breed.vibe}</div>
                </div>
              </div>
              <div className="mt-4 text-sm space-y-1.5 opacity-90">
                <Row label={breed.name} value={`R$ ${breed.price},00`} />
                <Row
                  label="Complementos"
                  value={
                    complements.length
                      ? complements
                        .map((id) => COMPLEMENTS.find((c) => c.id === id)?.name)
                        .filter(Boolean)
                        .join(", ")
                      : "—"
                  }
                />
                <Row label="Refri" value={drink ? "R$ 1,00" : "—"} />
              </div>
              <div className="mt-4 pt-4 border-t border-background/30 flex justify-between items-baseline">
                <span className="font-display">Total</span>
                <span className="font-display text-3xl font-bold text-primary">R$ {total},00</span>
              </div>

              <label className="block mt-5 text-xs font-bold opacity-80">SEU NOME DE HUMANO</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 40))}
                placeholder="Ex: Ana, Tutor(a) do Pingo"
                className="mt-1 w-full px-4 py-3 rounded-full ink-border bg-background text-foreground placeholder:text-foreground/40"
              />

              <label className="mt-4 flex items-start gap-3 cursor-pointer select-none rounded-2xl p-3 bg-background/10 hover:bg-background/15 transition">
                <input
                  type="checkbox"
                  checked={joinContest}
                  onChange={(e) => setJoinContest(e.target.checked)}
                  className="mt-1 h-5 w-5 accent-primary cursor-pointer"
                />
                <span className="text-sm leading-snug">
                  <strong className="font-bold text-primary">🏆 Quero participar do Cãocurso do Mês!</strong>
                  <br />
                  <span className="opacity-80 text-xs">Inscreve teu cusco e concorre a uma cesta de mimos.</span>
                </span>
              </label>

              <button
                onClick={handleAdopt}
                disabled={!name.trim()}
                className="mt-4 w-full bg-primary text-primary-foreground font-bold py-3 rounded-full ink-border chunky-shadow disabled:opacity-50 disabled:chunky-shadow-sm"
              >
                Adotar agora 🐾
              </button>
            </aside>
          </div>
        ) : (
          <>
            <Certificate
              name={name}
              breed={breed}
              drink={drink}
              total={total}
              onReset={() => {
                setDone(false);
                setShowPetCard(false);
              }}
            />
            {showPetCard && auth.user && (
              <PetSignupCard user={auth.user} onDone={() => setShowPetCard(false)} />
            )}
          </>
        )}
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function StepHeader({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-9 w-9 grid place-items-center rounded-full bg-accent text-accent-foreground font-display font-bold ink-border">
        {n}
      </span>
      <h3 className="font-display text-2xl font-bold">{title}</h3>
    </div>
  );
}

function Certificate({
  name,
  breed,
  drink,
  total,
  onReset,
}: {
  name: string;
  breed: Breed;
  drink: boolean;
  total: number;
  onReset: () => void;
}) {
  const code = useMemo(() => Math.random().toString(36).slice(2, 8).toUpperCase(), []);
  return (
    <div className="mt-10 animate-pop">
      <div className="relative max-w-2xl mx-auto bg-card rounded-3xl ink-border chunky-shadow p-8 sm:p-10 text-center overflow-hidden">
        <div className="absolute inset-0 paw-bg" aria-hidden />
        <div className="relative">
          <div className="inline-block bg-accent text-accent-foreground font-bold text-xs px-3 py-1 rounded-full ink-border">
            CERTIFICADO DE ADOÇÃO
          </div>
          <h2 className="mt-4 font-display text-4xl sm:text-5xl font-bold">Parabéns, {name}! 🎉</h2>
          <p className="mt-3 text-foreground/80">
            Você acabou de adotar um <strong>{breed.name}</strong> da matilha do Pit Stop do Cusco.
          </p>

          <div className="mt-6 grid sm:grid-cols-[140px_1fr] gap-5 items-center text-left bg-background rounded-2xl ink-border p-5">
            <img src={breed.img} alt={breed.name} className="w-full aspect-square object-cover rounded-xl ink-border" />
            <div className="space-y-1.5 text-sm">
              <Row label="Raça" value={breed.name} />
              <Row label="Recheio" value={breed.desc} />
              <Row label="Refri" value={drink ? "Sim 🥤" : "Não"} />
              <Row label="Código de adoção" value={`#${code}`} />
              <div className="pt-2 mt-2 border-t flex justify-between items-baseline">
                <span className="font-display">Total</span>
                <span className="font-display text-2xl font-bold text-accent">R$ {total},00</span>
              </div>
            </div>
          </div>

          <p className="mt-6 text-sm text-foreground/70">
            📸 Poste seu certificado nos Stories marcando <strong>@pitstopdocusco</strong> e ganhe um <strong>refri grátis</strong> no balcão!
          </p>

          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => {
                const text = `Acabei de adotar um ${breed.name} no Pit Stop do Cusco! 🌭🐶 #PitStopDoCusco`;
                if (navigator.share) {
                  navigator.share({ title: "Pit Stop do Cusco", text }).catch(() => { });
                } else {
                  navigator.clipboard?.writeText(text);
                  alert("Texto copiado! Cola nos seus Stories 🎉");
                }
              }}
              className="bg-accent text-accent-foreground font-bold px-6 py-3 rounded-full ink-border chunky-shadow"
            >
              Compartilhar nos Stories 📱
            </button>
            <button
              onClick={onReset}
              className="bg-background font-bold px-6 py-3 rounded-full ink-border chunky-shadow-sm"
            >
              Adotar outro 🐕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- LOGIN MODAL ---------------- */

function LoginModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (u: User) => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Preenche tudo aí, humano 🐾");
      return;
    }
    const usersRaw = localStorage.getItem("pitstop_users");
    const users: Record<string, { name: string; password: string }> = usersRaw ? JSON.parse(usersRaw) : {};

    if (mode === "signup") {
      if (!name.trim()) return setError("Bota teu nome aí 🐶");
      if (users[email]) return setError("Esse email já tá na matilha. Faz login!");
      users[email] = { name, password };
      localStorage.setItem("pitstop_users", JSON.stringify(users));
      onSuccess({ name, email });
    } else {
      const u = users[email];
      if (!u || u.password !== password) return setError("Email ou senha não latem juntos 🦴");
      onSuccess({ name: u.name, email });
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4 bg-ink/60 backdrop-blur-sm animate-pop"
      style={{ background: "color-mix(in oklab, var(--ink) 60%, transparent)" }}
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-card rounded-3xl ink-border chunky-shadow p-6 sm:p-7"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl font-bold">
            {mode === "login" ? "Entrar na matilha 🐾" : "Virar matilha 🐶"}
          </h3>
          <button type="button" onClick={onClose} className="text-xl font-bold opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>
        <p className="text-sm text-foreground/70 mt-1">
          {mode === "login"
            ? "Loga rapidinho pra inscrever teu cusco no Cãocurso."
            : "Cria tua conta pra inscrever teu cusco no Cãocurso."}
        </p>

        <div className="mt-5 space-y-3">
          {mode === "signup" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full px-4 py-3 rounded-full ink-border bg-background"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@cusco.com"
            className="w-full px-4 py-3 rounded-full ink-border bg-background"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="w-full px-4 py-3 rounded-full ink-border bg-background"
          />
        </div>

        {error && <p className="mt-3 text-sm font-bold text-accent">{error}</p>}

        <button className="mt-5 w-full bg-primary text-primary-foreground font-bold py-3 rounded-full ink-border chunky-shadow">
          {mode === "login" ? "Entrar 🐾" : "Criar conta 🐶"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError("");
          }}
          className="mt-3 w-full text-sm font-bold opacity-80 hover:opacity-100"
        >
          {mode === "login" ? "Ainda não tem conta? Criar uma" : "Já tem conta? Entrar"}
        </button>
      </form>
    </div>
  );
}

/* ---------------- PET SIGNUP CARD ---------------- */

function PetSignupCard({ user, onDone }: { user: User; onDone: () => void }) {
  const [petName, setPetName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Resize to max 512px so it fits in localStorage
        const MAX = 512;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return setPhoto(String(reader.result));
        ctx.drawImage(img, 0, 0, w, h);
        setPhoto(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(f);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!petName.trim() || !photo) return;
    const pet = {
      id: Date.now(),
      name: petName.trim(),
      owner: instagram.trim() || `@${user.name.split(" ")[0].toLowerCase()}`,
      photo,
      votes: 0,
      createdAt: new Date().toISOString(),
    };
    try {
      const raw = localStorage.getItem("pitstop_pets");
      const list = raw ? JSON.parse(raw) : [];
      list.push(pet);
      localStorage.setItem("pitstop_pets", JSON.stringify(list));
      window.dispatchEvent(new CustomEvent("pitstop_pets_updated"));
    } catch (err) {
      console.error("Falha ao salvar pet no storage", err);
      alert("Não consegui salvar a foto (muito grande). Tenta uma menor.");
      return;
    }
    setSubmitted(true);
    setTimeout(onDone, 2000);
  }

  return (
    <div className="mt-8 max-w-2xl mx-auto animate-pop">
      <form
        onSubmit={submit}
        className="bg-card rounded-3xl ink-border chunky-shadow p-6 sm:p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 paw-bg" aria-hidden />
        <div className="relative">
          <span className="inline-block bg-accent text-accent-foreground font-bold text-xs px-3 py-1 rounded-full ink-border">
            🏆 INSCRIÇÃO NO CÃOCURSO
          </span>
          <h3 className="mt-3 font-display text-3xl font-bold">Bora inscrever teu cusco, {user.name.split(" ")[0]}!</h3>
          <p className="text-foreground/70 text-sm mt-1">
            Manda o nome e a foto mais latida. A matilha julga.
          </p>

          {submitted ? (
            <div className="mt-6 bg-primary/30 rounded-2xl ink-border p-6 text-center">
              <p className="font-display text-2xl font-bold">Inscrito! Au au 🎉</p>
              <p className="text-sm mt-2 opacity-80">
                Teu cusco já tá na disputa. Boa sorte, tutor(a)!
              </p>
            </div>
          ) : (
            <div className="mt-5 grid sm:grid-cols-[160px_1fr] gap-5 items-start">
              <label className="block aspect-square rounded-2xl ink-border border-dashed bg-background cursor-pointer overflow-hidden grid place-items-center text-center text-sm font-bold p-3">
                {photo ? (
                  <img src={photo} alt="Pet" className="w-full h-full object-cover" />
                ) : (
                  <span>📷<br />Solta a foto do teu cusco</span>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={onFile} />
              </label>
              <div className="space-y-3">
                <input
                  required
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="Nome do teu cusco"
                  className="w-full px-4 py-3 rounded-full ink-border bg-background"
                />
                <input
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@instagram (opcional)"
                  className="w-full px-4 py-3 rounded-full ink-border bg-background"
                />
                <p className="text-xs opacity-70">
                  Inscrevendo como <strong>{user.name}</strong> ({user.email}).
                </p>
                <button
                  disabled={!petName.trim() || !photo}
                  className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-full ink-border chunky-shadow disabled:opacity-50 disabled:chunky-shadow-sm"
                >
                  Mandar pro Cãocurso 🐶
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

/* ---------------- CÃOCURSO ---------------- */

type Pet = { id: number; name: string; owner: string; votes: number; emoji?: string; photo?: string };

function Caocurso() {
  const scrollRef = useScrollReveal();
  const [pets, setPets] = useState<Pet[]>([]);
  const [voted, setVoted] = useState<Set<number>>(new Set());

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem("pitstop_pets");
        const stored: Pet[] = raw ? JSON.parse(raw) : [];
        setPets(stored);
      } catch { }
    };
    load();
    window.addEventListener("pitstop_pets_updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("pitstop_pets_updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const sorted = [...pets].sort((a, b) => b.votes - a.votes);

  function vote(id: number) {
    if (voted.has(id)) return;
    setPets((ps) => ps.map((p) => (p.id === id ? { ...p, votes: p.votes + 1 } : p)));
    setVoted((s) => new Set(s).add(id));
  }


  return (
    <section ref={scrollRef} id="caocurso" className="scroll-reveal py-16 sm:py-24 bg-primary/40 ink-border border-x-0">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle
          kicker="ENGAJAMENTO VIRAL"
          title="Cãocurso do Mês 🏆"
          subtitle="O cusco mais latido leva uma cesta cheia de mimos. Vote no seu favorito — pra inscrever o teu, marca a opção ao adotar seu cusco lá em cima!"
        />

        {sorted.length === 0 ? (
          <div className="mt-10 max-w-xl mx-auto bg-card rounded-3xl ink-border chunky-shadow-sm p-8 text-center">
            <div className="text-5xl">🐾</div>
            <p className="mt-3 font-display text-2xl font-bold">A matilha tá vazia… por enquanto.</p>
            <p className="mt-2 text-foreground/70 text-sm">
              Seja o primeiro a inscrever um cusco! Vai em <strong>Adote seu Cusco</strong>, marca a opção do Cãocurso e manda a foto do teu campeão.
            </p>
            <a
              href="#simulador"
              className="mt-5 inline-block bg-primary text-primary-foreground font-bold px-5 py-3 rounded-full ink-border chunky-shadow"
            >
              Inscrever meu cusco 🐶
            </a>
          </div>
        ) : (
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sorted.map((p, i) => {
              const leader = i === 0;
              const hasVoted = voted.has(p.id);
              return (
                <article
                  key={p.id}
                  className={`relative bg-card rounded-3xl ink-border p-5 ${leader ? "chunky-shadow ring-4 ring-accent/40" : "chunky-shadow-sm"}`}
                >
                  {leader && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full ink-border">
                      👑 LÍDER DA MATILHA
                    </span>
                  )}
                  <div className="aspect-square rounded-2xl ink-border bg-bun overflow-hidden relative">
                    {p.photo ? (
                      <img src={p.photo} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-7xl">
                        <span>{p.emoji}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <h3 className="font-display text-2xl font-bold">{p.name}</h3>
                      <p className="text-sm text-muted-foreground">{p.owner}</p>
                    </div>
                    <span className="font-display text-xl font-bold">{p.votes}</span>
                  </div>
                  <button
                    onClick={() => vote(p.id)}
                    disabled={hasVoted}
                    className={`mt-3 w-full font-bold py-2.5 rounded-full ink-border chunky-shadow-sm transition ${hasVoted ? "bg-muted text-muted-foreground" : "bg-accent text-accent-foreground"
                      }`}
                  >
                    {hasVoted ? "Já latiu 🐾" : "Votar ❤️"}
                  </button>
                </article>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}

/* ---------------- CUSCO CLAN SECTION ---------------- */

function CuscoClan({
  auth,
  onLoginClick,
}: {
  auth: ReturnType<typeof useAuth>;
  onLoginClick: () => void;
}) {
  const scrollRef = useScrollReveal();
  const email = auth.user?.email;
  const { points, redemptions } = usePoints(email);
  const [flash, setFlash] = useState<string | null>(null);

  function redeem(rewardId: string) {
    if (!auth.user) return onLoginClick();
    const r = REWARDS.find((x) => x.id === rewardId);
    if (!r) return;
    if (!spendPoints(auth.user.email, r.cost)) {
      setFlash(`Faltam ${r.cost - points} pontos pra ${r.name}. Continua latindo! 🐾`);
      setTimeout(() => setFlash(null), 3500);
      return;
    }
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    addRedemption(auth.user.email, {
      id: `${Date.now()}`,
      reward: r.name,
      cost: r.cost,
      code,
      at: new Date().toISOString(),
    });
    setFlash(`🎉 Resgatado! Mostra o código #${code} no balcão pra retirar: ${r.name}.`);
    setTimeout(() => setFlash(null), 6000);
  }

  return (
    <section ref={scrollRef} id="cuscoclan" className="scroll-reveal py-16 sm:py-24 bg-bun ink-border border-x-0">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle
          kicker="PROGRAMA DE PONTOS"
          title="Cusco Clan 🦴"
          subtitle="A cada R$ 1 gasto no Pit Stop, teu cusco ganha 1 ponto. Troca por mimos da casa quando juntar a matilha."
        />

        <div className="mt-10 grid lg:grid-cols-[320px_1fr] gap-6 items-start">
          {/* Wallet */}
          <aside className="bg-ink text-background rounded-3xl ink-border chunky-shadow p-6 lg:sticky lg:top-24" style={{ background: "var(--ink)" }}>
            {auth.user ? (
              <>
                <div className="text-xs font-bold opacity-70 tracking-widest">SUA MATILHA</div>
                <div className="mt-1 font-display text-2xl font-bold">Olá, {auth.user.name.split(" ")[0]} 🐾</div>
                <div className="mt-6 bg-primary text-primary-foreground rounded-2xl ink-border p-5 text-center">
                  <div className="text-xs font-bold tracking-widest">SALDO DE OSSINHOS</div>
                  <div className="mt-1 font-display text-5xl font-bold">{points}</div>
                  <div className="text-xs mt-1 opacity-80">pontos disponíveis</div>
                </div>
                <p className="mt-4 text-xs opacity-80">
                  💡 Cada adoção de cusco te dá pontos igual ao valor do pedido. Acumula e troca aí embaixo.
                </p>
                {redemptions.length > 0 && (
                  <div className="mt-5">
                    <div className="text-xs font-bold opacity-70 tracking-widest">RESGATES RECENTES</div>
                    <ul className="mt-2 space-y-2">
                      {redemptions.slice(0, 3).map((r) => (
                        <li key={r.id} className="text-xs bg-background/10 rounded-xl p-2.5">
                          <div className="font-bold">{r.reward}</div>
                          <div className="opacity-70">Código <strong>#{r.code}</strong> · {r.cost} pts</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center">
                <div className="text-5xl">🐕</div>
                <p className="mt-3 font-display text-xl font-bold">Entra na matilha</p>
                <p className="mt-2 text-sm opacity-80">
                  Faz login pra começar a juntar ossinhos a cada compra e trocar por mimos.
                </p>
                <button
                  onClick={onLoginClick}
                  className="mt-5 w-full bg-primary text-primary-foreground font-bold py-3 rounded-full ink-border chunky-shadow cursor-pointer"
                >
                  Entrar 🐾
                </button>
              </div>
            )}
          </aside>

          {/* Rewards catalog */}
          <div>
            {flash && (
              <div className="mb-5 bg-card rounded-2xl ink-border chunky-shadow-sm p-4 text-sm font-bold animate-pop">
                {flash}
              </div>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-8">
              {REWARDS.map((r) => {
                const affordable = !!auth.user && points >= r.cost;
                return (
                  <article
                    key={r.id}
                    className={`bg-card rounded-3xl ink-border p-7 flex flex-col ${affordable ? "chunky-shadow" : "chunky-shadow-sm"}`}
                  >
                    <div className="text-5xl">{r.emoji}</div>
                    <h3 className="mt-3 font-display text-xl font-bold leading-tight">{r.name}</h3>
                    <p className="mt-1 text-sm text-foreground/70 flex-1">{r.desc}</p>
                    <div className="mt-4 flex items-center gap-3 justify-between">
                      <span className="font-display text-lg font-bold text-accent whitespace-nowrap">{r.cost} pts</span>
                      <button
                        onClick={() => redeem(r.id)}
                        disabled={!!auth.user && !affordable}
                        className={`font-bold text-sm px-4 py-2 rounded-full ink-border chunky-shadow-sm transition cursor-pointer disabled:cursor-not-allowed whitespace-nowrap ${!auth.user
                          ? "bg-background hover:bg-primary/30"
                          : affordable
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-muted-foreground"
                          }`}
                      >
                        {!auth.user ? "Entrar pra trocar" : affordable ? "Trocar 🦴" : `Faltam ${r.cost - points}`}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- WHERE / FOOTER ---------------- */

function WhereWeAre() {
  const scrollRef = useScrollReveal();
  return (
    <section ref={scrollRef} id="onde" className="scroll-reveal py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <SectionTitle kicker="VEM LATIR COM A GENTE" title="Onde estamos 📍" subtitle="Estamos no shopping mais carioca do Rio." />
        <div className="mt-8 bg-card rounded-3xl ink-border chunky-shadow p-8">
          <p className="font-display text-2xl">Barra Shopping — Quiosque Pit Stop do Cusco</p>
          <p className="mt-2 text-foreground/80">Av. das Américas, 4.666 — Barra da Tijuca, Rio de Janeiro</p>
          <p className="mt-4 text-sm">Aberto todos os dias · 10h às 22h</p>
          <div className="mt-6 inline-flex items-center gap-2 bg-primary px-4 py-2 rounded-full ink-border chunky-shadow-sm font-bold">
            🦴 Latiu? Já tá no balcão.
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-ink text-background ink-border border-x-0 border-b-0" style={{ background: "var(--ink)" }}>
      <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col sm:flex-row gap-6 items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="" className="h-12 w-12 rounded-full bg-background ink-border" />
          <div>
            <div className="font-display text-lg font-bold">PITSTOP DO CUSCO</div>
            <div className="text-xs opacity-70">Barra Shopping · Quiosque</div>
          </div>
        </div>
        <div className="flex gap-4 text-sm font-bold">
          <a href="#" className="hover:text-primary">Instagram</a>
          <a href="#" className="hover:text-primary">TikTok</a>
          <a href="#" className="hover:text-primary">WhatsApp</a>
        </div>
      </div>
      <p className="text-center text-xs opacity-70 pb-6 px-4">
        🐾 Nenhum cusco de verdade foi tostado na produção desses hot dogs.
      </p>
    </footer>
  );
}

function SectionTitle({ kicker, title, subtitle }: { kicker: string; title: string; subtitle: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <span className="inline-block bg-background font-bold text-xs px-3 py-1 rounded-full ink-border">{kicker}</span>
      <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold">{title}</h2>
      <p className="mt-3 text-foreground/80">{subtitle}</p>
    </div>
  );
}
