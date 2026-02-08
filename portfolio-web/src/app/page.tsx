const caseStudies = [
  {
    title: "予約導線の改善",
    before: "CV導線が分断され、離脱率が高い状態",
    action: "フォーム再設計と入力ステップ最適化を実施",
    after: "問い合わせ完了率が31%改善"
  },
  {
    title: "管理画面の再設計",
    before: "操作が煩雑で更新コストが高い状態",
    action: "情報設計と操作フローをゼロから整理",
    after: "日次更新作業を40%短縮"
  },
  {
    title: "運用改善ダッシュボード",
    before: "レポート集計に半日かかる状態",
    action: "データ連携と可視化UIを一本化",
    after: "意思決定のサイクルを週次から日次へ改善"
  }
];

const process = [
  "要件整理: ゴール・課題・優先順位を言語化",
  "設計: 体験設計と情報構造を固める",
  "実装: Next.jsで高速かつ運用しやすく構築",
  "改善: 計測と仮説検証で成果を積み上げる"
];

const skills = [
  { area: "Frontend", stack: "Next.js / TypeScript / React / Motion" },
  { area: "Design", stack: "Figma / UI設計 / デザインシステム" },
  { area: "Data", stack: "GA4 / KPI設計 / SQL" },
  { area: "Infra", stack: "Vercel / GitHub Actions / 監視" }
];

export default function Home() {
  return (
    <main>
      <section className="hero" id="top">
        <div className="hero-surface" aria-hidden="true" />
        <header className="hero-inner">
          <p className="eyebrow">Portfolio Landing Page</p>
          <h1>課題を、成果に変えるプロダクト実装。</h1>
          <p className="lead">
            戦略・デザイン・実装を一気通貫でつなぎ、
            <br />
            使われるプロダクトと届く導線を作ります。
          </p>
          <div className="hero-cta">
            <a href="#works" className="button button-primary">
              実績を見る
            </a>
            <a href="#contact" className="button button-ghost">
              相談する
            </a>
          </div>
        </header>
      </section>

      <section className="proof section">
        <div className="proof-card">
          <h2>12+</h2>
          <p>リリース実績</p>
        </div>
        <div className="proof-card">
          <h2>31%</h2>
          <p>最大CV改善率</p>
        </div>
        <div className="proof-card">
          <h2>4領域</h2>
          <p>戦略から運用まで一貫対応</p>
        </div>
      </section>

      <section className="section" id="works">
        <div className="section-heading">
          <p className="eyebrow">Case Studies</p>
          <h2>Before / After で見る実績</h2>
        </div>
        <div className="case-grid">
          {caseStudies.map((item) => (
            <article key={item.title} className="case-card">
              <h3>{item.title}</h3>
              <dl>
                <dt>Before</dt>
                <dd>{item.before}</dd>
                <dt>Action</dt>
                <dd>{item.action}</dd>
                <dt>After</dt>
                <dd>{item.after}</dd>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="section split">
        <div>
          <div className="section-heading">
            <p className="eyebrow">Process</p>
            <h2>進め方を可視化</h2>
          </div>
          <ul className="process-list">
            {process.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>

        <div>
          <div className="section-heading">
            <p className="eyebrow">Skills</p>
            <h2>用途起点の技術スタック</h2>
          </div>
          <ul className="skill-list">
            {skills.map((skill) => (
              <li key={skill.area}>
                <strong>{skill.area}</strong>
                <span>{skill.stack}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section about" id="about">
        <div className="section-heading">
          <p className="eyebrow">About</p>
          <h2>作って終わりにしない</h2>
        </div>
        <p>
          見た目だけではなく、成果に直結する設計を重視しています。要件整理から実装、
          公開後の改善まで伴走し、継続的に価値が積み上がる開発を行います。
        </p>
      </section>

      <section className="section contact" id="contact">
        <div className="section-heading">
          <p className="eyebrow">Contact</p>
          <h2>30分だけ、壁打ちしませんか？</h2>
        </div>
        <p>課題の言語化からでも大丈夫です。まずは現状を聞かせてください。</p>
        <div className="hero-cta">
          <a href="mailto:hello@example.com" className="button button-primary">
            メールで相談する
          </a>
          <a href="https://github.com/yourname" className="button button-ghost">
            GitHubを見る
          </a>
        </div>
      </section>
    </main>
  );
}
