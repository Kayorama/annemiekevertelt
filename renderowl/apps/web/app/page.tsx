import Link from 'next/link';
import { Video, Sparkles, Share2, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Video className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">RenderOwl</span>
          </div>
          <div className="flex gap-4">
            <Link
              href="/sign-in"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Create Stunning Videos
            <br />
            <span className="text-blue-600">in Minutes</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            RenderOwl is the easiest way to create professional videos with drag-and-drop editing,
            AI-powered effects, and one-click publishing to social media.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/sign-up"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg"
            >
              Start Creating Free
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-lg"
            >
              Learn More
            </Link>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-white py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Sparkles className="w-8 h-8 text-blue-600" />}
                title="AI-Powered Editing"
                description="Let AI handle the heavy lifting with smart cuts, transitions, and effects."
              />
              <FeatureCard
                icon={<Share2 className="w-8 h-8 text-blue-600" />}
                title="One-Click Publishing"
                description="Publish directly to YouTube, TikTok, and other platforms instantly."
              />
              <FeatureCard
                icon={<Zap className="w-8 h-8 text-blue-600" />}
                title="Lightning Fast"
                description="Render videos in the cloud at blazing speeds. No waiting around."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <Video className="w-6 h-6 text-blue-400" />
            <span className="text-xl font-bold">RenderOwl</span>
          </div>
          <p className="text-gray-400">
            © 2024 RenderOwl. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
