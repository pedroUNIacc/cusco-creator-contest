import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import logo from "@/assets/logo.png";

import dogCaramelo from "@/assets/dog-caramelo.png";
import dogGolden from "@/assets/dog-golden.png";
import dogFox from "@/assets/dog-fox.png";
import dogDoberman from "@/assets/dog-doberman.png";
import dogRott from "@/assets/dog-rott.png";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";

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
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap",
      },
    ],
  }),
  component: Index,
});

type Breed = {
  id: string;
  name: string;
  tag: string;
  desc: string;
  price: number;
  img: string;
  vibe: string;
  extraComplementSlots?: number;
};

const COMPLEMENTS = [
  "Queijo",
  "Bacon",
  "Milho",
  "Batata-palha",
  "Catupiry",
  "Cebola",
  "Maionese",
];

const BREEDS: Breed[] = [
  {
    id: "caramelo",
    name: "Caramelo",
    tag: "O vira-lata básico (e raiz)",
    desc: "Pão, salsicha + 1 complemento",
    price: 5,
    img: dogCaramelo,
    vibe: "Pra quem é fiel ao básico bom.",
    extraComplementSlots: 1,
  },
  {
    id: "golden",
    name: "Golden",
    tag: "Dócil, mas fominha",
    desc: "Caramelo + 1 salsicha extra",
    price: 7,
    img: dogGolden,
    vibe: "Dobrou na salsicha, dobrou no amor.",
    extraComplementSlots: 0,
  },
  {
    id: "fox",
    name: "FoxPaulistinha",
    tag: "Pequeno notável",
    desc: "Pão, salsicha + 5 complementos",
    price: 10,
    img: dogFox,
    vibe: "Recheado até o último latido.",
    extraComplementSlots: 5,
  },
  {
    id: "doberman",
    name: "Doberman",
    tag: "Imponente, sem frescura",
    desc: "FoxPaulistinha + 1 salsicha extra",
    price: 12,
    img: dogDoberman,
    vibe: "Pra fome braba.",
    extraComplementSlots: 5,
  },
  {
    id: "rottweiler",
    name: "Rottweiler",
    tag: "Top da matilha",
    desc: "Pão + 2 linguiças + 5 complementos (sem salsicha)",
    price: 15,
    img: dogRott,
    vibe: "Late forte, come mais forte ainda.",
    extraComplementSlots: 5,
  },
];

const MOCK_PETS = [
  { id: 1, name: "Pingo", owner: "@anaclara", votes: 142, emoji: "🐶" },
  { id: 2, name: "Biscoito", owner: "@thiagop", votes: 121, emoji: "🐕" },
  { id: 3, name: "Mel", owner: "@jujubaa", votes: 98, emoji: "🐾" },
  { id: 4, name: "Thor", owner: "@rafael", votes: 76, emoji: "🦴" },
  { id: 5, name: "Nina", owner: "@camis", votes: 64, emoji: "🐩" },
  { id: 6, name: "Bento", owner: "@lulu", votes: 51, emoji: "🐕‍🦺" },
];

/* ---------------- AUTH (localStorage) ---------------- */

type User = { name: string; email: string };
const AUTH_KEY = "pitstop_user";

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function useAuth() {
  const [user, setUser] = useState<User | null>(null);
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

function Index() {
  const auth = useAuth();
  return (
    <div className="min-h-screen text-foreground">
      <Header user={auth.user} onLogout={auth.logout} />
      <main>
        <Hero />
        <Simulator auth={auth} />
        <Caocurso />
        <WhereWeAre />
      </main>
      <Footer />
    </div>
  );
}

function Header({ user, onLogout }: { user: User | null; onLogout: () => void }) {
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
          <a href="#onde" className="px-3 py-2 rounded-full hover:bg-primary transition">📍 Onde Estamos</a>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden sm:inline text-sm font-bold">Olá, {user.name.split(" ")[0]} 🐾</span>
              <button
                onClick={onLogout}
                className="text-xs font-bold px-3 py-2 rounded-full ink-border chunky-shadow-sm bg-background"
              >
                Sair
              </button>
            </>
          ) : null}
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
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="absolute inset-0 paw-bg" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 pt-10 pb-14 sm:pt-16 sm:pb-20 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <span className="inline-block bg-accent text-accent-foreground font-bold text-xs px-3 py-1 rounded-full ink-border chunky-shadow-sm">
            🐾 BARRA SHOPPING · QUIOSQUE
          </span>
          <h1 className="mt-4 font-display text-5xl sm:text-7xl font-bold leading-[0.95]">
            Hot dog <span className="text-accent">com raça</span>,<br />
            fome de <em className="not-italic underline decoration-accent decoration-[6px] underline-offset-4">vira-lata</em>.
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
              className={`h-3 rounded-full ink-border transition-all cursor-pointer ${
                current === i ? "w-10 bg-accent" : "w-3 bg-muted-foreground/40 hover:bg-muted-foreground/60"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- SIMULATOR ---------------- */

function Simulator({ auth }: { auth: ReturnType<typeof useAuth> }) {
  const [breedId, setBreedId] = useState<string>("fox");
  const [selectedComplements, setSelectedComplements] = useState<string[]>([]);
  const [drink, setDrink] = useState(true);
  const [name, setName] = useState("");
  const [joinContest, setJoinContest] = useState(false);
  const [done, setDone] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showPetCard, setShowPetCard] = useState(false);

  const breed = useMemo(() => BREEDS.find((b) => b.id === breedId)!, [breedId]);
  const complementCount = breed.extraComplementSlots ?? 0;
  const total = breed.price + (drink ? 1 : 0);

  useEffect(() => {
    setSelectedComplements((current) => current.slice(0, complementCount));
  }, [complementCount]);

  function toggleComplement(option: string) {
    setSelectedComplements((current) => {
      if (current.includes(option)) {
        return current.filter((item) => item !== option);
      }
      if (current.length >= complementCount) {
        return current;
      }
      return [...current, option];
    });
  }

  function handleAdopt() {
    setDone(true);
    if (joinContest) {
      if (auth.user) setShowPetCard(true);
      else setShowLogin(true);
    }
  }

  return (
    <section id="simulador" className="py-16 sm:py-24">
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
                      className={`text-left rounded-2xl ink-border overflow-hidden transition transform ${
                        selected ? "bg-primary chunky-shadow -translate-y-0.5" : "bg-background hover:-translate-y-0.5"
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
                {complementCount > 0 ? (
                  <>
                    <p className="mt-3 text-sm opacity-80">
                      Selecione até {complementCount} complemento{complementCount > 1 ? "s" : ""} para o seu {breed.name}.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {COMPLEMENTS.map((option) => {
                        const selected = selectedComplements.includes(option);
                        const disabled = !selected && selectedComplements.length >= complementCount;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => toggleComplement(option)}
                            disabled={disabled}
                            className={`rounded-2xl border px-4 py-3 text-left transition ${
                              selected ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border"
                            } ${disabled ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-0.5"}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold">{option}</span>
                              {selected ? <span className="text-xs uppercase tracking-widest">Selecionado</span> : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="mt-3 rounded-2xl bg-background/80 p-4 text-sm opacity-90">
                    Este cusco não permite complementos opcionais.
                  </div>
                )}
              </div>

              <div className="mt-7">
                <StepHeader n={3} title="Quer um refri pra acompanhar?" />
                <button
                  onClick={() => setDrink((d) => !d)}
                  className={`mt-4 w-full sm:w-auto flex items-center gap-3 px-5 py-3 rounded-full ink-border chunky-shadow-sm font-bold ${
                    drink ? "bg-accent text-accent-foreground" : "bg-background"
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
                    selectedComplements.length > 0
                      ? selectedComplements.join(", ")
                      : complementCount > 0
                      ? "Nenhum selecionado"
                      : "Não disponível"
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
              complements={selectedComplements}
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

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={(u) => {
            auth.login(u);
            setShowLogin(false);
            setShowPetCard(true);
          }}
        />
      )}
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
  complements,
  total,
  onReset,
}: {
  name: string;
  breed: Breed;
  drink: boolean;
  complements: string[];
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
              <Row
                label="Complementos"
                value={complements.length > 0 ? complements.join(", ") : "Nenhum selecionado"}
              />
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
                  navigator.share({ title: "Pit Stop do Cusco", text }).catch(() => {});
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
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(f);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!petName.trim() || !photo) return;
    try {
      const raw = localStorage.getItem("pitstop_pets");
      const list = raw ? JSON.parse(raw) : [];
      list.push({
        id: Date.now(),
        name: petName.trim(),
        owner: instagram.trim() || `@${user.name.split(" ")[0].toLowerCase()}`,
        photo,
        votes: 0,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("pitstop_pets", JSON.stringify(list));
    } catch {}
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
  const [pets, setPets] = useState<Pet[]>(MOCK_PETS);
  const [voted, setVoted] = useState<Set<number>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pitstop_pets");
      const stored: Pet[] = raw ? JSON.parse(raw) : [];
      setPets([...stored, ...MOCK_PETS]);
    } catch {}
  }, []);

  const sorted = [...pets].sort((a, b) => b.votes - a.votes);

  function vote(id: number) {
    if (voted.has(id)) return;
    setPets((ps) => ps.map((p) => (p.id === id ? { ...p, votes: p.votes + 1 } : p)));
    setVoted((s) => new Set(s).add(id));
  }

  return (
    <section id="caocurso" className="py-16 sm:py-24 bg-primary/40 ink-border border-x-0">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle
          kicker="ENGAJAMENTO VIRAL"
          title="Cãocurso do Mês 🏆"
          subtitle="O cusco mais latido leva uma cesta cheia de mimos. Vote no seu favorito — pra inscrever o teu, marca a opção ao adotar seu cusco lá em cima!"
        />

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
                <div className="aspect-square rounded-2xl ink-border bg-bun grid place-items-center text-7xl overflow-hidden">
                  {p.photo ? (
                    <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{p.emoji}</span>
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
                  className={`mt-3 w-full font-bold py-2.5 rounded-full ink-border chunky-shadow-sm transition ${
                    hasVoted ? "bg-muted text-muted-foreground" : "bg-accent text-accent-foreground"
                  }`}
                >
                  {hasVoted ? "Já latiu 🐾" : "Votar ❤️"}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- WHERE / FOOTER ---------------- */

function WhereWeAre() {
  return (
    <section id="onde" className="py-16 sm:py-24">
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
