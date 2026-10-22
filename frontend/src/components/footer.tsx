import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "./header";
export default function Footer() {
  return <footer className="site-footer"><div className="container"><div className="footer-top"><div><Brand /><p>Meer ruimte voor ondernemen.<br />Meer rust in je administratie.</p></div><div className="footer-links"><strong>Ontdek Numico</strong><Link to="/#features">Mogelijkheden</Link><Link to="/#how-it-works">Zo werkt het</Link><Link to="/pricing">Prijzen</Link></div><div className="footer-links"><strong>Jouw werkruimte</strong><Link to="/login">Inloggen</Link><Link to="/register">Account aanmaken <ArrowUpRight size={14} /></Link><Link to="/dashboard">Dashboard</Link></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Numico</span><span>Een heldere administratie. Een betere werkdag.</span></div></div></footer>;
}
