"use client"

import { useNavigate } from "react-router-dom"

export default function NotFoundDesign2() {
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage:
          "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download%20%282%29.jfif-ezNOAzX9jl8A6CGHDlfqnz9aflhXM0.jpeg')",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-2xl">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-white mb-2 tracking-widest">404</h1>
            <div className="w-24 h-1 bg-white mx-auto mb-6"></div>
            <h2 className="text-3xl text-white font-light mb-4">Page Not Found</h2>
            <p className="text-xl text-gray-300">This outfit seems to have vanished into thin air</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 bg-white text-black font-semibold hover:bg-gray-100 transition-colors"
            >
              HOME
            </button>
            <button
              onClick={() => navigate("/all")}
              className="px-8 py-3 border-2 border-white text-white font-semibold hover:bg-white hover:text-black transition-colors"
            >
              SHOP NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
