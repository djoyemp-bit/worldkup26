import { useState, useEffect } from "react";

const WHATSAPP = "237696006874";
const EMAILJS_SERVICE_ID = "service_5q4i1m9";
const EMAILJS_TEMPLATE_ID = "template_tgw0hlf";
const EMAILJS_PUBLIC_KEY = "IHYjMQA_XED0Qaf5G";

const matches = [
  { id: 1, phase: "Group A", team1: "🇺🇸 USA", team2: "🇧🇷 Brazil", date: "Jun 15, 2026", time: "8:00 PM", city: "New York", stadium: "MetLife Stadium", prices: { cat1: 850, cat2: 450, cat3: 220 } },
  { id: 2, phase: "Group B", team1: "🇫🇷 France", team2: "🇦🇷 Argentina", date: "Jun 16, 2026", time: "6:00 PM", city: "Los Angeles", stadium: "SoFi Stadium", prices: { cat1: 1200, cat2: 680, cat3: 320 } },
  { id: 3, phase: "Group C", team1: "🇩🇪 Germany", team2: "🇵🇹 Portugal", date: "Jun 17, 2026", time: "9:00 PM", city: "Dallas", stadium: "AT&T Stadium", prices: { cat1: 780, cat2: 420, cat3: 190 } },
  { id: 4, phase: "Group D", team1: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 England", team2: "🇪🇸 Spain", date: "Jun 18, 2026", time: "7:00 PM", city: "Miami", stadium: "Hard Rock Stadium", prices: { cat1: 950, cat2: 510, cat3: 250 } },
  { id: 5, phase: "Group E", team1: "🇧🇷 Brazil", team2: "🇲🇽 Mexico", date: "Jun 20, 2026", time: "8:00 PM", city: "Houston", stadium: "NRG Stadium", prices: { cat1: 1100, cat2: 590, cat3: 280 } },
  { id: 6, phase: "Group F", team1: "🇯🇵 Japan", team2: "🇳🇬 Nigeria", date: "Jun 22, 2026", time: "6:00 PM", city: "Seattle", stadium: "Lumen Field", prices: { cat1: 650, cat2: 380, cat3: 170 } },
  { id: 7, phase: "Round of 16", team1: "🏆 TBD", team2: "🏆 TBD", date: "Jun 28, 2026", time: "9:00 PM", city: "Chicago", stadium: "Soldier Field", prices: { cat1: 1400, cat2: 800, cat3: 380 } },
  { id: 8, phase: "Quarter-Final", team1: "🏆 TBD", team2: "🏆 TBD", date: "Jul 4, 2026", time: "9:00 PM", city: "Boston", stadium: "Gillette Stadium", prices: { cat1: 1800, cat2: 1000, cat3: 500 } },
  { id: 9, phase: "Semi-Final", team1: "🏆 TBD", team2: "🏆 TBD", date: "Jul 14, 2026", time: "9:00 PM", city: "Atlanta", stadium: "Mercedes-Benz Stadium", prices: { cat1: 2500, cat2: 1400, cat3: 700 } },
  { id: 10, phase: "🏆 Final", team1: "🏆 TBD", team2: "🏆 TBD", date: "Jul 19, 2026", time: "9:00 PM", city: "New York", stadium: "MetLife Stadium", prices: { cat1: 5500, cat2: 3000, cat3: 1400 } },
];

const cities = ["All Cities", "New York", "Los Angeles", "Dallas", "Miami", "Houston", "Seattle", "Chicago", "Boston", "Atlanta"];
const phases = ["All Phases", "Group A", "Group B", "Group C", "Group D", "Group E", "Group F", "Round of 16", "Quarter-Final", "Semi-Final", "🏆 Final"];
const catLabel = { cat1: "Category 1 — VIP Tribune", cat2: "Category 2 — Standard Tribune", cat3: "Category 3 — General Stand" };

export default function App() {
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedCat, setSelectedCat] = useState(null);
  const [qty, setQty] = useState(1);
  const [cityFilter, setCityFilter] = useState("All Cities");
  const [phaseFilter, setPhaseFilter] = useState("All Phases");
  const [orderDone, setOrderDone] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [sending, setSending] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [emailStatus, setEmailStatus] = useState(""); // "", "sent", "failed"

  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  // Load EmailJS SDK once
  useEffect(() => {
    if (window.emailjs) return;
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
    script.onload = () => window.emailjs.init(EMAILJS_PUBLIC_KEY);
    document.body.appendChild(script);
  }, []);

  const filtered = matches.filter(m => {
    const cityOk = cityFilter === "All Cities" || m.city === cityFilter;
    const phaseOk = phaseFilter === "All Phases" || m.phase === phaseFilter;
    return cityOk && phaseOk;
  });

  const totalCart = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const serviceFee = Math.round(totalCart * 0.05);

  const addToCart = () => {
    if (!selectedCat) return;
    const price = selectedMatch.prices[selectedCat];
    const existing = cart.find(i => i.matchId === selectedMatch.id && i.cat === selectedCat);
    if (existing) {
      setCart(cart.map(i => i.matchId === selectedMatch.id && i.cat === selectedCat ? { ...i, qty: i.qty + qty } : i));
    } else {
      setCart([...cart, { matchId: selectedMatch.id, match: selectedMatch, cat: selectedCat, price, qty }]);
    }
    setPage("cart");
  };

  const removeFromCart = (idx) => setCart(cart.filter((_, i) => i !== idx));

  const handleOrder = async () => {
    if (!form.name || !form.email || sending) return;
    setSending(true);

    const newOrderId = "WC26-" + Math.floor(10000 + Math.random() * 89999);
    setOrderId(newOrderId);
    const total = totalCart + serviceFee;

    // Send e-ticket email(s) via EmailJS — one email per cart item
    try {
      if (window.emailjs) {
        for (const item of cart) {
          await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            order_id: newOrderId,
            to_name: form.name,
            to_email: form.email,
            team1: item.match.team1,
            team2: item.match.team2,
            phase: item.match.phase,
            match_date: item.match.date,
            match_time: item.match.time,
            city: item.match.city,
            stadium: item.match.stadium,
            category: catLabel[item.cat],
            quantity: item.qty,
            total: item.price * item.qty,
          });
        }
        setEmailStatus("sent");
      } else {
        setEmailStatus("failed");
      }
    } catch (err) {
      console.error("EmailJS error:", err);
      setEmailStatus("failed");
    }

    // Build professional WhatsApp order summary
    const itemLines = cart.map((item, idx) =>
      `*${String.fromCodePoint(0x2460 + idx)} ${item.match.team1} vs ${item.match.team2}*\n` +
      `   📍 ${item.match.city} · ${item.match.date}\n` +
      `   🪑 ${catLabel[item.cat]}\n` +
      `   🎟️ ${item.qty} ticket(s) × $${item.price} = *$${item.price * item.qty}*`
    ).join("\n\n");

    const line = "━━━━━━━━━━━━━━━━━━━━━━";
    const msg =
`🏆 *FIFA WORLD CUP 2026 — TICKET ORDER*
${line}
🔖 *Order ID:* #${newOrderId}

👤 *CUSTOMER*
• Name: ${form.name}
• Email: ${form.email}
• Phone: ${form.phone || "N/A"}

🎫 *ORDER DETAILS*
${line}
${itemLines}

${line}
💰 Subtotal: $${totalCart}
➕ Service Fee: $${serviceFee}
✅ *TOTAL: $${total}*
${line}
⏳ Please confirm within 24h. Thank you!`;

    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
    setSending(false);
    setOrderDone(true);
  };

  const goMatch = (m) => { setSelectedMatch(m); setSelectedCat(null); setQty(1); setPage("match"); };

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        body { background:#04091e; }
        ::-webkit-scrollbar { width:5px; background:#04091e; }
        ::-webkit-scrollbar-thumb { background:#c9a227; border-radius:4px; }
        .hov-card { transition: transform .3s, box-shadow .3s; cursor:pointer; }
        .hov-card:hover { transform:translateY(-5px); box-shadow:0 16px 48px rgba(201,162,39,.2)!important; }
        .hov-btn { transition: all .2s; }
        .hov-btn:hover { filter:brightness(1.15); transform:scale(1.02); }
        .hov-nav { transition:color .2s; cursor:pointer; }
        .hov-nav:hover { color:#f0c030!important; }
        .fade { animation: fadeUp .45s ease forwards; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        input:focus,select:focus { outline:none; border-color:#c9a227!important; box-shadow:0 0 0 2px rgba(201,162,39,.15)!important; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(201,162,39,.4)} 50%{box-shadow:0 0 0 10px rgba(201,162,39,0)} }
        .stripe { background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.01) 10px, rgba(255,255,255,.01) 20px); }
      `}</style>

      {/* ── NAV ── */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div onClick={() => setPage("home")} style={s.logo}>
            <span style={s.logoBall}>⚽</span>
            <div>
              <div style={s.logoMain}>FIFA WORLD CUP <span style={{color:"#c9a227"}}>2026™</span></div>
              <div style={s.logoSub}>OFFICIAL TICKET MARKETPLACE</div>
            </div>
          </div>
          <div style={s.navLinks}>
            {[["home","Home"],["tickets","Matches"],["cart",`Cart (${cart.length})`]].map(([p,label])=>(
              <span key={p} className="hov-nav" onClick={()=>setPage(p)}
                style={{...s.navLink, color: page===p?"#c9a227":"#a0aec0", borderBottom: page===p?"2px solid #c9a227":"2px solid transparent", paddingBottom:4}}>
                {p==="cart" && cart.length>0 && <span style={s.cartBadge}>{cart.length}</span>}
                {label}
              </span>
            ))}
          </div>
        </div>
      </nav>

      {/* ── HOME ── */}
      {page==="home" && (
        <div className="fade">
          {/* HERO */}
          <div style={s.hero}>
            <div style={s.heroGrad}/>
            <div style={s.heroGrid}/>
            <div style={s.heroInner}>
              <div style={s.hostFlags}>🇺🇸 USA · 🇨🇦 CANADA · 🇲🇽 MEXICO</div>
              <h1 style={s.heroH1}>THE GREATEST<br/><span style={{color:"#c9a227"}}>SHOW ON EARTH</span></h1>
              <p style={s.heroP}>48 teams · 104 matches · 16 host cities · June 11 – July 19, 2026</p>
              <div style={s.heroStats}>
                {[["48","Nations"],["104","Matches"],["16","Cities"],["100%","Guaranteed"]].map(([v,l])=>(
                  <div key={l} style={s.stat}><span style={s.statN}>{v}</span><span style={s.statL}>{l}</span></div>
                ))}
              </div>
              <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                <button className="hov-btn pulse" onClick={()=>setPage("tickets")} style={s.btnPrimary}>GET TICKETS →</button>
                <button className="hov-btn" onClick={()=>setPage("tickets")} style={s.btnSecondary}>VIEW SCHEDULE</button>
              </div>
            </div>
            {/* Trophy decoration */}
            <div style={s.heroTrophy}>🏆</div>
          </div>

          {/* TRUST BAR */}
          <div style={s.trustBar}>
            {[["🔒","Secure Payment","SSL 256-bit encryption"],["✅","100% Guaranteed","Full refund if match cancelled"],["⚡","Instant E-Tickets","Delivered to your inbox"],["🌍","24/7 Support","Multilingual team"]].map(([ic,t,d])=>(
              <div key={t} style={s.trustItem}>
                <span style={{fontSize:28}}>{ic}</span>
                <div><div style={{color:"#fff",fontWeight:600,fontSize:14}}>{t}</div><div style={{color:"#64748b",fontSize:12,marginTop:2}}>{d}</div></div>
              </div>
            ))}
          </div>

          {/* FEATURED MATCHES */}
          <div style={s.section}>
            <div style={s.sectionHead}>
              <div style={s.sectionTag}>DON'T MISS OUT</div>
              <h2 style={s.sectionH2}>FEATURED <span style={{color:"#c9a227"}}>MATCHES</span></h2>
            </div>
            <div style={s.featGrid}>
              {[matches[1], matches[3], matches[9]].map(m=>(
                <div key={m.id} className="hov-card" onClick={()=>goMatch(m)} style={s.featCard}>
                  <div style={s.featTop}>
                    <span style={s.phasePill}>{m.phase}</span>
                    {m.phase.includes("Final") && <span style={s.hotPill}>🔥 HOT</span>}
                  </div>
                  <div style={s.featVs}>
                    <span style={s.featTeam}>{m.team1}</span>
                    <span style={s.vsCircle}>VS</span>
                    <span style={s.featTeam}>{m.team2}</span>
                  </div>
                  <div style={s.featMeta}>
                    <span>📅 {m.date} · {m.time}</span>
                    <span>📍 {m.city}</span>
                    <span>🏟️ {m.stadium}</span>
                  </div>
                  <div style={s.featFoot}>
                    <span style={{color:"#64748b",fontSize:13}}>From <strong style={{color:"#c9a227",fontSize:18}}>${m.prices.cat3}</strong></span>
                    <span style={s.featBtn}>View Tickets →</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{textAlign:"center",marginTop:40}}>
              <button className="hov-btn" onClick={()=>setPage("tickets")} style={s.btnPrimary}>VIEW ALL MATCHES</button>
            </div>
          </div>

          {/* HOST CITIES */}
          <div style={{...s.section, background:"#060d26", borderTop:"1px solid #0f1e4a", borderBottom:"1px solid #0f1e4a", maxWidth:"100%", padding:"60px 24px"}}>
            <div style={{maxWidth:1200,margin:"0 auto"}}>
              <div style={s.sectionHead}>
                <div style={s.sectionTag}>3 COUNTRIES · 16 CITIES</div>
                <h2 style={s.sectionH2}>HOST <span style={{color:"#c9a227"}}>CITIES</span></h2>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:12,justifyContent:"center"}}>
                {["New York","Los Angeles","Dallas","Miami","Houston","Seattle","Chicago","Boston","Atlanta","San Francisco","Vancouver","Toronto","Guadalajara","Mexico City","Monterrey","Kansas City"].map(c=>(
                  <div key={c} onClick={()=>{setCityFilter(c);setPage("tickets");}} className="hov-btn"
                    style={{background:"#0a1535",border:"1px solid #1a2d6a",color:"#a0aec0",padding:"10px 20px",fontSize:13,cursor:"pointer",borderRadius:2,fontFamily:"Inter"}}>
                    📍 {c}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* WHY US */}
          <div style={s.section}>
            <div style={s.sectionHead}>
              <div style={s.sectionTag}>WHY CHOOSE US</div>
              <h2 style={s.sectionH2}>THE TRUSTED <span style={{color:"#c9a227"}}>MARKETPLACE</span></h2>
            </div>
            <div style={s.whyGrid}>
              {[["🎫","Official Partner Tickets","All tickets sourced from verified sellers with authenticity guarantee."],
                ["💳","Flexible Payment","Multiple payment methods accepted. Secure and instant confirmation."],
                ["📱","Mobile E-Tickets","QR-coded e-tickets delivered directly to your email — no printing needed."],
                ["🔄","Free Cancellation","Cancel up to 48 hours before the match for a full refund."]].map(([ic,t,d])=>(
                <div key={t} style={s.whyCard}>
                  <span style={{fontSize:40,marginBottom:16,display:"block"}}>{ic}</span>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:"#fff",letterSpacing:1,marginBottom:10}}>{t}</div>
                  <div style={{color:"#64748b",fontSize:14,lineHeight:1.6}}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MATCHES ── */}
      {page==="tickets" && (
        <div className="fade" style={s.section}>
          <div style={s.sectionHead}>
            <div style={s.sectionTag}>FIFA WORLD CUP 2026</div>
            <h2 style={s.sectionH2}>ALL <span style={{color:"#c9a227"}}>MATCHES</span></h2>
          </div>

          {/* Filters */}
          <div style={s.filterBar}>
            <div style={s.filterGroup}>
              <label style={s.filterLabel}>CITY</label>
              <select value={cityFilter} onChange={e=>setCityFilter(e.target.value)} style={s.select}>
                {cities.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={s.filterGroup}>
              <label style={s.filterLabel}>PHASE</label>
              <select value={phaseFilter} onChange={e=>setPhaseFilter(e.target.value)} style={s.select}>
                {phases.map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
            <div style={{color:"#64748b",fontSize:13,alignSelf:"flex-end",paddingBottom:8}}>{filtered.length} match{filtered.length!==1?"es":""} found</div>
          </div>

          <div style={s.matchGrid}>
            {filtered.map(m=>(
              <div key={m.id} className="hov-card" style={s.matchCard} onClick={()=>goMatch(m)}>
                <div style={s.matchCardTop}>
                  <span style={s.phasePill}>{m.phase}</span>
                  <span style={{color:"#64748b",fontSize:12}}>{m.time}</span>
                </div>
                <div style={s.matchVs}>
                  <div style={s.matchTeamBlock}><span style={s.matchTeamName}>{m.team1}</span></div>
                  <div style={s.vsBox}>VS</div>
                  <div style={{...s.matchTeamBlock,textAlign:"right"}}><span style={s.matchTeamName}>{m.team2}</span></div>
                </div>
                <div style={s.divider}/>
                <div style={s.matchInfo}>
                  <span>📅 {m.date}</span>
                  <span>📍 {m.city}</span>
                  <span>🏟️ {m.stadium}</span>
                </div>
                <div style={s.matchCardFoot}>
                  <span>From <strong style={{color:"#c9a227"}}>${m.prices.cat3}</strong></span>
                  <button className="hov-btn" style={s.btnSmall}>Select Tickets →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MATCH DETAIL ── */}
      {page==="match" && selectedMatch && (
        <div className="fade" style={s.section}>
          <button onClick={()=>setPage("tickets")} style={s.backBtn}>← Back to Matches</button>

          <div style={s.detailWrap}>
            {/* Header */}
            <div style={s.detailHead}>
              <span style={s.phasePill}>{selectedMatch.phase}</span>
              <div style={s.detailVs}>
                <span style={s.detailTeam}>{selectedMatch.team1}</span>
                <div style={s.detailVsBox}>VS</div>
                <span style={s.detailTeam}>{selectedMatch.team2}</span>
              </div>
              <div style={s.detailMeta}>
                <span>📅 {selectedMatch.date} · {selectedMatch.time}</span>
                <span>📍 {selectedMatch.city}</span>
                <span>🏟️ {selectedMatch.stadium}</span>
              </div>
            </div>

            {/* Categories */}
            <div style={{marginBottom:32}}>
              <div style={s.stepLabel}><span style={s.stepNum}>1</span> SELECT CATEGORY</div>
              <div style={s.catGrid}>
                {Object.entries(selectedMatch.prices).map(([cat,price])=>(
                  <div key={cat} onClick={()=>setSelectedCat(cat)} className="hov-card"
                    style={{...s.catCard, border: selectedCat===cat?"2px solid #c9a227":"2px solid #0f1e4a", background: selectedCat===cat?"#0e1e00":"#060d26"}}>
                    {cat==="cat1" && <div style={s.premBadge}>⭐ PREMIUM</div>}
                    <div style={s.catTitle}>{catLabel[cat]}</div>
                    <div style={s.catPrice}>${price}<span style={{fontSize:14,color:"#64748b"}}> / ticket</span></div>
                    <div style={{fontSize:12,color:"#64748b",marginTop:8}}>
                      {cat==="cat1"?"Best view · Lounge access · Premium seating":cat==="cat2"?"Good view · Covered seating":"General admission · Great atmosphere"}
                    </div>
                    {selectedCat===cat && <div style={s.checkMark}>✓ Selected</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div style={{marginBottom:32}}>
              <div style={s.stepLabel}><span style={s.stepNum}>2</span> SELECT QUANTITY</div>
              <div style={s.qtyRow}>
                <button onClick={()=>setQty(Math.max(1,qty-1))} style={s.qtyBtn}>−</button>
                <span style={s.qtyVal}>{qty}</span>
                <button onClick={()=>setQty(Math.min(10,qty+1))} style={s.qtyBtn}>+</button>
                <span style={{color:"#64748b",fontSize:14}}>Max 10 tickets per order</span>
                {selectedCat && <span style={{color:"#c9a227",fontFamily:"'Bebas Neue'",fontSize:24,marginLeft:"auto"}}>Total: ${selectedMatch.prices[selectedCat]*qty}</span>}
              </div>
            </div>

            <button className="hov-btn" onClick={addToCart}
              style={{...s.btnPrimary, opacity:selectedCat?1:0.4, cursor:selectedCat?"pointer":"not-allowed", fontSize:18, padding:"18px 48px"}}>
              🛒 ADD TO CART
            </button>
            {!selectedCat && <p style={{color:"#64748b",fontSize:13,marginTop:8}}>Please select a category first</p>}
          </div>
        </div>
      )}

      {/* ── CART ── */}
      {page==="cart" && !orderDone && (
        <div className="fade" style={s.section}>
          <div style={s.sectionHead}>
            <div style={s.sectionTag}>REVIEW YOUR ORDER</div>
            <h2 style={s.sectionH2}>YOUR <span style={{color:"#c9a227"}}>CART</span></h2>
          </div>

          {cart.length===0 ? (
            <div style={s.emptyCart}>
              <span style={{fontSize:72}}>🎫</span>
              <h3 style={{fontFamily:"'Bebas Neue'",fontSize:32,color:"#fff"}}>YOUR CART IS EMPTY</h3>
              <p style={{color:"#64748b"}}>Browse our available matches and secure your seats.</p>
              <button className="hov-btn" onClick={()=>setPage("tickets")} style={s.btnPrimary}>BROWSE MATCHES</button>
            </div>
          ):(
            <div style={s.cartLayout}>
              {/* Items */}
              <div>
                <h3 style={s.cartSectionTitle}>ORDER ITEMS</h3>
                {cart.map((item,idx)=>(
                  <div key={idx} style={s.cartItem}>
                    <div style={s.cartItemLeft}>
                      <span style={s.phasePill}>{item.match.phase}</span>
                      <div style={s.cartMatchTitle}>{item.match.team1} <span style={{color:"#c9a227"}}>vs</span> {item.match.team2}</div>
                      <div style={{color:"#64748b",fontSize:13,marginTop:4}}>{item.match.date} · {item.match.city}</div>
                      <div style={{color:"#64748b",fontSize:13}}>{catLabel[item.cat]}</div>
                    </div>
                    <div style={s.cartItemRight}>
                      <div style={s.cartItemPrice}>${item.price*item.qty}</div>
                      <div style={{color:"#64748b",fontSize:12}}>{item.qty} × ${item.price}</div>
                      <button onClick={()=>removeFromCart(idx)} style={s.removeBtn}>✕ Remove</button>
                    </div>
                  </div>
                ))}
                <button className="hov-btn" onClick={()=>setPage("tickets")} style={{...s.btnSecondary,marginTop:16,fontSize:13}}>+ ADD MORE TICKETS</button>
              </div>

              {/* Summary + Form */}
              <div style={s.cartSide}>
                <div style={s.summaryBox}>
                  <h3 style={s.cartSectionTitle}>ORDER SUMMARY</h3>
                  <div style={s.sumRow}><span>Subtotal</span><span>${totalCart}</span></div>
                  <div style={s.sumRow}><span>Service Fee (5%)</span><span>${serviceFee}</span></div>
                  <div style={{...s.sumRow,borderTop:"1px solid #0f1e4a",paddingTop:14,color:"#c9a227",fontWeight:700,fontSize:20}}>
                    <span>TOTAL</span><span>${totalCart+serviceFee}</span>
                  </div>
                </div>

                <div style={s.formBox}>
                  <h3 style={s.cartSectionTitle}>YOUR INFORMATION</h3>
                  {[["Full Name","name","text","John Doe"],["Email Address","email","email","john@example.com"],["Phone (optional)","phone","tel","+1 234 567 890"]].map(([label,key,type,ph])=>(
                    <div key={key} style={{marginBottom:16}}>
                      <label style={s.filterLabel}>{label}</label>
                      <input type={type} placeholder={ph} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} style={s.input}/>
                    </div>
                  ))}
                  <button className="hov-btn" onClick={handleOrder} disabled={sending}
                    style={{...s.btnPrimary, width:"100%", marginTop:8, opacity:(form.name&&form.email&&!sending)?1:0.5, cursor:(form.name&&form.email&&!sending)?"pointer":"not-allowed"}}>
                    {sending ? "PROCESSING..." : "ORDER →"}
                  </button>
                  <div style={s.secureNote}>
                    <span>🔒</span>
                    <span>Your information is secure. You will be redirected to finalize your payment.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SUCCESS ── */}
      {page==="cart" && orderDone && (
        <div className="fade" style={s.successPage}>
          <div style={s.successIcon}>🎉</div>
          <h2 style={{fontFamily:"'Bebas Neue'",fontSize:52,color:"#c9a227",letterSpacing:2}}>ORDER PLACED!</h2>
          <div style={s.orderIdPill}>Order #{orderId}</div>
          <p style={{color:"#a0aec0",maxWidth:480,textAlign:"center",lineHeight:1.7}}>
            {emailStatus === "sent"
              ? <>Your e-ticket has been sent to <strong style={{color:"#c9a227"}}>{form.email}</strong>. You've also been redirected to WhatsApp to confirm your order.</>
              : <>You have been redirected to WhatsApp to confirm your order. We'll follow up by email at <strong style={{color:"#c9a227"}}>{form.email}</strong> shortly.</>}
          </p>
          <div style={s.successFeats}>
            {[emailStatus === "sent" ? "📧 E-ticket sent" : "📧 Confirmation pending", "💬 WhatsApp order sent", "📞 Support available 24/7"].map(f=>(
              <div key={f} style={s.successFeat}>{f}</div>
            ))}
          </div>
          <button className="hov-btn" onClick={()=>{setCart([]);setOrderDone(false);setForm({name:"",email:"",phone:""});setOrderId("");setEmailStatus("");setPage("home");}} style={s.btnPrimary}>
            BACK TO HOME
          </button>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.footLogo}>
            <span style={{fontSize:28}}>⚽</span>
            <div>
              <div style={s.logoMain}>FIFA WORLD CUP <span style={{color:"#c9a227"}}>2026™</span></div>
              <div style={s.logoSub}>OFFICIAL TICKET MARKETPLACE</div>
            </div>
          </div>
          <div style={s.footLinks}>
            {["Home","Matches","Cart","Terms","Privacy","Contact"].map(l=>(
              <span key={l} className="hov-nav" style={{color:"#64748b",fontSize:13,cursor:"pointer"}}>{l}</span>
            ))}
          </div>
          <div style={{color:"#2d3748",fontSize:12,textAlign:"center",borderTop:"1px solid #0f1e4a",paddingTop:24}}>
            © 2026 WorldCup26 Tickets · Unofficial Marketplace · For demonstration purposes only
          </div>
        </div>
      </footer>
    </div>
  );
}

const s = {
  root: { minHeight:"100vh", background:"#04091e", color:"#fff", fontFamily:"'Inter',sans-serif" },

  // NAV
  nav: { position:"sticky", top:0, zIndex:100, background:"rgba(4,9,30,0.97)", backdropFilter:"blur(12px)", borderBottom:"1px solid #0f1e4a" },
  navInner: { maxWidth:1280, margin:"0 auto", padding:"14px 32px", display:"flex", justifyContent:"space-between", alignItems:"center" },
  logo: { display:"flex", alignItems:"center", gap:14, cursor:"pointer" },
  logoBall: { fontSize:32 },
  logoMain: { fontFamily:"'Bebas Neue'", fontSize:22, letterSpacing:2, color:"#fff" },
  logoSub: { fontSize:9, letterSpacing:3, color:"#64748b", textTransform:"uppercase" },
  navLinks: { display:"flex", gap:36, alignItems:"center" },
  navLink: { fontFamily:"Inter", fontWeight:600, fontSize:14, letterSpacing:.5, position:"relative" },
  cartBadge: { position:"absolute", top:-8, right:-12, background:"#e53e3e", color:"#fff", borderRadius:"50%", width:18, height:18, fontSize:10, display:"flex", alignItems:"center", justifyContent:"center" },

  // HERO
  hero: { position:"relative", minHeight:"88vh", display:"flex", alignItems:"center", overflow:"hidden", background:"linear-gradient(135deg, #04091e 0%, #081440 40%, #0c1e5a 70%, #081030 100%)" },
  heroGrad: { position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 50%, rgba(201,162,39,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(220,38,38,0.05) 0%, transparent 50%)" },
  heroGrid: { position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px)", backgroundSize:"60px 60px" },
  heroInner: { position:"relative", zIndex:2, maxWidth:1280, margin:"0 auto", padding:"80px 32px" },
  heroTrophy: { position:"absolute", right:"5%", top:"50%", transform:"translateY(-50%)", fontSize:"clamp(120px,20vw,280px)", opacity:.06, zIndex:1, pointerEvents:"none" },
  hostFlags: { display:"inline-block", background:"rgba(201,162,39,.12)", border:"1px solid rgba(201,162,39,.3)", color:"#c9a227", fontSize:12, letterSpacing:3, padding:"6px 18px", marginBottom:28, fontWeight:600 },
  heroH1: { fontFamily:"'Bebas Neue'", fontSize:"clamp(52px,9vw,110px)", lineHeight:.95, marginBottom:24, letterSpacing:2 },
  heroP: { color:"#94a3b8", fontSize:16, letterSpacing:2, marginBottom:48, fontWeight:300 },
  heroStats: { display:"flex", gap:48, marginBottom:52, flexWrap:"wrap" },
  stat: { display:"flex", flexDirection:"column" },
  statN: { fontFamily:"'Bebas Neue'", fontSize:52, color:"#c9a227", lineHeight:1 },
  statL: { color:"#4a5568", fontSize:11, letterSpacing:3, textTransform:"uppercase", marginTop:2 },
  btnPrimary: { background:"linear-gradient(135deg,#c9a227,#e8b830)", color:"#000", border:"none", fontFamily:"'Bebas Neue'", fontSize:16, letterSpacing:3, padding:"15px 36px", cursor:"pointer", fontWeight:700 },
  btnSecondary: { background:"transparent", color:"#c9a227", border:"1px solid #c9a227", fontFamily:"'Bebas Neue'", fontSize:16, letterSpacing:3, padding:"15px 36px", cursor:"pointer" },

  // TRUST BAR
  trustBar: { background:"#060d26", borderTop:"1px solid #0f1e4a", borderBottom:"1px solid #0f1e4a", display:"flex", justifyContent:"center", gap:48, padding:"28px 32px", flexWrap:"wrap" },
  trustItem: { display:"flex", alignItems:"center", gap:14 },

  // SECTION
  section: { maxWidth:1280, margin:"0 auto", padding:"72px 32px" },
  sectionHead: { marginBottom:48 },
  sectionTag: { color:"#c9a227", fontSize:11, letterSpacing:4, fontWeight:600, marginBottom:12 },
  sectionH2: { fontFamily:"'Bebas Neue'", fontSize:42, letterSpacing:2 },

  // FEATURED
  featGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:24 },
  featCard: { background:"#060d26", border:"1px solid #0f1e4a", padding:28 },
  featTop: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 },
  phasePill: { background:"rgba(201,162,39,.12)", color:"#c9a227", fontSize:10, letterSpacing:2, padding:"4px 12px", fontWeight:600, textTransform:"uppercase" },
  hotPill: { background:"rgba(220,38,38,.15)", color:"#fc8181", fontSize:10, letterSpacing:1, padding:"4px 10px", fontWeight:600 },
  featVs: { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, gap:8 },
  featTeam: { fontFamily:"'Bebas Neue'", fontSize:18, flex:1 },
  vsCircle: { background:"#0f1e4a", color:"#c9a227", fontFamily:"'Bebas Neue'", fontSize:14, padding:"8px 12px", flexShrink:0 },
  featMeta: { display:"flex", flexDirection:"column", gap:4, color:"#4a5568", fontSize:12, marginBottom:20 },
  featFoot: { display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:"1px solid #0f1e4a", paddingTop:16 },
  featBtn: { color:"#c9a227", fontSize:13, fontWeight:600 },

  // WHY
  whyGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:24 },
  whyCard: { background:"#060d26", border:"1px solid #0f1e4a", padding:32 },

  // MATCHES
  filterBar: { display:"flex", gap:24, marginBottom:40, flexWrap:"wrap", alignItems:"flex-end", background:"#060d26", border:"1px solid #0f1e4a", padding:24 },
  filterGroup: { display:"flex", flexDirection:"column", gap:6 },
  filterLabel: { color:"#64748b", fontSize:10, letterSpacing:3, textTransform:"uppercase", fontWeight:600 },
  select: { background:"#04091e", border:"1px solid #0f1e4a", color:"#fff", padding:"10px 16px", fontFamily:"Inter", fontSize:14, cursor:"pointer", minWidth:180 },
  matchGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(350px,1fr))", gap:20 },
  matchCard: { background:"#060d26", border:"1px solid #0f1e4a", padding:24 },
  matchCardTop: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 },
  matchVs: { display:"flex", alignItems:"center", gap:12, marginBottom:16 },
  matchTeamBlock: { flex:1 },
  matchTeamName: { fontFamily:"'Bebas Neue'", fontSize:20 },
  vsBox: { background:"#0f1e4a", color:"#c9a227", fontFamily:"'Bebas Neue'", fontSize:13, padding:"6px 10px", flexShrink:0 },
  divider: { height:1, background:"#0f1e4a", margin:"16px 0" },
  matchInfo: { display:"flex", flexDirection:"column", gap:4, color:"#4a5568", fontSize:12, marginBottom:16 },
  matchCardFoot: { display:"flex", justifyContent:"space-between", alignItems:"center" },
  btnSmall: { background:"linear-gradient(135deg,#c9a227,#e8b830)", color:"#000", border:"none", fontFamily:"'Bebas Neue'", fontSize:13, letterSpacing:1, padding:"9px 20px", cursor:"pointer" },

  // MATCH DETAIL
  backBtn: { background:"transparent", border:"1px solid #0f1e4a", color:"#64748b", padding:"8px 20px", cursor:"pointer", fontFamily:"Inter", fontSize:13, marginBottom:32 },
  detailWrap: { background:"#060d26", border:"1px solid #0f1e4a", padding:40 },
  detailHead: { borderBottom:"1px solid #0f1e4a", paddingBottom:32, marginBottom:40 },
  detailVs: { display:"flex", alignItems:"center", gap:24, margin:"20px 0" },
  detailTeam: { fontFamily:"'Bebas Neue'", fontSize:"clamp(24px,4vw,42px)", flex:1 },
  detailVsBox: { background:"#0f1e4a", color:"#c9a227", fontFamily:"'Bebas Neue'", fontSize:24, padding:"12px 18px" },
  detailMeta: { display:"flex", gap:32, color:"#64748b", fontSize:14, flexWrap:"wrap" },
  stepLabel: { display:"flex", alignItems:"center", gap:12, fontFamily:"'Bebas Neue'", fontSize:18, letterSpacing:2, marginBottom:20, color:"#94a3b8" },
  stepNum: { background:"#c9a227", color:"#000", width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Bebas Neue'", fontSize:16, flexShrink:0 },
  catGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:16 },
  catCard: { padding:24, position:"relative" },
  premBadge: { position:"absolute", top:12, right:12, background:"#c9a227", color:"#000", fontSize:10, padding:"3px 8px", fontFamily:"'Bebas Neue'", letterSpacing:1 },
  catTitle: { color:"#94a3b8", fontSize:13, marginBottom:12, fontWeight:500 },
  catPrice: { fontFamily:"'Bebas Neue'", fontSize:36, color:"#fff" },
  checkMark: { color:"#c9a227", fontSize:12, fontWeight:700, marginTop:12 },
  qtyRow: { display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" },
  qtyBtn: { background:"#0f1e4a", border:"1px solid #1a2d6a", color:"#fff", width:44, height:44, fontSize:22, cursor:"pointer", fontFamily:"'Bebas Neue'" },
  qtyVal: { background:"#060d26", border:"1px solid #0f1e4a", color:"#fff", width:60, height:44, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Bebas Neue'", fontSize:24 },

  // CART
  emptyCart: { display:"flex", flexDirection:"column", alignItems:"center", gap:20, padding:"80px 0", textAlign:"center" },
  cartLayout: { display:"grid", gridTemplateColumns:"1fr 400px", gap:32, alignItems:"start" },
  cartSectionTitle: { fontFamily:"'Bebas Neue'", fontSize:20, letterSpacing:2, color:"#94a3b8", marginBottom:20 },
  cartItem: { background:"#060d26", border:"1px solid #0f1e4a", padding:24, display:"flex", justifyContent:"space-between", gap:16, marginBottom:16 },
  cartItemLeft: { flex:1 },
  cartMatchTitle: { fontFamily:"'Bebas Neue'", fontSize:22, margin:"10px 0 6px" },
  cartItemRight: { textAlign:"right", flexShrink:0 },
  cartItemPrice: { fontFamily:"'Bebas Neue'", fontSize:30, color:"#c9a227" },
  removeBtn: { background:"transparent", border:"none", color:"#4a5568", cursor:"pointer", fontSize:12, marginTop:8, fontFamily:"Inter" },
  cartSide: { display:"flex", flexDirection:"column", gap:24, position:"sticky", top:80 },
  summaryBox: { background:"#060d26", border:"1px solid #0f1e4a", padding:28 },
  sumRow: { display:"flex", justifyContent:"space-between", color:"#64748b", fontSize:14, marginBottom:12 },
  formBox: { background:"#060d26", border:"1px solid #0f1e4a", padding:28 },
  input: { width:"100%", background:"#04091e", border:"1px solid #0f1e4a", color:"#fff", padding:"11px 16px", fontFamily:"Inter", fontSize:14, marginTop:6 },
  secureNote: { display:"flex", gap:8, color:"#4a5568", fontSize:11, marginTop:14, lineHeight:1.5, alignItems:"flex-start" },

  // SUCCESS
  successPage: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:24, minHeight:"75vh", padding:40, textAlign:"center" },
  successIcon: { fontSize:80 },
  orderIdPill: { background:"#0f1e4a", color:"#c9a227", fontSize:14, letterSpacing:1, padding:"8px 20px", borderRadius:4, fontWeight:600 },
  successFeats: { display:"flex", gap:20, flexWrap:"wrap", justifyContent:"center", margin:"8px 0" },
  successFeat: { background:"#060d26", border:"1px solid #0f1e4a", color:"#94a3b8", padding:"10px 20px", fontSize:13 },

  // FOOTER
  footer: { background:"#020612", borderTop:"1px solid #0f1e4a", padding:"48px 32px 24px" },
  footerInner: { maxWidth:1280, margin:"0 auto", display:"flex", flexDirection:"column", gap:32 },
  footLogo: { display:"flex", alignItems:"center", gap:14 },
  footLinks: { display:"flex", gap:32, flexWrap:"wrap" },
};
