import Image from "next/image";
import heroOcean from "@/public/hero-ocean.jpg";
import logo from "@/public/logo.png";

export default function HomePage() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={heroOcean}
          alt="Ocean satellite view"
          fill
          priority
          className="object-cover opacity-40"
          placeholder="blur"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center">
        {/* Logo */}
        <Image
          src={logo}
          alt="Rendezvous"
          className="h-48 md:h-64 w-auto mb-8"
          priority
        />

        {/* Main Tagline */}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Rendezvous
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed">
          The hidden meeting points where shadowfleet vessels connect, exchange,
          and operate beyond visibility, yet in plain sight.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border/20 w-full max-w-lg">
          <div>
            <div className="text-2xl font-bold text-primary mb-1">98.7%</div>
            <div className="text-xs text-muted-foreground">
              Detection Accuracy
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary mb-1">15min</div>
            <div className="text-xs text-muted-foreground">
              Update Frequency
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary mb-1">24/7</div>
            <div className="text-xs text-muted-foreground">Global Coverage</div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
