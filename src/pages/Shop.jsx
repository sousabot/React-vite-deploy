import React from "react";
import PageMotion from "../components/PageMotion.jsx";

const PRODUCTS = [
  {
    id: "home",
    name: "Home Jersey",
    tag: "Orange Edition",
    img: "/jersey-reveal.png",
    desc: "Official GD Esports Home Jersey.",
    // TODO: replace with your real checkout/product link
    href: "https://www.spized.com/uk-en/design-preview?cfgId=9c58ed21fcfae35b449522141611f77833875fb7c5be760a69db6080e8352126381d90eb5ab54adc9f3ecf271cab68c2607f99f6eed0d09f17daa43ac52da0a3",
    badge: "Available now",
  },
  {
    id: "away",
    name: "Away Jersey",
    tag: "Black Edition",
    img: "/jersey-away.png",
    desc: "Official GD Esports Away Jersey.",
    // TODO: replace with your real checkout/product link
    href: "/shop/away-jersey",
    badge: "Available now",
  },
];

export default function Shop() {
  return (
    <PageMotion>
      <section className="shopPage">
        <div className="shopWrap">
          <header className="shopHeader">
            <div className="shopKicker">GD ESPORTS SHOP</div>
            <h1 className="shopTitle">Official Jerseys</h1>
            <p className="shopSub">
              Built to compete. Built to last. Grab the Home or Away kit — limited drops,
              fast restocks.
            </p>

            <div className="shopCtas">
              <a className="btn btnPrimary" href="#jerseys">
                Shop jerseys
              </a>
              <a className="btn btnGhost" href="/about">
                Learn more
              </a>
            </div>
          </header>

          <div className="shopSection" id="jerseys">
            <div className="shopSectionTop">
              <h2 className="shopH2">Jerseys</h2>
              <div className="shopPills">
                <span className="shopPill">Premium fit</span>
                <span className="shopPill">Official kit</span>
                <span className="shopPill">Limited drops</span>
              </div>
            </div>

            <div className="shopGrid">
              {PRODUCTS.map((p) => (
                <article key={p.id} className="shopCard">
                  <div className="shopCardMedia">
                    <span className="shopCardBadge">{p.badge}</span>
                    <img src={p.img} alt={p.name} loading="lazy" />
                  </div>

                  <div className="shopCardBody">
                    <div className="shopCardTopline">
                      <div>
                        <h3 className="shopCardTitle">{p.name}</h3>
                        <div className="shopCardTag">{p.tag}</div>
                      </div>
                    </div>

                    <p className="shopCardDesc">{p.desc}</p>

                    <div className="shopCardActions">
                      <a className="btn btnPrimary" href={p.href}>
                        View & Buy
                      </a>
                      <a className="btn btnGhost" href={`/creators`}>
                        See it on creators
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="shopInfo">
            <div className="shopInfoCard">
              <div className="shopInfoTitle">Shipping</div>
              <div className="shopInfoText">
                UK & international shipping available. Delivery times vary by region.
              </div>
            </div>

            <div className="shopInfoCard">
              <div className="shopInfoTitle">Sizing</div>
              <div className="shopInfoText">
                True-to-size athletic fit. If you’re between sizes, size up for comfort.
              </div>
            </div>

            <div className="shopInfoCard">
              <div className="shopInfoTitle">Support</div>
              <div className="shopInfoText">
                Issues with an order? Contact us and we’ll sort it fast.
              </div>
            </div>
          </div>

          <div className="shopFooterCta">
            <div>
              <div className="shopFooterTitle">Want the next drop?</div>
              <div className="shopFooterText">
                Follow us for restocks, limited editions, and creator drops.
              </div>
            </div>
            <div className="shopFooterBtns">
              <a className="btn btnPrimary" href="/creators">
                Creators
              </a>
              <a className="btn btnGhost" href="/">
                Home
              </a>
            </div>
          </div>
        </div>
      </section>
    </PageMotion>
  );
}
