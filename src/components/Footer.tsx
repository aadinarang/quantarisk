import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30 px-6 py-3">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-mono font-medium text-foreground/60">QuantaRisk</span>
          <span className="text-muted-foreground/30">|</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
          <a href="#" className="hover:text-foreground transition-colors">Docs</a>
          <a href="#" className="hover:text-foreground transition-colors">API</a>
          <span className="font-mono text-muted-foreground/30">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
