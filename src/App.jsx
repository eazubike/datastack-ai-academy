import { useState } from 'react'
import ChatWidget from './ChatWidget'

const weeks = [
  { num: 1, title: 'SQL Foundations + Your Data Toolkit', desc: 'Go from zero to confidently querying any database. Set up your complete dev environment.', project: 'E-Commerce Sales Analysis', skills: ['SQL', 'PostgreSQL', 'Git', 'GitHub'] },
  { num: 2, title: 'Python from Scratch', desc: 'Learn Python from zero. By Friday you can write scripts that read files, process data, and automate tasks.', project: 'Data Validation Script', skills: ['Python', 'File I/O', 'CSV', 'JSON'] },
  { num: 3, title: 'Python for Data + First AI Integration', desc: 'Master Pandas for data manipulation. Make your first real LLM API call from code.', project: 'API-to-Insight Pipeline with AI Summary', skills: ['Pandas', 'APIs', 'LLM APIs', 'Bedrock'] },
  { num: 4, title: 'Data Modeling, ETL & Data Quality', desc: 'Learn how production data systems are designed. Build a real ETL pipeline with quality checks.', project: 'Multi-Source ETL Pipeline', skills: ['Star Schema', 'ETL', 'Great Expectations', 'pytest'] },
  { num: 5, title: 'The AWS Cloud Data Platform', desc: 'Move to production cloud systems: S3, Glue, Redshift, Lambda, MWAA, dbt, and event-driven architecture.', project: 'Event-Driven Cloud Pipeline', skills: ['S3', 'Redshift', 'Glue', 'Lambda', 'dbt', 'MWAA', 'SNS', 'SQS', 'SES', 'Slack'] },
  { num: 6, title: 'AI Deep Dive + BI Dashboards + Career Launch', desc: 'Master AI/LLM integrations, build professional dashboards, deploy with CDK, and prepare for the job market.', project: 'AI-Powered Dashboard with Daily Brief', skills: ['Bedrock', 'Text-to-SQL', 'RAG', 'Tableau/Power BI', 'CDK', 'CodePipeline'] },
  { num: '7-8', title: 'Capstone Project', desc: 'Build a complete, production-grade data project from scratch. This is the project you walk into interviews with.', project: 'Full End-to-End Data Platform', skills: ['Everything from Weeks 1-6'] },
]

const faqs = [
  { q: "I've never coded before. Can I really do this in 8 weeks?", a: "Yes. Week 1 starts with 'what is a database' and Week 2 starts with 'what is a variable.' Every concept is introduced with simple examples before building complexity. You'll need ~15-20 hours per week." },
  { q: "What if I fall behind?", a: "All content is self-paced with lifetime access. Live sessions are recorded. You can join the next cohort at no extra cost." },
  { q: "Do I need a powerful computer?", a: "No. Any laptop from the last 5 years works. We use cloud services for heavy computation." },
  { q: "What cloud costs should I expect?", a: "We use free tiers wherever possible. Budget ~$10-20 total if you go beyond free tier limits." },
  { q: "Will this get me a job?", a: "We can't guarantee employment, but you'll graduate with 7+ portfolio projects, a polished resume, interview prep, and access to our job board." },
  { q: "How is this different from free YouTube tutorials?", a: "Structure, projects, and accountability. Free tutorials teach isolated skills. This course builds them into a connected system with real projects, peer review, and career support." },
]

const careers = [
  { role: 'Data Engineer', salary: '$131,000', growth: 'High demand' },
  { role: 'BI Analyst', salary: '$95,000', growth: 'Steady growth' },
  { role: 'Analytics Engineer', salary: '$125,000', growth: 'Fastest growing' },
  { role: 'AI/ML Engineer', salary: '$155,000', growth: 'Explosive' },
]

function App() {
  const [openWeek, setOpenWeek] = useState(null)
  const [openFaq, setOpenFaq] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', background: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || ''
      if (apiUrl) {
        await fetch(`${apiUrl}/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      }
      setSubmitted(true)
    } catch (err) {
      console.error('Submit error:', err)
      setSubmitted(true) // Still show success — don't block the user
    }
    setSubmitting(false)
  }

  return (
    <div className="bg-gray-950 text-white min-h-screen">

      {/* Nav */}
      <nav className="fixed top-0 w-full bg-gray-950/90 backdrop-blur-sm border-b border-gray-800 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent cursor-pointer">DataStack AI Academy</a>
          <div className="hidden md:flex gap-6 text-sm text-gray-400">
            <a href="#curriculum" className="hover:text-white transition">Curriculum</a>
            <a href="#careers" className="hover:text-white transition">Careers</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </div>
          <a href="#apply" className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition">Register Interest</a>
        </div>
      </nav>

      {/* Cohort Banner */}
      <section className="pt-28 pb-0 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-sm text-blue-400 font-medium mb-1">Next Cohort — April 2026</div>
              <div className="text-white font-semibold">Starts April 14 · Tue &amp; Thu 7-9 PM + Sat 10 AM-12 PM</div>
              <div className="text-sm text-gray-400 mt-1">Registration closes April 12 · Limited spots</div>
            </div>
            <a href="#apply" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition shrink-0">Register Now</a>
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="pt-10 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-6">8 Weeks · Tue &amp; Thu Evenings + Sat Mornings · Online</div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Master <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Data + AI</span> in 8 Weeks
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">From zero coding experience to a job-ready portfolio with 7 projects, deployed on AWS. The only bootcamp that teaches AI-native data engineering from Day 1.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#apply" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition shadow-lg shadow-blue-500/25"><span className="line-through text-blue-200/60 mr-2">£1,500</span> £399.99 — Register Interest</a>
            <a href="#curriculum" className="border border-gray-700 hover:border-gray-500 text-gray-300 px-8 py-4 rounded-xl text-lg transition">View Curriculum</a>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <span>✓ No experience required</span>
            <span>✓ 7 portfolio projects</span>
            <span>✓ Live instructor-led</span>
            <span>✓ Career support</span>
          </div>
        </div>
      </section>

      {/* What Makes This Different */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Makes This Different</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🤖', title: 'AI-Native from Day 1', desc: 'Every week has an AI integration. You build the muscle memory of using LLMs as a daily tool.' },
              { icon: '📦', title: '7 Portfolio Projects', desc: 'Every week ends with a deployable project. By Week 8, your portfolio speaks louder than any certificate.' },
              { icon: '📊', title: 'Real Data, Real Scenarios', desc: 'No toy datasets. You work with e-commerce transactions, APIs, and messy CSVs that mirror actual work.' },
              { icon: '🎯', title: 'Beginner-Friendly', desc: 'Each day builds on the previous one. No surprise jumps. You always know what you\'re doing and why.' },
              { icon: '💼', title: 'Career Outcomes Built In', desc: 'Resume templates, LinkedIn optimization, mock interviews, salary negotiation, and a networking playbook.' },
              { icon: '☁️', title: 'Full AWS Stack', desc: 'S3, Redshift, Glue, Lambda, Bedrock, CDK, CodePipeline — the real services companies use in production.' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 hover:border-blue-500/30 transition">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Outlook */}
      <section id="careers" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Career Outlook (2026)</h2>
          <p className="text-gray-400 text-center mb-10">This course qualifies you for entry-level roles in all four paths.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {careers.map((c, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">{c.salary}</div>
                <div className="font-semibold mb-1">{c.role}</div>
                <div className="text-sm text-gray-500">{c.growth}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section id="curriculum" className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">8-Week Curriculum</h2>
          <p className="text-gray-400 text-center mb-10">6 weeks of learning + 2 weeks capstone project. Each week builds directly on the last.</p>
          <div className="space-y-3">
            {weeks.map((w, i) => (
              <div key={i} className="border border-gray-700/50 rounded-xl overflow-hidden">
                <button onClick={() => setOpenWeek(openWeek === i ? null : i)} className="w-full flex items-center justify-between p-5 hover:bg-gray-800/50 transition text-left">
                  <div className="flex items-center gap-4">
                    <span className="bg-blue-500/10 text-blue-400 text-sm font-bold px-3 py-1 rounded-lg">Week {w.num}</span>
                    <span className="font-semibold">{w.title}</span>
                  </div>
                  <svg className={`w-5 h-5 text-gray-500 transition-transform ${openWeek === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {openWeek === i && (
                  <div className="px-5 pb-5 border-t border-gray-700/50">
                    <p className="text-gray-400 text-sm mt-3 mb-3">{w.desc}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-emerald-400 font-medium">Weekly Project:</span>
                      <span className="text-sm text-gray-300">{w.project}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {w.skills.map((s, j) => (
                        <span key={j} className="text-xs bg-gray-700/50 text-gray-300 px-2.5 py-1 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bonus Modules */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-block px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm mb-4">Bonus Modules</div>
            <h2 className="text-3xl font-bold mb-3">Your Competitive Edge</h2>
            <p className="text-gray-400">Two production AI applications deployed on AWS. No other beginner course offers this.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-2">🗣️ "Chat With Your Data"</h3>
              <p className="text-sm text-gray-400 mb-3">Production Text-to-SQL Agent. Users type questions in English, get answers from your database with guardrails.</p>
              <div className="text-xs text-gray-500">API Gateway → Lambda → Bedrock → Redshift</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-2">📚 "Ask Your Docs"</h3>
              <p className="text-sm text-gray-400 mb-3">Production RAG Chatbot. Upload documentation, ask questions in natural language, get accurate answers with citations.</p>
              <div className="text-xs text-gray-500">S3 → Bedrock Knowledge Bases → Lambda → API Gateway</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Simple Pricing</h2>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8">
            <div className="flex items-baseline justify-center gap-3 mb-2">
              <span className="text-2xl text-gray-500 line-through">£1,500</span>
              <span className="text-5xl font-bold">£399<span className="text-2xl text-gray-400">.99</span></span>
            </div>
            <div className="inline-block bg-emerald-500/10 text-emerald-400 text-sm font-medium px-3 py-1 rounded-full mb-4">Save 67% — Limited Time</div>
            <div className="text-gray-400 mb-6">One-time payment · Lifetime access</div>
            <ul className="text-left text-sm text-gray-300 space-y-3 mb-8">
              {['8 weeks of structured curriculum', '30+ interactive Jupyter notebooks', '7 portfolio projects + capstone', '2 bonus AI modules (Text-to-SQL + RAG)', 'Weekly live sessions (recorded for replay)', 'Private community (Discord/Slack)', 'Resume + LinkedIn optimization', 'Interview prep + salary negotiation', 'Certificate of completion', 'Access to all course materials + recordings'].map((item, i) => (
                <li key={i} className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span>{item}</li>
              ))}
            </ul>
            <a href="#apply" className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl text-lg font-semibold transition shadow-lg shadow-blue-500/25">Register Interest</a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="border border-gray-700/50 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 hover:bg-gray-800/50 transition text-left">
                  <span className="font-medium pr-4">{f.q}</span>
                  <svg className={`w-5 h-5 text-gray-500 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 border-t border-gray-700/50">
                    <p className="text-gray-400 text-sm mt-3">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Apply Form */}
      <section id="apply" className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Register Your Interest</h2>
          <p className="text-gray-400 text-center mb-8">Spots are limited. Register now and we'll reach out with next steps.</p>
          {submitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-xl font-bold mb-2">You're on the List! 🎉</h3>
              <p className="text-gray-400">We'll reach out within 24 hours with details about the next cohort and how to secure your spot.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Full Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition" placeholder="jane@example.com" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Your Background (optional)</label>
                <select value={formData.background} onChange={e => setFormData({...formData, background: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition">
                  <option value="">Select one...</option>
                  <option value="complete-beginner">Complete beginner — never coded</option>
                  <option value="some-coding">Some coding experience</option>
                  <option value="analyst">Working as an analyst (Excel/SQL)</option>
                  <option value="career-switch">Career switcher from another field</option>
                  <option value="student">Student</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white py-4 rounded-xl text-lg font-semibold transition shadow-lg shadow-blue-500/25">{submitting ? 'Submitting...' : 'Register Interest'}</button>
              <p className="text-xs text-gray-500 text-center">No payment required. We'll contact you with details about the next cohort.</p>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-sm font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">DataStack AI Academy</span>
          <div className="text-sm text-gray-500">© 2026 DataStack AI Academy. All rights reserved.</div>
        </div>
      </footer>
      <ChatWidget />
    </div>
  )
}

export default App
