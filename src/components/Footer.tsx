import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 px-6 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="font-mono font-medium text-foreground">QuantaRisk</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
          <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
          <a href="#" className="hover:text-foreground transition-colors">API</a>
          <span className="font-mono text-muted-foreground/50">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
