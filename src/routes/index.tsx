import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import logo from "@/assets/logo.png";
import mascot from "@/assets/mascot.png";
import dogCaramelo from "@/assets/dog-caramelo.jpg";
import dogGolden from "@/assets/dog-golden.jpg";
import dogFox from "@/assets/dog-fox.jpg";
import dogDoberman from "@/assets/dog-doberman.jpg";
import dogRott from "@/assets/dog-rott.jpg";

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
};

const BREEDS: Breed[] = [
  {
    id: "caramelo",
    name: "Caramelo",
    tag: "O vira-lata básico (e raiz)",
    desc: "Pão, salsicha + 1 complemento",
    price: 5,
    img: dogCaramelo,
    vibe: "Pra quem é fiel ao básico bom.",
  },
  {
    id: "golden",
    name: "Golden",
    tag: "Dócil, mas fominha",
    desc: "Caramelo + 1 salsicha extra",
    price: 7,
    img: dogGolden,
    vibe: "Dobrou na salsicha, dobrou no amor.",
  },
  {
    id: "fox",
    name: "FoxPaulistinha",
    tag: "Pequeno notável",
    desc: "Pão, salsicha + 5 complementos",
    price: 10,
    img: dogFox,
    vibe: "Recheado até o último latido.",
  },
  {
    id: "doberman",
    name: "Doberman",
    tag: "Imponente, sem frescura",
    desc: "FoxPaulistinha + 1 salsicha extra",
    price: 12,
    img: dogDoberman,
    vibe: "Pra fome braba.",
  },
  {
    id: "rottweiler",
    name: "Rottweiler",
    tag: "Top da matilha",
    desc: "Pão + 2 linguiças + 5 complementos (sem salsicha)",
    price: 15,
    img: dogRott,
    vibe: "Late forte, come mais forte ainda.",
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

function Index() {
  return (
    <div className="min-h-screen text-foreground">
      <Header />
      <main>
        <Hero />
        <Simulator />
        <Caocurso />
        <WhereWeAre />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
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
        <a
          href="#simulador"
          className="sm:hidden bg-accent text-accent-foreground font-bold px-4 py-2 rounded-full ink-border chunky-shadow-sm text-sm"
        >
          Montar 🌭
        </a>
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
        <div className="relative">
          <div className="absolute -inset-6 bg-primary/40 rounded-[3rem] -rotate-3 ink-border" aria-hidden />
          <img
            src={mascot}
            alt="Mascote Pit Stop do Cusco"
            className="relative w-full max-w-md mx-auto animate-wag drop-shadow-xl"
          />
        </div>
      </div>
    </section>
  );
}

/* ---------------- SIMULATOR ---------------- */

function Simulator() {
  const [breedId, setBreedId] = useState<string>("fox");
  const [drink, setDrink] = useState(true);
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);

  const breed = useMemo(() => BREEDS.find((b) => b.id === breedId)!, [breedId]);
  const total = breed.price + (drink ? 1 : 0);

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
                <StepHeader n={2} title="Quer um refri pra acompanhar?" />
                <button
                  onClick={() => setDrink((d) => !d)}
                  className={`mt-4 w-full sm:w-auto flex items-center gap-3 px-5 py-3 rounded-full ink-border chunky-shadow-sm font-bold ${
                    drink ? "bg-accent text-accent-foreground" : "bg-background"
                  }`}
                >
                  <span className={`h-6 w-11 rounded-full ink-border relative transition ${drink ? "bg-background" : "bg-muted"}`}>
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-ink transition-all ${drink ? "left-6" : "left-0.5"}`}
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
              <button
                onClick={() => setDone(true)}
                disabled={!name.trim()}
                className="mt-4 w-full bg-primary text-primary-foreground font-bold py-3 rounded-full ink-border chunky-shadow disabled:opacity-50 disabled:chunky-shadow-sm"
              >
                Adotar agora 🐾
              </button>
            </aside>
          </div>
        ) : (
          <Certificate
            name={name}
            breed={breed}
            drink={drink}
            total={total}
            onReset={() => {
              setDone(false);
            }}
          />
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

/* ---------------- CÃOCURSO ---------------- */

function Caocurso() {
  const [pets, setPets] = useState(MOCK_PETS);
  const [voted, setVoted] = useState<Set<number>>(new Set());
  const [showForm, setShowForm] = useState(false);

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
          subtitle="O cusco mais latido leva uma cesta cheia de mimos. Vote no seu favorito ou inscreva o seu."
        />

        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setShowForm((s) => !s)}
            className="bg-accent text-accent-foreground font-bold px-6 py-3 rounded-full ink-border chunky-shadow"
          >
            {showForm ? "Fechar inscrição" : "Inscrever meu Cusco no Concurso 🐾"}
          </button>
        </div>

        {showForm && <SignupForm onClose={() => setShowForm(false)} />}

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
                <div className="aspect-square rounded-2xl ink-border bg-bun grid place-items-center text-7xl">
                  {p.emoji}
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

function SignupForm({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(onClose, 1500);
      }}
      className="mt-6 max-w-xl mx-auto bg-card rounded-3xl ink-border chunky-shadow p-6 space-y-4"
    >
      {submitted ? (
        <p className="text-center font-display text-xl">Inscrição recebida! Au au 🎉</p>
      ) : (
        <>
          <h3 className="font-display text-2xl font-bold text-center">Bora inscrever seu cusco?</h3>
          <input required placeholder="Nome do pet" className="w-full px-4 py-3 rounded-full ink-border bg-background" />
          <input required placeholder="@instagram do tutor" className="w-full px-4 py-3 rounded-full ink-border bg-background" />
          <label className="block w-full text-center px-4 py-6 rounded-2xl ink-border border-dashed bg-background cursor-pointer font-bold">
            📷 Solta a foto do seu cusco aqui
            <input type="file" accept="image/*" className="hidden" />
          </label>
          <button className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-full ink-border chunky-shadow">
            Mandar pro Cãocurso 🐶
          </button>
        </>
      )}
    </form>
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
