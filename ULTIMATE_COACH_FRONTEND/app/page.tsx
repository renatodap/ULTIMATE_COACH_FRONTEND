export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ULTIMATE COACH
        </h1>

        <p className="text-xl text-gray-600">
          Your AI-powered fitness and nutrition coach
        </p>

        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Log In
          </a>
          <a
            href="/signup"
            className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Sign Up
          </a>
        </div>

        <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">🤖 AI Coach</h3>
            <p className="text-sm text-gray-600">
              Get personalized coaching powered by advanced AI
            </p>
          </div>

          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">🍽️ Smart Tracking</h3>
            <p className="text-sm text-gray-600">
              Log meals with text, voice, or photos
            </p>
          </div>

          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">💪 Custom Programs</h3>
            <p className="text-sm text-gray-600">
              AI-generated workout and meal plans
            </p>
          </div>
        </div>

        <footer className="pt-8 text-sm text-gray-500">
          <p>Built with Next.js 14, FastAPI, and Supabase</p>
        </footer>
      </div>
    </main>
  )
}
