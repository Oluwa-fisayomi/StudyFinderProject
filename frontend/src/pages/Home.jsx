
import { Link } from 'react-router-dom'
import {
  GraduationCap,
  Users,
  Search,
  CalendarDays,
  ArrowRight,
  BookOpen,
  UserPlus,
  Sparkles,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react'

function Home() {
  const features = [
    {
      icon: Search,
      title: 'Find Study Groups',
      description:
        'Discover students studying the same courses and find groups that match your academic interests.',
    },
    {
      icon: Users,
      title: 'Create or Join Groups',
      description:
        'Start your own study community or become part of an existing group that shares your learning goals.',
    },
    {
      icon: CalendarDays,
      title: 'Organise Study Sessions',
      description:
        'Find groups based on meeting schedules and preferred study formats that work for you.',
    },
  ]

  const benefits = [
    'Discover course-based study communities',
    'Connect with students who share your interests',
    'Organise collaborative study sessions',
    'Share ideas and learn together',
  ]

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-hidden">

      <style>{`
        @keyframes homeFadeUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes homeFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        @keyframes homeGlow {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.65; }
        }

        .home-fade-up {
          animation: homeFadeUp 0.8s ease-out both;
        }

        .home-delay-1 { animation-delay: 0.15s; }
        .home-delay-2 { animation-delay: 0.3s; }
        .home-delay-3 { animation-delay: 0.45s; }

        .home-float {
          animation: homeFloat 5s ease-in-out infinite;
        }

        .home-glow {
          animation: homeGlow 5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .home-fade-up,
          .home-float,
          .home-glow {
            animation: none;
          }
        }
      `}</style>

      {/* Navigation */}
      <nav className="relative z-20 bg-white/90 backdrop-blur-xl border-b border-emerald-100/70">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 h-20 flex items-center justify-between">

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-800 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-900/15 group-hover:scale-105 transition-transform duration-300">
              <GraduationCap size={27} className="text-white" />
            </div>

            <span className="text-xl font-bold tracking-tight text-slate-900">
              Study<span className="text-emerald-700">Finder</span>
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              to="/login"
              className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
            >
              Log in
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl bg-emerald-800 text-white text-sm font-semibold shadow-md shadow-emerald-900/15 hover:bg-emerald-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
            >
              Get Started
              <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-[#F3FAF6] overflow-hidden">

        {/* Decorative Background */}
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl home-glow pointer-events-none" />
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-green-200/40 rounded-full blur-3xl home-glow pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-20 md:py-28 grid lg:grid-cols-2 gap-16 items-center">

          {/* Hero Text */}
          <div className="home-fade-up">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-emerald-100 shadow-sm text-emerald-800 text-sm font-semibold mb-7">
              <Sparkles size={16} className="text-emerald-600" />
              Learn better, together.
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.12] tracking-tight text-slate-950">
              Find Your People.
              <span className="block text-emerald-700 mt-2">
                Study Smarter.
              </span>
            </h1>

            <p className="mt-7 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Learning doesn't have to be a solo journey. Discover
              study groups, connect with fellow students and make
              every study session count.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-9">

              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-3 px-7 py-4 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-600 text-white font-semibold shadow-xl shadow-emerald-900/20 hover:shadow-2xl hover:shadow-emerald-900/25 hover:-translate-y-1 transition-all duration-300"
              >
                Join a Study Group
                <ArrowRight size={19} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center px-7 py-4 rounded-xl bg-white border border-emerald-200 text-emerald-900 font-semibold hover:bg-emerald-50 hover:border-emerald-400 transition-all duration-300"
              >
                Sign In
              </Link>

            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-9 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-emerald-600" />
                Course-based groups
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-emerald-600" />
                Student community
              </span>
            </div>

          </div>

          {/* Hero Visual */}
          <div className="relative home-fade-up home-delay-2">

            <div className="absolute inset-0 bg-emerald-300/30 rounded-[2.5rem] blur-3xl scale-90 home-glow" />

            <div className="relative home-float bg-gradient-to-br from-[#064E3B] via-[#065F46] to-[#047857] rounded-[2rem] p-6 sm:p-9 shadow-2xl shadow-emerald-950/25 overflow-hidden">

              <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full border border-white/10" />
              <div className="absolute -top-12 -right-8 w-52 h-52 rounded-full border border-white/10" />
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/10 to-transparent" />

              <div className="relative z-10">

                <div className="flex items-center justify-between mb-9">
                  <div>
                    <p className="text-emerald-200 text-sm font-medium">
                      YOUR LEARNING COMMUNITY
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">
                      Study Together.
                    </h2>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                    <Users size={30} className="text-emerald-100" />
                  </div>
                </div>

                <div className="space-y-4">

                  <div className="group bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-sm transition-all duration-300 hover:translate-x-1">
                    <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                      <BookOpen size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        Course-based groups
                      </h3>
                      <p className="text-sm text-emerald-100 mt-1">
                        Connect through your courses
                      </p>
                    </div>
                  </div>

                  <div className="group bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-sm transition-all duration-300 hover:translate-x-1">
                    <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                      <CalendarDays size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        Flexible meetings
                      </h3>
                      <p className="text-sm text-emerald-100 mt-1">
                        Find suitable study times
                      </p>
                    </div>
                  </div>

                  <div className="group bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-sm transition-all duration-300 hover:translate-x-1">
                    <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                      <UserPlus size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        Student connections
                      </h3>
                      <p className="text-sm text-emerald-100 mt-1">
                        Learn with other students
                      </p>
                    </div>
                  </div>

                </div>

                <div className="mt-7 pt-6 border-t border-white/15 flex items-center justify-between">
                  <div>
                    <p className="text-emerald-200 text-xs">
                      A better way to learn
                    </p>
                    <p className="text-white font-semibold mt-1">
                      Together, we achieve more.
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
                    <GraduationCap size={24} className="text-white" />
                  </div>
                </div>

              </div>
            </div>

            {/* Floating Message Card */}
            <div className="hidden sm:flex absolute -bottom-6 -left-8 bg-white rounded-2xl shadow-xl border border-emerald-50 p-4 items-center gap-3 home-fade-up home-delay-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
                <MessageCircle size={22} className="text-emerald-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Learn collaboratively
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Your community starts here
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-5 sm:px-8 lg:px-12 py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto">

          <div className="text-center max-w-2xl mx-auto mb-14 home-fade-up">
            <span className="text-sm font-bold tracking-widest text-emerald-700">
              WHY STUDYFINDER?
            </span>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 mt-4">
              Everything you need to
              <span className="text-emerald-700"> learn together.</span>
            </h2>

            <p className="mt-5 text-slate-500 leading-relaxed">
              A simpler way to find your academic community,
              collaborate and organise your learning.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">

            {features.map((feature) => {
              const Icon = feature.icon

              return (
                <div
                  key={feature.title}
                  className="group relative p-7 sm:p-8 bg-white border border-emerald-100 rounded-2xl shadow-[0_8px_30px_-20px_rgba(6,78,59,0.25)] hover:shadow-[0_20px_45px_-20px_rgba(6,78,59,0.3)] hover:-translate-y-2 hover:border-emerald-300 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-6 group-hover:bg-emerald-700 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                    <Icon size={27} />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>

                </div>
              )
            })}

          </div>
        </div>
      </section>

      {/* About / Benefits */}
      <section className="bg-[#F3FAF6] px-5 sm:px-8 lg:px-12 py-20 md:py-24">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">

          <div>
            <span className="text-sm font-bold tracking-widest text-emerald-700">
              LEARNING MADE COLLABORATIVE
            </span>

            <h2 className="text-3xl sm:text-4xl font-bold leading-tight text-slate-950 mt-4">
              Your academic journey deserves a
              <span className="text-emerald-700"> great community.</span>
            </h2>

            <p className="mt-5 text-slate-600 leading-relaxed">
              StudyFinder brings students together around shared
              courses, study schedules and academic interests.
              Find your people and make learning more engaging.
            </p>

            <div className="mt-8 space-y-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 size={21} className="text-emerald-700 shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 mt-9 px-6 py-3.5 rounded-xl bg-emerald-800 text-white font-semibold shadow-lg shadow-emerald-900/15 hover:bg-emerald-700 hover:-translate-y-1 transition-all duration-300"
            >
              Get Started
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Benefits Visual */}
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-200/50 blur-3xl rounded-full" />

            <div className="relative bg-gradient-to-br from-emerald-900 to-emerald-700 rounded-3xl p-7 sm:p-10 text-white shadow-2xl shadow-emerald-950/20">

              <div className="flex items-center gap-4 mb-9">
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
                  <GraduationCap size={31} />
                </div>
                <div>
                  <p className="text-emerald-200 text-sm">
                    STUDYFINDER COMMUNITY
                  </p>
                  <h3 className="text-2xl font-bold mt-1">
                    Learn. Connect. Grow.
                  </h3>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-4 bg-white/10 rounded-2xl p-4">
                  <Users size={25} className="text-emerald-200 shrink-0" />
                  <div>
                    <h4 className="font-semibold">Build connections</h4>
                    <p className="text-sm text-emerald-100 mt-1">
                      Meet students who share your courses.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white/10 rounded-2xl p-4">
                  <BookOpen size={25} className="text-emerald-200 shrink-0" />
                  <div>
                    <h4 className="font-semibold">Share knowledge</h4>
                    <p className="text-sm text-emerald-100 mt-1">
                      Exchange ideas and learn together.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white/10 rounded-2xl p-4">
                  <ShieldCheck size={25} className="text-emerald-200 shrink-0" />
                  <div>
                    <h4 className="font-semibold">A structured community</h4>
                    <p className="text-sm text-emerald-100 mt-1">
                      Organise your study experience.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Call to Action */}
      <section className="relative overflow-hidden bg-[#064E3B] px-5 sm:px-8 lg:px-12 py-20 md:py-24 text-white">

        <div className="absolute -top-32 -right-24 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-24 w-96 h-96 bg-green-300/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-emerald-100 text-sm font-medium mb-7">
            <Sparkles size={16} />
            YOUR NEXT CHAPTER STARTS HERE
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Your next study partner
            <span className="block text-emerald-300 mt-2">
              is waiting.
            </span>
          </h2>

          <p className="mt-6 text-emerald-100 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Join a community of learners, discover study groups
            and make your academic journey more collaborative.
          </p>

          <Link
            to="/register"
            className="inline-flex items-center gap-3 mt-9 px-8 py-4 rounded-xl bg-white text-emerald-900 font-bold shadow-xl hover:bg-emerald-50 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
          >
            Create Your Account
            <ArrowRight size={19} />
          </Link>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#032F25] text-white px-5 sm:px-8 lg:px-12 py-9">
        <div className="max-w-7xl mx-auto">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

            <Link to="/" className="flex items-center gap-2.5 group">
              <GraduationCap size={28} className="text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold">
                StudyFinder
              </span>
            </Link>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-emerald-100">
              <Link to="/login" className="hover:text-white transition-colors">
                Log in
              </Link>
              <Link to="/register" className="hover:text-white transition-colors">
                Register
              </Link>
              <Link to="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </div>

          </div>

          <div className="border-t border-white/10 mt-7 pt-7 text-center">
            <p className="text-sm text-emerald-200/70">
              © 2026 StudyFinder. All rights reserved.
            </p>
          </div>

        </div>
      </footer>

    </div>
  )
}

export default Home
